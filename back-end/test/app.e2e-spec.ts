import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) - Retorna Hello World', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/ (GET) - Testa comportamento com cabeçalhos inesperados', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('X-Custom-Header', 'TestHeader')
      .expect(200)
      .expect('Hello World!');
  });

  it('/ (GET) - Testa comportamento com método HTTP inválido', () => {
    return request(app.getHttpServer())
      .post('/') // Usando POST em vez de GET
      .expect(404); // Deve retornar 404, pois a rota não aceita POST
  });

  it('/ (GET) - Testa comportamento com query string inesperada', () => {
    return request(app.getHttpServer())
      .get('/?unexpectedParam=value')
      .expect(200)
      .expect('Hello World!');
  });

  it('/ (GET) - Testa comportamento com payload inesperado', () => {
    return request(app.getHttpServer())
      .get('/')
      .send({ unexpected: 'data' }) // Envia um payload para um GET
      .expect(200)
      .expect('Hello World!');
  });

  it('/ (GET) - Testa comportamento com cabeçalhos maliciosos', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('Content-Type', 'application/json')
      .set('X-Forwarded-For', '127.0.0.1') // Cabeçalho que pode ser usado para spoofing
      .expect(200)
      .expect('Hello World!');
  });

  afterAll(async () => {
    await app.close();
  });
});
