import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { Product } from '../products/product.entity';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PricingService],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  it('should calculate dynamic price during peak hours', () => {
    const product = { price: 10, stock: 20 } as Product;
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(12); // Mock peak hour
    const price = service.calculateDynamicPrice(product);
    expect(price).toBe(12); // 20% increase
  });

  it('should calculate dynamic price for low stock', () => {
    const product = { price: 10, stock: 5 } as Product;
    const price = service.calculateDynamicPrice(product);
    expect(price).toBe(11); // 10% increase
  });

  it('should throw an error for invalid product data', () => {
    const product = { price: -10, stock: 5 } as Product;
    expect(() => service.calculateDynamicPrice(product)).toThrow(
      'Invalid product data',
    );
  });
});
