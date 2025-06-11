"use client";

import React from 'react';
import styles from './ComponentActions.module.css';

interface ComponentActionsProps {
  onCreateClick: () => void;
  onAIGenerateClick: () => void;
  onRefresh: () => void;
  componentsCount: number;
  isLoading: boolean;
}

export default function ComponentActions({
  onCreateClick,
  onAIGenerateClick,
  onRefresh,
  componentsCount,
  isLoading
}: ComponentActionsProps) {
  return (
    <div className={styles.actionsContainer}>
      <div className={styles.actionsHeader}>
        <div className={styles.statsInfo}>
          <span className={styles.componentCount}>
            {componentsCount} {componentsCount === 1 ? 'componente' : 'componentes'}
          </span>
        </div>
        
        <div className={styles.actionButtons}>
          <button 
            className={styles.refreshButton}
            onClick={onRefresh}
            disabled={isLoading}
            title="Atualizar lista"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className={isLoading ? styles.spinning : ''}
            >
              <path 
                d="M1 4V10H7M23 20V14H17" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M20.49 9C19.9 5.46 16.85 3 13 3C9.85 3 7.1 4.95 6 8M3.51 15C4.1 18.54 7.15 21 11 21C14.15 21 16.9 19.05 18 16" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          
          <button 
            className={styles.aiButton}
            onClick={onAIGenerateClick}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3.09 8.26L12 14L20.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.09 8.26V15.74L12 22L20.91 15.74V8.26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Gerar com IA
          </button>
          
          <button 
            className={styles.createButton}
            onClick={onCreateClick}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Novo Componente
          </button>
        </div>
      </div>
    </div>
  );
}
