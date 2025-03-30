import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';


/**
 * @Author: Dev-Ricas & Luanplays11
 * @Date: 30/03/2025
 * @Description: Serviço para gerenciar componentes CSS.
 */
@Injectable()
export class ComponentsService {
  private prisma = new PrismaClient();

    /**
   * Cria um novo componente CSS no banco de dados.
   * @param name - O nome do componente.
   * @param cssContent - O conteúdo CSS do componente.
   * @returns O componente recém-criado com seus detalhes (ID, nome e conteúdo CSS).
   */
  async createComponent(name: string, cssContent: string) {
    return this.prisma.component.create({
      data: {
        name,
        cssContent,
      },
    });
  }

    /**
   * Busca um componente específico pelo ID.
   * @param id - O ID único do componente (esperado como string e convertido para número).
   * @returns O componente correspondente ou lança um erro caso não seja encontrado.
   * @throws Erro em caso de falha na busca.
   */
  async getComponentById(id : string){
    try{
        const numericId = parseInt(id, 10);
        return await this.prisma.component.findUnique({
          where: {
            id : numericId,
         }
       });
    } catch (error){
      throw new Error(`Erro ao buscar produto com o ID ${id}: ${error.message}`)
    }
  }

  /**
   * Retorna a lista de todos os componentes armazenados no banco de dados.
   * @returns Um array de objetos representando os componentes.
   */
  async getAllComponents() {
    return this.prisma.component.findMany();
  }

  /**
   * Exclui um componente específico pelo ID.
   * @param id - O ID único do componente (esperado como string e convertido para número).
   * @returns O componente excluído ou lança um erro caso não seja encontrado.
   * @throws Erro em caso de falha na exclusão.
   */
  async deleteComponent(id: string){
    try {
      const numericId = parseInt(id, 10)
      return await this.prisma.component.delete({
        where: {
          id: numericId,
        },
      });
    } catch (error){
      throw new Error(`Erro ao excluir o componente com o ID ${id}: ${error.message}`)
    }
  }
}