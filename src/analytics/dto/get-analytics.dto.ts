import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsIn,
} from 'class-validator';

export class GetOrderAnalyticsDto {
  @IsOptional()
  @IsString()
  @IsIn(['day', 'week', 'month'], {
    message: 'Period must be one of: day, week, month',
  })
  period?: string;
}

export class GetRevenueAnalyticsDto {
  @IsOptional()
  @IsString()
  @IsIn(['day', 'week', 'month'], {
    message: 'Period must be one of: day, week, month',
  })
  period?: string;
}

export class GetPopularProductsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  limit?: number;
}
