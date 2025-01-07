import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module'; // Import UsersModule

import { AuthService } from './auth.service';

import { JwtStrategy } from './jwt.strategy';

import { AuthController } from './auth.controller';

import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule, // Ensure UsersModule is imported

    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),

        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],

  providers: [AuthService, JwtStrategy],

  controllers: [AuthController],
})
export class AuthModule {}
