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

  it('/auth/session-check (GET) - should return authentication status', () => {
    return request(app.getHttpServer())
      .get('/auth/session-check')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('authenticated');
        expect(res.body.authenticated).toBe(false);
      });
  });

  it('/auth/check-auth (GET) - should return authentication status', () => {
    return request(app.getHttpServer())
      .get('/auth/check-auth')
      .expect(401)
      .expect((res) => {
        expect(res.body).toHaveProperty('authenticated');
        expect(res.body.authenticated).toBe(false);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});