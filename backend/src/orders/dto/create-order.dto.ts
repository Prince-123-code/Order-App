import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({ example: 1, description: 'ID of the product' })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 2, description: 'Quantity of the product' })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {

  @ApiProperty({ example: 1, description: 'ID of the user placing the order' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ type: [OrderItemDto], description: 'List of order items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

}
