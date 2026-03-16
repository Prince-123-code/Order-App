import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {

  @ApiPropertyOptional({ example: 'Laptop Pro', description: 'Product name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 1299.99, description: 'Product price' })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ example: 'An upgraded high-performance laptop', description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'http://example.com/image.png', description: 'Product image URL' })
  @IsOptional()
  @IsString()
  image?: string;

}
