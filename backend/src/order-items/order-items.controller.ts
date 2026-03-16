import { Controller, Post, Get, Param, Delete, Body } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Order Items')
@ApiBearerAuth('bearer')
@Controller('order-items')
export class OrderItemsController {

  constructor(private orderItemsService: OrderItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an order item', description: 'Adds a product item to an order' })
  @ApiBody({ type: CreateOrderItemDto })
  @ApiResponse({ status: 201, description: 'Order item created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() body: CreateOrderItemDto) {
    return this.orderItemsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all order items', description: 'Returns all order items with order and product details' })
  @ApiResponse({ status: 200, description: 'List of order items returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.orderItemsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order item by ID', description: 'Returns a single order item with order and product details' })
  @ApiParam({ name: 'id', type: Number, description: 'Order Item ID' })
  @ApiResponse({ status: 200, description: 'Order item found' })
  @ApiResponse({ status: 404, description: 'Order item not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.orderItemsService.findOne(Number(id));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order item', description: 'Removes an order item by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Order Item ID' })
  @ApiResponse({ status: 200, description: 'Order item deleted' })
  @ApiResponse({ status: 404, description: 'Order item not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  delete(@Param('id') id: string) {
    return this.orderItemsService.delete(Number(id));
  }

}