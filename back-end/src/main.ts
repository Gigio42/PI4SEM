import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para o frontend
  app.enableCors({
    origin: 'http://localhost:3001', // Permitir apenas o frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Permitir envio de cookies e cabeçalhos de autenticação
  });

  await app.listen(3000);
}
bootstrap();


