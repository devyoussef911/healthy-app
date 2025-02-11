import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSingleCategoryDto } from './update-single-category.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateManyCategoryDto {
  @ApiProperty({ description: 'Array of category updates' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSingleCategoryDto)
  updates: UpdateSingleCategoryDto[];
}
