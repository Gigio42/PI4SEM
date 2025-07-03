import { Injectable, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
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
   */  async createComponent(name: string, cssContent: string, category?: string, color?: string, htmlContent?: string) {
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
   * @param userId - ID opcional do usuário que está fazendo a requisição
   * @param checkSubscription - Indica se deve verificar assinatura (padrão: true)
   * @returns O componente correspondente ou lança um erro caso não seja encontrado.
   * @throws NotFoundException em caso de componente não encontrado.
   * @throws ForbiddenException se o usuário não tiver assinatura ativa e checkSubscription for true
   */
  async getComponentById(id: string, userId?: number, checkSubscription: boolean = true) {
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
      
      // Base do componente com campos padrão
      const baseComponent = {
        ...component,
        category: component.category || 'Outros',
        color: component.color || '#6366F1',
        htmlContent: component.htmlContent || ''
      };
      
      // Se precisar checar assinatura
      if (checkSubscription) {
        let hasActiveSubscription = false;
        
        // Se temos um userId, verificamos assinatura
        if (userId) {
          this.logger.log(`Verificando assinatura para usuário ${userId} ao acessar componente ${id}`);
          
          // Verifica se o usuário tem uma assinatura ativa
          const subscription = await this.prisma.subscription.findFirst({
            where: {
              userId: userId,
              status: 'ACTIVE',
              endDate: { gte: new Date() }
            }
          });
          
          hasActiveSubscription = !!subscription;
          this.logger.log(`Status de assinatura para usuário ${userId}: ${hasActiveSubscription ? 'ATIVA' : 'INATIVA'}`);
        }

        // Se não possui assinatura ativa (ou não está logado), restringe acesso
        if (!hasActiveSubscription) {
          // Retorna o componente sem conteúdo CSS e HTML
          this.logger.log(`Acesso bloqueado ao componente ${id} - assinatura necessária`);
          return {
            ...baseComponent,
            cssContent: null,
            htmlContent: null,
            requiresSubscription: true
          };
        }
      }

      // Retorna o componente completo para usuários com assinatura ou quando não é necessário verificar
      return {
        ...baseComponent,
        requiresSubscription: false // Explicitamente marcado como não requerendo assinatura
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error(`Erro ao buscar componente com o ID ${id}: ${error.message}`);
    }
  }

  /**
   * Retorna a lista de todos os componentes armazenados no banco de dados.
   * @param userId - ID opcional do usuário para verificar assinatura
   * @returns Um array de objetos representando os componentes.
   */  async getAllComponents(userId?: number) {
    try {
      this.logger.log('Fetching all components from database');
      const components = await this.prisma.component.findMany({
        orderBy: {
          id: 'asc'
        }
      });
      
      // Verificar se o usuário tem assinatura ativa (se um userId for fornecido)
      let hasActiveSubscription = false;
      if (userId) {
        this.logger.log(`Verificando assinatura para usuário ${userId}`);
        try {
          // Verificação mais robusta com log detalhado
          const subscription = await this.prisma.subscription.findFirst({
            where: {
              userId: userId,
              status: 'ACTIVE',
              endDate: { gte: new Date() }
            },
            orderBy: {
              endDate: 'desc' // Pega a assinatura com data de término mais distante
            }
          });
          
          hasActiveSubscription = !!subscription;
          this.logger.log(`Status de assinatura para usuário ${userId}: ${hasActiveSubscription ? 'ATIVA' : 'INATIVA'}`);
          
          if (subscription) {
            this.logger.log(`Detalhes da assinatura: ID=${subscription.id}, Término=${subscription.endDate}`);
          } else {
            // Se não achou assinatura ativa, busca todas as assinaturas do usuário para log
            const allSubscriptions = await this.prisma.subscription.findMany({
              where: { userId: userId },
              orderBy: { endDate: 'desc' }
            });
            
            if (allSubscriptions.length > 0) {
              this.logger.log(`Encontradas ${allSubscriptions.length} assinaturas para o usuário, mas nenhuma ativa:`);
              allSubscriptions.forEach(sub => {
                this.logger.log(`ID=${sub.id}, Status=${sub.status}, Término=${sub.endDate}`);
              });
            } else {
              this.logger.log(`Nenhuma assinatura encontrada para o usuário ${userId}`);
            }
          }
        } catch (error) {
          this.logger.error(`Erro ao verificar assinatura: ${error.message}`);
          // Em caso de erro, assume que não tem assinatura
          hasActiveSubscription = false;
        }
      }
      
      // Garantir que todos os componentes tenham campos obrigatórios
      const normalizedComponents = components.map(component => {
        // Base do componente com campos padrão
        const baseComponent = {
          ...component,
          category: component.category || 'Outros',
          color: component.color || '#6366F1'
        };
        
        // Se o usuário não tem assinatura ou não está logado, marcar todos componentes como restritos
        if (!hasActiveSubscription) {
          // Para usuários sem assinatura, não enviar o conteúdo CSS e HTML
          return {
            ...baseComponent,
            cssContent: null,
            htmlContent: null,
            requiresSubscription: true
          };
        }
        
        // Para usuários com assinatura, retornar o componente completo
        return {
          ...baseComponent,
          htmlContent: component.htmlContent || '',
          requiresSubscription: false // Explicitamente marcar como não requerendo assinatura
        };
      });
      
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