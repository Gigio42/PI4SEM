"use client";

import React from 'react';
import styles from './ComponentModal.module.css';
import ComponentForm from '../ComponentForm/ComponentForm';
import ComponentEditForm from '../ComponentEditForm/ComponentEditForm';
import AIComponentGenerator from '../AIComponentGenerator/AIComponentGenerator';
import { Component, ComponentFormData } from '@/contexts/ComponentContext';

export type ModalType = 'create' | 'edit' | 'ai-generate' | null;

interface ComponentModalProps {
  isOpen: boolean;
  type: ModalType;
  component?: Component | null;
  onClose: () => void;
  onSubmit: (data: ComponentFormData) => Promise<void>;
  onUpdate?: (id: number, data: Partial<ComponentFormData>) => Promise<void>;
  onAIGenerate?: (prompt: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ComponentModal({
  isOpen,
  type,
  component,
  onClose,
  onSubmit,
  onUpdate,
  onAIGenerate,
  isLoading = false
}: ComponentModalProps) {
  if (!isOpen || !type) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Prevent closing during loading
    if (isLoading) return;
    
    // Only close if backdrop was clicked (not modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderModalContent = () => {
    switch (type) {
      case 'create':
        return (
          <ComponentForm
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        );
      
      case 'edit':
        if (!component || !onUpdate) return null;
        return (
          <ComponentEditForm
            component={component}
            onSave={(data) => onUpdate(component.id, data)}
            onCancel={onClose}
            isLoading={isLoading}
          />
        );
      
      case 'ai-generate':
        if (!onAIGenerate) return null;
        return (
          <AIComponentGenerator
            onGenerate={onAIGenerate}
            onCancel={onClose}
            isLoading={isLoading}
          />
        );
      
      default:
        return null;
    }
  };

  // Adjust modal size based on type
  const modalSizeClass = type === 'ai-generate' 
    ? styles.modalLarge 
    : styles.modalMedium;

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={`${styles.modalContainer} ${modalSizeClass} ${isLoading ? styles.loading : ''}`}>
        <div className={styles.modalContent}>
          {renderModalContent()}
        </div>
      </div>
    </div>
  );
}
