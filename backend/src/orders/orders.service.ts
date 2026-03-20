import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Role } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';

interface UserPayload {
  userId: number;
  name: string;
  email: string;
  role: Role;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(data: any) {
    const order = await this.prisma.order.create({
      data: {
        userId: Number(data.userId),
        items: {
          create: data.items.map((item: any) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
          })),
        },
      },
      include: {
        user: true,
        items: {
          include: { product: true },
        },
      },
    });
    this.eventsGateway.emitOrderCreated(order);
    return order;
  }

  findAllWithContext(user: UserPayload, page: number = 1, limit: number = 12) {
    return user.role === 'ADMIN'
      ? this.findAll(page, limit)
      : this.findByUserId(user.userId, page, limit);
  }

  async findAll(page: number = 1, limit: number = 12) {
    return this.getPaginatedOrders({}, page, limit);
  }

  async findByUserId(userId: number, page: number = 1, limit: number = 12) {
    return this.getPaginatedOrders({ userId }, page, limit);
  }

  private async getPaginatedOrders(where: any, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          items: {
            include: { product: true },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: { product: true },
        },
      },
    });
  }

  async updateStatus(id: number, status: string, userRole?: Role) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const currentStatus = order.status;
    const targetStatus = status.trim().toUpperCase() as OrderStatus;

    // Status sequence: PENDING -> CONFIRMED -> PROCESSING -> DELIVERED
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [OrderStatus.PENDING]
    };

    // Administrators can override transitions for corrective actions
    const isAuthorizedTransition = 
      userRole === Role.ADMIN || 
      (transitions[currentStatus] && transitions[currentStatus].includes(targetStatus));

    if (!isAuthorizedTransition) {
      throw new BadRequestException(
        `Invalid transition from ${currentStatus} to ${targetStatus}`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: targetStatus },
      include: {
        user: true,
        items: {
          include: { product: true },
        },
      },
    });
    this.eventsGateway.emitOrderStatusUpdated(updated);
    return updated;
  }

  async cancelOrder(id: number, user: UserPayload) {
    const order = await this.findOne(id);
    if (!order) throw new Error('Order not found');

    if (user.role === 'USER' && order.userId !== user.userId) {
      throw new Error('You can only cancel your own orders');
    }

    if (user.role === 'ADMIN') {
      if (
        order.status !== OrderStatus.PENDING &&
        order.status !== OrderStatus.CONFIRMED
      ) {
        throw new BadRequestException(
          'Administrators can only cancel orders in PENDING or CONFIRMED state',
        );
      }
    } else {
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(
          'Order can only be cancelled while in PENDING state',
        );
      }
    }

    return this.updateStatus(id, 'CANCELLED', user.role);
  }

  async delete(id: number) {
    await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
    return this.prisma.order.delete({ where: { id } });
  }

  async getAnalytics() {
    const [orders, productsCount, ordersCount, activeCustomers] =
      await Promise.all([
        this.prisma.order.findMany({
          where: { status: 'DELIVERED' },
          include: { items: { include: { product: true } } },
        }),
        this.prisma.product.count({ where: { deleted: false } }),
        this.prisma.order.count(),
        this.prisma.user.count({ where: { role: 'USER' } }),
      ]);

    let totalRevenue = 0;
    const productSalesMap = new Map<string, number>();

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        if (item.product) {
          totalRevenue += item.quantity * item.product.price;
          productSalesMap.set(
            item.product.name,
            (productSalesMap.get(item.product.name) || 0) + item.quantity,
          );
        }
      });
    });

    const productSales = Array.from(productSalesMap, ([name, quantity]) => ({
      name,
      quantity,
    })).sort((a, b) => b.quantity - a.quantity);

    return {
      totalRevenue,
      productsCount,
      ordersCount,
      activeCustomers,
      productSales,
    };
  }
}
