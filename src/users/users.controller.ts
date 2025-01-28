import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Users') // Swagger tag for grouping
@ApiBearerAuth() // Enable Bearer Token authentication
@Controller(':lang/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Register a new user',
    description: 'Register a new user by providing necessary details.',
  })
  @ApiBody({
    description: 'User registration details',
    type: CreateUserDto,
  })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    this.logger.log({
      message: `Registering user`,
      email: createUserDto.email,
    });

    const existingUser = await this.usersService.findByEmailOrPhone(
      createUserDto.email,
      createUserDto.mobileNumber,
    );
    if (existingUser) {
      this.logger.warn({
        message: `Registration failed: User already exists`,
        email: createUserDto.email,
      });
      throw new ForbiddenException(
        'User with this email or phone already exists.',
      );
    }

    const newUser = await this.usersService.create(createUserDto);
    this.logger.log({
      message: `User registered successfully`,
      userId: newUser.id,
      email: newUser.email,
    });
    return newUser;
  }

  @ApiOperation({
    summary: 'Update user details',
    description: 'Accessible by the user themselves or an admin.',
  })
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    const role = req.user.role;
    const actorId = req.user.id;

    this.logger.log({
      message: `Attempting to update user`,
      actorId,
      actorRole: role,
      targetUserId: id,
    });

    if (actorId !== id && role !== 'admin') {
      this.logger.warn({
        message: `Unauthorized update attempt`,
        actorId,
        actorRole: role,
        targetUserId: id,
      });
      throw new ForbiddenException('You can only update your own profile.');
    }

    const updatedUser = await this.usersService.update(id, updateUserDto);
    this.logger.log({
      message: `User updated successfully`,
      updatedBy: actorId,
      updatedUserId: id,
    });
    return updatedUser;
  }

  @ApiOperation({
    summary: 'Get user details by ID',
    description: 'Accessible by the user themselves or an admin.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to fetch.',
  })
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const role = req.user.role;
    const actorId = req.user.id;

    this.logger.log({
      message: `Fetching user details`,
      actorId,
      actorRole: role,
      targetUserId: id,
    });

    if (actorId !== id && role !== 'admin') {
      this.logger.warn({
        message: `Unauthorized access attempt`,
        actorId,
        actorRole: role,
        targetUserId: id,
      });
      throw new ForbiddenException('Access denied.');
    }

    const user = await this.usersService.findById(id);
    this.logger.log({
      message: `User details fetched successfully`,
      actorId,
      targetUserId: id,
    });
    return user;
  }

  @ApiOperation({
    summary: 'Soft delete a user',
    description: 'Accessible by the user themselves or an admin.',
  })
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const role = req.user.role;
    const actorId = req.user.id;

    this.logger.log({
      message: `Attempting to delete user`,
      actorId,
      actorRole: role,
      targetUserId: id,
    });

    if (actorId !== id && role !== 'admin') {
      this.logger.warn({
        message: `Unauthorized delete attempt`,
        actorId,
        actorRole: role,
        targetUserId: id,
      });
      throw new ForbiddenException('You can only delete your own profile.');
    }

    const result = await this.usersService.delete(id, actorId);
    this.logger.log({
      message: `User soft-deleted successfully`,
      actorId,
      targetUserId: id,
    });
    return result;
  }

  @ApiOperation({
    summary: 'Hard delete a user',
    description: 'Accessible by admins only.',
  })
  @Delete(':id/hard')
  @UseGuards(JwtAuthGuard)
  async hardDeleteUser(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const role = req.user.role;
    const actorId = req.user.id;

    this.logger.log({
      message: `Attempting to hard delete user`,
      actorId,
      actorRole: role,
      targetUserId: id,
    });

    if (role !== 'admin') {
      this.logger.warn({
        message: `Unauthorized hard delete attempt`,
        actorId,
        actorRole: role,
        targetUserId: id,
      });
      throw new ForbiddenException('Only admins can perform hard delete.');
    }

    const result = await this.usersService.hardDelete(id, actorId);
    this.logger.log({
      message: `User permanently deleted successfully`,
      actorId,
      targetUserId: id,
    });
    return result;
  }
}
