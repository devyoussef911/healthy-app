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
import { City } from 'src/locations/city.entity';
import { Area } from 'src/locations/area.entity';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @Inject(NotificationsGateway)
    private readonly notificationsGateway: NotificationsGateway,
    private readonly inventoryService: InventoryService, // Inject InventoryService
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const { userId, city, area, products, paymentMethod, deliveryTime } =
        createOrderDto;

      // Find the user
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Find city and area
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

      // Validate products
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

          // Check stock
          if (dbProduct.stock < product.quantity) {
            throw new NotFoundException(
              `Insufficient stock for product ${dbProduct.name}`,
            );
          }

          total_amount += product.price * product.quantity;
          return { ...product, name: dbProduct.name, stock: dbProduct.stock };
        }),
      );

      // Create and save the order
      const createdOrder = this.orderRepository.create({
        user,
        city: cityEntity,
        area: areaEntity,
        products: productDetails,
        total_amount,
        payment_method: paymentMethod,
        delivery_time: new Date(deliveryTime),
        status: OrderStatus.PENDING,
      });

      const savedOrder = await this.orderRepository.save(createdOrder);

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

  // async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
  //   const order = this.orderRepository.create(createOrderDto);
  //   return this.orderRepository.save(order);
  // }

  async updateInventory(orderId: number): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new Error('Order not found');
    }
    // Perform inventory update logic here
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
