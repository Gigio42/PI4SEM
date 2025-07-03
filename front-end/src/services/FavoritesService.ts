import { Favorite } from '@/types/component';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Temporary storage for fallback when API is not available
const tempFavorites = new Map<string, boolean>();

export class FavoritesService {
  private static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  /**
   * Add component to user's favorites
   */
  static async addFavorite(userId: number, componentId: number): Promise<Favorite> {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ 
          userId: userId,
          componentId: componentId 
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Fallback: store in memory
          const key = `${userId}-${componentId}`;
          tempFavorites.set(key, true);
          console.warn('Favorites API not implemented, using temporary storage');
          
          // Return mock favorite object
          return {
            id: Date.now(),
            userId,
            componentId,
            createdAt: new Date().toISOString()
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clear from temp storage if it was there
      const key = `${userId}-${componentId}`;
      tempFavorites.delete(key);

      return await response.json();
    } catch (error) {
      // Fallback: store in memory
      const key = `${userId}-${componentId}`;
      tempFavorites.set(key, true);
      console.warn('Favorites API not available, using temporary storage:', error);
      
      // Return mock favorite object
      return {
        id: Date.now(),
        userId,
        componentId,
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * Remove component from user's favorites
   */
  static async removeFavorite(userId: number, componentId: number): Promise<void> {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ 
          userId: userId,
          componentId: componentId 
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Fallback: remove from memory
          const key = `${userId}-${componentId}`;
          tempFavorites.delete(key);
          console.warn('Favorites API not implemented, using temporary storage');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clear from temp storage
      const key = `${userId}-${componentId}`;
      tempFavorites.delete(key);
    } catch (error) {
      // Fallback: remove from memory
      const key = `${userId}-${componentId}`;
      tempFavorites.delete(key);
      console.warn('Favorites API not available, using temporary storage:', error);
    }
  }

  /**
   * Get all user's favorite components
   */
  static async getUserFavorites(userId: number): Promise<Favorite[]> {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/favorites/user/${userId}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Fallback: return from memory storage
          const favorites: Favorite[] = [];
          tempFavorites.forEach((value, key) => {
            if (key.startsWith(`${userId}-`) && value) {
              const componentId = parseInt(key.split('-')[1]);
              favorites.push({
                id: Date.now() + Math.random(),
                userId,
                componentId,
                createdAt: new Date().toISOString()
              });
            }
          });
          return favorites;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      
      // Fallback: return from memory storage
      const favorites: Favorite[] = [];
      tempFavorites.forEach((value, key) => {
        if (key.startsWith(`${userId}-`) && value) {
          const componentId = parseInt(key.split('-')[1]);
          favorites.push({
            id: Date.now() + Math.random(),
            userId,
            componentId,
            createdAt: new Date().toISOString()
          });
        }
      });
      return favorites;
    }
  }

  /**
   * Check if a component is favorited by user
   */
  static async checkIfFavorited(userId: number, componentId: number): Promise<boolean> {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/favorites/user/${userId}/component/${componentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Fallback: check memory storage
          const key = `${userId}-${componentId}`;
          return tempFavorites.get(key) || false;
        }
        return false;
      }

      const data = await response.json();
      return data.isFavorite || false;
    } catch (error) {
      console.error('Error checking if favorited:', error);
      
      // Fallback: check memory storage
      const key = `${userId}-${componentId}`;
      return tempFavorites.get(key) || false;
    }
  }

  /**
   * Get user's favorite components count
   */
  static async getFavoritesCount(userId: number): Promise<number> {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/favorites/user/${userId}/count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Fallback: count from memory storage
          let count = 0;
          tempFavorites.forEach((value, key) => {
            if (key.startsWith(`${userId}-`) && value) {
              count++;
            }
          });
          return count;
        }
        return 0;
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Error getting favorites count:', error);
      
      // Fallback: count from memory storage
      let count = 0;
      tempFavorites.forEach((value, key) => {
        if (key.startsWith(`${userId}-`) && value) {
          count++;
        }
      });
      return count;
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
      throw new Error('Failed to toggle favorite status');
    }
  }
}
