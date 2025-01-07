import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Category } from '../categories/category.entity';
import { PricingService } from '../pricing/pricing.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private pricingService: PricingService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const { name, description, price, stock, imageUrl, categoryId } =
        createProductDto;

      this.logger.log(
        `Creating product with DTO: ${JSON.stringify(createProductDto)}`,
      );

      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      this.logger.log(`Found category: ${JSON.stringify(category)}`);

      const product = this.productRepository.create({
        name,
        description,
        price,
        stock,
        imageUrl,
        category,
      });

      const savedProduct = await this.productRepository.save(product);

      this.logger.log(
        `Product created successfully: ${JSON.stringify(savedProduct)}`,
      );

      return savedProduct;
    } catch (error) {
      this.logger.error(
        `Failed to create product: ${error.message}`,
        error.stack,
      );

      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findOne(id: number): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Apply dynamic pricing
      product.price = await this.pricingService.calculateDynamicPrice(product); // Await the result

      this.logger.log(
        `Fetched product with dynamic pricing: ${JSON.stringify(product)}`,
      );

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to fetch product: ${error.message}`,
        error.stack,
      );

      throw new InternalServerErrorException('Failed to fetch product');
    }
  }

  async searchAndFilter(
    search?: string,
    categoryId?: number | null,
    minPrice?: number | null,
    maxPrice?: number | null,
    inStock?: boolean,
  ): Promise<Product[]> {
    this.logger.log(`Search and filter parameters:`, {
      search,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
    });

    const query = this.productRepository.createQueryBuilder('product');

    if (search) {
      query.andWhere('product.name LIKE :search', { search: `%${search}%` });
    }

    if (categoryId !== null && categoryId !== undefined) {
      query.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (
      minPrice !== null &&
      maxPrice !== null &&
      minPrice !== undefined &&
      maxPrice !== undefined
    ) {
      query.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== null && minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    } else if (maxPrice !== null && maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (inStock !== undefined) {
      query.andWhere('product.stock > 0');
    }

    try {
      const products = await query.getMany();
      this.logger.log(`Found products:`, products);
      return products;
    } catch (error) {
      this.logger.error(`Failed to fetch products:`, error.stack);
      throw new InternalServerErrorException('Failed to fetch product');
    }
  }
}
