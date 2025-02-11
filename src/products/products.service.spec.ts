// products/products.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;

  const mockProductRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        // You can also provide a mock for the Category repository if needed.
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const product = {
        id: 1,
        name: 'Milk',
        description: 'Fresh Milk',
        price: 10,
        stock: 100,
      };
      mockProductRepository.findOne.mockResolvedValue(product);
      const updateDto: UpdateProductDto = { name: 'Organic Milk' };
      const updatedProduct = { ...product, name: 'Organic Milk' };
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.updateProduct(1, updateDto);
      expect(result.name).toEqual('Organic Milk');
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockProductRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      const updateDto: UpdateProductDto = { name: 'Organic Milk' };
      await expect(service.updateProduct(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const product = { id: 1, name: 'Milk' };
      mockProductRepository.findOne.mockResolvedValue(product);
      mockProductRepository.remove.mockResolvedValue(product);

      const result = await service.deleteProduct(1);
      expect(result).toEqual({ message: 'Product deleted successfully' });
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockProductRepository.remove).toHaveBeenCalledWith(product);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      await expect(service.deleteProduct(1)).rejects.toThrow(NotFoundException);
    });
  });
});
