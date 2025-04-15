import { Test, TestingModule } from '@nestjs/testing';
import { ComponentsService } from './components.service';

// Mock do PrismaClient
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      component: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
    })),
  };
});

describe('ComponentsService', () => {
  let service: ComponentsService;
  let mockPrismaService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComponentsService],
    }).compile();

    service = module.get<ComponentsService>(ComponentsService);
    // Access the mock from the service
    mockPrismaService = (service as any).prisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createComponent', () => {
    it('should create a component with all fields', async () => {
      const componentData = {
        id: 1,
        name: 'Test Component',
        cssContent: '.test { color: red; }',
        category: 'Buttons',
        color: '#FF0000',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.component.create.mockResolvedValue(componentData);

      const result = await service.createComponent(
        componentData.name,
        componentData.cssContent,
        componentData.category,
        componentData.color
      );

      expect(result).toEqual(componentData);
      expect(mockPrismaService.component.create).toHaveBeenCalledWith({
        data: {
          name: componentData.name,
          cssContent: componentData.cssContent,
          category: componentData.category,
          color: componentData.color,
        },
      });
    });

    it('should create a component with default values for optional fields', async () => {
      const componentData = {
        id: 1,
        name: 'Test Component',
        cssContent: '.test { color: red; }',
        category: 'Outros',
        color: '#6366F1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.component.create.mockResolvedValue(componentData);

      const result = await service.createComponent(
        componentData.name,
        componentData.cssContent
      );

      expect(result).toEqual(componentData);
      expect(mockPrismaService.component.create).toHaveBeenCalledWith({
        data: {
          name: componentData.name,
          cssContent: componentData.cssContent,
          category: 'Outros',
          color: '#6366F1',
        },
      });
    });
  });

  // Adicione testes para os outros métodos (getComponentById, getAllComponents, deleteComponent)
});
