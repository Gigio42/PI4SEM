import axios from 'axios';
import statisticsService from './statistics.service';

// Definição de tipos
export interface Component {
  id: number;
  name: string;
  cssContent: string;
  htmlContent?: string;
  category: string;
  color: string;
}

// Classe do serviço
class ComponentsService {
  private apiUrl = '/api';
  // Obtém todos os componentes
  async getAllComponents(): Promise<Component[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/components`, { withCredentials: true });
      
      // Garantir que todos os componentes tenham campos obrigatórios
      const components = Array.isArray(response.data) ? response.data : [];
      return components.map(component => ({
        ...component,
        htmlContent: component.htmlContent || '',
        category: component.category || 'Outros',
        color: component.color || '#6366F1'
      }));
    } catch (error) {
      console.error('Error fetching components:', error);
      throw error;
    }
  }
  // Obtém um componente por ID
  async getComponentById(id: number): Promise<Component> {
    try {
      const response = await axios.get(`${this.apiUrl}/components/${id}`, { withCredentials: true });
      
      // Registrar visualização do componente
      this.trackComponentView(id);
      
      // Garantir que o componente tenha todos os campos necessários
      const component = response.data;
      return {
        ...component,
        htmlContent: component.htmlContent || '',
        category: component.category || 'Outros',
        color: component.color || '#6366F1'
      };
    } catch (error) {
      console.error(`Error fetching component ${id}:`, error);
      throw error;
    }
  }
  // Obtém componentes por categoria
  async getComponentsByCategory(category: string): Promise<Component[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/components/category/${category}`, { withCredentials: true });
      
      // Garantir que todos os componentes tenham campos obrigatórios
      const components = Array.isArray(response.data) ? response.data : [];
      return components.map(component => ({
        ...component,
        htmlContent: component.htmlContent || '',
        category: component.category || 'Outros',
        color: component.color || '#6366F1'
      }));
    } catch (error) {
      console.error(`Error fetching components by category ${category}:`, error);
      throw error;
    }
  }

  // Rastreia a visualização do componente para estatísticas
  private trackComponentView(componentId: number): void {
    try {
      statisticsService.registerComponentView(componentId);
    } catch (error) {
      // Apenas registra o erro, não interrompe o fluxo principal
      console.error('Error tracking component view:', error);
    }
  }

  // Adiciona um componente aos favoritos
  async addToFavorites(componentId: number): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/favoritos`,
        { componentId },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding component to favorites:', error);
      throw error;
    }
  }

  // Remove um componente dos favoritos
  async removeFromFavorites(componentId: number): Promise<any> {
    try {
      const response = await axios.delete(
        `${this.apiUrl}/favoritos/${componentId}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Error removing component from favorites:', error);
      throw error;
    }
  }

  // Verifica se um componente está nos favoritos
  async checkFavoriteStatus(componentId: number): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/favoritos/check/${componentId}`,
        { withCredentials: true }
      );
      return response.data.isFavorite;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  // Obtém todos os componentes favoritos do usuário
  async getFavorites(): Promise<Component[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/favoritos`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }
}

export default new ComponentsService();
