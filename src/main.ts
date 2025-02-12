import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesGuard } from './common/guards/roles.guard';
import { ValidationPipe } from '@nestjs/common';
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
  if (isAppInitialized) return;
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

  // Swagger Documentation JSON
  const swaggerDocument = {
    openapi: '3.0.1',
    info: {
      title: 'Healthy Milk Products API',
      description: 'API for managing milk product orders',
      version: '1.0',
    },
    paths: {},
  };

  // ✅ Save Swagger JSON in `/tmp`
  const swaggerJsonPath = join(tmpdir(), 'swagger.json');
  fs.writeFileSync(swaggerJsonPath, JSON.stringify(swaggerDocument, null, 2));

  // ✅ Serve Swagger JSON Dynamically
  expressApp.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });

  // ✅ Serve Swagger UI as Static Files
  expressApp.use(
    '/swagger',
    express.static(join(__dirname, '..', 'public', 'swagger')),
  );

  // ✅ Redirect `/api` to Swagger UI
  expressApp.get('/api', (req, res) => {
    res.redirect('/swagger/index.html');
  });

  // Start listening on the correct port
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`✅ NestJS API is live at: http://localhost:${port}/api`);

  isAppInitialized = true;
}

// ✅ Bootstrap for local development
if (process.env.NODE_ENV !== 'production') {
  bootstrap().catch((err) => console.error('Error bootstrapping app:', err));
}

// ✅ Fix: Export handler for Vercel
export default async function handler(req, res) {
  if (!isAppInitialized) {
    await bootstrap();
  }
  expressApp(req, res);
}
