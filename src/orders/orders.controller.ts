import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Query,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateManyOrderDto } from './dto/update-many-order.dto';
import { BulkDeleteOrderDto } from './dto/bulk-delete-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { OrderStatus } from './enums/order-status.enum';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller(':lang/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Create an order – available to authenticated users.
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.CONTROLLER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  // Get all orders – if requester is non-admin, only return their orders.
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findAll(@Query('status') status: OrderStatus, @Req() req: any) {
    return this.ordersService.findAll(req.user, status);
  }

  // Get a specific order – enforce that non-admin users can access only their own order.
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.CONTROLLER)
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.ordersService.findOne(id, req.user);
  }

  // Update a specific order – only the owner or admin can update.
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.CONTROLLER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: any,
  ) {
    return this.ordersService.update(id, updateOrderDto, req.user);
  }

  // Bulk update orders (Admin or Controller Only)
  @Put('bulk/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTROLLER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBody({ description: 'Bulk update payload', type: UpdateManyOrderDto })
  @ApiResponse({ status: 200, description: 'Orders updated successfully' })
  async updateMany(
    @Body() updateManyOrderDto: UpdateManyOrderDto,
    @Req() req: any,
  ) {
    return this.ordersService.updateMany(updateManyOrderDto, req.user);
  }

  // Soft delete a specific order – only the owner or admin can delete.
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.ordersService.remove(id, req.user);
  }

  // Bulk delete orders (soft deletion)
  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiBody({
    description: 'Array of order IDs to delete',
    type: BulkDeleteOrderDto,
  })
  @ApiResponse({ status: 200, description: 'Orders deleted successfully' })
  async bulkDelete(
    @Body() bulkDeleteOrderDto: BulkDeleteOrderDto,
    @Req() req: any,
  ) {
    return this.ordersService.bulkDelete(bulkDeleteOrderDto, req.user);
  }
}
