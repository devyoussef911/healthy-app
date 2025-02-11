import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesGuard } from './common/guards/roles.guard';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as fs from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Create an Express app for handling API requests
const expressApp = express();
let isAppInitialized = false;

async function bootstrap() {
  if (isAppInitialized) {
    return;
  }
  console.log('Bootstrapping the app...');

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // Security Middleware
  app.use(helmet());
  app.enableCors();

  // Rate Limiting (Protect against brute force attacks)
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
    }),
  );

  // Global Validation (Ensure proper request format)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Guards (for role-based access)
  const reflector = new Reflector();
  app.useGlobalGuards(new RolesGuard(reflector));

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Healthy Milk Products API')
    .setDescription('API for managing milk product orders')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // 🚀 Fix: Ensure Swagger works on both Vercel and local development
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      url: process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}/api-json`
        : 'http://localhost:3000/api-json',
    },
  });

  // ✅ Fix: Save Swagger JSON to `/tmp`, which is writable in Vercel
  const swaggerPath = join(tmpdir(), 'swagger-spec.json');
  fs.writeFileSync(swaggerPath, JSON.stringify(document, null, 2));
  console.log(`Swagger spec saved to: ${swaggerPath}`);

  // Set up the server port (default: 3000 for local development)
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`✅ NestJS API is live at: http://localhost:${port}/api`);

  isAppInitialized = true;
}

// ✅ Fix: Call `bootstrap()` immediately for local development
if (process.env.NODE_ENV !== 'production') {
  bootstrap().catch((err) => console.error('Error bootstrapping app:', err));
}

// ✅ Fix: Export as a serverless function for Vercel
export default async function handler(req, res) {
  if (!isAppInitialized) {
    await bootstrap();
  }
  expressApp(req, res);
}
