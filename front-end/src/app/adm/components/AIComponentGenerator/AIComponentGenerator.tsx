"use client";

import React, { useState, useEffect } from 'react';
import styles from './AIComponentGenerator.module.css';
import { AIComponentService, AIGenerationOptions } from '@/services/AIComponentService';
import AIPreview from '../AIPreview/AIPreview';

interface AIComponentGeneratorProps {
  onGenerate: (prompt: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AIComponentGenerator({
  onGenerate,
  onCancel,
  isLoading = false
}: AIComponentGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [componentType, setComponentType] = useState('component');
  const [designTheme, setDesignTheme] = useState('modern');
  const [colorScheme, setColorScheme] = useState('default');
  const [complexityLevel, setComplexityLevel] = useState<'simple' | 'medium' | 'complex'>('medium');
  const [apiStatus, setApiStatus] = useState<{ available: boolean; message: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewCode, setPreviewCode] = useState({ html: '', css: '' });
  const [generationProgress, setGenerationProgress] = useState(0);

  // Get data for UI
  const componentTypes = AIComponentService.getComponentTypes();
  const designThemes = AIComponentService.getDesignThemes();
  const colorSchemes = AIComponentService.getColorSchemes();

  useEffect(() => {
    checkAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    try {
      const status = await AIComponentService.checkAPIStatus();
      setApiStatus(status);
    } catch (err) {
      setApiStatus({ available: false, message: 'Erro ao verificar status da IA' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Por favor, descreva o componente que deseja gerar');
      return;
    }

    if (!apiStatus?.available) {
      setError('IA não está disponível no momento. Tente novamente mais tarde.');
      return;
    }

    try {
      setError('');
      setShowPreview(false);
      setGenerationProgress(20);
      
      // Create enhanced options
      const options: AIGenerationOptions = {
        componentType,
        theme: designTheme,
        colorScheme,
        complexityLevel
      };
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      // Call the API with advanced options
      await onGenerate(prompt);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      // Reset after successful generation
      setTimeout(() => {
        setGenerationProgress(0);
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar componente');
      setGenerationProgress(0);
    }
  };

  const handlePreview = async () => {
    if (!prompt.trim()) {
      setError('Por favor, descreva o componente para visualizar o preview');
      return;
    }
    
    try {
      setError('');
      setGenerationProgress(10);
      
      // Preview generation is simpler and faster
      const options: AIGenerationOptions = {
        componentType,
        theme: designTheme,
        colorScheme,
        complexityLevel: 'simple'
      };
      
      const result = await AIComponentService.generateComponent(
        `Versão simplificada para preview: ${prompt}`,
        options
      );
      
      setPreviewCode({
        html: result.html,
        css: result.css
      });
      
      setShowPreview(true);
      setGenerationProgress(100);
      
      setTimeout(() => {
        setGenerationProgress(0);
      }, 1000);
    } catch (err) {
      setError('Erro ao gerar preview. Tente novamente.');
      setGenerationProgress(0);
    }
  };

  const examples = [
    "Um botão de login com gradiente azul e efeito de ondulação ao clicar",
    "Card de produto com imagem, título, preço e botão de compra",
    "Modal de confirmação com animação de entrada suave e backdrop blur",
    "Navbar responsivo com logo, menu e botão de perfil",
    "Formulário de contato com validação visual e estados de erro",
    "Componente de loading com animação de esqueleto",
    "Hero section com fundo gradiente e call-to-action"
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>
            <span className={styles.aiIcon}>✨</span>
            Gerar Componente com IA
          </h2>
          <div className={styles.statusIndicator}>
            <div className={`${styles.statusDot} ${apiStatus?.available ? styles.statusOnline : styles.statusOffline}`} />
            <span className={styles.statusText}>
              {apiStatus?.available ? 'IA Online' : 'IA Offline'}
            </span>
          </div>
        </div>
        <button 
          onClick={onCancel}
          className={styles.closeButton}
          disabled={isLoading}
          aria-label="Fechar gerador de IA"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.formSection}>
          {generationProgress > 0 && (
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${generationProgress}%` }}
              />
              <span className={styles.progressLabel}>
                {generationProgress < 100 ? 'Gerando componente...' : 'Concluído!'}
                {generationProgress < 100 && (
                  <span className={styles.progressDots}>
                    <span>.</span><span>.</span><span>.</span>
                  </span>
                )}
              </span>
            </div>
          )}

          {!apiStatus?.available && (
            <div className={styles.warningAlert}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.2679 4L3.33975 16C2.56998 17.3333 3.53223 19 5.07183 19Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>IA temporariamente indisponível. Algumas funcionalidades podem não funcionar.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="prompt" className={styles.label}>
                Descreva o componente que você quer criar *
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (error) setError('');
                }}
                className={`${styles.textarea} ${error ? styles.inputError : ''}`}
                rows={4}
                disabled={isLoading}
                placeholder="Ex: Um botão azul com bordas arredondadas e efeito hover suave..."
                maxLength={500}
              />
              {error && <span className={styles.errorText}>{error}</span>}
              <div className={styles.charCount}>
                {prompt.length}/500 caracteres
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de Componente</label>
                <div className={styles.typeGrid}>
                  {componentTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className={`${styles.typeCard} ${componentType === type.value ? styles.typeCardActive : ''}`}
                      onClick={() => setComponentType(type.value)}
                      disabled={isLoading}
                      title={type.description}
                    >
                      <span className={styles.typeIcon}>{type.icon}</span>
                      <span className={styles.typeLabel}>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tema Visual</label>
                <div className={styles.themeGrid}>
                  {designThemes.map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      className={`${styles.themeCard} ${designTheme === theme.value ? styles.themeCardActive : ''}`}
                      onClick={() => setDesignTheme(theme.value)}
                      disabled={isLoading}
                      title={theme.description}
                    >
                      <div 
                        className={styles.themePreview}
                        style={{ background: theme.preview }}
                      />
                      <span className={styles.themeLabel}>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Esquema de Cores</label>
                <div className={styles.colorGrid}>
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.value}
                      type="button"
                      className={`${styles.colorCard} ${colorScheme === scheme.value ? styles.colorCardActive : ''}`}
                      onClick={() => setColorScheme(scheme.value)}
                      disabled={isLoading}
                      title={scheme.description}
                    >
                      <div 
                        className={styles.colorSwatch}
                        style={{ backgroundColor: scheme.color }}
                      />
                      <span className={styles.colorLabel}>{scheme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Complexidade</label>
                <div className={styles.complexitySlider}>
                  <button
                    type="button"
                    className={`${styles.complexityOption} ${complexityLevel === 'simple' ? styles.complexityActive : ''}`}
                    onClick={() => setComplexityLevel('simple')}
                    disabled={isLoading}
                  >
                    Simples
                  </button>
                  <button
                    type="button"
                    className={`${styles.complexityOption} ${complexityLevel === 'medium' ? styles.complexityActive : ''}`}
                    onClick={() => setComplexityLevel('medium')}
                    disabled={isLoading}
                  >
                    Médio
                  </button>
                  <button
                    type="button"
                    className={`${styles.complexityOption} ${complexityLevel === 'complex' ? styles.complexityActive : ''}`}
                    onClick={() => setComplexityLevel('complex')}
                    disabled={isLoading}
                  >
                    Complexo
                  </button>
                </div>
                <div className={styles.complexityDescription}>
                  {complexityLevel === 'simple' && 'Componentes básicos com estilos simples.'}
                  {complexityLevel === 'medium' && 'Balanceado entre simplicidade e recursos.'}
                  {complexityLevel === 'complex' && 'Design sofisticado com animações e variações de estados.'}
                </div>
              </div>
            </div>

            <div className={styles.examples}>
              <h3 className={styles.examplesTitle}>💡 Exemplos de prompts:</h3>
              <div className={styles.examplesList}>
                {examples.map((example, index) => (
                  <div key={index} className={styles.exampleButtonContainer}>
                    <button
                      type="button"
                      className={styles.exampleButton}
                      onClick={() => setPrompt(example)}
                      disabled={isLoading}
                    >
                      <span className={styles.exampleText}>{example}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <div className={styles.actionsLeft}>
                <button
                  type="button"
                  className={styles.previewButton}
                  onClick={handlePreview}
                  disabled={isLoading || !apiStatus?.available || !prompt.trim()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Visualizar
                </button>
              </div>
              
              <div className={styles.actionsRight}>
                <button
                  type="button"
                  onClick={onCancel}
                  className={styles.cancelButton}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.generateButton}
                  disabled={isLoading || !prompt.trim() || !apiStatus?.available}
                >
                  {isLoading ? (
                    <>
                      <div className={styles.spinner} />
                      <span>Gerando</span>
                      <div className={styles.progressDots}>
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Gerar com IA
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {showPreview && previewCode.html && previewCode.css && (
          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>Preview</h3>
              <span className={styles.previewNote}>Versão simplificada para visualização</span>
            </div>
            <AIPreview html={previewCode.html} css={previewCode.css} />
          </div>
        )}
      </div>
    </div>
  );
}
