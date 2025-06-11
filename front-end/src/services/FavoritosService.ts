import api from '@/services/api';

export interface Favorito {
  id: number;
  userId: number;
  componentId: number;
  createdAt: string;
}

export class FavoritesService {
  private static getAuthHeaders() {
    if (typeof window === 'undefined') {
      return {};
    }
    
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Add component to user's favorites
   */
  static async addFavorite(userId: number, componentId: number): Promise<Favorito> {
    try {
      console.log(`Adding component ${componentId} to favorites for user ${userId}`);

      const response = await api.post('/favoritos', {
        userId,
        componentId
      }, {
        headers: this.getAuthHeaders(),
        timeout: 5000
      });

      console.log('Add favorite response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }

  /**
   * Remove component from user's favorites
   */
  static async removeFavorite(userId: number, componentId: number): Promise<void> {
    try {
      console.log(`Removing component ${componentId} from favorites for user ${userId}`);

      await api.delete(`/favoritos/${componentId}/${userId}`, {
        headers: this.getAuthHeaders(),
        timeout: 5000
      });

      console.log('Successfully removed from favorites');
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }

  /**
   * Check if a component is favorited by user
   */
  static async checkIfFavorited(userId: number, componentId: number): Promise<boolean> {
    try {
      console.log(`Checking if component ${componentId} is favorited by user ${userId}`);

      const response = await api.get(`/favoritos/check/${componentId}/${userId}`, {
        headers: this.getAuthHeaders(),
        timeout: 3000
      });

      console.log('API response for checkIfFavorited:', response.data);
      return response.data?.isFavorite || false;
    } catch (error: any) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  /**
   * Get all user's favorite components
   */
  static async getUserFavorites(userId: number): Promise<Favorito[]> {
    try {
      console.log(`Fetching favorites for user ${userId}`);

      const response = await api.get(`/favoritos/user/${userId}`, {
        headers: this.getAuthHeaders(),
        timeout: 10000
      });

      console.log('User favorites response:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Error fetching user favorites:', error);
      return [];
    }
  }

  /**
   * Toggle favorite status for a component
   */
  static async toggleFavorite(userId: number, componentId: number): Promise<boolean> {
    try {
      const isFavorited = await this.checkIfFavorited(userId, componentId);
      
      if (isFavorited) {
        await this.removeFavorite(userId, componentId);
        return false;
      } else {
        await this.addFavorite(userId, componentId);
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Get user favorites with component details
   */
  static async getUserFavoritesWithComponents(userId: number): Promise<any[]> {
    try {
      console.log(`Getting favorites with components for user ${userId}`);

      const response = await api.get(`/favoritos/user/${userId}/components`, {
        headers: this.getAuthHeaders(),
        timeout: 10000
      });

      console.log('Favorites with components response:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching user favorites with components:', error);
      return [];
    }
  }

  // Backward compatibility methods
  static async checkIsFavorito(componentId: number, userId?: number): Promise<boolean> {
    if (!userId) return false;
    return this.checkIfFavorited(userId, componentId);
  }

  static async addFavorito(componentId: number, userId: number): Promise<Favorito | null> {
    try {
      return await this.addFavorite(userId, componentId);
    } catch (error) {
      console.error('Error adding favorite:', error);
      return null;
    }
  }

  static async removeFavorito(componentId: number, userId: number): Promise<boolean> {
    try {
      await this.removeFavorite(userId, componentId);
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }

  static async getUserFavoritos(userId: number): Promise<Favorito[]> {
    return this.getUserFavorites(userId);
  }

  static async getFavoritosByUser(userId: number): Promise<Favorito[]> {
    return this.getUserFavoritos(userId);
  }

  static async toggleFavorito(componentId: number, userId?: number): Promise<boolean> {
    if (!userId) return false;
    return this.toggleFavorite(userId, componentId);
  }

  static async removeFavoritoByUserAndComponent(userId: number, componentId: number): Promise<boolean> {
    return this.removeFavorito(componentId, userId);
  }
}

// Export both names for compatibility
export { FavoritesService as FavoritosService };
