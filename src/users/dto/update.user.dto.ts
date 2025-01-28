import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsUrl,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'First name of the user',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the user',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Valid email address of the user',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Valid Egyptian mobile number',
    example: '01012345678',
  })
  @IsOptional()
  @IsString({ message: 'Mobile number must be a string' })
  @Matches(/^(010|011|012|015)[0-9]{8}$/, {
    message:
      'Mobile number must be a valid Egyptian number (e.g., 01012345678)',
  })
  mobileNumber?: string;

  @ApiPropertyOptional({
    description:
      'Password for the user account. Must contain letters and numbers.',
    example: 'Password123',
    minLength: 8,
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(20, { message: 'Password must not exceed 20 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: 'Password must contain at least one letter and one number',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL of the user',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Profile picture must be a valid URL' })
  profilePictureUrl?: string;

  passwordHash?: string; // Internal use only
}
