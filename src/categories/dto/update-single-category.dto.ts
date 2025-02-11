import { IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateCategoryDto } from './update-category.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSingleCategoryDto {
  @ApiProperty({ description: 'Category ID to update', example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Data for updating the category' })
  @ValidateNested()
  @Type(() => UpdateCategoryDto)
  data: UpdateCategoryDto;
}
