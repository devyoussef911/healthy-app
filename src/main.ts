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

// Create an Express app
const expressApp = express();

// Bootstrap the NestJS app
async function bootstrap() {
  console.log('Bootstrapping the app...'); // Add this log
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

  // Write the OpenAPI JSON file to disk so you can share it with your team.
  const outputPath = './swagger-spec.json';
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  console.log(`Swagger spec saved to ${outputPath}`);

  // Use the PORT environment variable for deployment, default to 3000 for local dev
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`NestJS app is listening on http://localhost:${port}`);

  // Initialize the app
  await app.init();

  // Return the Express app
  return expressApp;
}

// Call the bootstrap function directly for local dev
bootstrap().catch((err) => {
  console.error('Error bootstrapping app:', err);
});
