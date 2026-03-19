import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ example: 1, description: 'ID of the order' })
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @ApiProperty({ example: 1, description: 'ID of the product' })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 2, description: 'Quantity of the product' })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
