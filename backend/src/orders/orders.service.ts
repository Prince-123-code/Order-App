import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {

  constructor(private prisma: PrismaService) {}

  create(data:any){
    return this.prisma.order.create({
      data: {
        userId: data.userId,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });
  }

  findAll(){
    return this.prisma.order.findMany({
      include:{
        user:true,
        items: {
          include: { product: true }
        }
      }
    });
  }

  findByUserId(userId: number){
    return this.prisma.order.findMany({
      where: { userId },
      include:{
        user:true,
        items: {
          include: { product: true }
        }
      }
    });
  }

  findOne(id:number){
    return this.prisma.order.findUnique({
      where:{ id },
      include:{
        user:true,
        items: {
          include: { product: true }
        }
      }
    });
  }

  updateStatus(id: number, status: any) {
    return this.prisma.order.update({
      where: { id },
      data: { status }
    });
  }

  async delete(id: number) {
    // Delete related order items first to avoid FK constraint errors
    await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
    return this.prisma.order.delete({ where: { id } });
  }

  async getAnalytics() {
    const orders = await this.prisma.order.findMany({
      where: { status: 'DELIVERED' },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    const productsCount = await this.prisma.product.count();
    const ordersCount = await this.prisma.order.count();
    const activeCustomers = await this.prisma.user.count({
      where: { role: 'USER' }
    });

    let totalRevenue = 0;
    const productSales = {};

    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.product) {
            const itemTotal = item.quantity * item.product.price;
            totalRevenue += itemTotal;

            if (!productSales[item.product.name]) {
              productSales[item.product.name] = 0;
            }
            productSales[item.product.name] += item.quantity;
          }
        });
      }
    });

    const productSalesArray = Object.keys(productSales).map(name => ({
      name,
      quantity: productSales[name]
    })).sort((a, b) => b.quantity - a.quantity);

    return {
      totalRevenue,
      productsCount,
      ordersCount,
      activeCustomers,
      productSales: productSalesArray
    };
  }

}