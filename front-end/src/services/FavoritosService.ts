import { Component } from '../types/component';

interface FavoritoResponse {
  id: string;
  userId: number;
  componentId: number;
  createdAt: string;
  updatedAt: string;
}

export class FavoritosService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/favoritos` 
    : 'http://localhost:3000/favoritos';

  /**
   * Marca um componente como favorito para um usuário
   * @param userId ID do usuário
   * @param componentId ID do componente
   * @returns Dados do favorito criado
   */
  static async addFavorito(userId: number, componentId: number): Promise<FavoritoResponse> {
    try {
      console.log('Enviando request para:', this.baseUrl);
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, componentId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Erro detalhado:', errorData);
        throw new Error(`Erro ao adicionar favorito: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      throw error;
    }
  }

  /**
   * Remove um componente dos favoritos de um usuário
   * @param id ID do favorito
   * @returns 
   */
  static async removeFavorito(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro ao remover favorito: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      throw error;
    }
  }

  /**
   * Remove um componente dos favoritos pelo ID do usuário e componente
   * @param userId ID do usuário
   * @param componentId ID do componente
   * @returns 
   */
  static async removeFavoritoByUserAndComponent(userId: number, componentId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}/component/${componentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro ao remover favorito: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      throw error;
    }
  }
  /**
   * Verifica se um componente é favorito de um usuário
   * @param userId ID do usuário
   * @param componentId ID do componente
   * @returns Objeto com estado do favorito
   */
  static async checkIsFavorito(userId: number, componentId: number): Promise<{ isFavorito: boolean; favoritoData: FavoritoResponse | null }> {
    try {
      if (!userId || !componentId) {
        return { isFavorito: false, favoritoData: null };
      }
      
      const response = await fetch(`${this.baseUrl}/check/${userId}/${componentId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return { isFavorito: false, favoritoData: null };
        }
        throw new Error(`Erro ao verificar favorito: ${response.status}`);
      }

      const data = await response.json();
      return {
        isFavorito: data.isFavorite,
        favoritoData: data.favorito
      };
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return { isFavorito: false, favoritoData: null };
    }
  }

  /**
   * Obtém todos os favoritos de um usuário
   * @param userId ID do usuário
   * @returns Lista de componentes favoritos
   */
  static async getFavoritosByUser(userId: number): Promise<Component[]> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar favoritos: ${response.status}`);
      }

      const data = await response.json();
      return data.map((item: any) => item.component);
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      throw error;
    }
  }
}
