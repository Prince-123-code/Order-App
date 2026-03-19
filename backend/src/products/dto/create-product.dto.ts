import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop', description: 'Product name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 999.99, description: 'Product price' })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 'A high-performance laptop',
    description: 'Product description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 'http://example.com/image.png',
    description: 'Product image URL',
  })
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty({ example: 'VEG', description: 'Product category' })
  @IsNotEmpty()
  @IsString()
  category: string;
}
