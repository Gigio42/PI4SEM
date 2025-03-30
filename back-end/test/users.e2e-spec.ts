import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('UsersController (e2e)', () => {
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
    // Limpa a tabela Subscription antes de limpar a tabela User
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();
  });

  it('/users (POST) - Criar Usuário com dados válidos', () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: uniqueEmail, password: 'testpassword' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe(uniqueEmail);
      });
  });

  it('/users (POST) - Criar Usuário com dados inválidos', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: '', password: '' }) // Dados inválidos
      .expect(400); // Deve retornar erro 400
  });

  it('/users (POST) - Criar Usuário com entrada maliciosa (SQL Injection)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: "'; DROP TABLE users; --", password: 'testpassword' }) // Entrada maliciosa
      .expect(400); // Deve retornar erro 400
  });

  it('/users (POST) - Criar Usuário com entrada muito longa', () => {
    const longEmail = 'a'.repeat(256) + '@example.com'; // Email muito longo
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: longEmail, password: 'testpassword' })
      .expect(400); // Deve retornar erro 400
  });

  it('/users (POST) - Criar Usuário com campo faltando (somente email)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@example.com' }) // Sem o campo password
      .expect(400); // Deve retornar erro 400
  });

  it('/users (POST) - Criar Usuário com campo faltando (somente password)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ password: 'testpassword' }) // Sem o campo email
      .expect(400); // Deve retornar erro 400
  });

  it('/users (POST) - Criar Usuário com email duplicado', async () => {
    const email = 'duplicate@example.com';
    const password = 'testpassword';

    // Cria o primeiro usuário
    await request(app.getHttpServer())
      .post('/users')
      .send({ email, password })
      .expect(201);

    // Tenta criar outro usuário com o mesmo email
    return request(app.getHttpServer())
      .post('/users')
      .send({ email, password })
      .expect(400); // Deve retornar erro 400
  });

  it('/users (POST) - Criar Usuário com caracteres especiais no email', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test+special@example.com', password: 'testpassword' })
      .expect(201); // Deve permitir caracteres especiais válidos
  });

  it('/users (POST) - Criar Usuário com senha muito curta', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@example.com', password: '123' }) // Senha muito curta
      .expect(400); // Deve retornar erro 400
  });

  it('/users (POST) - Criar Usuário com senha muito longa', () => {
    const longPassword = 'a'.repeat(129); // Senha com 129 caracteres
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@example.com', password: longPassword })
      .expect(400); // Deve retornar erro 400
  });

  it('/users/login (GET) - Login de Usuário com credenciais válidas', async () => {
    const email = `test${Date.now()}@example.com`;
    const password = 'testpassword';

    // Cria um usuário antes de testar o login
    await request(app.getHttpServer())
      .post('/users')
      .send({ email, password });

    return request(app.getHttpServer())
      .get('/users/login')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('message', 'Login bem-sucedido');
      });
  });

  it('/users/login (GET) - Login de Usuário com credenciais inválidas', async () => {
    return request(app.getHttpServer())
      .get('/users/login')
      .send({ email: 'invalid@example.com', password: 'wrongpassword' }) // Credenciais inválidas
      .expect(404) // Deve retornar erro 404
      .expect((res) => {
        expect(res.body.message).toBe('Usuário ou senha inválidos');
      });
  });

  it('/users/login (GET) - Login de Usuário com entrada maliciosa (SQL Injection)', async () => {
    return request(app.getHttpServer())
      .get('/users/login')
      .send({ email: "' OR 1=1; --", password: 'wrongpassword' }) // Entrada maliciosa
      .expect(404); // Deve retornar erro 404
  });

  it('/users/login (GET) - Login com email não registrado', () => {
    return request(app.getHttpServer())
      .get('/users/login')
      .send({ email: 'notregistered@example.com', password: 'testpassword' })
      .expect(404); // Deve retornar erro 404
  });

  it('/users/login (GET) - Login com SQL Injection no campo password', () => {
    return request(app.getHttpServer())
      .get('/users/login')
      .send({ email: 'test@example.com', password: "' OR 1=1; --" }) // Entrada maliciosa
      .expect(404); // Deve retornar erro 404
  });

  afterAll(async () => {
    await app.close();
  });
});