import {
  IsOptional,
  IsNumber,
  IsBoolean,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchProductsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number) // Ensure the value is transformed to a number
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0) // Ensure the value is a positive number
  @Type(() => Number) // Ensure the value is transformed to a number
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0) // Ensure the value is a positive number
  @Type(() => Number) // Ensure the value is transformed to a number
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean) // Ensure the value is transformed to a boolean
  inStock?: boolean;
}
