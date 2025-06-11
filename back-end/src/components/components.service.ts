import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * @Author: Dev-Ricas & Luanplays11
 * @Date: 30/03/2025
 * @Description: Serviço para gerenciar componentes CSS.
 */
@Injectable()
export class ComponentsService {
  private readonly logger = new Logger(ComponentsService.name);

  constructor(private prisma: PrismaService) {}
  /**
   * Cria um novo componente CSS no banco de dados.
   * @param name - O nome do componente.
   * @param cssContent - O conteúdo CSS do componente.
   * @param category - A categoria do componente (opcional).
   * @param color - A cor representativa do componente (opcional).
   * @param htmlContent - O conteúdo HTML do componente (opcional).
   * @returns O componente recém-criado com seus detalhes.
   */
  async createComponent(name: string, cssContent: string, category?: string, color?: string, htmlContent?: string) {
    return this.prisma.component.create({
      data: {
        name,
        cssContent,
        htmlContent: htmlContent || '', // Garantir que htmlContent nunca seja null
        category: category || 'Outros',
        color: color || '#6366F1', // Cor padrão se não for fornecida
      },
    });
  }/**
   * Busca um componente específico pelo ID.
   * @param id - O ID único do componente (esperado como string e convertido para número).
   * @returns O componente correspondente ou lança um erro caso não seja encontrado.
   * @throws NotFoundException em caso de componente não encontrado.
   */
  async getComponentById(id: string) {
    try {
      const numericId = parseInt(id, 10);
      const component = await this.prisma.component.findUnique({
        where: {
          id: numericId,
        }
      });

      if (!component) {
        throw new NotFoundException(`Componente com ID ${id} não encontrado`);
      }

      return component;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Erro ao buscar componente com o ID ${id}: ${error.message}`);
    }
  }

  /**
   * Retorna a lista de todos os componentes armazenados no banco de dados.
   * @returns Um array de objetos representando os componentes.
   */
  async getAllComponents() {
    try {
      this.logger.log('Fetching all components from database');
      const components = await this.prisma.component.findMany({
        orderBy: {
          id: 'asc'
        }
      });
      
      // Garantir que todos os componentes tenham campos obrigatórios
      const normalizedComponents = components.map(component => ({
        ...component,
        htmlContent: component.htmlContent || '',
        category: component.category || 'Outros',
        color: component.color || '#6366F1'
      }));
      
      this.logger.log(`Found ${normalizedComponents.length} components`);
      return normalizedComponents;
    } catch (error) {
      this.logger.error(`Error fetching components: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      // Throw a more specific exception for better error handling
      throw new Error(`Failed to fetch components: ${error.message}`);
    }
  }
  /**
   * Exclui um componente específico pelo ID.
   * @param id - O ID único do componente (esperado como string e convertido para número).
   * @returns O componente excluído ou lança um erro caso não seja encontrado.
   * @throws NotFoundException em caso de componente não encontrado.
   */
  async deleteComponent(id: string) {
    try {
      const numericId = parseInt(id, 10);
      
      // Verificar se o componente existe antes de excluir
      const componentExists = await this.prisma.component.findUnique({
        where: {
          id: numericId,
        },
      });
      
      if (!componentExists) {
        throw new NotFoundException(`Componente com ID ${id} não encontrado`);
      }
      
      // Excluir o componente
      return await this.prisma.component.delete({
        where: {
          id: numericId,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Erro ao excluir o componente com o ID ${id}: ${error.message}`);
    }
  }
  
  /**
   * Atualiza um componente existente pelo ID.
   * @param id - O ID único do componente (esperado como string e convertido para número).
   * @param data - Os dados a serem atualizados no componente.
   * @returns O componente atualizado.
   * @throws NotFoundException em caso de componente não encontrado.
   */
  async updateComponent(id: string, data: {
    name?: string;
    cssContent?: string;
    category?: string;
    color?: string;
  }) {
    try {
      const numericId = parseInt(id, 10);
      
      // Verificar se o componente existe antes de atualizar
      const componentExists = await this.prisma.component.findUnique({
        where: {
          id: numericId,
        },
      });
      
      if (!componentExists) {
        throw new NotFoundException(`Componente com ID ${id} não encontrado`);
      }
      
      // Atualizar o componente
      return await this.prisma.component.update({
        where: {
          id: numericId,
        },
        data,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Erro ao atualizar o componente com o ID ${id}: ${error.message}`);
    }
  }
}