import {
  Controller,
  Post,
  Body,
  ConflictException,
  InternalServerErrorException,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { CreateUserDto } from './dto/create-user.dto';

import { AuthGuard } from '@nestjs/passport';

import { Request } from 'express';

import { Roles } from '../common/decorators/roles.decorator'; // Import the Roles decorator

@Controller(':lang/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt')) // Protect this route with JWT
  @Roles('user', 'admin') // Restrict to users with 'user' or 'admin' role
  getProfile(@Req() req: Request) {
    // Return the authenticated user's details

    return req.user;
  }
}
