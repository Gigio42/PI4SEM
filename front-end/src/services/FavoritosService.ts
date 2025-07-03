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
   * Check if a component is favorited by user (improved with retry logic)
   */
  static async checkIfFavorited(userId: number, componentId: number): Promise<boolean> {
    try {
      console.log(`Checking if component ${componentId} is favorited by user ${userId}`);

      // Add retry logic with exponential backoff
      let retries = 0;
      const maxRetries = 2;
      
      while (retries <= maxRetries) {
        try {
          const timeout = 5000 * Math.pow(2, retries); // 5s, 10s, 20s
          console.log(`Attempt ${retries + 1} with timeout ${timeout}ms`);
          
          const response = await api.get(`/favoritos/check/${componentId}/${userId}`, {
            headers: this.getAuthHeaders(),
            timeout: timeout
          });
          
          console.log('API response for checkIfFavorited:', response.data);
          return response.data?.isFavorite || false;
        } catch (attemptError: any) {
          retries++;
          if (retries > maxRetries || attemptError.response) {
            // If we got a response status (like 404, 500), no need to retry
            throw attemptError;
          }
          console.warn(`Retry ${retries}/${maxRetries} after error:`, attemptError.message);
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      throw new Error("Max retries exceeded");
    } catch (error: any) {
      console.error('Error checking favorite status:', error);
      // Provide detail logging for debugging
      if (error.response) {
        console.error('Response error:', {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('Request error (no response received):', {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout
        });
      }
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

  /**
   * Alias for addFavorite (to maintain compatibility with existing code)
   */
  static async addFavorito(componentId: number, userId: number): Promise<Favorito> {
    return this.addFavorite(userId, componentId);
  }
  
  /**
   * Alias for removeFavorite (to maintain compatibility with existing code)
   */
  static async removeFavorito(componentId: number, userId: number): Promise<void> {
    return this.removeFavorite(userId, componentId);
  }
}
