"use client";

import React, { useState } from 'react';
import styles from './ComponentForm.module.css';
import { ComponentFormData } from '@/contexts/ComponentContext';

interface ComponentFormProps {
  onSubmit: (data: ComponentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ComponentForm({
  onSubmit,
  onCancel,
  isLoading = false
}: ComponentFormProps) {
  const [formData, setFormData] = useState<ComponentFormData>({
    name: '',
    category: '',
    cssContent: '',
    htmlContent: '',
    color: '#6366f1'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome do componente é obrigatório';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Categoria é obrigatória';
    }
    if (!formData.cssContent.trim()) {
      newErrors.cssContent = 'Conteúdo CSS é obrigatório';
    }
    if (!formData.color.trim()) {
      newErrors.color = 'Cor é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const categories = [
    'Buttons',
    'Cards', 
    'Forms',
    'Navigation',
    'Alerts',
    'Modals',
    'Tables',
    'Loaders',
    'Typography'
  ];

  const handleColorPresetClick = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
    if (errors.color) {
      setErrors(prev => ({ ...prev, color: '' }));
    }
  };

  const colorPresets = [
    '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', 
    '#f59e0b', '#ef4444', '#8b5a2b', '#6b7280'
  ];

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Criar Novo Componente</h2>
        <button 
          onClick={onCancel}
          className={styles.closeButton}
          disabled={isLoading}
          aria-label="Fechar formulário"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Nome do Componente *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              disabled={isLoading}
              placeholder="Ex: Primary Button"
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Categoria *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`${styles.select} ${errors.category ? styles.inputError : ''}`}
              disabled={isLoading}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className={styles.errorText}>{errors.category}</span>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="color" className={styles.label}>
            Cor Principal *
          </label>
          <div className={styles.colorSection}>
            <div className={styles.colorInputGroup}>
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className={styles.colorPicker}
                disabled={isLoading}
              />
              <input
                type="text"
                value={formData.color}
                onChange={handleInputChange}
                name="color"
                className={`${styles.colorInput} ${errors.color ? styles.inputError : ''}`}
                disabled={isLoading}
                placeholder="#6366f1"
              />
            </div>
            <div className={styles.colorPresets}>
              {colorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`${styles.colorPreset} ${formData.color === color ? styles.colorPresetActive : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorPresetClick(color)}
                  disabled={isLoading}
                  aria-label={`Cor ${color}`}
                />
              ))}
            </div>
          </div>
          {errors.color && <span className={styles.errorText}>{errors.color}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="htmlContent" className={styles.label}>
            Conteúdo HTML
          </label>
          <textarea
            id="htmlContent"
            name="htmlContent"
            value={formData.htmlContent}
            onChange={handleInputChange}
            className={styles.textarea}
            rows={8}
            disabled={isLoading}
            placeholder="<button class='btn-primary'>Click Me</button>"
          />
          <div className={styles.fieldHint}>
            HTML opcional para preview do componente
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="cssContent" className={styles.label}>
            Conteúdo CSS *
          </label>
          <textarea
            id="cssContent"
            name="cssContent"
            value={formData.cssContent}
            onChange={handleInputChange}
            className={`${styles.textarea} ${styles.codeTextarea} ${errors.cssContent ? styles.inputError : ''}`}
            rows={12}
            disabled={isLoading}
            placeholder=".btn-primary {
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition-base);
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}"
          />
          {errors.cssContent && <span className={styles.errorText}>{errors.cssContent}</span>}
          <div className={styles.fieldHint}>
            Use as variáveis CSS do sistema (--primary, --radius, etc.)
          </div>
        </div>

        <div className={styles.formActions}>
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
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className={styles.loadingSpinner} />
                Criando...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Criar Componente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
