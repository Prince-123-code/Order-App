import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {

  constructor(private prisma: PrismaService) {}

  create(data:any){
    return this.prisma.product.create({
      data
    });
  }

  findAll(){
    return this.prisma.product.findMany();
  }

  findOne(id:number){
    return this.prisma.product.findUnique({
      where:{ id }
    });
  }

  update(id:number,data:any){
    return this.prisma.product.update({
      where:{ id },
      data
    });
  }

  async delete(id:number){
    // Delete related OrderItems first to avoid foreign key constraint error
    return this.prisma.$transaction([
      this.prisma.orderItem.deleteMany({ where: { productId: id } }),
      this.prisma.product.delete({ where: { id } }),
    ]);
  }

}