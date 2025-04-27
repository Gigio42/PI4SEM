import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // Add this import

async function bootstrap() {
  // Set a default JWT_SECRET if not already defined
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'temporary_secret_for_development';
    console.warn('WARNING: JWT_SECRET not set in environment. Using temporary secret for development only!');
  }
  
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with credentials
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      // Add your production URLs if needed
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Use cookie parser middleware
  app.use(cookieParser());
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Setup Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('UXperiment Labs API')
    .setDescription('API documentation for UXperiment Labs')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('components')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Change port to 3001 to match frontend requests
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();


