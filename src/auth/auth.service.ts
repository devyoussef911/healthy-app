import { Injectable } from '@nestjs/common'; // Removed UnauthorizedException

import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,

    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email); // Ensure role is retrieved
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user; // Exclude sensitive data
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role }; // Add role to payload
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
