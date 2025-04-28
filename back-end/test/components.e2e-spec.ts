import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Component } from '@prisma/client'; // Import Component type

describe('ComponentsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Apply validation pipe globally for e2e tests
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // Remove properties not defined in DTO
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
    }));
    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Limpa a tabela Component antes de cada teste
    await prisma.favorito.deleteMany(); // Clear dependent tables first
    await prisma.component.deleteMany();
  });

  it('/components (POST) - Criar Componente com dados válidos', () => {
    return request(app.getHttpServer())
      .post('/components')
      .send({ name: 'Button', cssContent: '.btn { color: red; }', category: 'Buttons', color: '#FF0000', htmlContent: '<button>Test</button>' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Button');
        expect(res.body.cssContent).toBe('.btn { color: red; }');
        expect(res.body.category).toBe('Buttons');
        expect(res.body.color).toBe('#FF0000');
        expect(res.body.htmlContent).toBe('<button>Test</button>');
      });
  });

  it('/components (POST) - Criar Componente com dados inválidos (nome faltando)', () => {
    return request(app.getHttpServer())
      .post('/components')
      .send({ cssContent: '.btn { color: red; }' }) // Nome faltando
      .expect(400); // Deve retornar erro 400 devido à validação do DTO
  });

  it('/components (POST) - Criar Componente com dados inválidos (css faltando)', () => {
    return request(app.getHttpServer())
      .post('/components')
      .send({ name: 'Button' }) // CSS faltando
      .expect(400); // Deve retornar erro 400
  });

  it('/components (GET) - Listar todos os Componentes', async () => {
    // Cria dois componentes antes de listar
    await prisma.component.createMany({
      data: [
        { name: 'Button', cssContent: '.btn { color: red; }' },
        { name: 'Card', cssContent: '.card { border: 1px solid black; }' },
      ]
    });

    return request(app.getHttpServer())
      .get('/components')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data');
        
        // Verify that data is an array of components
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(2);
        expect(res.body.data[0].name).toBe('Button');
        expect(res.body.data[1].name).toBe('Card');
      });
  });

  it('/components/:id (GET) - Obter um Componente pelo ID', async () => {
    // Cria um componente para buscar
    const createdComponent = await prisma.component.create({
      data: { name: 'Specific Button', cssContent: '.specific { color: blue; }' },
    });

    return request(app.getHttpServer())
      .get(`/components/${createdComponent.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', createdComponent.id);
        expect(res.body.name).toBe('Specific Button');
        expect(res.body.cssContent).toBe('.specific { color: blue; }');
      });
  });

  it('/components/:id (GET) - Retornar 404 para ID inexistente', () => {
    const nonExistentId = 99999;
    return request(app.getHttpServer())
      .get(`/components/${nonExistentId}`)
      .expect(404);
  });

  it('/components/:id (PUT) - Atualizar um Componente', async () => {
    // Cria um componente para atualizar
    const createdComponent = await prisma.component.create({
      data: { name: 'Old Name', cssContent: '.old {}', category: 'Old Cat', color: '#000000', htmlContent: '<old></old>' },
    });

    const updateData = {
      name: 'New Name',
      cssContent: '.new {}',
      category: 'New Cat',
      color: '#FFFFFF',
      htmlContent: '<new></new>'
    };

    return request(app.getHttpServer())
      .put(`/components/${createdComponent.id}`)
      .send(updateData)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', createdComponent.id);
        expect(res.body.name).toBe(updateData.name);
        expect(res.body.cssContent).toBe(updateData.cssContent);
        expect(res.body.category).toBe(updateData.category);
        expect(res.body.color).toBe(updateData.color);
        expect(res.body.htmlContent).toBe(updateData.htmlContent);
      });
  });

   it('/components/:id (PUT) - Retornar 404 ao tentar atualizar ID inexistente', () => {
    const nonExistentId = 99999;
    const updateData = { name: 'New Name', cssContent: '.new {}' };
    return request(app.getHttpServer())
      .put(`/components/${nonExistentId}`)
      .send(updateData)
      .expect(404);
  });

   it('/components/:id (PUT) - Retornar 400 ao tentar atualizar com dados inválidos', async () => {
    // Cria um componente para tentar atualizar
    const createdComponent = await prisma.component.create({
      data: { name: 'Valid Name', cssContent: '.valid {}' },
    });

    const invalidUpdateData = { name: '' }; // Nome inválido (vazio)

    return request(app.getHttpServer())
      .put(`/components/${createdComponent.id}`)
      .send(invalidUpdateData)
      .expect(400); // Espera erro de validação
  });

  it('/components/:id (DELETE) - Excluir um Componente', async () => {
    // Cria um componente para excluir
    const createdComponent = await prisma.component.create({
      data: { name: 'To Delete', cssContent: '.delete {}' },
    });

    await request(app.getHttpServer())
      .delete(`/components/${createdComponent.id}`)
      .expect(200) // Espera 200 OK na exclusão
      .expect((res) => {
         expect(res.body).toHaveProperty('id', createdComponent.id); // Verifica se o componente excluído é retornado
      });


    // Verifica se o componente foi realmente excluído
    const findDeleted = await prisma.component.findUnique({
      where: { id: createdComponent.id },
    });
    expect(findDeleted).toBeNull();
  });

  it('/components/:id (DELETE) - Retornar 404 ao tentar excluir ID inexistente', () => {
    const nonExistentId = 99999;
    return request(app.getHttpServer())
      .delete(`/components/${nonExistentId}`)
      .expect(404);
  });


  afterAll(async () => {
    // Limpa o banco de dados após todos os testes
    await prisma.favorito.deleteMany();
    await prisma.component.deleteMany();
    await app.close();
  });
});