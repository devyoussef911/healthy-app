// import {
//   Injectable,
//   NotFoundException,
//   BadRequestException,
//   InternalServerErrorException,
//   Logger,
//   Inject,
// } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update.user.dto';
// import { User } from './user.entity';
// import { AuditLog } from '../audit-log/AuditLog.entity';
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';
// import { AuditLogService } from '../audit-log/audit-log.service';
// import * as bcrypt from 'bcrypt';
// import { Cache } from 'cache-manager';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';

// @Injectable()
// export class UsersService {
//   constructor(
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,

//     private readonly auditLogService: AuditLogService,
//     @InjectRepository(AuditLog)
//     private readonly auditLogRepository: Repository<AuditLog>,
//   ) {}

//   // Find user by email
//   async findByEmail(email: string): Promise<User | null> {
//     return await this.userRepository.findOne({ where: { email } });
//   }

//   // Find user by email or phone
//   async findByEmailOrPhone(
//     email: string,
//     mobileNumber: string,
//   ): Promise<User | null> {
//     return await this.userRepository.findOne({
//       where: [{ email }, { mobileNumber }],
//     });
//   }

//   // Create a new user
//   // Create a new user
//   async create(createUserDto: CreateUserDto): Promise<User> {
//     const existingUser = await this.findByEmailOrPhone(
//       createUserDto.email,
//       createUserDto.mobileNumber,
//     );
//     if (existingUser) {
//       throw new BadRequestException(
//         'User with this email or phone already exists.',
//       );
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

//     // Create the user with the hashed password
//     const newUser = this.userRepository.create({
//       ...createUserDto,
//       passwordHash: hashedPassword,
//     });

//     const savedUser = await this.userRepository.save(newUser);

//     // Log the registration action (pass the user ID)
//     await this.auditLogService.logAction(savedUser.id, 'register', {
//       email: savedUser.email,
//     });

//     // // Log the deletion action (pass the user ID)
//     // await this.auditLogService.logAction(performedBy, 'delete', {
//     //   deletedUserId: id,
//     // });

//     return savedUser;
//   }

//   // Update user by ID
//   async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
//     const user = await this.userRepository.findOne({ where: { id } });
//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     if (updateUserDto.password) {
//       // Hash new password
//       updateUserDto.passwordHash = await bcrypt.hash(
//         updateUserDto.password,
//         10,
//       );
//       delete updateUserDto.password; // Remove plain password from the DTO
//     }

//     Object.assign(user, updateUserDto);
//     return await this.userRepository.save(user);
//   }

//   // Find user by ID
//   async findById(id: number): Promise<User> {
//     const user = await this.userRepository.findOne({ where: { id } });
//     if (!user) {
//       throw new NotFoundException('User not found');
//     }
//     return user;
//   }

//   // Delete user by ID
//   // Delete user by ID
//   async delete(id: number, performedBy: number): Promise<{ message: string }> {
//     const user = await this.userRepository.findOne({
//       where: { id, isDeleted: false },
//     });

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     user.isDeleted = true; // Mark the user as deleted
//     await this.userRepository.save(user);

//     console.log(`User with ID ${id} was soft-deleted by user ${performedBy}`); // Log the action

//     // Fetch the user performing the action
//     const performingUser = await this.userRepository.findOne({
//       where: { id: performedBy },
//     });
//     if (!performingUser) {
//       throw new NotFoundException('Performing user not found');
//     }

//     // Log the delete action to the AuditLog table
//     await this.auditLogRepository.save({
//       user: performingUser, // Set the relationship here
//       action: 'delete',
//       details: { affectedUser: id },
//       createdAt: new Date(), // Optional; will be auto-set if omitted
//     });

//     return { message: 'User successfully deleted (soft delete)' };
//   }

//   async hardDelete(
//     id: number,
//     performedBy: number,
//   ): Promise<{ message: string }> {
//     const user = await this.userRepository.findOne({
//       where: { id },
//     });

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     // Log the action
//     await this.auditLogRepository.save({
//       action: 'hard_delete',
//       user: { id: performedBy }, // Ensure `user` is provided as a relation
//       affectedUser: id,
//       timestamp: new Date(),
//     });

//     // Remove the user permanently
//     await this.userRepository.remove(user);

//     console.log(
//       `User with ID ${id} was permanently deleted by user ${performedBy}`,
//     ); // Log the action
//     return { message: 'User permanently deleted' };
//   }
// }

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { User } from './user.entity';
import { AuditLog } from '../audit-log/AuditLog.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByEmailOrPhone(
    email: string,
    mobileNumber: string,
  ): Promise<User | null> {
    return await this.userRepository.findOne({
      where: [{ email }, { mobileNumber }],
    });
  }

  async findById(id: number): Promise<User> {
    const cacheKey = `user:${id}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.cacheManager.set(cacheKey, user, 300); // Cache TTL in seconds
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmailOrPhone(
      createUserDto.email,
      createUserDto.mobileNumber,
    );
    if (existingUser) {
      throw new BadRequestException(
        'User with this email or phone already exists.',
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create the user with the hashed password
    const newUser = this.userRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword, // Set the hashed password
    });

    const savedUser = await this.userRepository.save(newUser);
    return savedUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash the password if it's being updated
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto.passwordHash = hashedPassword;
      delete updateUserDto.password; // Remove the plain password field
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async delete(id: number, performedBy: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isDeleted = true;
    await this.userRepository.save(user);

    await this.auditLogRepository.save({
      user: { id: performedBy },
      action: 'delete',
      details: { affectedUserId: id },
    });

    return { message: 'User successfully soft-deleted' };
  }

  async hardDelete(
    id: number,
    performedBy: number,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);

    await this.auditLogRepository.save({
      user: { id: performedBy },
      action: 'hard_delete',
      details: { affectedUserId: id },
    });

    return { message: 'User permanently deleted' };
  }
}
