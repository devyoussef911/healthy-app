// src/analytics/analytics.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let orderRepository: any;
  let productRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockResolvedValue(10),
              getRawOne: jest.fn().mockResolvedValue({ revenue: 1000 }),
            })),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([
                { name: 'Milk', orderCount: 5 },
                { name: 'Yogurt', orderCount: 3 },
              ]),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    orderRepository = module.get(getRepositoryToken(Order));
    productRepository = module.get(getRepositoryToken(Product));
  });

  it('should return order analytics', async () => {
    const result = await service.getOrderAnalytics('day');
    expect(result).toBe(10);
  });

  it('should return revenue analytics', async () => {
    const result = await service.getRevenueAnalytics('day');
    expect(result).toBe(1000);
  });

  it('should return popular products', async () => {
    const result = await service.getPopularProducts(5);
    expect(result).toEqual([
      { name: 'Milk', orderCount: 5 },
      { name: 'Yogurt', orderCount: 3 },
    ]);
  });
});
