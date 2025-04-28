/**
 * Interface que define a estrutura de um componente CSS
 */
export interface Component {
  id: number;
  name: string;
  category?: string;
  color?: string;
  cssContent: string;
  htmlContent?: string;
  imageUrl?: string; // Add this property to fix the TypeScript error
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
