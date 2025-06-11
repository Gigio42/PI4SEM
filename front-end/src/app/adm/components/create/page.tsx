"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ComponentProvider, useComponents } from '@/contexts/ComponentContext';
import { useNotification } from '@/contexts/NotificationContext';
import { validateComponent, ComponentValidation } from '@/types/component';
import { AIComponentService } from '@/services/AIComponentService';
import Header from "@/app/components/Header/Header";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import ComponentPreview from "@/app/components/ComponentPreview/ComponentPreview";
import adminStyles from "../../admin.module.css";
import styles from './create.module.css';

interface FormData {
  name: string;
  cssContent: string;
  htmlContent: string;
  category: string;
  color: string;
  description: string;
}

function CreateComponentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit');
  const isEditing = !!editId;
  
  const { createComponent, updateComponent, getComponentById, loading } = useComponents();
  const { showToast } = useNotification();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    cssContent: '',
    htmlContent: '',
    category: 'Buttons',
    color: '#6366f1',
    description: ''
  });

  const [validation, setValidation] = useState<ComponentValidation>({
    isValid: true,
    errors: [],
    warnings: []
  });

  const [activeTab, setActiveTab] = useState<'form' | 'ai'>('form');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiOptions, setAiOptions] = useState({
    componentType: 'button',
    theme: 'modern',
    colorScheme: 'default',
    complexityLevel: 'medium' as 'simple' | 'medium' | 'complex'
  });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load component for editing
  useEffect(() => {
    if (isEditing && editId) {
      const loadComponent = async () => {
        try {
          const component = await getComponentById(parseInt(editId));
          if (component) {
            setFormData({
              name: component.name,
              cssContent: component.cssContent,
              htmlContent: component.htmlContent || '',
              category: component.category,
              color: component.color,
              description: (component as any).description || ''
            });
          }
        } catch (error) {
          console.error('Error loading component:', error);
          showToast('Erro ao carregar componente', { type: 'error' } as any);
          router.push('/adm/components');
        }
      };
      loadComponent();
    }
  }, [isEditing, editId, getComponentById, showToast, router]);

  // Validate form data
  useEffect(() => {
    const validationResult = validateComponent({
      name: formData.name,
      cssContent: formData.cssContent,
      htmlContent: formData.htmlContent,
      category: formData.category,
      color: formData.color
    });
    setValidation(validationResult);
  }, [formData]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      showToast('Digite uma descrição para gerar o componente', { type: 'error' } as any);
      return;
    }

    setAiGenerating(true);
    try {
      const result = await AIComponentService.generateComponent(aiPrompt, aiOptions);
      
      setFormData(prev => ({
        ...prev,
        name: result.name,
        cssContent: result.css,
        htmlContent: result.html,
        category: result.category,
        color: result.color
      }));

      setActiveTab('form');
      showToast('Componente gerado com sucesso!', { type: 'success' } as any);
    } catch (error: any) {
      showToast(error.message || 'Erro ao gerar componente', { type: 'error' } as any);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!validation.isValid) {
      showToast('Corrija os erros antes de salvar', { type: 'error' } as any);
      return;
    }

    try {
      if (isEditing && editId) {
        await updateComponent(parseInt(editId), formData);
        showToast('Componente atualizado com sucesso!', { type: 'success' } as any);
      } else {
        await createComponent(formData);
        showToast('Componente criado com sucesso!', { type: 'success' } as any);
      }
      
      setHasUnsavedChanges(false);
      router.push('/adm/components');
    } catch (error) {
      console.error('Error saving component:', error);
      showToast('Erro ao salvar componente', { type: 'error' } as any);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) {
        router.push('/adm/components');
      }
    } else {
      router.push('/adm/components');
    }
  };

  const categories = ['Buttons', 'Cards', 'Forms', 'Navigation', 'Alerts', 'Modals', 'Tables', 'Loaders', 'Typography'];
  const componentTypes = AIComponentService.getComponentTypes();
  const themes = AIComponentService.getDesignThemes();
  const colorSchemes = AIComponentService.getColorSchemes();

  return (
    <div className={adminStyles.pageWrapper}>
      <Header />
      <div className={adminStyles.layoutContainer}>
        <Sidebar isAdmin={true} />
        <main className={`${adminStyles.mainContent} ${adminStyles.loaded} ${styles.createPage}`}>
          {/* Header */}
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerInfo}>
                <button className={styles.backButton} onClick={handleCancel}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Voltar
                </button>
                <div>
                  <h1 className={styles.pageTitle}>
                    {isEditing ? 'Editar Componente' : 'Criar Novo Componente'}
                  </h1>
                  <p className={styles.pageDescription}>
                    {isEditing ? 'Modifique as propriedades do componente' : 'Crie um novo componente para a biblioteca'}
                  </p>
                </div>
              </div>
              <div className={styles.headerActions}>
                <button 
                  className={styles.saveButton}
                  onClick={handleSave}
                  disabled={!validation.isValid || loading}
                >
                  {loading ? (
                    <>
                      <div className={styles.spinner}></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3H16L20 7V20C20 20.5523 19.5523 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {isEditing ? 'Atualizar' : 'Salvar'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={styles.mainLayout}>
            {/* Left Panel - Form/AI */}
            <div className={styles.leftPanel}>
              {/* Tabs */}
              <div className={styles.tabs}>
                <button 
                  className={`${styles.tab} ${activeTab === 'form' ? styles.active : ''}`}
                  onClick={() => setActiveTab('form')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.44772 2 5 2.44772 5 3V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Formulário
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'ai' ? styles.active : ''}`}
                  onClick={() => setActiveTab('ai')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3.09 8.26L12 14L20.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3.09 8.26V15.74L12 22L20.91 15.74V8.26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Gerar com IA
                </button>
              </div>

              {/* Form Content */}
              {activeTab === 'form' && (
                <div className={styles.formContent}>
                  {/* Validation Alerts */}
                  {validation.errors.length > 0 && (
                    <div className={styles.errorAlert}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <div>
                        <strong>Erros encontrados:</strong>
                        <ul>
                          {validation.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {validation.warnings.length > 0 && (
                    <div className={styles.warningAlert}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.29 3.86L1.82 18C1.64539 18.3024 1.55299 18.6453 1.55201 18.9945C1.55103 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.901 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86V3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div>
                        <strong>Avisos:</strong>
                        <ul>
                          {validation.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <label>Nome do Componente *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Ex: Botão Primário"
                        className={validation.errors.some(e => e.includes('Nome')) ? styles.error : ''}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Categoria</label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Cor Principal</label>
                      <div className={styles.colorInput}>
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => handleInputChange('color', e.target.value)}
                        />
                        <input
                          type="text"
                          value={formData.color}
                          onChange={(e) => handleInputChange('color', e.target.value)}
                          placeholder="#6366f1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Descrição</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descrição opcional do componente..."
                      rows={3}
                    />
                  </div>

                  <div className={styles.codeSection}>
                    <div className={styles.inputGroup}>
                      <label>HTML *</label>
                      <textarea
                        value={formData.htmlContent}
                        onChange={(e) => handleInputChange('htmlContent', e.target.value)}
                        placeholder="<div class='meu-componente'>...</div>"
                        rows={8}
                        className={styles.codeInput}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>CSS *</label>
                      <textarea
                        value={formData.cssContent}
                        onChange={(e) => handleInputChange('cssContent', e.target.value)}
                        placeholder=".meu-componente { ... }"
                        rows={12}
                        className={`${styles.codeInput} ${validation.errors.some(e => e.includes('CSS')) ? styles.error : ''}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* AI Content */}
              {activeTab === 'ai' && (
                <div className={styles.aiContent}>
                  <div className={styles.aiDescription}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L3.09 8.26L12 14L20.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.09 8.26V15.74L12 22L20.91 15.74V8.26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <h3>Geração com IA</h3>
                      <p>Descreva o componente que você quer criar e nossa IA gerará o código automaticamente.</p>
                    </div>
                  </div>

                  <div className={styles.aiForm}>
                    <div className={styles.inputGroup}>
                      <label>Descrição do Componente *</label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Ex: Um botão moderno com gradiente roxo, sombra suave e animação no hover..."
                        rows={4}
                      />
                    </div>

                    <div className={styles.aiOptions}>
                      <h4>Opções de Geração</h4>
                      <div className={styles.optionsGrid}>
                        <div className={styles.inputGroup}>
                          <label>Tipo</label>
                          <select
                            value={aiOptions.componentType}
                            onChange={(e) => setAiOptions(prev => ({ ...prev, componentType: e.target.value }))}
                          >
                            {componentTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.icon} {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.inputGroup}>
                          <label>Tema</label>
                          <select
                            value={aiOptions.theme}
                            onChange={(e) => setAiOptions(prev => ({ ...prev, theme: e.target.value }))}
                          >
                            {themes.map(theme => (
                              <option key={theme.value} value={theme.value}>
                                {theme.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.inputGroup}>
                          <label>Esquema de Cores</label>
                          <select
                            value={aiOptions.colorScheme}
                            onChange={(e) => setAiOptions(prev => ({ ...prev, colorScheme: e.target.value }))}
                          >
                            {colorSchemes.map(scheme => (
                              <option key={scheme.value} value={scheme.value}>
                                {scheme.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.inputGroup}>
                          <label>Complexidade</label>
                          <select
                            value={aiOptions.complexityLevel}
                            onChange={(e) => setAiOptions(prev => ({ ...prev, complexityLevel: e.target.value as any }))}
                          >
                            <option value="simple">Simples</option>
                            <option value="medium">Médio</option>
                            <option value="complex">Complexo</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      className={styles.generateButton}
                      onClick={handleAIGenerate}
                      disabled={aiGenerating || !aiPrompt.trim()}
                    >
                      {aiGenerating ? (
                        <>
                          <div className={styles.spinner}></div>
                          Gerando...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L3.09 8.26L12 14L20.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3.09 8.26V15.74L12 22L20.91 15.74V8.26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Gerar Componente
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Preview */}
            <div className={styles.rightPanel}>
              <div className={styles.previewHeader}>
                <h3>Preview</h3>
                <div className={styles.previewControls}>
                  <button
                    className={`${styles.deviceButton} ${previewMode === 'desktop' ? styles.active : ''}`}
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button
                    className={`${styles.deviceButton} ${previewMode === 'tablet' ? styles.active : ''}`}
                    onClick={() => setPreviewMode('tablet')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button
                    className={`${styles.deviceButton} ${previewMode === 'mobile' ? styles.active : ''}`}
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className={styles.previewContainer}>
                {formData.cssContent || formData.htmlContent ? (
                  <ComponentPreview
                    htmlContent={formData.htmlContent}
                    cssContent={formData.cssContent}
                    initialMode="system"
                    initialDevice={previewMode}
                    showCode={false}
                    showControls={false}
                  />
                ) : (
                  <div className={styles.emptyPreview}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                      <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <p>Preview aparecerá aqui</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CreateComponentPage() {
  return (
    <ComponentProvider>
      <CreateComponentContent />
    </ComponentProvider>
  );
}
