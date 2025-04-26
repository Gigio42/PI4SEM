/**
 * Interface que define a estrutura de um componente CSS
 */
export interface Component {
  id: number;
  name: string;
  cssContent: string;
  htmlContent?: string;
  category?: string;
  color?: string;
  downloads?: number;
  status?: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para criar um novo componente
 */
export interface CreateComponentDto {
  name: string;
  cssContent: string;
  htmlContent?: string;
  category?: string;
  color?: string;
}

/**
 * Interface para atualizar um componente existente
 */
export interface UpdateComponentDto {
  name?: string;
  cssContent?: string;
  htmlContent?: string;
  category?: string;
  color?: string;
}
