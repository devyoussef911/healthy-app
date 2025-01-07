import {
  IsArray,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductDto {
  @IsNumber()
  product_id: number;

  @IsNumber()
  quantity: number;

  @IsDecimal()
  price: number;
}

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  area: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[];

  @IsDecimal()
  total_amount: number;

  @IsString()
  @IsEnum(['online', 'cod'])
  payment_method: string;

  @IsOptional()
  @IsString()
  delivery_time?: string; // Optional for "later" orders
}
