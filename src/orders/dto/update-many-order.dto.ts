// src/orders/dto/update-many-order.dto.ts
import { IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateOrderDto } from './update-order.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSingleOrderDto {
  @ApiProperty({ description: 'Order ID to update', example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Update data for the order' })
  @ValidateNested()
  @Type(() => UpdateOrderDto)
  data: UpdateOrderDto;
}

export class UpdateManyOrderDto {
  @ApiProperty({ description: 'Array of order updates' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSingleOrderDto)
  updates: UpdateSingleOrderDto[];
}
