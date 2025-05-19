import { Component } from '../types/component';
import api from './api';

interface FavoritoResponse {
  id: string;
  userId: number;
  componentId: number;
  createdAt: string;
  updatedAt: string;
}

class FavoritosService {
  static baseUrl = '/api/favoritos';
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
  }  /**
   * Marca um componente como favorito para um usuário
   * @param userId ID do usuário
   * @param componentId ID do componente
   * @returns Dados do favorito criado
   */
  static async addFavorito(userId: number | undefined, componentId: number) {
    try {
      // Validate userId before proceeding
      if (userId === undefined) {
        throw new Error('User ID is required to add a favorite');
      }
      
      console.log('Enviando request para adicionar favorito:', { userId, componentId });
      
      // The path should not include /api as the api.ts already has baseURL set to '/api'
      const response = await api.post('/favoritos', {
        userId,
        componentId
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      // Re-throw the error for the calling component to handle
      throw error;
    }
  }  /**
   * Remove um componente dos favoritos pelo ID do usuário e componente
   * @param userId ID do usuário
   * @param componentId ID do componente
   * @returns 
   */  
  static async removeFavoritoByUserAndComponent(userId: number | undefined, componentId: number) {
    try {
      // Validate userId before proceeding
      if (userId === undefined) {
        throw new Error('User ID is required to remove a favorite');
      }
      
      await api.delete(`/favoritos/user/${userId}/component/${componentId}`);
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      throw error;
    }
  }

  /**
   * Remove um componente dos favoritos de um usuário
   * @param id ID do favorito
   * @returns 
   */  static async removeFavorito(id: string) {
    try {
      await api.delete(`/favoritos/${id}`);
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      throw error;
    }
  }  /**
   * Verifica se um componente é favorito de um usuário
   * @param userId ID do usuário
   * @param componentId ID do componente
   * @returns Objeto com estado do favorito
   */
  static async checkIsFavorito(userId: number | undefined, componentId: number) {
    try {
      if (userId === undefined || !componentId) {
        return {
          isFavorito: false,
          favoritoData: null
        };
      }      try {
        const response = await api.get(`/favoritos/check/${userId}/${componentId}`);
        return {
          isFavorito: response.data.isFavorite,
          favoritoData: response.data.favorito
        };
      } catch (error: any) {
        // Return default response for common errors
        if (error.response) {
          if (error.response.status === 404) {
            return { isFavorito: false, favoritoData: null };
          }
          if (error.response.status === 401) {
            console.warn('Authentication required for checking favorites');
            return { isFavorito: false, favoritoData: null };
          }
        }
        throw error;
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
  static async getFavoritosByUser(userId: number | undefined) {
    try {
      // If userId is undefined, return an empty array early
      if (userId === undefined) {
        return [];
      }
      
      const response = await api.get(`/favoritos/user/${userId}`);
      return response.data.map((item: any) => item.component);
    } catch (error: any) {
      console.error('Erro ao buscar favoritos:', error);
      // Return empty array for better UX
      if (error.response && error.response.status === 401) {
        console.warn('Authentication required for fetching favorites');
      }
      return [];
    }
  }
}

export { FavoritosService };
