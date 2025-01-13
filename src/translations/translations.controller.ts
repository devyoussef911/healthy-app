// src/translations/translations.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('translations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Post()
  async createTranslation(
    @Body('key') key: string,
    @Body('values') values: Record<string, string>,
  ) {
    return this.translationsService.createTranslation(key, values);
  }

  @Get(':key/:lang')
  async getTranslation(@Param('key') key: string, @Param('lang') lang: string) {
    return this.translationsService.getTranslation(key, lang);
  }

  @Put(':key')
  async updateTranslation(
    @Param('key') key: string,
    @Body('values') values: Record<string, string>,
  ) {
    return this.translationsService.updateTranslation(key, values);
  }

  @Delete(':key')
  async deleteTranslation(@Param('key') key: string) {
    return this.translationsService.deleteTranslation(key);
  }
}
