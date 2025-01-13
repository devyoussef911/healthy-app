import {
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsString()
  size?: string; // Optional field for variations
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  city: number; // Match service field name

  @IsNotEmpty()
  @IsNumber()
  area: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number; // Match service field name

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[];

  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @IsNotEmpty()
  @IsString()
  paymentMethod: string; // Correct name to match service usage

  @IsNotEmpty()
  @IsString()
  deliveryTime: string; // Correct name to match service usage
}
