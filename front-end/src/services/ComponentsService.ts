import api from '@/services/api';
import { Component } from '@/types/component';
import { mockComponents } from './mockData';

export class ComponentsService {
  /**
   * Obtém todos os componentes disponíveis
   * @returns Lista de componentes
   */
  static async getAllComponents(): Promise<Component[]> {
    try {
      // Log the API request for debugging
      console.log('Fetching components from API...');
      
      // Ensure the endpoint doesn't have a leading slash as api.ts adds it
      const endpoint = 'components';
      console.log(`Requesting from endpoint: ${endpoint}`);
      
      // Try to fetch from the backend API
      const response = await api.get(endpoint);
      
      // Validate the response data format
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('Received HTML instead of JSON. The API URL is likely incorrect.');
      }
      
      console.log('API Response:', response.data);
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Support API that wraps results in a data property
        return response.data.data;
      } else {
        console.error('Unexpected API response format:', response.data);
        // Return mock data for development as a fallback
        console.log('Falling back to mock data due to unexpected response format');
        return mockComponents;
      }
    } catch (error: any) {
      console.error('Error fetching components:', error);
      
      // Add more detailed error information
      if (error.response) {
        console.error(`Status: ${error.response.status}, Data:`, error.response.data);
        
        // Check for HTML response
        const contentType = error.response.headers?.['content-type'];
        if (contentType && contentType.includes('text/html')) {
          console.error('Received HTML response from API. Check backend URL configuration.');
        }
      } else if (error.request) {
        console.error('No response from server. Server might be down or unreachable.');
      }
      
      // Show connection information for debugging
      console.log('API Connection Info:');
      console.log('- Base URL:', api.defaults.baseURL);
      console.log('- Timeout:', api.defaults.timeout);
      console.log('- With Credentials:', api.defaults.withCredentials);
      
      // Return mock data for development as a fallback
      console.log('Falling back to mock data');
      return mockComponents;
    }
  }

  /**
   * Obtém um componente específico pelo ID
   * @param id ID do componente
   * @returns Detalhes do componente
   */
  static async getComponentById(id: number): Promise<Component> {
    try {
      const response = await api.get(`components/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error fetching component ${id}:`, error);
      
      // Return mock component as fallback
      const mockComponent = mockComponents.find(c => c.id === id);
      if (mockComponent) {
        return mockComponent;
      }
      
      throw error;
    }
  }

  /**
   * Cria um novo componente
   * @param componentData Dados do componente a ser criado
   * @returns Componente criado
   */
  static async createComponent(componentData: Partial<Component>): Promise<Component> {
    try {
      const response = await api.post('components', componentData);
      return response.data;
    } catch (error: unknown) {
      console.error('Error creating component:', error);
      throw error;
    }
  }

  /**
   * Atualiza um componente existente
   * @param id ID do componente
   * @param componentData Dados do componente a serem atualizados
   * @returns Componente atualizado
   */
  static async updateComponent(id: number, componentData: Partial<Component>): Promise<Component> {
    try {
      const response = await api.put(`components/${id}`, componentData);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error updating component ${id}:`, error);
      throw error;
    }
  }

  /**
   * Remove um componente
   * @param id ID do componente
   * @returns Void
   */
  static async deleteComponent(id: number): Promise<void> {
    try {
      await api.delete(`components/${id}`);
    } catch (error: unknown) {
      console.error(`Error deleting component ${id}:`, error);
      throw error;
    }
  }
}

export default ComponentsService;
