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
   * @param userId ID opcional do usuário para verificar assinatura
   * @returns Lista de componentes
   */
  async getAllComponents(userId?: number): Promise<Component[]> {
    try {
      console.log('🔍 ComponentsService: Fetching all components...', { userId });
      
      // Verificar se há uma flag para forçar recarregamento
      const forceRefresh = typeof window !== 'undefined' && localStorage.getItem('forceRefreshComponents') === 'true';
      
      // Try endpoints in order of preference (most likely to work first)
      const possibleEndpoints = getEndpointFallbacks('components');
      
      let response;
      let lastError;
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          
          // Prepare headers for authentication if userId is provided
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          
          // Add authorization if we have a token
          const token = localStorage.getItem('token');
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          // Adicionar userId como parâmetro de consulta se fornecido
          let url = endpoint;
          if (userId) {
            // Adicionar userId como parâmetro de query para garantir que o backend saiba qual usuário está requisitando
            const separator = url.includes('?') ? '&' : '?';
            url = `${url}${separator}userId=${userId}`;
            console.log(`🔒 Adding userId ${userId} to request`);
            
            // Se forceRefresh estiver habilitado, adicionar um parâmetro para evitar cache no CDN ou no servidor
            if (forceRefresh) {
              url = `${url}&_t=${Date.now()}`;
              console.log(`🔄 Adding timestamp to avoid caching`);
            }
          }
          
          // Use fetch for direct backend URLs, axios for proxied
          if (url.startsWith('http://')) {
            const fetchResponse = await fetch(url, {
              method: 'GET',
              headers,
              // Desabilitar cache se forçando refresh
              cache: forceRefresh ? 'no-store' : 'default'
            });
            
            if (!fetchResponse.ok) {
              throw new Error(`HTTP ${fetchResponse.status}`);
            }
            
            const responseData = await fetchResponse.json();
            response = { data: responseData };
          } else {
            response = await this.api.get(endpoint, { 
              timeout: 30000,
              headers
            });
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
        requiresSubscriptionCount: response.data.filter((comp: Component) => comp.requiresSubscription === true).length,
        firstComponent: response.data[0],
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
   * @param userId ID opcional do usuário para verificar assinatura
   * @returns O componente 
   */
  async getComponentById(id: number, userId?: number): Promise<Component | null> {
    try {
      console.log(`🔍 ComponentsService: Fetching component with ID ${id}`);
      
      // Prepare headers for authentication if userId is provided
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization if we have a token
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const possibleEndpoints = getEndpointFallbacks(`components/${id}`);
      
      let response;
      let lastError;
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          
          if (endpoint.startsWith('http://')) {
            const fetchResponse = await fetch(endpoint, {
              method: 'GET',
              headers,
            });
            
            if (!fetchResponse.ok) {
              throw new Error(`HTTP ${fetchResponse.status}`);
            }
            
            const responseData = await fetchResponse.json();
            response = { data: responseData };
          } else {
            response = await this.api.get(endpoint, { 
              timeout: 10000,
              headers 
            });
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
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching component with ID ${id}:`, error);
      return null;
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
