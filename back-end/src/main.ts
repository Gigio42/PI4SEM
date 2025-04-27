import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  
  // Add cookie parser middleware
  app.use(cookieParser());
  
  // Configure CORS with comprehensive settings
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: '*',  // Allow all headers in preflight requests
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
  
  await app.listen(3000);
  logger.log(`Application listening on port 3000 with CORS enabled for http://localhost:3001`);
}
bootstrap();
