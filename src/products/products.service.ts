import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
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
  ) {}

  /**
   * Creates a new product
   * @param createProductDto Product creation DTO
   * @returns Newly created product
   */
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

      // Verify the category exists
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        this.logger.warn(`Category with ID ${categoryId} not found`);
        throw new NotFoundException('Category not found');
      }

      // Create the product entity
      const product = this.productRepository.create({
        name,
        description,
        price,
        stock,
        imageUrl,
        category,
        variations,
      });

      // Save the product to the database
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

  /**
   * Finds a product by ID and applies translations
   * @param id Product ID
   * @param lang Language code
   * @returns Translated product
   */
  async findOne(id: number, lang: string): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        this.logger.warn(`Product with ID ${id} not found`);
        throw new NotFoundException('Product not found');
      }

      // Apply translations
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

  /**
   * Searches and filters products with optional translations
   * @param search Search keyword
   * @param categoryId Filter by category ID
   * @param minPrice Minimum price filter
   * @param maxPrice Maximum price filter
   * @param inStock Filter by stock availability
   * @param lang Language code for translations
   * @returns Filtered and translated products
   */
  async searchAndFilter(
    search?: string,
    categoryId?: number | null,
    minPrice?: number | null,
    maxPrice?: number | null,
    inStock?: boolean,
    lang?: string,
  ): Promise<Product[]> {
    this.logger.log('Applying search and filter criteria', {
      search,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
    });

    const query = this.productRepository.createQueryBuilder('product');

    // Apply search and filter criteria
    if (search)
      query.andWhere('product.name LIKE :search', { search: `%${search}%` });
    if (categoryId)
      query.andWhere('product.category.id = :categoryId', { categoryId });
    if (minPrice !== undefined)
      query.andWhere('product.price >= :minPrice', { minPrice });
    if (maxPrice !== undefined)
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    if (inStock) query.andWhere('product.stock > 0');

    try {
      const products = await query.getMany();

      // Apply translations if a language is specified
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

      this.logger.log(`Found ${products.length} products`);
      return products;
    } catch (error) {
      this.logger.error(
        `Failed to fetch products: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  /**
   * Fetch product details and apply translations
   * @param productId Product ID
   * @param lang Language code
   * @returns Translated product details
   */
  async getProductDetails(productId: number, lang: string): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        this.logger.warn(`Product with ID ${productId} not found`);
        throw new NotFoundException('Product not found');
      }

      // Apply translations
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
