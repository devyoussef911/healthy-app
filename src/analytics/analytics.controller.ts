// src/analytics/analytics.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import {
  GetOrderAnalyticsDto,
  GetRevenueAnalyticsDto,
  GetPopularProductsDto,
} from './dto/get-analytics.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // Restrict access to admins
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('orders')
  async getOrderAnalytics(@Query() query: GetOrderAnalyticsDto) {
    return this.analyticsService.getOrderAnalytics(query.period);
  }

  @Get('revenue')
  async getRevenueAnalytics(@Query() query: GetRevenueAnalyticsDto) {
    return this.analyticsService.getRevenueAnalytics(query.period);
  }

  @Get('popular-products')
  async getPopularProducts(@Query() query: GetPopularProductsDto) {
    return this.analyticsService.getPopularProducts(query.limit);
  }
}
