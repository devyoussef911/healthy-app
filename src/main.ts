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

// Create an Express app
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

  // Rate Limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
    }),
  );

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Guards
  const reflector = new Reflector();
  app.useGlobalGuards(new RolesGuard(reflector));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Healthy Milk Products API')
    .setDescription('API for managing milk product orders')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // ✅ Save Swagger JSON to `/tmp`, which is writable in Vercel
  const swaggerPath = join(tmpdir(), 'swagger-spec.json');
  fs.writeFileSync(swaggerPath, JSON.stringify(document, null, 2));
  console.log(`Swagger spec saved to: ${swaggerPath}`);

  // Use the PORT environment variable for deployment, default to 3000 for local dev
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`NestJS app is listening on http://localhost:${port}`);

  isAppInitialized = true;
}

// ✅ Call bootstrap() immediately in dev mode
if (process.env.NODE_ENV !== 'production') {
  bootstrap().catch((err) => console.error('Error bootstrapping app:', err));
}

// ✅ Ensure Vercel recognizes this as a serverless function
export default async function handler(req, res) {
  if (!isAppInitialized) {
    await bootstrap();
  }
  expressApp(req, res);
}
