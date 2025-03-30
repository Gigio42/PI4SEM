import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ComponentsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Limpa a tabela Component antes de cada teste
    await prisma.component.deleteMany();
  });

  it('/components (POST) - Criar Componente com dados válidos', () => {
    return request(app.getHttpServer())
      .post('/components')
      .send({ name: 'Button', cssContent: '.btn { color: red; }' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Button');
        expect(res.body.cssContent).toBe('.btn { color: red; }');
      });
  });

  it('/components (POST) - Criar Componente com dados inválidos', () => {
    return request(app.getHttpServer())
      .post('/components')
      .send({ name: '', cssContent: '' }) // Dados inválidos
      .expect(400); // Deve retornar erro 400
  });

  it('/components (GET) - Listar todos os Componentes', async () => {
    // Cria dois componentes antes de listar
    await request(app.getHttpServer())
      .post('/components')
      .send({ name: 'Button', cssContent: '.btn { color: red; }' });

    await request(app.getHttpServer())
      .post('/components')
      .send({ name: 'Card', cssContent: '.card { border: 1px solid black; }' });

    return request(app.getHttpServer())
      .get('/components')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true); // Verifica se a resposta é um array
        expect(res.body.length).toBe(2); // Verifica se há dois componentes
      });
  });

  afterAll(async () => {
    await app.close();
  });
});