import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle('Components API')
  .setDescription('API para gerenciar e disponibilizar componentes CSS')
  .setVersion('1.0')
  .addTag('Components')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);

  // Habilitar CORS para o frontend
  app.enableCors({
    origin: 'http://localhost:3001', // Permitir apenas o frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Permitir envio de cookies e cabeçalhos de autenticação
  });

  await app.listen(3000);
}
bootstrap();


