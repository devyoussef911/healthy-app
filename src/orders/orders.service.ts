import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { OrderStatus } from './enums/order-status.enum';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @Inject(NotificationsGateway)
    private readonly notificationsGateway: NotificationsGateway,
    private readonly inventoryService: InventoryService, // Inject InventoryService
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const { userId, products, city, area, payment_method, delivery_time } =
        createOrderDto;

      // Log the incoming DTO
      this.logger.log(
        `Creating order with DTO: ${JSON.stringify(createOrderDto)}`,
      );

      // Find the user
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Validate products and calculate total amount
      let total_amount = 0;
      const productDetails = await Promise.all(
        products.map(async (product) => {
          const dbProduct = await this.productRepository.findOne({
            where: { id: product.id },
          });
          if (!dbProduct) {
            throw new NotFoundException(
              `Product with ID ${product.id} not found`,
            );
          }

          // Check stock for variations
          if (product.size) {
            const variation = dbProduct.variations.find(
              (v) => v.size === product.size,
            );
            if (!variation || variation.stock < product.quantity) {
              throw new NotFoundException(
                `Insufficient stock for product ${dbProduct.name} (${product.size})`,
              );
            }
          } else if (dbProduct.stock < product.quantity) {
            throw new NotFoundException(
              `Insufficient stock for product ${dbProduct.name}`,
            );
          }

          total_amount += product.price * product.quantity;
          return {
            id: dbProduct.id,
            name: dbProduct.name,
            quantity: product.quantity,
            price: product.price,
            stock: dbProduct.stock,
            lowStockAlert: dbProduct.lowStockAlert,
            size: product.size, // Include size for variations
          };
        }),
      );

      // Create and save the order
      const order = this.orderRepository.create({
        user,
        city,
        area,
        products: productDetails,
        total_amount,
        payment_method,
        delivery_time,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await this.orderRepository.save(order);

      // Update inventory and check for low stock alerts
      await this.inventoryService.updateInventory(savedOrder.id);

      // Log the saved order
      this.logger.log(
        `Order created successfully: ${JSON.stringify(savedOrder)}`,
      );

      // Notify the user and admins
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
      // Log the error
      this.logger.error(
        `Failed to create order: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async cancel(orderId: number): Promise<void> {
    try {
      const order = await this.findOne(orderId);

      // Update inventory when order is canceled
      await this.inventoryService.updateInventory(orderId);

      await this.orderRepository.delete(orderId);

      // Notify the user and admins
      this.notificationsGateway.notifyUser(
        order.user.id,
        `Your order #${order.id} has been canceled.`,
        'order_update', // Add type argument
      );
      this.notificationsGateway.notifyAdmins(
        `Order #${order.id} has been canceled by user ${order.user.id}.`,
        'order_update', // Add type argument
      );
    } catch (error) {
      this.logger.error(
        `Failed to cancel order: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to cancel order');
    }
  }

  async findAll(status?: OrderStatus): Promise<Order[]> {
    try {
      const where = status ? { status } : {};
      return await this.orderRepository.find({
        where,
        relations: ['user', 'products'],
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch orders: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch orders');
    }
  }

  async findOne(id: number): Promise<Order> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['user', 'products'],
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      return order;
    } catch (error) {
      this.logger.error(`Failed to fetch order: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch order');
    }
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    try {
      const order = await this.findOne(id);
      Object.assign(order, updateOrderDto);
      const savedOrder = await this.orderRepository.save(order);

      // Notify the user and admins
      this.notificationsGateway.notifyUser(
        savedOrder.user.id,
        `Your order #${savedOrder.id} status has been updated to ${savedOrder.status}.`,
        'order_update', // Add type argument
      );
      this.notificationsGateway.notifyAdmins(
        `Order #${savedOrder.id} status updated to ${savedOrder.status}.`,
        'order_update', // Add type argument
      );

      return savedOrder;
    } catch (error) {
      this.logger.error(
        `Failed to update order: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to update order');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const order = await this.findOne(id);
      await this.orderRepository.remove(order);

      // Notify the user and admins
      this.notificationsGateway.notifyUser(
        order.user.id,
        `Your order #${order.id} has been canceled.`,
        'order_update', // Add type argument
      );
      this.notificationsGateway.notifyAdmins(
        `Order #${order.id} has been canceled by user ${order.user.id}.`,
        'order_update', // Add type argument
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete order: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete order');
    }
  }
}
