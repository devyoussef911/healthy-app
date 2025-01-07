import { Controller, Post, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories') // Ensure the route prefix is 'categories'
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post() // Ensure this decorator is present
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }
}
