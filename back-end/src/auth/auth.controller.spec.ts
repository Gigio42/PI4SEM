import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from './auth.module';
import { ConfigModule } from '@nestjs/config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, ConfigModule.forRoot()],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/google (GET) - should redirect to Google login', () => {
    return request(app.getHttpServer())
      .get('/auth/google')
      .expect(302); // 302 indica redirecionamento
  });

  it('/auth/google/redirect (GET) - should handle Google redirect', () => {
    return request(app.getHttpServer())
      .get('/auth/google/redirect')
      .expect(401); // 401 porque o teste não fornece um token válido
  });

  afterAll(async () => {
    await app.close();
  });
});