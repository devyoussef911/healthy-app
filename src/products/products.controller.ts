import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Query,
  NotFoundException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './product.entity';
import { SearchProductsDto } from './dto/search-products.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'Failed to create product' })
  async create(@Body() createProductDto: CreateProductDto) {
    try {
      return await this.productsService.create(createProductDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to create product',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Product found', type: Product })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: number): Promise<Product> {
    try {
      return await this.productsService.findOne(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to fetch product',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('search')
  async searchAndFilter(
    @Query('search') search?: string,
    @Query('categoryId', new DefaultValuePipe(null), ParseIntPipe)
    categoryId?: number,
    @Query('minPrice', new DefaultValuePipe(null), ParseIntPipe)
    minPrice?: number,
    @Query('maxPrice', new DefaultValuePipe(null), ParseIntPipe)
    maxPrice?: number,
    @Query('inStock') inStock?: boolean,
  ): Promise<Product[]> {
    const products = await this.productsService.searchAndFilter(
      search,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
    );

    if (!products.length) {
      throw new NotFoundException('No products found matching the criteria');
    }

    return products;
  }
}
