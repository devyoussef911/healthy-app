import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller(':lang/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      if (error.code === '23505') {
        throw new ForbiddenException('Email or mobile number already exists');
      }
      throw error;
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    if (req.user.id !== parseInt(id, 10) && req.user.role !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to update this profile',
      );
    }
    return this.usersService.updateUser(parseInt(id, 10), updateUserDto);
  }
}
