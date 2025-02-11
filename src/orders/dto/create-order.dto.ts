// src/orders/dto/create-order.dto.ts
import {
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ProductDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Quantity ordered', example: 2 })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Price per unit', example: 6.5 })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Optional size/variation',
    example: '1 liter',
    required: false,
  })
  @IsString()
  size?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'City ID for the order', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  city: number;

  @ApiProperty({ description: 'Area ID for the order', example: 2 })
  @IsNotEmpty()
  @IsNumber()
  area: number;

  @ApiProperty({ description: 'User ID who places the order', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'List of products in the order',
    type: [ProductDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[];

  @ApiProperty({
    description:
      'Total order amount (should equal the sum of (price * quantity) for each product)',
    example: 13.0,
  })
  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @ApiProperty({
    description: 'Payment method used (e.g., online, COD)',
    example: 'online',
  })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @ApiProperty({
    description: 'Delivery time as a string (ISO date)',
    example: '2025-03-01T12:00:00Z',
  })
  @IsNotEmpty()
  @IsString()
  deliveryTime: string;
}
