// src/products/dto/create-product.dto.ts
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Min,
  IsArray,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;

  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @IsArray()
  variations: Array<{
    size: string;
    price: number;
    stock: number;
  }>;
}
