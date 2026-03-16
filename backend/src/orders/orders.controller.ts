import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Orders')
@ApiBearerAuth('bearer')
@Controller('orders')
@UseGuards(RolesGuard)
export class OrdersController {

  constructor(private ordersService: OrdersService) {}

  @Post()
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Create an order', description: 'Creates a new order for a user' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() body: CreateOrderDto) {
    return this.ordersService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders', description: 'Returns all orders with user details' })
  @ApiResponse({ status: 200, description: 'List of orders returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Req() req: any) {
    const userRole = req.user.role;
    const userId = req.user.userId;

    if (userRole === Role.ADMIN) {
      return this.ordersService.findAll();
    } else {
      return this.ordersService.findByUserId(userId);
    }
  }

  @Get('analytics/stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get analytics stats', description: 'Returns business metrics (admin only)' })
  @ApiResponse({ status: 200, description: 'Stats returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getStats() {
    return this.ordersService.getAnalytics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID', description: 'Returns a single order with user details' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(Number(id));
  }

  @Post(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update order status', description: 'Updates the status of an existing order' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: ['ORDER_ITEMS', 'CONFIRMED', 'PROCESSING', 'DELIVERED', 'CANCELLED'] } } } })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.ordersService.updateStatus(Number(id), status);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Cancel an order', description: 'Cancels an order by updating its status to CANCELLED (owner or admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot cancel after confirmation' })
  async deleteOrder(@Param('id') id: string, @Req() req: any) {
    const orderId = Number(id);
    const order = await this.ordersService.findOne(orderId);
    
    if (!order) return { message: 'Order not found' };

    // Ownership check for users
    if (req.user.role === Role.USER && order.userId !== req.user.userId) {
      throw new Error('You can only cancel your own orders');
    }

    // Status check - only allow cancellation in initial phase
    if (order.status !== 'ORDER_ITEMS' && req.user.role !== Role.ADMIN) {
      throw new Error('Order cannot be cancelled as it is already being processed');
    }

    return this.ordersService.updateStatus(orderId, 'CANCELLED');
  }

}