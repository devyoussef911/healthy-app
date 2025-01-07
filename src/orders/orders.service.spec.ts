// src/orders/orders.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { InventoryService } from '../inventory/inventory.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: any;
  let userRepository: any;
  let productRepository: any;
  let notificationsGateway: any;
  let inventoryService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn().mockReturnValue({}),
            save: jest.fn().mockResolvedValue({}),
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: NotificationsGateway,
          useValue: {
            notifyUser: jest.fn(),
            notifyAdmins: jest.fn(),
          },
        },
        {
          provide: InventoryService,
          useValue: {
            updateInventory: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get(getRepositoryToken(Order));
    userRepository = module.get(getRepositoryToken(User));
    productRepository = module.get(getRepositoryToken(Product));
    notificationsGateway = module.get(NotificationsGateway);
    inventoryService = module.get(InventoryService);
  });

  it('should create an order', async () => {
    const createOrderDto = {
      userId: 1,
      products: [{ product_id: 1, quantity: 2 }],
      city: 'Test City',
      area: 'Test Area',
      payment_method: 'cod',
    };

    const result = await service.create(createOrderDto);
    expect(result).toBeDefined();
    expect(orderRepository.create).toHaveBeenCalled();
    expect(orderRepository.save).toHaveBeenCalled();
    expect(inventoryService.updateInventory).toHaveBeenCalled();
  });
});
