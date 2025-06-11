"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Using the provided API key
const API_KEY = "AIzaSyCjGBkTZAQnEcD2UzIcvSa6Y8ytQ2KlpfE";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AIGenerationOptions {
  componentType: string;
  theme: string;
  colorScheme?: string;
  complexityLevel?: 'simple' | 'medium' | 'complex';
}

export class AIComponentService {
  /**
   * Generates HTML and CSS for complex components using Gemini 2.5 Flash
   */
  static async generateComponent(
    description: string,
    options?: Partial<AIGenerationOptions>
  ): Promise<{ html: string; css: string; name: string; category: string; color: string }> {
    try {
      // Default options
      const componentType = options?.componentType || "component";
      const theme = options?.theme || "modern";
      const colorScheme = options?.colorScheme || "default";
      const complexityLevel = options?.complexityLevel || "medium";
      
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      });

      // Color mapping for primary color extraction
      const colorMapping = {
        default: "#6366f1", // indigo-500
        blue: "#3b82f6",
        indigo: "#6366f1",
        purple: "#8b5cf6",
        pink: "#ec4899",
        red: "#ef4444",
        orange: "#f97316",
        yellow: "#eab308",
        green: "#10b981",
        teal: "#14b8a6",
        cyan: "#06b6d4",
        gray: "#64748b",
      };
      
      const prompt = `
Você é um especialista em desenvolvimento frontend moderno. Crie um componente ${componentType} baseado nesta descrição: "${description}".

REQUISITOS OBRIGATÓRIOS:
1. HTML semântico e acessível (ARIA, roles, labels)
2. CSS moderno com variáveis CSS, flexbox/grid, animações suaves
3. Design responsivo para mobile, tablet e desktop
4. Estados interativos (hover, focus, active, disabled)
5. Microanimações e transições elegantes
6. Componente funcional e reutilizável
7. Nível de complexidade: ${complexityLevel}

PADRÕES DE DESIGN:
- Use a paleta de cores: Primary #6366f1, Secondary #8b5cf6, Success #10b981, Error #ef4444
- Tema visual: ${theme}
- Esquema de cores: ${colorScheme}
- Bordas arredondadas: 8px para cards, 6px para botões
- Sombras suaves: box-shadow com baixa opacidade
- Tipografia: Inter, system-ui, sans-serif
- Espaçamentos consistentes: 8px, 16px, 24px, 32px
- Transições: 0.2s ease-in-out

ESTRUTURA DE RESPOSTA OBRIGATÓRIA:
COMPONENT_NAME: [Nome descritivo do componente]
CATEGORY: [Categoria: Buttons, Cards, Forms, Navigation, Alerts, Modals, Tables, Loaders, ou Typography]
COLOR: [Código de cor hexadecimal para o componente ex: #6366f1]

HTML:
\`\`\`html
[Código HTML semântico com classes CSS apropriadas]
\`\`\`

CSS:
\`\`\`css
[Código CSS moderno com animações e responsividade]
\`\`\`

EXEMPLO DE ESTRUTURA:
- Use classes descritivas como .btn-primary, .card-container, .form-group
- Inclua estados como .btn:hover, .card:focus-within
- Use CSS custom properties para cores e espaçamentos
- Adicione animações suaves com transform e opacity

Crie um componente profissional e moderno!
      `;
      
      console.log('Gerando componente com Gemini 2.5 Flash...');
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      console.log('Resposta recebida do Gemini 2.5 Flash');
      
      // Extract component name, category and color
      const nameMatch = text.match(/COMPONENT_NAME:\s*(.*?)(?:\n|$)/i);
      const categoryMatch = text.match(/CATEGORY:\s*(.*?)(?:\n|$)/i);
      const colorMatch = text.match(/COLOR:\s*(.*?)(?:\n|$)/i);
      
      // Extract HTML and CSS
      const htmlMatch = text.match(/HTML:\s*```html\s*([\s\S]*?)\s*```/i) || 
                       text.match(/```html\s*([\s\S]*?)\s*```/i);
      const cssMatch = text.match(/CSS:\s*```css\s*([\s\S]*?)\s*```/i) || 
                      text.match(/```css\s*([\s\S]*?)\s*```/i);
      
      const name = nameMatch ? nameMatch[1].trim() : `AI ${componentType}`;
      const category = categoryMatch ? categoryMatch[1].trim() : 'AI Generated';
      const color = colorMatch ? colorMatch[1].trim() : colorMapping[colorScheme as keyof typeof colorMapping] || '#6366f1';
      const html = htmlMatch ? htmlMatch[1].trim() : "";
      const css = cssMatch ? cssMatch[1].trim() : "";
      
      if (!html || !css) {
        throw new Error("Gemini não retornou HTML e CSS válidos. Tente reformular sua descrição.");
      }
      
      // Enhance CSS with system variables
      const enhancedCSS = this.enhanceCSS(css);
      
      return { 
        html, 
        css: enhancedCSS, 
        name,
        category,
        color
      };
      
    } catch (error: unknown) {
      console.error("AI generation failed:", error);
      
      let errorMessage = "Erro na geração com IA.";
      
      if (error instanceof Error) {
        if (error.message?.includes('429')) {
          errorMessage = "Muitas requisições. Aguarde alguns segundos e tente novamente.";
        } else if (error.message?.includes('quota')) {
          errorMessage = "Limite de uso da IA atingido. Tente novamente mais tarde.";
        } else if (error.message?.includes('API key')) {
          errorMessage = "Erro de autenticação da IA. Contate o administrador.";
        } else if (error.message?.includes('blocked') || error.message?.includes('safety')) {
          errorMessage = "Descrição rejeitada pela IA. Tente ser mais específico e técnico.";
        } else {
          errorMessage = `Erro na IA: ${error.message}`;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Enhance CSS with system design tokens
   */
  private static enhanceCSS(css: string): string {
    const systemVariables = `

`;

    return systemVariables + css;
  }

  /**
   * Check API status
   */
  static async checkAPIStatus(): Promise<{
    available: boolean;
    message: string;
    model: string;
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      await model.generateContent("Test");
      
      return {
        available: true,
        message: "IA funcionando normalmente",
        model: "Gemini 2.5 Flash"
      };
    } catch (error: unknown) {
      console.error('API Status Check Failed:', error);
      
      let message = "Erro na conexão com a IA";
      
      if (error instanceof Error) {
        if (error.message?.includes('429')) {
          message = "Limite de requisições atingido";
        } else if (error.message?.includes('quota')) {
          message = "Cota da IA esgotada";
        } else if (error.message?.includes('API key')) {
          message = "Chave da API inválida";
        }
      }
      
      return {
        available: false,
        message,
        model: "Gemini 2.5 Flash"
      };
    }
  }

  /**
   * Get available design themes and component types for enhanced UX
   */
  static getComponentTypes() {
    return [
      { value: 'button', label: 'Botão', icon: '🔘', description: 'Botões interativos e Call-to-Actions' },
      { value: 'card', label: 'Card', icon: '🃏', description: 'Containers para conteúdo, produtos ou informações' },
      { value: 'form', label: 'Formulário', icon: '📝', description: 'Campos de formulário e validação' },
      { value: 'navigation', label: 'Navegação', icon: '🧭', description: 'Menus, navbars e navegação' },
      { value: 'modal', label: 'Modal', icon: '🔲', description: 'Diálogos e overlays' },
      { value: 'alert', label: 'Alerta', icon: '⚠️', description: 'Mensagens de aviso e notificações' },
      { value: 'loader', label: 'Loader', icon: '⏳', description: 'Animações de carregamento' },
      { value: 'table', label: 'Tabela', icon: '🗃️', description: 'Tabelas de dados e listas' },
      { value: 'component', label: 'Customizado', icon: '🧩', description: 'Componente personalizado' }
    ];
  }

  static getDesignThemes() {
    return [
      { value: 'modern', label: 'Moderno', preview: '#6366f1', description: 'Design contemporâneo e minimalista' },
      { value: 'glassmorphism', label: 'Glassmorfismo', preview: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.2))', description: 'Efeito de vidro translúcido' },
      { value: 'neumorphism', label: 'Neumorfismo', preview: '#e0e5ec', description: 'Design suave com relevos e sombras' },
      { value: 'flat', label: 'Flat Design', preview: '#0ea5e9', description: 'Design plano e simples' },
      { value: 'skeuomorphic', label: 'Skeuomórfico', preview: 'linear-gradient(135deg, #f8d186, #f5ba5b)', description: 'Design que imita objetos reais' }
    ];
  }

  static getColorSchemes() {
    return [
      { value: 'default', label: 'Padrão', color: '#6366f1', description: 'Paleta padrão do sistema' },
      { value: 'blue', label: 'Azul', color: '#3b82f6', description: 'Tons de azul' },
      { value: 'purple', label: 'Roxo', color: '#8b5cf6', description: 'Tons de roxo' },
      { value: 'green', label: 'Verde', color: '#10b981', description: 'Tons de verde' },
      { value: 'red', label: 'Vermelho', color: '#ef4444', description: 'Tons de vermelho' },
      { value: 'orange', label: 'Laranja', color: '#f97316', description: 'Tons de laranja' },
      { value: 'teal', label: 'Teal', color: '#14b8a6', description: 'Tons de azul-esverdeado' },
      { value: 'pink', label: 'Rosa', color: '#ec4899', description: 'Tons de rosa' }
    ];
  }
}

export default AIComponentService;

