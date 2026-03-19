import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderItemsService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.orderItem.create({
      data,
    });
  }

  findAll() {
    return this.prisma.orderItem.findMany({
      include: {
        order: true,
        product: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.orderItem.findUnique({
      where: { id },
      include: {
        order: true,
        product: true,
      },
    });
  }

  delete(id: number) {
    return this.prisma.orderItem.delete({
      where: { id },
    });
  }
}
