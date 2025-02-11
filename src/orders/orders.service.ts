import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateManyOrderDto } from './dto/update-many-order.dto';
import { BulkDeleteOrderDto } from './dto/bulk-delete-order.dto';
import { User } from '../users/user.entity';
import { City } from '../locations/city.entity';
import { Area } from '../locations/area.entity';
import { Product } from '../products/product.entity';
import { OrderStatus } from './enums/order-status.enum';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { InventoryService } from '../inventory/inventory.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(City)
    private cityRepository: Repository<City>,
    @InjectRepository(Area)
    private areaRepository: Repository<Area>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly inventoryService: InventoryService,
    private readonly auditLogService: AuditLogService,
  ) {}

  // Create an order – any authenticated user can create their own order.
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const {
        userId,
        city,
        area,
        products,
        paymentMethod,
        deliveryTime,
        totalAmount,
      } = createOrderDto;

      // Validate user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Validate city and area
      const cityEntity = await this.cityRepository.findOne({
        where: { id: city },
      });
      if (!cityEntity) {
        throw new NotFoundException('City not found');
      }
      const areaEntity = await this.areaRepository.findOne({
        where: { id: area },
      });
      if (!areaEntity) {
        throw new NotFoundException('Area not found');
      }

      // Validate products and calculate computed total
      let computedTotal = 0;
      const productDetails = await Promise.all(
        products.map(async (p) => {
          const dbProduct = await this.productRepository.findOne({
            where: { id: p.id },
          });
          if (!dbProduct) {
            throw new NotFoundException(`Product with ID ${p.id} not found`);
          }
          if (dbProduct.stock < p.quantity) {
            throw new NotFoundException(
              `Insufficient stock for product ${dbProduct.name}`,
            );
          }
          computedTotal += p.price * p.quantity;
          return {
            ...p,
            name: dbProduct.name,
            stock: dbProduct.stock,
            lowStockAlert: dbProduct.lowStockAlert,
          };
        }),
      );
      computedTotal = parseFloat(computedTotal.toFixed(2));
      if (computedTotal !== totalAmount) {
        throw new BadRequestException(
          'Total amount does not match sum of product prices',
        );
      }

      // Create and save order
      const order = this.orderRepository.create({
        user,
        city: cityEntity,
        area: areaEntity,
        products: productDetails,
        total_amount: computedTotal,
        payment_method: paymentMethod,
        delivery_time: new Date(deliveryTime),
        status: OrderStatus.PENDING,
      });
      const savedOrder = await this.orderRepository.save(order);

      await this.auditLogService.logAction('CREATE_ORDER', {
        orderId: savedOrder.id,
        userId: user.id,
      });

      // Notify user and admins
      this.notificationsGateway.notifyUser(
        savedOrder.user.id,
        `Your order #${savedOrder.id} has been placed successfully.`,
        'order_update',
      );
      this.notificationsGateway.notifyAdmins(
        `New order #${savedOrder.id} placed by user ${savedOrder.user.id}.`,
        'order_update',
      );

      return savedOrder;
    } catch (error) {
      this.logger.error(
        `Failed to create order: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  // Get all orders – if the requester is not admin, only return orders that belong to them.
  async findAll(
    requestUser: { id: number; role: string },
    status?: OrderStatus,
  ): Promise<Order[]> {
    try {
      const where: any = { deletedAt: null };
      if (status) {
        where.status = status;
      }
      if (requestUser.role !== 'admin') {
        where.user = { id: requestUser.id };
      }
      // Remove "products" from relations because it's a JSON column, not a relation.
      return await this.orderRepository.find({
        where,
        relations: ['user'],
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch orders: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch orders');
    }
  }

  // Get a specific order – enforce that non-admin users can access only their own orders.
  async findOne(
    id: number,
    requestUser: { id: number; role: string },
  ): Promise<Order> {
    try {
      // Remove "products" from relations as above.
      const order = await this.orderRepository.findOne({
        where: { id, deletedAt: null },
        relations: ['user'],
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      if (requestUser.role !== 'admin' && order.user.id !== requestUser.id) {
        throw new ForbiddenException('Access denied.');
      }
      return order;
    } catch (error) {
      this.logger.error(`Failed to fetch order: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch order');
    }
  }

  // Update an order – enforce ownership for non-admins and validate total if products are updated.
  async update(
    id: number,
    updateOrderDto: UpdateOrderDto,
    requestUser: { id: number; role: string },
  ): Promise<Order> {
    const order = await this.findOne(id, requestUser);
    if (updateOrderDto.products) {
      let computedTotal = 0;
      const productDetails = await Promise.all(
        updateOrderDto.products.map(async (p) => {
          const dbProduct = await this.productRepository.findOne({
            where: { id: p.id },
          });
          if (!dbProduct) {
            throw new NotFoundException(`Product with ID ${p.id} not found`);
          }
          if (dbProduct.stock < p.quantity) {
            throw new NotFoundException(
              `Insufficient stock for product ${dbProduct.name}`,
            );
          }
          computedTotal += p.price * p.quantity;
          return {
            ...p,
            name: dbProduct.name,
            stock: dbProduct.stock,
            lowStockAlert: dbProduct.lowStockAlert,
          };
        }),
      );
      computedTotal = parseFloat(computedTotal.toFixed(2));
      if (updateOrderDto.totalAmount !== computedTotal) {
        throw new BadRequestException(
          'Total amount does not match sum of product prices',
        );
      }
      order.products = productDetails;
      order.total_amount = computedTotal;
    }
    Object.assign(order, updateOrderDto);
    const savedOrder = await this.orderRepository.save(order);
    await this.auditLogService.logAction('UPDATE_ORDER', {
      orderId: savedOrder.id,
      updatedBy: requestUser.id,
    });

    this.notificationsGateway.notifyUser(
      savedOrder.user.id,
      `Your order #${savedOrder.id} has been updated.`,
      'order_update',
    );
    this.notificationsGateway.notifyAdmins(
      `Order #${savedOrder.id} updated by user ${savedOrder.user.id}.`,
      'order_update',
    );

    return savedOrder;
  }

  // Bulk update orders.
  async updateMany(
    updateManyOrderDto: UpdateManyOrderDto,
    requestUser: { id: number; role: string },
  ): Promise<Order[]> {
    const results: Order[] = [];
    for (const { id, data } of updateManyOrderDto.updates) {
      const order = await this.findOne(id, requestUser);
      if (data.products) {
        let computedTotal = 0;
        const productDetails = await Promise.all(
          data.products.map(async (p) => {
            const dbProduct = await this.productRepository.findOne({
              where: { id: p.id },
            });
            if (!dbProduct) {
              throw new NotFoundException(`Product with ID ${p.id} not found`);
            }
            if (dbProduct.stock < p.quantity) {
              throw new NotFoundException(
                `Insufficient stock for product ${dbProduct.name}`,
              );
            }
            computedTotal += p.price * p.quantity;
            return {
              ...p,
              name: dbProduct.name,
              stock: dbProduct.stock,
              lowStockAlert: dbProduct.lowStockAlert,
            };
          }),
        );
        computedTotal = parseFloat(computedTotal.toFixed(2));
        if (data.totalAmount !== computedTotal) {
          throw new BadRequestException(
            'Total amount does not match sum of product prices',
          );
        }
        order.products = productDetails;
        order.total_amount = computedTotal;
      }
      Object.assign(order, data);
      const updated = await this.orderRepository.save(order);
      results.push(updated);
      await this.auditLogService.logAction('UPDATE_ORDER', {
        orderId: updated.id,
        updatedBy: requestUser.id,
      });
    }
    return results;
  }

  // Soft delete an order – enforce that non-admin users can delete only their own orders.
  async remove(
    id: number,
    requestUser: { id: number; role: string },
  ): Promise<void> {
    const order = await this.findOne(id, requestUser);
    order.deletedAt = new Date();
    await this.orderRepository.save(order);
    await this.auditLogService.logAction('DELETE_ORDER', {
      orderId: order.id,
      deletedBy: requestUser.id,
    });
    this.notificationsGateway.notifyUser(
      order.user.id,
      `Your order #${order.id} has been canceled.`,
      'order_update',
    );
    this.notificationsGateway.notifyAdmins(
      `Order #${order.id} has been canceled by user ${order.user.id}.`,
      'order_update',
    );
  }

  // Bulk delete orders (soft deletion).
  async bulkDelete(
    bulkDeleteOrderDto: BulkDeleteOrderDto,
    requestUser: { id: number; role: string },
  ): Promise<{ deletedIds: number[] }> {
    const { ids } = bulkDeleteOrderDto;
    const deletedIds: number[] = [];
    for (const id of ids) {
      try {
        const order = await this.findOne(id, requestUser);
        order.deletedAt = new Date();
        await this.orderRepository.save(order);
        deletedIds.push(id);
        await this.auditLogService.logAction('DELETE_ORDER', {
          orderId: id,
          deletedBy: requestUser.id,
        });
      } catch (error) {
        this.logger.error(
          `Bulk delete error for order ID ${id}: ${error.message}`,
        );
      }
    }
    if (deletedIds.length === 0) {
      throw new NotFoundException('No orders found to delete');
    }
    return { deletedIds };
  }
}
