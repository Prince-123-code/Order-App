import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.product.create({
      data,
    });
  }

  async findAll(search?: string, category?: string, page: number = 1, limit: number = 12) {
    const skip = (page - 1) * limit;
    const where: any = { deleted: false };
    if (search) {
      where.name = {
        contains: search,
      };
    }
    if (category && category !== 'ALL') {
      where.category = category;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
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
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  findOneActive(id: number) {
    return this.prisma.product.findFirst({
      where: { id, deleted: false },
    });
  }

  update(id: number, data: any) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    // Soft delete: mark product as deleted instead of removing it
    // This preserves order history and OrderItems
    return this.prisma.product.update({
      where: { id },
      data: { deleted: true },
    });
  }

  async getTopSelling() {
    const topSales = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: { order: { status: 'DELIVERED' } },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 3,
    });

    const ids = topSales.map((s) => s.productId);
    if (ids.length === 0) return this.prisma.product.findMany({ where: { deleted: false }, take: 3, orderBy: { id: 'desc' } });

    const products = await this.prisma.product.findMany({
      where: { id: { in: ids }, deleted: false },
    });
    return ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  }
}
