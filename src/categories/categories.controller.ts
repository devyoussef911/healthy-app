import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateManyCategoryDto } from './dto/update-many-category.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { SearchCategoryDto } from './dto/search-category.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Category } from './category.entity';

@ApiTags('categories')
@Controller(':lang/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Create a new category (Admin Only)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Parent category not found' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: any,
  ): Promise<Category> {
    const adminId = req.user.id;
    return this.categoriesService.create(createCategoryDto, adminId);
  }

  // Get all categories (Public)
  @Public()
  @Get()
  @ApiOperation({ summary: 'Retrieve all categories with nested products' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [Category],
  })
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  // Get a specific category (Public)
  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a specific category by ID with nested products',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  // Advanced Search (Public) using query parameters
  @Public()
  @Get('search')
  @ApiOperation({
    summary:
      'Advanced search for categories by name or description, with pagination and sorting',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [Category],
  })
  async search(@Req() req: any): Promise<Category[]> {
    // Get search parameters from the query string
    const searchDto: SearchCategoryDto = req.query;
    return this.categoriesService.searchCategories(searchDto);
  }

  // Update a specific category (Admin Only)
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a specific category' })
  @ApiParam({ name: 'id', type: Number, description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() req: any,
  ): Promise<Category> {
    const adminId = req.user.id;
    return this.categoriesService.update(id, updateCategoryDto, adminId);
  }

  // Bulk update categories (Admin Only)
  @Put('bulk/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update categories' })
  @ApiBody({ type: UpdateManyCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Categories updated successfully',
    type: [Category],
  })
  async updateMany(
    @Body() updateManyCategoryDto: UpdateManyCategoryDto,
    @Req() req: any,
  ): Promise<Category[]> {
    const adminId = req.user.id;
    return this.categoriesService.updateMany(updateManyCategoryDto, adminId);
  }

  // Delete a specific category (Admin Only, Soft Delete)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category (soft delete)' })
  @ApiParam({ name: 'id', type: Number, description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<void> {
    const adminId = req.user.id;
    return this.categoriesService.remove(id, adminId);
  }

  // Bulk delete categories (Admin Only, Soft Delete)
  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk delete categories (soft delete)' })
  @ApiBody({
    description: 'Array of category IDs to delete',
    type: BulkDeleteDto,
  })
  @ApiResponse({ status: 200, description: 'Categories deleted successfully' })
  @ApiResponse({ status: 404, description: 'No categories found to delete' })
  async bulkDelete(
    @Body() bulkDeleteDto: BulkDeleteDto,
    @Req() req: any,
  ): Promise<{ deletedIds: number[] }> {
    const adminId = req.user.id;
    return this.categoriesService.bulkDelete(bulkDeleteDto, adminId);
  }

  // Restore a specific category (Admin Only)
  @Put('restore/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted category' })
  @ApiParam({ name: 'id', type: Number, description: 'Category ID to restore' })
  @ApiResponse({
    status: 200,
    description: 'Category restored successfully',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found or not deleted',
  })
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<Category> {
    const adminId = req.user.id;
    return this.categoriesService.restore(id, adminId);
  }

  // Bulk restore categories (Admin Only)
  @Put('bulk/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk restore soft-deleted categories' })
  @ApiBody({
    description: 'Array of category IDs to restore',
    type: BulkDeleteDto,
  })
  @ApiResponse({ status: 200, description: 'Categories restored successfully' })
  @ApiResponse({ status: 404, description: 'No categories found to restore' })
  async bulkRestore(
    @Body() bulkDeleteDto: BulkDeleteDto,
    @Req() req: any,
  ): Promise<{ restoredIds: number[] }> {
    const adminId = req.user.id;
    return this.categoriesService.bulkRestore(bulkDeleteDto, adminId);
  }
}
