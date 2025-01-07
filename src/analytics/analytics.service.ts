import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getOrderAnalytics(period: string): Promise<number> {
    const query = this.orderRepository.createQueryBuilder('order');

    if (period === 'day') {
      query.where("order.createdAt >= NOW() - INTERVAL '1 day'");
    } else if (period === 'week') {
      query.where("order.createdAt >= NOW() - INTERVAL '1 week'");
    } else if (period === 'month') {
      query.where("order.createdAt >= NOW() - INTERVAL '1 month'");
    }

    return query.getCount();
  }

  async getRevenueAnalytics(period: string): Promise<number> {
    const query = this.orderRepository.createQueryBuilder('order');

    if (period === 'day') {
      query.where("order.createdAt >= NOW() - INTERVAL '1 day'");
    } else if (period === 'week') {
      query.where("order.createdAt >= NOW() - INTERVAL '1 week'");
    } else if (period === 'month') {
      query.where("order.createdAt >= NOW() - INTERVAL '1 month'");
    }

    const result = await query
      .select('SUM(order.totalAmount)', 'revenue')
      .getRawOne();
    return result.revenue || 0;
  }

  async getPopularProducts(limit: number): Promise<any[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.orders', 'order')
      .select('product.name', 'name')
      .addSelect('COUNT(order.id)', 'orderCount')
      .groupBy('product.id')
      .orderBy('orderCount', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getLowStockProducts(): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.stock <= :threshold', { threshold: 10 })
      .getMany();
  }
}
