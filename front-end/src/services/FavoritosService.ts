import { Component } from '../types/component';

interface FavoritoResponse {
  id: string;
  userId: number;
  componentId: number;
  createdAt: string;
  updatedAt: string;
}

class FavoritosService {
  static baseUrl = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/favoritos` : `http://localhost:3000/favoritos`;
  
  // Helper method to get auth token - updated to handle both client and server environments
  private static getAuthToken() {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Client-side code
      return localStorage.getItem('auth_token') || '';
    } else {
      // Server-side code - use a different method to get token or return a default
      return process.env.DEFAULT_AUTH_TOKEN || '';
    }
  }

  // Helper to create headers with auth token
  private static getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getAuthToken()}`
    };
  }

  /**
   * Marca um componente como favorito para um usuário
   * @param userId ID do usuário
   * @param componentId ID do componente
   * @returns Dados do favorito criado
   */
  static async addFavorito(userId: number, componentId: number) {
    try {
      console.log('Enviando request para:', this.baseUrl);
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          userId,
          componentId
        }),
        // Add credentials to ensure cookies are sent with the request
        credentials: 'include'
      });

      if (!response.ok) {
        // Improved error handling with better logging
        const errorText = await response.text();
        let errorData;
        
        try {
          // Try to parse as JSON if possible
          errorData = JSON.parse(errorText);
        } catch {
          // If not JSON, use the raw text
          errorData = { message: errorText || 'No response details available' };
        }
        
        console.error('Error response:', response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('Autenticação necessária para adicionar favoritos');
        } else if (response.status === 404) {
          throw new Error('Componente ou usuário não encontrado');
        } else {
          throw new Error(`Erro ao adicionar favorito: ${response.status} - ${errorData.message || 'Erro desconhecido'}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      // Re-throw the error for the calling component to handle
      throw error;
    }
  }

  /**
   * Remove um componente dos favoritos pelo ID do usuário e componente
   * @param userId ID do usuário
   * @param componentId ID do componente
   * @returns 
   */
  static async removeFavoritoByUserAndComponent(userId: number, componentId: number) {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}/component/${componentId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        // Add credentials to ensure cookies are sent
        credentials: 'include'
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
   * Remove um componente dos favoritos de um usuário
   * @param id ID do favorito
   * @returns 
   */
  static async removeFavorito(id: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        // Add credentials to ensure cookies are sent
        credentials: 'include'
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
  static async checkIsFavorito(userId: number, componentId: number) {
    try {
      if (!userId || !componentId) {
        return {
          isFavorito: false,
          favoritoData: null
        };
      }

      // Add error handling for failed requests
      try {
        const response = await fetch(`${this.baseUrl}/check/${userId}/${componentId}`, {
          headers: this.getHeaders(),
          // Add credentials to ensure cookies are sent
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 404) {
            return {
              isFavorito: false,
              favoritoData: null
            };
          }
          if (response.status === 401) {
            console.warn('Authentication required for checking favorites');
            return {
              isFavorito: false, 
              favoritoData: null
            };
          }
          throw new Error(`Erro ao verificar favorito: ${response.status}`);
        }

        const data = await response.json();
        return {
          isFavorito: data.isFavorite,
          favoritoData: data.favorito
        };
      } catch (fetchError) {
        console.error('Erro na requisição para verificar favorito:', fetchError);
        // Return a default response rather than throwing
        return {
          isFavorito: false,
          favoritoData: null
        };
      }
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return {
        isFavorito: false,
        favoritoData: null
      };
    }
  }

  /**
   * Obtém todos os favoritos de um usuário
   * @param userId ID do usuário
   * @returns Lista de componentes favoritos
   */
  static async getFavoritosByUser(userId: number) {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}`, {
        headers: this.getHeaders(),
        // Add credentials to ensure cookies are sent
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Authentication required for fetching favorites');
          return [];
        }
        throw new Error(`Erro ao buscar favoritos: ${response.status}`);
      }

      const data = await response.json();
      return data.map((item: any) => item.component);
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      // Return empty array instead of throwing error for better UX
      return [];
    }
  }
}

export { FavoritosService };
