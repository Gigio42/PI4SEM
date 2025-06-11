"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ComponentsService from '@/services/ComponentsService';
import { AIComponentService } from '@/services/AIComponentService';

export interface Component {
  id: number;
  name: string;
  category: string;
  cssContent: string;
  htmlContent?: string;
  color: string;
  primaryColor?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isFavorited?: boolean;
}

export interface ComponentFormData {
  name: string;
  category: string;
  cssContent: string;
  htmlContent: string;
  color: string;
}

interface ComponentContextType {
  components: Component[];
  loading: boolean;
  error: string | null;
  selectedComponent: Component | null;
  
  // CRUD Operations
  fetchComponents: () => Promise<void>;
  createComponent: (data: ComponentFormData) => Promise<Component>;
  updateComponent: (id: number, data: Partial<ComponentFormData>) => Promise<Component>;
  deleteComponent: (id: number) => Promise<void>;
  
  // AI Generation
  generateComponentWithAI: (prompt: string) => Promise<Component>;
  
  // State Management
  setSelectedComponent: (component: Component | null) => void;
  clearError: () => void;

  // API Connection
  apiConnected: boolean | null;
  testAPIConnection: () => Promise<boolean>;

  // Get Component by ID
  getComponentById: (id: number) => Promise<Component | null>;
}

const ComponentContext = createContext<ComponentContextType | undefined>(undefined);

export function ComponentProvider({ children }: { children: React.ReactNode }) {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  // Testar conexão com a API no início
  const testAPIConnection = useCallback(async () => {
    try {
      const isConnected = await ComponentsService.testConnection();
      setApiConnected(isConnected);
      
      if (!isConnected) {
        setError('Não foi possível conectar com o servidor. Verifique se o backend está rodando.');
      }
      
      return isConnected;
    } catch (error) {
      console.error('API connection test failed:', error);
      setApiConnected(false);
      setError('Erro ao testar conexão com o servidor.');
      return false;
    }
  }, []);

  const fetchComponents = useCallback(async () => {
    console.log('🔄 ComponentContext: Starting to fetch components...');
    setLoading(true);
    setError(null);
    
    try {
      // Primeiro descobrir se existe um endpoint funcionando
      const workingEndpoint = await ComponentsService.discoverAPIEndpoint();
      
      if (!workingEndpoint) {
        console.log('⚠️ ComponentContext: No working API endpoint found');
        setApiConnected(false);
        setError('Servidor não encontrado. Verifique se o backend está rodando.');
        setComponents([]);
        return;
      }
      
      const data = await ComponentsService.getAllComponents();
      console.log('✅ ComponentContext: Components fetched successfully:', data);
      setComponents(data);
      setApiConnected(true);
      
      if (data.length === 0) {
        console.log('📝 ComponentContext: No components found in database');
      }
    } catch (error: any) {
      console.error('❌ ComponentContext: Error fetching components:', error);
      setError(error.message || 'Erro ao carregar componentes');
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const getComponentById = async (id: number): Promise<Component | null> => {
    try {
      setError(null);
      
      // Primeiro, tentar encontrar no cache local
      const cachedComponent = components.find(c => c.id === id);
      if (cachedComponent) {
        console.log('📦 ComponentContext: Found component in cache');
        return cachedComponent;
      }
      
      // Se não encontrar no cache, buscar na API
      console.log('🔍 ComponentContext: Component not in cache, fetching from API...');
      const component = await ComponentsService.getComponentById(id);
      return component;
    } catch (error: any) {
      console.error('❌ ComponentContext: Error fetching component by ID:', error);
      setError(error.message || 'Erro ao carregar componente');
      throw error;
    }
  };

  const createComponent = async (data: ComponentFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newComponent = await ComponentsService.createComponent(data);
      setComponents(prev => [...prev, newComponent]);
      return newComponent;
    } catch (error: any) {
      console.error('❌ ComponentContext: Error creating component:', error);
      setError(error.message || 'Erro ao criar componente');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateComponent = async (id: number, data: Partial<ComponentFormData>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedComponent = await ComponentsService.updateComponent(id, data);
      setComponents(prev => prev.map(comp => comp.id === id ? updatedComponent : comp));
      return updatedComponent;
    } catch (error: any) {
      console.error('❌ ComponentContext: Error updating component:', error);
      setError(error.message || 'Erro ao atualizar componente');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteComponent = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await ComponentsService.deleteComponent(id);
      setComponents(prev => prev.filter(comp => comp.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir componente';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateComponentWithAI = useCallback(async (prompt: string): Promise<Component> => {
    try {
      setLoading(true);
      setError(null);
      
      // Usando a API Gemini 2.5 através do serviço
      const aiResult = await AIComponentService.generateComponent(prompt);
      
      const aiData: ComponentFormData = {
        name: aiResult.name || `AI: ${prompt.substring(0, 20)}...`,
        category: aiResult.category || 'AI Generated',
        cssContent: aiResult.css || '',
        htmlContent: aiResult.html || '',
        color: aiResult.color || '#8b5cf6'
      };
      
      const newComponent = await ComponentsService.createComponent(aiData);
      const transformedComponent = {
        ...newComponent,
        color: newComponent.color || '#8b5cf6',
        createdAt: newComponent.createdAt ? new Date(newComponent.createdAt) : new Date(),
        updatedAt: newComponent.updatedAt ? new Date(newComponent.updatedAt) : new Date()
      };
      setComponents(prev => [transformedComponent, ...prev]);
      return transformedComponent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar componente com IA';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: ComponentContextType = {
    components,
    loading,
    error,
    selectedComponent,
    fetchComponents,
    getComponentById,
    createComponent,
    updateComponent,
    deleteComponent,
    generateComponentWithAI,
    setSelectedComponent,
    clearError,
    apiConnected,
    testAPIConnection
  };

  return (
    <ComponentContext.Provider value={value}>
      {children}
    </ComponentContext.Provider>
  );
}

export function useComponents() {
  const context = useContext(ComponentContext);
  if (context === undefined) {
    throw new Error('useComponents must be used within a ComponentProvider');
  }
  return context;
}
