import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '@prisma/client';

describe('ComponentsController (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    // Limpa a tabela Component antes de cada teste
    await prisma.component.deleteMany();
  });

  it('/components (POST)', () => {
    return request(app.getHttpServer())
      .post('/components')
      .send({ name: 'Test Component', cssContent: '.test { color: red; }' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Test Component');
        expect(res.body.cssContent).toBe('.test { color: red; }');
      });
  });

  it('/components (GET)', async () => {
    // Cria um componente antes de testar o GET
    await prisma.component.create({
      data: { name: 'Test Component', cssContent: '.test { color: red; }' },
    });

    return request(app.getHttpServer())
      .get('/components')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0].name).toBe('Test Component');
        expect(res.body[0].cssContent).toBe('.test { color: red; }');
      });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });
});