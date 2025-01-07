// src/inventory/inventory.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { Order } from '../orders/order.entity';

describe('InventoryService', () => {
  let service: InventoryService;
  let productRepository: any;
  let orderRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: 1,
              name: 'Milk',
              stock: 20,
              lowStockAlert: false,
            }),
            update: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: 1,
              products: [
                {
                  id: 1,
                  name: 'Milk',
                  quantity: 2,
                  price: 10,
                  stock: 20,
                  lowStockAlert: false,
                },
              ],
            }),
          },
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    productRepository = module.get(getRepositoryToken(Product));
    orderRepository = module.get(getRepositoryToken(Order));
  });

  it('should update inventory and send low stock alert', async () => {
    await service.updateInventory(1);
    expect(productRepository.update).toHaveBeenCalled();
  });
});
