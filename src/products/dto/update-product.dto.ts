// src/products/dto/update-product.dto.ts
import {
  IsOptional,
  IsString,
  IsNumber,
  IsUrl,
  Min,
  IsArray,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsArray()
  variations?: Array<{
    size: string;
    price: number;
    stock: number;
  }>;
}
