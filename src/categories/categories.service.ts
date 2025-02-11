import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateManyCategoryDto } from './dto/update-many-category.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { SearchCategoryDto } from './dto/search-category.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private auditLogService: AuditLogService,
  ) {}

  // Create a new category (Admin Only)
  async create(
    createCategoryDto: CreateCategoryDto,
    adminId: number,
  ): Promise<Category> {
    const { name, parentId } = createCategoryDto;
    const category = new Category();
    category.name = name;
    if (parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: parentId, deletedAt: null },
      });
      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }
      category.parent = parentCategory;
    }
    const created = await this.categoryRepository.save(category);
    await this.auditLogService.logAction('CREATE_CATEGORY', {
      categoryId: created.id,
      name,
      adminId,
    });
    return created;
  }

  // Retrieve all categories (only non-deleted) with relations
  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { deletedAt: null },
      relations: ['children', 'parent', 'products'],
    });
  }

  // Retrieve a single category by ID (non-deleted)
  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['children', 'parent', 'products'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  // Advanced search for categories
  async searchCategories(dto: SearchCategoryDto): Promise<Category[]> {
    const {
      search,
      parentId,
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
    } = dto;
    const query = this.categoryRepository.createQueryBuilder('category');

    // Only non-deleted categories
    query.where('category.deletedAt IS NULL');

    if (search) {
      query.andWhere(
        '(category.name ILIKE :search OR category.description ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (parentId !== undefined) {
      query.andWhere('category.parentId = :parentId', { parentId });
    }

    query.orderBy(
      `category.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );
    query.skip((page - 1) * limit).take(limit);

    return query.getMany();
  }

  // Update a single category (Admin Only)
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    adminId: number,
  ): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, deletedAt: null },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    Object.assign(category, updateCategoryDto);
    const updated = await this.categoryRepository.save(category);
    await this.auditLogService.logAction('UPDATE_CATEGORY', {
      categoryId: updated.id,
      adminId,
    });
    return updated;
  }

  // Bulk update categories (Admin Only)
  async updateMany(
    updateManyCategoryDto: UpdateManyCategoryDto,
    adminId: number,
  ): Promise<Category[]> {
    const results: Category[] = [];
    for (const { id, data } of updateManyCategoryDto.updates) {
      const category = await this.categoryRepository.findOne({
        where: { id, deletedAt: null },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      Object.assign(category, data);
      const updated = await this.categoryRepository.save(category);
      results.push(updated);
      await this.auditLogService.logAction('UPDATE_CATEGORY', {
        categoryId: updated.id,
        adminId,
      });
    }
    return results;
  }

  // Soft delete a single category (Admin Only)
  async remove(id: number, adminId: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id, deletedAt: null },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    category.deletedAt = new Date();
    await this.categoryRepository.save(category);
    await this.auditLogService.logAction('DELETE_CATEGORY', {
      categoryId: id,
      adminId,
    });
  }

  // Bulk delete categories (Admin Only, Soft Delete)
  async bulkDelete(
    bulkDeleteDto: BulkDeleteDto,
    adminId: number,
  ): Promise<{ deletedIds: number[] }> {
    const { ids } = bulkDeleteDto;
    const deletedIds: number[] = [];
    for (const id of ids) {
      const category = await this.categoryRepository.findOne({
        where: { id, deletedAt: null },
      });
      if (category) {
        category.deletedAt = new Date();
        await this.categoryRepository.save(category);
        deletedIds.push(id);
        await this.auditLogService.logAction('DELETE_CATEGORY', {
          categoryId: id,
          adminId,
        });
      }
    }
    if (deletedIds.length === 0) {
      throw new NotFoundException('No categories found to delete');
    }
    return { deletedIds };
  }

  // Restore a single soft-deleted category (Admin Only)
  async restore(id: number, adminId: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, deletedAt: Not(null) },
      relations: ['children', 'parent', 'products'],
    });
    if (!category) {
      throw new NotFoundException('Category not found or not deleted');
    }
    category.deletedAt = null;
    const restored = await this.categoryRepository.save(category);
    await this.auditLogService.logAction('RESTORE_CATEGORY', {
      categoryId: restored.id,
      adminId,
    });
    return restored;
  }

  // Bulk restore soft-deleted categories (Admin Only)
  async bulkRestore(
    bulkDeleteDto: BulkDeleteDto,
    adminId: number,
  ): Promise<{ restoredIds: number[] }> {
    const { ids } = bulkDeleteDto;
    const restoredIds: number[] = [];
    for (const id of ids) {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (category && category.deletedAt) {
        category.deletedAt = null;
        await this.categoryRepository.save(category);
        restoredIds.push(id);
        await this.auditLogService.logAction('RESTORE_CATEGORY', {
          categoryId: id,
          adminId,
        });
      }
    }
    if (restoredIds.length === 0) {
      throw new NotFoundException('No categories found to restore');
    }
    return { restoredIds };
  }
}
