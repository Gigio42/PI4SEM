/**
 * Interface que define a estrutura de um componente CSS
 */
export interface Component {
  id: number;
  name: string;
  category: string;
  color: string;
  cssContent: string;
  htmlContent?: string;
  isFavorited?: boolean;
  description?: string;
  primaryColor?: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: number;
  requiresSubscription?: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
  };
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

// Add validation interface for better type safety
export interface ComponentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Add utility function for validation
export const validateComponent = (data: CreateComponentDto): ComponentValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate name
  if (!data.name || !data.name.trim()) {
    errors.push('Nome é obrigatório');
  } else if (data.name.trim().length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres');
  } else if (data.name.trim().length > 100) {
    errors.push('Nome muito longo (máximo 100 caracteres)');
  }

  // Validate CSS
  if (!data.cssContent || !data.cssContent.trim()) {
    errors.push('Código CSS é obrigatório');
  } else if (data.cssContent.trim().length > 10000) {
    errors.push('Código CSS muito longo (máximo 10000 caracteres)');
  } else if (!data.cssContent.includes('{') || !data.cssContent.includes('}')) {
    warnings.push('CSS parece estar incompleto');
  }

  // Validate HTML
  if (data.htmlContent && data.htmlContent.trim().length > 5000) {
    errors.push('Código HTML muito longo (máximo 5000 caracteres)');
  }

  if (data.htmlContent && data.htmlContent.includes('<script>')) {
    errors.push('Tags script não são permitidas por segurança');
  }

  // Validate color
  if (data.color && !/^#[0-9A-F]{6}$/i.test(data.color)) {
    warnings.push('Formato de cor inválido, usando cor padrão');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Interface para componentes favoritos
 */
export interface Favorite {
  id: number;
  userId: number;
  componentId: number;
  createdAt: string;
  component?: Component;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}
