import { NestFactory, Reflector } from '@nestjs/core';

import { AppModule } from './app.module';

import { RolesGuard } from './common/guards/roles.guard';

import { ValidationPipe } from '@nestjs/common'; // Import ValidationPipe

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Import Swagger

import helmet from 'helmet'; // Correct import for Helmet

import rateLimit from 'express-rate-limit'; // Correct import for rate limiting

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Middleware

  app.use(helmet()); // Add security headers

  app.enableCors(); // Enable CORS (configure as needed)

  // Rate Limiting

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes

      max: 100, // Limit each IP to 100 requests per windowMs
    }),
  );

  // Global Validation

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip non-whitelisted properties

      forbidNonWhitelisted: true, // Throw errors for non-whitelisted properties

      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  // Global Guards

  const reflector = new Reflector();

  app.useGlobalGuards(new RolesGuard(reflector)); // Register RolesGuard globally

  // Swagger Documentation

  const config = new DocumentBuilder()

    .setTitle('Healthy Milk Products API')

    .setDescription('API for managing milk product orders')

    .setVersion('1.0')

    .addBearerAuth() // Add JWT authentication support

    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document); // Serve Swagger at /api

  await app.listen(3000);
}

bootstrap();
