"use client";

import React, { useState, useEffect } from 'react';
import styles from './ComponentEditForm.module.css';
import { Component } from '@/contexts/ComponentContext';

interface ComponentEditFormProps {
  component: Component;
  onSave: (data: Partial<Component>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ComponentEditForm({ 
  component, 
  onSave, 
  onCancel, 
  isLoading = false 
}: ComponentEditFormProps) {
  const [formData, setFormData] = useState({
    name: component.name || '',
    category: component.category || '',
    cssContent: component.cssContent || '',
    htmlContent: component.htmlContent || '',
    color: component.color || component.primaryColor || '#3b82f6'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      name: component.name || '',
      category: component.category || '',
      cssContent: component.cssContent || '',
      htmlContent: component.htmlContent || '',
      color: component.color || component.primaryColor || '#3b82f6'
    });
  }, [component]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
    if (!formData.cssContent.trim()) {
      newErrors.cssContent = 'Conteúdo CSS é obrigatório';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Categoria é obrigatória';
    }
    if (!formData.color.trim()) {
      newErrors.color = 'Cor é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSave(formData);
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

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Editar Componente</h2>
        <button 
          onClick={onCancel}
          className={styles.closeButton}
          disabled={isLoading}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
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

        <div className={styles.formGroup}>
          <label htmlFor="color" className={styles.label}>
            Cor *
          </label>
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
              placeholder="#3b82f6"
            />
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
            className={`${styles.textarea} ${errors.cssContent ? styles.inputError : ''}`}
            rows={12}
            disabled={isLoading}
            placeholder=".btn-primary { padding: 10px 20px; background: #3b82f6; }"
          />
          {errors.cssContent && <span className={styles.errorText}>{errors.cssContent}</span>}
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
            className={styles.saveButton}
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
