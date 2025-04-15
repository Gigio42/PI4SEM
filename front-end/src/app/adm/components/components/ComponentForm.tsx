import React, { useState } from 'react';
import { Component, CreateComponentDto } from '@/types/component';
import { ComponentsService } from '@/services/ComponentsService';
import styles from '../components.module.css';

interface ComponentFormProps {
  onSuccess: (component: Component) => void;
  onCancel: () => void;
}

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

const COLOR_OPTIONS = [
  { name: 'Primary', value: '#6366F1' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Pink', value: '#EC4899' },
];

/**
 * Formulário para criar novos componentes CSS
 */
export default function ComponentForm({ onSuccess, onCancel }: ComponentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateComponentDto>({
    name: '',
    cssContent: '',
    category: 'Outros',
    color: '#6366F1'
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validações básicas no lado do cliente
      if (!formData.name.trim()) {
        throw new Error('O nome do componente é obrigatório');
      }
      
      if (!formData.cssContent.trim()) {
        throw new Error('O conteúdo CSS é obrigatório');
      }
      
      const newComponent = await ComponentsService.createComponent(formData);
      onSuccess(newComponent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao criar o componente');
      console.error('Erro ao criar componente:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const cancelForm = () => {
    // Limpar o formulário e chamar onCancel
    setFormData({
      name: '',
      cssContent: '',
      category: 'Outros',
      color: '#6366F1'
    });
    onCancel();
  };

  return (
    <div className={styles.componentForm}>
      <h2 className={styles.formTitle}>Adicionar Novo Componente</h2>
      
      {error && (
        <div className={styles.errorMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nome do Componente *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Botão Moderno"
            className={styles.formInput}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="category">Categoria</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={styles.formSelect}
          >
            {CATEGORY_OPTIONS.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="color">Cor Representativa</label>
          <div className={styles.colorPickerContainer}>
            <select
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className={styles.formSelect}
            >
              {COLOR_OPTIONS.map(color => (
                <option key={color.value} value={color.value}>{color.name}</option>
              ))}
            </select>
            <div 
              className={styles.colorPreview} 
              style={{ backgroundColor: formData.color }}
              aria-hidden="true"
            ></div>
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="cssContent">Código CSS *</label>
          <textarea
            id="cssContent"
            name="cssContent"
            value={formData.cssContent}
            onChange={handleChange}
            placeholder=".component {\n  color: #6366F1;\n  padding: 1rem;\n}"
            className={styles.formTextarea}
            rows={10}
            required
          />
        </div>
        
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={cancelForm}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.smallSpinner}></span>
                Criando...
              </>
            ) : 'Criar Componente'}
          </button>
        </div>
      </form>
    </div>
  );
}
