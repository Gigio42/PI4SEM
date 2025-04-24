"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google AI with API key
// In production, this should be stored in environment variables
const API_KEY = "AIzaSyBq2BnwRHKXbYWAjJfcPy-3rfKUTLMoIMk";
const genAI = new GoogleGenerativeAI(API_KEY);

export class AIComponentService {
  /**
   * Generates HTML and CSS for a component based on a description
   * @param description - The description of the component to generate
   * @param componentType - The type of component (e.g., button, card, form)
   * @param theme - The design theme or color scheme
   * @returns - Object containing generated HTML and CSS
   */
  static async generateComponent(
    description: string,
    componentType: string,
    theme: string = "modern"
  ): Promise<{ html: string; css: string }> {
    try {
      // Get the generative model (Gemini Pro)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Construct the prompt with detailed instructions
      const prompt = `
        Generate a modern, accessible, and clean ${componentType} component based on this description: "${description}".
        The design should follow a ${theme} aesthetic.
        
        Please provide ONLY:
        1. Clean, semantic HTML that follows accessibility best practices
        2. Modern CSS that works across browsers (no vendor prefixes needed)
          Return your response in this format:
        
        HTML:
        \`\`\`html
        // Insira o código HTML aqui
        \`\`\`
        
        CSS:
        \`\`\`css
        /* Your CSS code here */
        \`\`\`
        
        Important guidelines:
        - Keep the HTML structure simple and semantic
        - Use modern CSS (flexbox, grid, custom properties)
        - Make sure it's mobile-responsive
        - Follow accessibility best practices (ARIA attributes when needed, proper contrast)
        - Don't use inline styles
        - Keep class names simple and descriptive
        - Use a BEM-like naming convention for CSS classes
        - Don't include any JavaScript
      `;
      
      // Generate content
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Parse the response to extract HTML and CSS
      const htmlMatch = text.match(/```html\n([\s\S]*?)\n```/);
      const cssMatch = text.match(/```css\n([\s\S]*?)\n```/);
      
      const html = htmlMatch ? htmlMatch[1].trim() : "";
      const css = cssMatch ? cssMatch[1].trim() : "";
      
      return { html, css };
    } catch (error) {
      console.error("Error generating component with AI:", error);
      throw new Error("Failed to generate component. Please try again.");
    }
  }
}

export default AIComponentService;
