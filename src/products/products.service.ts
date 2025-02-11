import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../categories/category.entity';
import { TranslationsService } from '../translations/translations.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly translationsService: TranslationsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const {
        name,
        description,
        price,
        stock,
        imageUrl,
        categoryId,
        variations,
      } = createProductDto;

      this.logger.log(
        `Creating product with data: ${JSON.stringify(createProductDto)}`,
      );

      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        this.logger.warn(`Category with ID ${categoryId} not found`);
        throw new NotFoundException('Category not found');
      }

      const product = this.productRepository.create({
        name,
        description,
        price,
        stock,
        imageUrl,
        category,
        variations,
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

  async findOne(id: number, lang: string): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        this.logger.warn(`Product with ID ${id} not found`);
        throw new NotFoundException('Product not found');
      }

      product.name = await this.translationsService.getTranslation(
        product.name,
        lang,
      );
      product.description = await this.translationsService.getTranslation(
        product.description,
        lang,
      );

      this.logger.log(`Fetched product: ${JSON.stringify(product)}`);
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
    lang?: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<Product[]> {
    this.logger.log('Applying search and filter criteria', {
      search,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    const cacheKey = `products:${search || ''}:${categoryId || 'all'}:${minPrice || 0}:${
      maxPrice || 0
    }:${inStock}:${page}:${limit}:${sortBy}:${sortOrder}`;
    const cached = await this.cacheManager.get<Product[]>(cacheKey);
    if (cached) {
      this.logger.log(`Returning cached products for key: ${cacheKey}`);
      return cached;
    }

    const query = this.productRepository.createQueryBuilder('product');

    if (search) {
      query.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }
    if (categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId });
    }
    if (minPrice !== undefined && minPrice !== null) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined && maxPrice !== null) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }
    if (inStock) {
      query.andWhere('product.stock > 0');
    }

    query.orderBy(
      `product.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );
    query.skip((page - 1) * limit).take(limit);

    try {
      const products = await query.getMany();

      if (lang) {
        for (const product of products) {
          product.name = await this.translationsService.getTranslation(
            product.name,
            lang,
          );
          product.description = await this.translationsService.getTranslation(
            product.description,
            lang,
          );
        }
      }

      // Set cache with TTL as a number (300 seconds)
      await this.cacheManager.set(cacheKey, products, 300);
      return products;
    } catch (error) {
      this.logger.error(
        `Failed to fetch products: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  async updateProduct(
    id: number,
    updateDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      this.logger.warn(`Product with ID ${id} not found for update`);
      throw new NotFoundException('Product not found');
    }

    if (updateDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateDto.categoryId },
      });
      if (!category) {
        this.logger.warn(
          `Category with ID ${updateDto.categoryId} not found during product update`,
        );
        throw new NotFoundException('Category not found');
      }
      updateDto['category'] = category;
    }

    Object.assign(product, updateDto);
    const savedProduct = await this.productRepository.save(product);
    this.logger.log(`Product with ID ${id} updated successfully`);
    return savedProduct;
  }

  async deleteProduct(id: number): Promise<{ message: string }> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      this.logger.warn(`Product with ID ${id} not found for deletion`);
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.remove(product);
    this.logger.log(`Product with ID ${id} deleted successfully`);
    return { message: 'Product deleted successfully' };
  }

  async translateProduct(product: Product, lang: string): Promise<Product> {
    try {
      product.name = await this.translationsService.getTranslation(
        product.name,
        lang,
      );
      product.description = await this.translationsService.getTranslation(
        product.description,
        lang,
      );
      return product;
    } catch (error) {
      this.logger.error(`Translation failed: ${error.message}`);
      return product;
    }
  }

  async getProductDetails(productId: number, lang: string): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        this.logger.warn(`Product with ID ${productId} not found`);
        throw new NotFoundException('Product not found');
      }

      product.name = await this.translationsService.getTranslation(
        product.name,
        lang,
      );
      product.description = await this.translationsService.getTranslation(
        product.description,
        lang,
      );

      this.logger.log(`Fetched product details for ID: ${productId}`);
      return product;
    } catch (error) {
      this.logger.error(
        `Failed to fetch product details: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch product details');
    }
  }
}
