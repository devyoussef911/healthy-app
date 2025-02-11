// src/products/products.controller.ts
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
  Put,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './product.entity';
import { IRequestWithLang } from '../types/request.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { UpdateProductDto } from './dto/update-product.dto';
// Optionally, if you have a Public decorator:
import { Public } from '../common/decorators/public.decorator';
import { SearchProductsDto } from './dto/search-products.dto';

@ApiTags('products')
@Controller(':lang/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Create Product (Admin Only)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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

  // Get a specific product (Public)
  @Public() // Mark this route as public if you use a custom Public decorator.
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
    const lang = req.i18nLang || 'en';
    return await this.productsService.getProductDetails(id, lang);
  }

  // Update Product (Admin Only)
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product or Category not found' })
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: IRequestWithLang,
  ): Promise<Product> {
    const lang = req.i18nLang || 'en';
    const updatedProduct = await this.productsService.updateProduct(
      id,
      updateProductDto,
    );
    return await this.productsService.translateProduct(updatedProduct, lang);
  }

  // Delete Product (Admin Only)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return await this.productsService.deleteProduct(id);
  }

  // Search and filter products (Public)
  @Public()
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
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field to sort by (e.g., price, name)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Sort order (asc or desc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [Product],
  })
  @ApiResponse({ status: 404, description: 'No products found' })
  async searchAndFilter(
    @Req() req: IRequestWithLang,
    @Query() query: SearchProductsDto,
  ): Promise<Product[]> {
    // Provide defaults if needed:
    const lang = req.i18nLang || 'en';
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
    } = query;
    const products = await this.productsService.searchAndFilter(
      search,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      lang,
      page,
      limit,
      sortBy,
      sortOrder,
    );

    if (!products.length) {
      throw new NotFoundException('No products found matching the criteria');
    }
    return products;
  }
}
