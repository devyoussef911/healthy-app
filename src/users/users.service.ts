import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // Method to create a new user
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...rest } = createUserDto;
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    try {
      // Create the user
      const user = this.usersRepository.create({
        ...rest,
        passwordHash,
      });

      return await this.usersRepository.save(user);
    } catch (error) {
      // Handle duplicate key errors
      if (error.code === '23505') {
        throw new ConflictException('Mobile number or email already exists');
      }
      throw error;
    }
  }

  // Method to find a user by email
  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Method to find a user by ID
  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  // Update user details
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { password, ...updates } = updateUserDto;

    if (password) {
      const salt = await bcrypt.genSalt();
      updates.passwordHash = await bcrypt.hash(password, salt);
    }

    await this.usersRepository.update(id, updates);
    return this.usersRepository.findOne({ where: { id } });
  }
}
