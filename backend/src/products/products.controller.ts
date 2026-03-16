import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { Public } from '../auth/public.decorator';

@ApiTags('Products')
@ApiBearerAuth('bearer')
@Controller('products')
@UseGuards(RolesGuard)
export class ProductsController {

  constructor(private productsService:ProductsService){}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a product', description: 'Creates a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() body: CreateProductDto){
    return this.productsService.create(body);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all products', description: 'Returns a list of all products' })
  @ApiResponse({ status: 200, description: 'List of products returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(){
    return this.productsService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID', description: 'Returns a single product by its ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id:string){
    return this.productsService.findOne(Number(id));
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a product', description: 'Updates an existing product by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id:string, @Body() body: UpdateProductDto){
    return this.productsService.update(Number(id), body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a product', description: 'Deletes a product by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  delete(@Param('id') id:string){
    return this.productsService.delete(Number(id));
  }

}