import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesGuard } from './common/guards/roles.guard';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Handler, Context, Callback } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

let cachedServer: any;

async function bootstrapServer() {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

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

  // Initialize the app
  await app.init();

  return createServer(expressApp, undefined, ['*/*']);
}

function sanitizeEvent(event: any) {
  const seen = new WeakSet();
  return JSON.parse(
    JSON.stringify(event, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return; // Remove circular reference
        }
        seen.add(value);
      }
      return value;
    }),
  );
}

export const handler: Handler = async (event: any, context: Context) => {
  console.log('Event:', JSON.stringify(event, null, 2)); // Log the event
  console.log('Context:', JSON.stringify(context, null, 2)); // Log the context

  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  const sanitizedEvent = sanitizeEvent(event);
  console.log('Sanitized Event:', JSON.stringify(sanitizedEvent, null, 2));
  return proxy(cachedServer, event, context, 'PROMISE').promise;
};

// Export the handler as the default export for Vercel
export default handler;
