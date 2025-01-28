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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { Product } from './product.entity';
import { IRequestWithLang } from '../types/request.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@ApiTags('products')
@Controller(':lang/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Create Product
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) // Ensure only admins can create products
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
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

  // Fetch a Single Product
  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IRequestWithLang,
  ): Promise<Product> {
    try {
      const lang = req.i18nLang || 'en';
      return await this.productsService.getProductDetails(id, lang);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Product not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // Search and Filter Products
  @Get('search')
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: 'Category ID',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price',
  })
  @ApiQuery({
    name: 'inStock',
    required: false,
    type: Boolean,
    description: 'In-stock status',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [Product],
  })
  @ApiResponse({ status: 404, description: 'No products found' })
  async searchAndFilter(
    @Req() req: IRequestWithLang, // Move this parameter first
    @Query('search') search?: string,
    @Query('categoryId', new DefaultValuePipe(null), ParseIntPipe)
    categoryId?: number,
    @Query('minPrice', new DefaultValuePipe(null), ParseIntPipe)
    minPrice?: number,
    @Query('maxPrice', new DefaultValuePipe(null), ParseIntPipe)
    maxPrice?: number,
    @Query('inStock', new DefaultValuePipe(true)) inStock?: boolean,
  ): Promise<Product[]> {
    const lang = req.i18nLang || 'en';
    const products = await this.productsService.searchAndFilter(
      search,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      lang,
    );

    if (!products.length) {
      throw new NotFoundException('No products found matching the criteria');
    }

    return products;
  }
}
