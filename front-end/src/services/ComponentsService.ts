import api from '@/services/api';
import { Component } from '@/types/component';
import { mockComponents } from './mockData';
import { getEndpointFallbacks } from './config';
import axios from 'axios';

interface CreateComponentDto {
  name: string;
  cssContent: string;
  htmlContent?: string;
  category?: string;
  color?: string;
}

class ComponentsServiceClass {  private api = axios.create({
    baseURL: '/api',
    timeout: 30000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Interceptador para debug
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`❌ API Response Error: ${error.response?.status} ${error.config?.url}`, {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }
  /**
   * Obtém todos os componentes disponíveis
   * @returns Lista de componentes
   */
  async getAllComponents(): Promise<Component[]> {
    try {
      console.log('🔍 ComponentsService: Fetching all components...');      // Try endpoints in order of preference (most likely to work first)
      const possibleEndpoints = getEndpointFallbacks('components');
      
      let response;
      let lastError;
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          
          // Use fetch for direct backend URLs, axios for proxied
          if (endpoint.startsWith('http://')) {
            const fetchResponse = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (!fetchResponse.ok) {
              throw new Error(`HTTP ${fetchResponse.status}`);
            }
            
            const responseData = await fetchResponse.json();
            response = { data: responseData };
          } else {
            response = await this.api.get(endpoint, { timeout: 30000 });
          }
          
          console.log(`✅ Success with endpoint: ${endpoint}`);
          break;
        } catch (error: any) {
          console.log(`❌ Failed with endpoint ${endpoint}:`, error.response?.status || error.message || 'Network Error');
          lastError = error;
          continue;
        }
      }
      
      if (!response) {
        throw lastError;
      }
      
      console.log('✅ ComponentsService: Components fetched successfully', {
        count: response.data?.length || 0,
        data: response.data
      });
      
      // Garantir que todos os componentes tenham htmlContent
      const components = Array.isArray(response.data) ? response.data : [];
      return components.map(component => ({
        ...component,
        htmlContent: component.htmlContent || '', // Garantir que htmlContent existe
        category: component.category || 'Outros',
        color: component.color || '#6366F1'
      }));
    } catch (error: any) {
      console.error('❌ ComponentsService: Error fetching components:', error);
      
      if (error.response?.status === 404) {
        console.log('📝 ComponentsService: 404 - Endpoint not found or no components exist, returning empty array');
        return [];
      }
      
      // Tratamento para outros erros
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Timeout: O servidor está demorando para responder. Tente novamente.');
      }
      
      if (error.response?.status >= 500) {
        throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
      }
      
      if (!error.response) {
        throw new Error('Erro de conexão. Verifique sua conexão com a internet.');
      }
      
      // Para outros casos, também retornar array vazio mas logar o erro
      console.warn('⚠️ ComponentsService: Returning empty array due to error:', error.message);
      return [];
    }
  }

  /**
   * Obtém um componente específico pelo ID
   * @param id ID do componente
   * @returns Detalhes do componente
   */  async getComponentById(id: number): Promise<Component | null> {
    try {
      console.log(`🔍 ComponentsService: Fetching component ${id}...`);
      
      const possibleEndpoints = [
        `/api/components/${id}`,
        `/components/${id}`,
        `/api/v1/components/${id}`
      ];
      
      let response;
      let lastError;
      
      for (const endpoint of possibleEndpoints) {
        try {
          response = await this.api.get(endpoint, { timeout: 20000 });
          break;
        } catch (error: any) {
          lastError = error;
          continue;
        }
      }
      
      if (!response) {
        throw lastError;
      }
      
      console.log('✅ ComponentsService: Component fetched successfully', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ ComponentsService: Error fetching component:', error);
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Timeout: O servidor está demorando para responder.');
      }
      
      if (error.response?.status === 404) {
        return null;
      }
      
      throw new Error(error.response?.data?.message || 'Erro ao carregar componente');
    }
  }

  /**
   * Cria um novo componente
   * @param componentData Dados do componente a ser criado
   * @returns Componente criado
   */  async createComponent(data: CreateComponentDto): Promise<Component> {
    try {
      console.log('🔍 ComponentsService: Creating component...', data);
        // Try direct backend first, then proxied endpoints
      const possibleEndpoints = getEndpointFallbacks('components');
      
      let response;
      let lastError;
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔍 Trying to create component with endpoint: ${endpoint}`);
          
          // Use fetch for direct backend URLs, axios for proxied
          if (endpoint.startsWith('http://')) {
            const fetchResponse = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });
            
            if (!fetchResponse.ok) {
              throw new Error(`HTTP ${fetchResponse.status}`);
            }
            
            const responseData = await fetchResponse.json();
            response = { data: responseData };
          } else {
            response = await this.api.post(endpoint, data, { timeout: 25000 });
          }
          
          console.log(`✅ Success creating component with endpoint: ${endpoint}`);
          break;
        } catch (error: any) {          console.log(`❌ Failed to create component with endpoint ${endpoint}:`, error.response?.status || error.message || 'Network Error');
          lastError = error;
          continue;
        }
      }
      
      if (!response) {
        throw lastError;
      }
      
      console.log('✅ ComponentsService: Component created successfully', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ ComponentsService: Error creating component:', error);
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Timeout: O servidor está demorando para processar. Tente novamente.');
      }
      
      throw new Error(error.response?.data?.message || 'Erro ao criar componente');
    }
  }

  /**
   * Atualiza um componente existente
   * @param id ID do componente
   * @param componentData Dados do componente a serem atualizados
   * @returns Componente atualizado
   */  async updateComponent(id: number, data: Partial<CreateComponentDto>): Promise<Component> {
    try {
      console.log(`🔍 ComponentsService: Updating component ${id}...`, data);
      const response = await this.api.put(`/components/${id}`, data, {
        timeout: 25000,
      });
      
      console.log('✅ ComponentsService: Component updated successfully', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ ComponentsService: Error updating component:', error);
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Timeout: O servidor está demorando para processar. Tente novamente.');
      }
      
      throw new Error(error.response?.data?.message || 'Erro ao atualizar componente');
    }
  }

  /**
   * Remove um componente
   * @param id ID do componente
   * @returns Void
   */  async deleteComponent(id: number): Promise<void> {
    try {
      console.log(`🔍 ComponentsService: Deleting component ${id}...`);
      await this.api.delete(`/components/${id}`, {
        timeout: 20000,
      });
      
      console.log('✅ ComponentsService: Component deleted successfully');
    } catch (error: any) {
      console.error('❌ ComponentsService: Error deleting component:', error);
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Timeout: O servidor está demorando para processar. Tente novamente.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Componente não encontrado.');
      }
      
      throw new Error(error.response?.data?.message || 'Erro ao excluir componente');
    }
  }

  // Método para descobrir qual endpoint está funcionando
  async discoverAPIEndpoint(): Promise<string | null> {
    const possibleEndpoints = [
      '/api/components',
      '/components',
      '/api/v1/components'
    ];
    
    for (const endpoint of possibleEndpoints) {
      try {
        await this.api.get(endpoint, { 
          timeout: 5000,
          validateStatus: (status) => status < 500 
        });
        console.log(`✅ Discovered working endpoint: ${endpoint}`);
        return endpoint;
      } catch (error: any) {
        console.log(`❌ Endpoint ${endpoint} not working:`, error.response?.status);
        continue;
      }
    }
    
    return null;
  }

  // Método para testar conectividade da API
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 ComponentsService: Testing API connection...');
      
      // Primeiro tentar descobrir um endpoint que funciona
      const workingEndpoint = await this.discoverAPIEndpoint();
      
      if (workingEndpoint) {
        console.log('✅ ComponentsService: API connection test successful');
        return true;
      }
      
      // Se nenhum endpoint de components funcionar, tentar endpoints de saúde
      const healthEndpoints = ['/api/health', '/health', '/api/status', '/status'];
      
      for (const endpoint of healthEndpoints) {
        try {
          await this.api.get(endpoint, { 
            timeout: 5000,
            validateStatus: (status) => status < 500 
          });
          console.log(`✅ Health check successful with: ${endpoint}`);
          return true;
        } catch (error) {
          continue;
        }
      }
      
      console.log('❌ ComponentsService: No working endpoints found');
      return false;
    } catch (error: any) {
      console.error('❌ ComponentsService: API connection test failed:', error);
      return false;
    }
  }
}

// Exportar como default e named export
export const ComponentsService = new ComponentsServiceClass();
export default ComponentsService;
