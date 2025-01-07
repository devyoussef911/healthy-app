// src/products/products.controller.spec.ts (updated)
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './product.entity';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            create: jest.fn().mockResolvedValue({
              id: 1,
              name: 'Milk',
              description: 'Fresh milk',
              price: 10.5,
              stock: 100,
              imageUrl: 'https://example.com/milk.jpg',
              categoryId: 1,
            }),
            findOne: jest.fn().mockResolvedValue({
              id: 1,
              name: 'Milk',
              price: 12, // Dynamic price applied
              stock: 20,
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should create a product', async () => {
    const createProductDto: CreateProductDto = {
      name: 'Milk',
      description: 'Fresh milk',
      price: 10.5,
      stock: 100,
      imageUrl: 'https://example.com/milk.jpg',
      categoryId: 1,
    };

    const result = await controller.create(createProductDto);
    expect(result).toEqual({
      id: 1,
      name: 'Milk',
      description: 'Fresh milk',
      price: 10.5,
      stock: 100,
      imageUrl: 'https://example.com/milk.jpg',
      categoryId: 1,
    });
    expect(service.create).toHaveBeenCalledWith(createProductDto);
  });

  it('should fetch a product with dynamic pricing', async () => {
    const result = await controller.findOne(1);
    expect(result).toEqual({
      id: 1,
      name: 'Milk',
      price: 12, // Dynamic price applied
      stock: 20,
    });
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should throw an error if product creation fails', async () => {
    jest
      .spyOn(service, 'create')
      .mockRejectedValue(new Error('Failed to create product'));

    const createProductDto: CreateProductDto = {
      name: 'Milk',
      description: 'Fresh milk',
      price: 10.5,
      stock: 100,
      imageUrl: 'https://example.com/milk.jpg',
      categoryId: 1,
    };

    await expect(controller.create(createProductDto)).rejects.toThrow(
      'Failed to create product',
    );
  });
});
