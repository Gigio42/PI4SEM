import React, { useState, useEffect } from 'react';
import { Component, CreateComponentDto } from '@/types/component';
import { ComponentsService } from '@/services/ComponentsService';
import { AIComponentService } from '@/services/AIComponentService';
import { useTheme } from '@/contexts/ThemeContext'; 
import styles from '../components.module.css';
import formStyles from '../component-form.module.css';
import aiStyles from '../components-ai.module.css';
import ColorPicker from './ColorPicker';

interface ComponentFormProps {
  onSuccess: (component: Component) => void;
  onCancel: () => void;
}

// Opções de categorias para seleção
const CATEGORY_OPTIONS = [
  'Buttons',
  'Cards',
  'Forms',
  'Navigation',
  'Layouts',
  'UI Elements',
  'Typography',
  'Outros'
];

// Opções de cores para seleção
const COLOR_OPTIONS = [
  { name: 'Primary', value: '#6366F1' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Pink', value: '#EC4899' },
];

// Component templates for quick start
const COMPONENT_TEMPLATES = [
  {
    id: 'button-basic',
    name: 'Botão Básico',
    category: 'Buttons',
    color: '#6366F1',
    html: '<button class="button">Clique aqui</button>',
    css: '.button {\n  padding: 10px 20px;\n  background-color: #6366F1;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  font-size: 16px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.button:hover {\n  background-color: #4F46E5;\n  transform: translateY(-2px);\n}',
    preview: '📋'
  },
  {
    id: 'card-simple',
    name: 'Card Simples',
    category: 'Cards',
    color: '#3B82F6',
    html: '<div class="card">\n  <div class="card-header">Título do Card</div>\n  <div class="card-body">Conteúdo do card...</div>\n  <div class="card-footer">Rodapé do card</div>\n</div>',
    css: '.card {\n  border-radius: 8px;\n  border: 1px solid #e2e8f0;\n  overflow: hidden;\n  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n}\n\n.card-header {\n  padding: 15px;\n  background-color: #f8fafc;\n  border-bottom: 1px solid #e2e8f0;\n  font-weight: bold;\n}\n\n.card-body {\n  padding: 15px;\n}\n\n.card-footer {\n  padding: 15px;\n  background-color: #f8fafc;\n  border-top: 1px solid #e2e8f0;\n}',
    preview: '🃏'
  },
  {
    id: 'form-input',
    name: 'Form Input',
    category: 'Forms',
    color: '#10B981',
    html: '<div class="form-group">\n  <label for="example">Exemplo de Input</label>\n  <input type="text" id="example" class="form-input" placeholder="Digite aqui...">\n</div>',
    css: '.form-group {\n  margin-bottom: 15px;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 5px;\n  font-size: 14px;\n  font-weight: 500;\n}\n\n.form-input {\n  width: 100%;\n  padding: 10px 12px;\n  border: 1px solid #e2e8f0;\n  border-radius: 4px;\n  font-size: 16px;\n  transition: all 0.2s;\n}\n\n.form-input:focus {\n  outline: none;\n  border-color: #10B981;\n  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);\n}',
    preview: '📝'
  },
  {
    id: 'navbar-simple',
    name: 'Barra de Nav',
    category: 'Navigation',
    color: '#8B5CF6',
    html: '<nav class="navbar">\n  <div class="logo">Logo</div>\n  <ul class="nav-links">\n    <li><a href="#">Home</a></li>\n    <li><a href="#">Sobre</a></li>\n    <li><a href="#">Contato</a></li>\n  </ul>\n</nav>',
    css: '.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 15px 30px;\n  background-color: #f8fafc;\n  border-bottom: 1px solid #e2e8f0;\n}\n\n.logo {\n  font-weight: bold;\n  font-size: 20px;\n}\n\n.nav-links {\n  display: flex;\n  list-style: none;\n  gap: 20px;\n  margin: 0;\n  padding: 0;\n}\n\n.nav-links a {\n  text-decoration: none;\n  color: #64748b;\n  transition: color 0.2s;\n}\n\n.nav-links a:hover {\n  color: #8B5CF6;\n}',
    preview: '🧭'
  }
];

/**
 * Formulário para criar novos componentes com suporte a geração por IA
 */
export default function ComponentForm({ onSuccess, onCancel }: ComponentFormProps) {
  // Get theme context
  const { isDarkMode } = useTheme();
  
  // Tabs management
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  
  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateComponentDto>( {
    name: '',
    cssContent: '',
    htmlContent: '',
    category: 'Outros',
    color: '#6366F1'
  });
  
  // AI Component generation fields
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState('');
  const [aiComponentType, setAiComponentType] = useState('button');
  const [aiTheme, setAiTheme] = useState('modern');
  const [showPreview, setShowPreview] = useState(false);
  // Update default preview mode based on global theme
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>(isDarkMode ? 'dark' : 'light');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Sync preview mode with theme changes
  useEffect(() => {
    setPreviewMode(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // New states for enhanced features
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState({
    name: { valid: false, message: '' },
    css: { valid: false, message: '' }
  });
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle color change from ColorPicker
  const handleColorChange = (color: string) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
  };
  
  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = COMPONENT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setFormData({
        name: template.name,
        category: template.category,
        color: template.color,
        htmlContent: template.html,
        cssContent: template.css
      });
      
      // Update validation status
      validateFormField('name', template.name);
      validateFormField('css', template.css);
    }
  };
  
  // Validate form fields
  const validateFormField = (field: 'name' | 'css', value: string) => {
    let valid = false;
    let message = '';
    
    if (field === 'name') {
      valid = value.trim().length >= 3;
      message = valid ? 'Nome válido' : 'Nome deve ter pelo menos 3 caracteres';
    }
    
    if (field === 'css') {
      valid = value.trim().length > 0;
      message = valid ? 'CSS válido' : 'CSS é obrigatório';
    }
    
    setValidationStatus(prev => ({
      ...prev,
      [field]: { valid, message }
    }));
    
    return valid;
  };
  
  // Validate input as user types
  useEffect(() => {
    if (formData.name) validateFormField('name', formData.name);
    if (formData.cssContent) validateFormField('css', formData.cssContent);
  }, [formData.name, formData.cssContent]);
  
  // Generate component using AI
  const handleAIGenerate = async () => {
    if (!aiDescription.trim()) {
      setAiError('Por favor, forneça uma descrição para o componente');
      return;
    }
    
    setAiLoading(true);
    setAiError(null);
    
    try {
      const { html, css } = await AIComponentService.generateComponent(
        aiDescription,
        aiComponentType,
        aiTheme
      );
      
      // Update form data with generated content
      const componentName = `${aiComponentType.charAt(0).toUpperCase() + aiComponentType.slice(1)} ${aiTheme}`;
      
      setFormData(prev => ({
        ...prev,
        name: prev.name || componentName,
        cssContent: css,
        htmlContent: html
      }));
      
      // Show preview after generation
      setShowPreview(true);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Falha ao gerar componente com IA. Tente novamente.');
      console.error('Erro na geração com IA:', err);
    } finally {
      setAiLoading(false);
    }
  };
  
  // Enhanced form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const nameValid = validateFormField('name', formData.name);
    const cssValid = validateFormField('css', formData.cssContent);
    
    if (!nameValid || !cssValid) {
      setError('Por favor, corrija os erros de validação antes de prosseguir.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const newComponent = await ComponentsService.createComponent(formData);
      onSuccess(newComponent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao criar o componente');
      console.error('Erro ao criar componente:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form and cancel
  const cancelForm = () => {
    setFormData({
      name: '',
      cssContent: '',
      htmlContent: '',
      category: 'Outros',
      color: '#6366F1'
    });
    setShowPreview(false);
    setAiDescription('');
    onCancel();
  };

  // AI Generation Tab - refine button
  const RefineButton = () => (
    <button 
      type="button" 
      className={aiStyles.refineButton}
      onClick={handleAIGenerate}
      disabled={aiLoading}
    >
      {aiLoading ? (
        <span className={formStyles.smallSpinner}></span>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17L9 11L13 15L21 7M21 7H15M21 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Refinar com IA
        </>
      )}
    </button>
  );

  // Enhanced form actions for both AI and Manual tabs
  const FormActions = ({ isAI = false }) => (
    <div className={formStyles.formActions}>
      <div className={formStyles.templateButtonsContainer}>
        {selectedTemplate && activeTab === 'manual' && (
          <button 
            type="button" 
            className={formStyles.clearTemplateButton}
            onClick={() => setSelectedTemplate(null)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M3 7H21M16 7L15.133 3.7985C14.9646 3.1178 14.3648 2.6 13.6598 2.6H10.3402C9.63523 2.6 9.03538 3.1178 8.86701 3.7985L8 7" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Limpar Template
          </button>
        )}
      </div>
      
      <div className={formStyles.actionButtonsContainer}>
        <button 
          type="button" 
          className={formStyles.cancelButton}
          onClick={cancelForm}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Cancelar
        </button>
        
        <button 
          type={isAI ? "button" : "submit"}
          className={formStyles.submitButton}
          onClick={isAI ? handleSubmit : undefined}
          disabled={loading || !validationStatus.name.valid || !validationStatus.css.valid}
        >
          {loading ? (
            <>
              <span className={formStyles.smallSpinner}></span>
              Criando...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4V20M20 12L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Criar Componente
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className={formStyles.componentForm}>
      <h2 className={formStyles.formTitle}>Adicionar Novo Componente</h2>
      
      {error && (
        <div className={formStyles.errorMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {/* Tabs for creation method */}
      <div className={aiStyles.tabsContainer}>
        <button 
          type="button"
          className={`${aiStyles.tab} ${activeTab === 'manual' ? aiStyles.tabActive : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          Criação Manual
        </button>
        <button 
          type="button"
          className={`${aiStyles.tab} ${activeTab === 'ai' ? aiStyles.tabActive : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          Gerar com IA
        </button>
      </div>
      
      {/* Manual Creation Tab */}
      <div className={`${aiStyles.tabContent} ${activeTab === 'manual' ? aiStyles.tabContentActive : ''}`}>
        {/* Template section */}
        <div className={formStyles.templateSection}>
          <h3 className={formStyles.templateTitle}>Iniciar com um template</h3>
          <div className={formStyles.templateGrid}>
            {COMPONENT_TEMPLATES.map(template => (
              <div 
                key={template.id}
                className={`${formStyles.templateItem} ${selectedTemplate === template.id ? formStyles.active : ''}`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className={formStyles.templatePreview}>
                  <span style={{ fontSize: '24px' }}>{template.preview}</span>
                </div>
                <p className={formStyles.templateName}>{template.name}</p>
                <p className={formStyles.templateDescription}>{template.category}</p>
              </div>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={formStyles.formGroup}>
            <label htmlFor="name">Nome do Componente *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => {
                handleChange(e);
                validateFormField('name', e.target.value);
              }}
              placeholder="Ex: Botão Moderno"
              className={formStyles.formInput}
              required
            />
            {formData.name && (
              <div className={`${formStyles.formValidationMessage} ${validationStatus.name.valid ? formStyles.valid : formStyles.invalid}`}>
                {validationStatus.name.valid ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V12M12 15H12.01M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
                {validationStatus.name.message}
              </div>
            )}
          </div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="category">Categoria</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={formStyles.formSelect}
            >
              {CATEGORY_OPTIONS.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="color">Cor Representativa</label>
            <ColorPicker 
              value={formData.color || '#6366F1'}
              onChange={handleColorChange}
              presetColors={COLOR_OPTIONS}
            />
          </div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="htmlContent">Código HTML</label>
            <textarea
              id="htmlContent"
              name="htmlContent"
              value={formData.htmlContent || ''}
              onChange={handleChange}
              placeholder="<button class='btn'>Click me</button>"
              className={formStyles.formTextarea}
              rows={6}
            />
          </div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="cssContent">Código CSS *</label>
            <textarea
              id="cssContent"
              name="cssContent"
              value={formData.cssContent}
              onChange={(e) => {
                handleChange(e);
                validateFormField('css', e.target.value);
              }}
              placeholder=".component {\n  color: #6366F1;\n  padding: 1rem;\n}"
              className={formStyles.formTextarea}
              rows={10}
              required
            />
            {formData.cssContent && (
              <div className={`${formStyles.formValidationMessage} ${validationStatus.css.valid ? formStyles.valid : formStyles.invalid}`}>
                {validationStatus.css.valid ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V12M12 15H12.01M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
                {validationStatus.css.message}
              </div>
            )}
          </div>
          
          <FormActions isAI={false} />
        </form>
      </div>
      
      {/* AI Generation Tab */}
      <div className={`${aiStyles.tabContent} ${activeTab === 'ai' ? aiStyles.tabContentActive : ''}`}>
        <div className={aiStyles.aiGeneratorSection}>
          <p className={aiStyles.aiDescription}>
            Descreva o componente que você deseja e deixe a IA gerar o código HTML e CSS automaticamente para você.
          </p>
          
          {aiError && (
            <div className={formStyles.errorMessage}>
              <span>{aiError}</span>
            </div>
          )}
          
          <div className={formStyles.formGroup}>
            <label htmlFor="aiDescription">Descreva o componente</label>
            <textarea
              id="aiDescription"
              value={aiDescription}
              onChange={(e) => setAiDescription(e.target.value)}
              placeholder="Ex: Um botão moderno com efeito de hover, cores gradientes e cantos arredondados"
              className={formStyles.formTextarea}
              rows={3}
            />
          </div>
          
          <div className={aiStyles.aiFormRow}>
            <div className={formStyles.formGroup}>
              <label htmlFor="aiComponentType">Tipo de componente</label>
              <select
                id="aiComponentType"
                value={aiComponentType}
                onChange={(e) => setAiComponentType(e.target.value)}
                className={formStyles.formSelect}
              >
                <option value="button">Botão</option>
                <option value="card">Card</option>
                <option value="form">Formulário</option>
                <option value="navbar">Barra de navegação</option>
                <option value="footer">Rodapé</option>
                <option value="hero">Hero Section</option>
                <option value="testimonial">Testimonial</option>
                <option value="pricing">Tabela de preços</option>
              </select>
            </div>
            
            <div className={formStyles.formGroup}>
              <label htmlFor="aiCategory">Categoria</label>
              <select
                id="aiCategory"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className={formStyles.formSelect}
              >
                {CATEGORY_OPTIONS.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className={formStyles.formGroup}>
              <label htmlFor="aiTheme">Estilo</label>
              <select
                id="aiTheme"
                value={aiTheme}
                onChange={(e) => setAiTheme(e.target.value)}
                className={formStyles.formSelect}
              >
                <option value="modern">Moderno</option>
                <option value="minimalist">Minimalista</option>
                <option value="glass">Glassmórfico</option>
                <option value="neomorphism">Neomorfismo</option>
                <option value="playful">Divertido</option>
                <option value="corporate">Corporativo</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>
          </div>
          
          <button 
            type="button" 
            className={aiStyles.aiGenerateButton}
            onClick={handleAIGenerate}
            disabled={aiLoading}
            aria-label="Gerar componente usando IA"
          >
            {aiLoading ? (
              <>
                <span className={formStyles.smallSpinner}></span>
                Gerando componente...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.5 3.25H14.5M12 15V6.5M18.446 7.108L14.1764 14.2612M15.6517 18.8537L7.5 14.5M5.55397 16.892L9.82353 9.73875M8.34827 5.14625L16.5 9.5"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Gerar com IA
              </>
            )}
          </button>
        </div>
        
        {showPreview && formData.htmlContent && (
          <div className={aiStyles.previewSection}>
            <div className={aiStyles.previewHeader}>
              <h3 className={aiStyles.sectionTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 6V18M18 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Preview do Componente
              </h3>
              <div className={aiStyles.previewControls}>
                <div className={aiStyles.previewModeToggle}>
                  <button
                    type="button"
                    className={`${aiStyles.previewModeButton} ${previewMode === 'light' ? aiStyles.previewModeActive : ''}`}
                    onClick={() => setPreviewMode('light')}
                    aria-label="Modo claro"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '4px'}}>
                      <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="currentColor"/>
                      <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Claro
                  </button>
                  <button
                    type="button"
                    className={`${aiStyles.previewModeButton} ${previewMode === 'dark' ? aiStyles.previewModeActive : ''}`}
                    onClick={() => setPreviewMode('dark')}
                    aria-label="Modo escuro"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '4px'}}>
                      <path d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM12 21.25C6.89137 21.25 2.75 17.1086 2.75 12H1.25C1.25 17.9371 6.06294 22.75 12 22.75V21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM12 2.75C12.1696 2.75 12.3373 2.75661 12.5034 2.76974L12.64 1.27642C12.4266 1.25879 12.2145 1.25 12 1.25V2.75ZM21.7092 12.2447C21.9234 11.8971 22.0638 11.5043 22.1304 11.093L20.6496 10.8437C20.6078 11.1171 20.5244 11.3815 20.4253 11.469L21.7092 12.2447ZM12.531 3.57467C12.6185 3.47556 12.8829 3.39225 13.1563 3.35036L12.907 1.86964C12.4957 1.93622 12.1029 2.07658 11.7553 2.29085L12.531 3.57467Z" fill="currentColor"/>
                    </svg>
                    Escuro
                  </button>
                </div>
              </div>
            </div>
            
            <div className={aiStyles.previewResponsiveControls}>
              <>
                <button 
                  className={`${aiStyles.previewResponsiveButton} ${previewDevice === 'desktop' ? aiStyles.previewResponsiveActive : ''}`} 
                  title="Desktop"
                  onClick={() => setPreviewDevice('desktop')}
                  aria-label="Visualizar em desktop"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 21H16M12 17V21M6.8 17H17.2C18.8802 17 19.7202 17 20.362 16.673C20.9265 16.3854 21.3854 15.9265 21.673 15.362C22 14.7202 22 13.8802 22 12.2V7.8C22 6.11984 22 5.27976 21.673 4.63803C21.3854 4.07354 20.9265 3.6146 20.362 3.32698C19.7202 3 18.8802 3 17.2 3H6.8C5.11984 3 4.27976 3 3.63803 3.32698C3.07354 3.6146 2.6146 4.07354 2.32698 4.63803C2 5.27976 2 6.11984 2 7.8V12.2C2 13.8802 2 14.7202 2.32698 15.362C2.6146 15.9265 3.07354 16.3854 3.63803 16.673C4.27976 17 5.11984 17 6.8 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button 
                  className={`${aiStyles.previewResponsiveButton} ${previewDevice === 'tablet' ? aiStyles.previewResponsiveActive : ''}`} 
                  title="Tablet"
                  onClick={() => setPreviewDevice('tablet')}
                  aria-label="Visualizar em tablet"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 17.5V19.5M9.6 21.5H14.4C16.0509 21.5 16.8763 21.5 17.5 21.1481C18.0353 20.8381 18.4722 20.3539 18.74 19.76C19.05 19.0727 19.05 18.1618 19.05 16.34V7.66C19.05 5.83821 19.05 4.92731 18.74 4.24C18.4722 3.6461 18.0353 3.16188 17.5 2.85192C16.8763 2.5 16.0509 2.5 14.4 2.5H9.6C7.94912 2.5 7.12368 2.5 6.5 2.85192C5.96469 3.16188 5.52777 3.6461 5.26 4.24C4.95 4.92731 4.95 5.83821 4.95 7.66V16.34C4.95 18.1618 4.95 19.0727 5.26 19.76C5.52777 20.3539 5.96469 20.8381 6.5 21.1481C7.12368 21.5 7.94912 21.5 9.6 21.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button 
                  className={`${aiStyles.previewResponsiveButton} ${previewDevice === 'mobile' ? aiStyles.previewResponsiveActive : ''}`} 
                  title="Mobile"
                  onClick={() => setPreviewDevice('mobile')}
                  aria-label="Visualizar em mobile"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 18V18.01M8.2 22H15.8C16.9201 22 17.4802 22 17.908 21.782C18.2843 21.5903 18.5903 21.2843 18.782 20.908C19 20.4802 19 19.9201 19 18.8V5.2C19 4.07989 19 3.51984 18.782 3.09202C18.5903 2.71569 18.2843 2.40973 17.908 2.21799C17.4802 2 16.9201 2 15.8 2H8.2C7.07989 2 6.51984 2 6.09202 2.21799C5.71569 2.40973 5.40973 2.71569 5.21799 3.09202C5 3.51984 5 4.07989 5 5.2V18.8C5 19.9201 5 20.4802 5.21799 20.908C5.40973 21.2843 5.71569 21.5903 6.09202 21.782C6.51984 22 7.07989 22 8.2 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            </div>
            
            <div className={`${aiStyles.componentPreviewContainer} ${previewMode === 'light' ? aiStyles.previewLight : aiStyles.previewDark}`}>
              <div 
                className={`${aiStyles.componentPreviewFrame} ${aiStyles['preview' + previewDevice.charAt(0).toUpperCase() + previewDevice.slice(1)]}`}
                dangerouslySetInnerHTML={{ 
                  __html: `
                  <style>
                    /* Reset básico para o preview */
                    .preview-wrapper * { box-sizing: border-box; }
                    .preview-wrapper { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; }
                    
                    /* Modo de visualização */
                    ${previewMode === 'dark' ? '.preview-wrapper { background-color: #1a1a1a; color: #f0f0f0; }' : ''}
                    
                    /* Estilos do componente */
                    ${formData.cssContent}
                  </style>
                  <div class="preview-wrapper">${formData.htmlContent}</div>
                  ` 
                }}
              />
            </div>
            
            <div className={aiStyles.codeViewHeader}>
              <div className={aiStyles.codeTabsContainer}>
                <button
                  type="button"
                  className={aiStyles.codeTab}
                  onClick={() => setFormData({ ...formData, name: `${aiComponentType.charAt(0).toUpperCase() + aiComponentType.slice(1)} ${aiTheme} - ${formData.category}` })}

                >
                  Definir nome padrão
                </button>
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do componente"
                className={aiStyles.componentNameInput}
              />
            </div>
            
            <div className={aiStyles.aiOptionsRow}>
              <div className={formStyles.formGroup} style={{ marginBottom: 0 }}>
                <label htmlFor="color">Cor Representativa</label>
                <ColorPicker 
                  value={formData.color || '#6366F1'}
                  onChange={handleColorChange}
                  presetColors={COLOR_OPTIONS}
                />
              </div>
            </div>
            
            <div className={aiStyles.refinementSection}>
              <h3 className={aiStyles.sectionTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 5L21 12M21 12L14 19M21 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refinar Componente
              </h3>
              <textarea
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder="Descreva ajustes para refinar este componente. Ex: Adicione uma borda mais arredondada, mude a cor para tons de azul..."
                className={formStyles.formTextarea}
                rows={2}
              />
              <RefineButton />
            </div>

            <div className={aiStyles.codeViewSection}>
              <div className={aiStyles.codeViewHeader}>
                <div className={aiStyles.codeTabsContainer}>
                  <button
                    type="button"
                    className={`${aiStyles.codeTab} ${aiStyles.codeTabActive}`}
                  >
                    Código HTML e CSS
                  </button>
                </div>
              </div>
              <div className={aiStyles.codeViewContainer}>
                <div className={aiStyles.codeBlock}>
                  <div className={aiStyles.codeHeader}>
                    <span>HTML</span>
                  </div>
                  <textarea
                    value={formData.htmlContent}
                    onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                    className={aiStyles.codeEditor}
                    rows={6}
                  />
                </div>
                
                <div className={aiStyles.codeBlock}>
                  <div className={aiStyles.codeHeader}>
                    <span>CSS</span>
                  </div>
                  <textarea
                    value={formData.cssContent}
                    onChange={(e) => setFormData({ ...formData, cssContent: e.target.value })}
                    className={aiStyles.codeEditor}
                    rows={8}
                  />
                </div>
              </div>
            </div>
            
            <FormActions isAI={true} />
          </div>
        )}
      </div>
    </div>
  );
}
