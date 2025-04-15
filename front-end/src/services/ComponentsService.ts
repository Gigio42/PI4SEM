import { Component, CreateComponentDto, UpdateComponentDto } from '../types/component';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ComponentsService {
  /**
   * Busca todos os componentes disponíveis
   * @returns Lista de componentes
   */
  static async getAllComponents(): Promise<Component[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/components`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar componentes: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro no serviço de componentes:', error);
      throw error;
    }
  }

  /**
   * Busca um componente específico pelo ID
   * @param id ID do componente
   * @returns O componente encontrado
   */
  static async getComponentById(id: number): Promise<Component> {
    try {
      const response = await fetch(`${API_BASE_URL}/components/${id}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar componente: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar componente ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo componente
   * @param data Dados do componente a ser criado
   * @returns O componente criado
   */
  static async createComponent(data: CreateComponentDto): Promise<Component> {
    try {
      const response = await fetch(`${API_BASE_URL}/components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Erro ao criar componente: ${response.status}`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar componente:', error);
      throw error;
    }
  }

  /**
   * Atualiza um componente existente
   * @param id ID do componente a ser atualizado
   * @param data Dados a serem atualizados
   * @returns O componente atualizado
   */
  static async updateComponent(id: number, data: UpdateComponentDto): Promise<Component> {
    try {
      const response = await fetch(`${API_BASE_URL}/components/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Erro ao atualizar componente: ${response.status}`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao atualizar componente ${id}:`, error);
      throw error;
    }
  }

  /**
   * Exclui um componente existente
   * @param id ID do componente a ser excluído
   * @returns O componente excluído
   */
  static async deleteComponent(id: number): Promise<Component> {
    try {
      const response = await fetch(`${API_BASE_URL}/components/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Erro ao excluir componente: ${response.status}`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao excluir componente ${id}:`, error);
      throw error;
    }
  }
}

// Add default export to ensure compatibility with various import styles
export default ComponentsService;
