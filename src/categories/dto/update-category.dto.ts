import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'New name of the category',
    example: 'Consumer Electronics',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description for the category',
    example: 'All kinds of electronic devices',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
