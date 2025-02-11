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
import * as swaggerUiDist from 'swagger-ui-dist';

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

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Healthy Milk Products API')
    .setDescription('API for managing milk product orders')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // 🚀 Fix: Serve Swagger UI static files with correct MIME types
  const SWAGGER_ASSET_PATH = swaggerUiDist.absolutePath();
  app.use(
    '/swagger-ui',
    express.static(SWAGGER_ASSET_PATH, {
      setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
      },
    }),
  );

  // 🚀 Fix: Correctly configure Swagger UI paths
  SwaggerModule.setup('api', app, document, {
    customCssUrl: '/swagger-ui/swagger-ui.css',
    customJs: [
      '/swagger-ui/swagger-ui-bundle.js',
      '/swagger-ui/swagger-ui-standalone-preset.js',
    ],
  });

  // ✅ Save Swagger JSON to `/tmp` for Vercel compatibility
  const swaggerPath = join(tmpdir(), 'swagger-spec.json');
  fs.writeFileSync(swaggerPath, JSON.stringify(document, null, 2));
  console.log(`Swagger spec saved to: ${swaggerPath}`);

  // Set up server
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
