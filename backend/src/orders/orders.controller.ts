import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/jwt/roles.guard';
import { Roles } from '../auth/jwt/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Orders')
@ApiBearerAuth('bearer')
@Controller('orders')
@UseGuards(RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @Roles(Role.USER)
  @ApiOperation({
    summary: 'Create an order',
    description: 'Creates a new order for a user',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() body: CreateOrderDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.ordersService.create({ ...body, userId });
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = +(page ?? 1) || 1;
    const l = +(limit ?? 12) || 12;
    return this.ordersService.findAllWithContext(req.user, p, l);
  }

  @Get('analytics/stats')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get business analytics',
    description: 'Returns revenue and sales data',
  })
  @ApiResponse({ status: 200, description: 'Analytics data' })
  getAnalytics() {
    return this.ordersService.getAnalytics();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Returns a single order with items',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(Number(id));
  }

  @Put(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update order status',
    description: 'Updates status with validation (Admin only)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiBody({ schema: { properties: { status: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    return this.ordersService.updateStatus(Number(id), status, req.user.role);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: 'Cancel an order',
    description: 'Cancels an order (owner or admin only)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  cancelOrder(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.cancelOrder(Number(id), req.user);
  }
}
