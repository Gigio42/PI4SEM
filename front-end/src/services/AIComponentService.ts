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

IMPORTANTE: Responda EXATAMENTE no formato especificado abaixo, sem texto adicional.

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

FORMATO DE RESPOSTA OBRIGATÓRIO (copie exatamente):

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

EXEMPLO MÍNIMO:
COMPONENT_NAME: Botão Primário
CATEGORY: Buttons
COLOR: #6366f1

HTML:
\`\`\`html
<button class="btn-primary">Clique aqui</button>
\`\`\`

CSS:
\`\`\`css
.btn-primary {
  background: #6366f1;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
\`\`\`

Agora crie o componente seguindo EXATAMENTE este formato:
      `;
        console.log('Gerando componente com Gemini 2.5 Flash...');
      console.log('Prompt enviado:', prompt.substring(0, 200) + '...');
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      console.log('Resposta recebida do Gemini 2.5 Flash');
      console.log('Tamanho da resposta:', text.length);
      console.log('Primeiros 500 caracteres:', text.substring(0, 500));
      console.log('Últimos 200 caracteres:', text.substring(Math.max(0, text.length - 200)));
      
      // Extract component name, category and color
      const nameMatch = text.match(/COMPONENT_NAME:\s*(.*?)(?:\n|$)/i);
      const categoryMatch = text.match(/CATEGORY:\s*(.*?)(?:\n|$)/i);
      const colorMatch = text.match(/COLOR:\s*(.*?)(?:\n|$)/i);
      
      // More flexible HTML and CSS extraction patterns
      const htmlMatch = text.match(/HTML:\s*```html\s*([\s\S]*?)\s*```/i) || 
                       text.match(/```html\s*([\s\S]*?)\s*```/i) ||
                       text.match(/HTML:\s*```\s*([\s\S]*?)\s*```/i) ||
                       text.match(/<[^>]+>[\s\S]*?<\/[^>]+>/i); // Fallback: match any HTML tags
      
      const cssMatch = text.match(/CSS:\s*```css\s*([\s\S]*?)\s*```/i) || 
                      text.match(/```css\s*([\s\S]*?)\s*```/i) ||
                      text.match(/CSS:\s*```\s*([\s\S]*?)\s*```/i) ||
                      text.match(/\{[\s\S]*?\}/); // Fallback: match CSS blocks
      
      const name = nameMatch ? nameMatch[1].trim() : `AI ${componentType}`;
      const category = categoryMatch ? categoryMatch[1].trim() : 'AI Generated';
      const color = colorMatch ? colorMatch[1].trim() : colorMapping[colorScheme as keyof typeof colorMapping] || '#6366f1';
      let html = htmlMatch ? htmlMatch[1].trim() : "";
      let css = cssMatch ? cssMatch[1].trim() : "";
      
      // If still no HTML/CSS found, try to extract from the entire response
      if (!html && text.includes('<')) {
        const htmlStart = text.indexOf('<');
        const htmlEnd = text.lastIndexOf('>') + 1;
        if (htmlStart !== -1 && htmlEnd > htmlStart) {
          html = text.substring(htmlStart, htmlEnd).trim();
        }
      }
      
      if (!css && (text.includes('{') || text.includes('.'))) {
        // Try to find CSS-like content
        const lines = text.split('\n');
        let cssLines = [];
        let inCSS = false;
        
        for (const line of lines) {
          if (line.includes('{') || line.match(/^\s*\.[a-zA-Z]/) || line.match(/^\s*#[a-zA-Z]/)) {
            inCSS = true;
          }
          if (inCSS) {
            cssLines.push(line);
          }
          if (line.includes('}') && cssLines.length > 0) {
            // Keep collecting CSS until we have a substantial amount
            if (cssLines.join('\n').length > 50) {
              css = cssLines.join('\n').trim();
              break;
            }
          }
        }
      }
        if (!html || !css) {
        console.error('Parsing falhou, tentando fallback...');
        console.error('HTML encontrado:', !!html, html ? html.substring(0, 100) + '...' : 'none');
        console.error('CSS encontrado:', !!css, css ? css.substring(0, 100) + '...' : 'none');
        
        // Fallback: Gerar componente simples baseado na descrição
        if (!html) {
          html = `<div class="ai-component">
            <h3>${name}</h3>
            <p>Componente gerado por IA: ${description}</p>
          </div>`;
        }
        
        if (!css) {
          css = `.ai-component {
            padding: 20px;
            border: 2px solid ${color};
            border-radius: 8px;
            background: linear-gradient(135deg, ${color}10, ${color}05);
            color: #333;
            font-family: Inter, system-ui, sans-serif;
          }
          .ai-component h3 {
            margin: 0 0 10px 0;
            color: ${color};
          }
          .ai-component p {
            margin: 0;
            opacity: 0.8;
          }`;
        }
        
        console.log('Usando fallback - HTML:', html.substring(0, 100));
        console.log('Usando fallback - CSS:', css.substring(0, 100));
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
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      
      let errorMessage = "Erro na geração com IA.";
      
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        
        if (error.message?.includes('429')) {
          errorMessage = "Muitas requisições. Aguarde alguns segundos e tente novamente.";
        } else if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
          errorMessage = "Limite de uso da IA atingido. Tente novamente mais tarde.";
        } else if (error.message?.includes('API key') || error.message?.includes('INVALID_ARGUMENT')) {
          errorMessage = "Erro de autenticação da IA. Contate o administrador.";
        } else if (error.message?.includes('blocked') || error.message?.includes('safety') || error.message?.includes('SAFETY')) {
          errorMessage = "Descrição rejeitada pela IA. Tente ser mais específico e técnico.";
        } else if (error.message?.includes('CANCELLED')) {
          errorMessage = "Geração cancelada. Tente novamente.";
        } else if (error.message?.includes('DEADLINE_EXCEEDED')) {
          errorMessage = "Tempo limite excedido. Tente uma descrição mais simples.";
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

