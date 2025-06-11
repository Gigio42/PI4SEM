"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import FavoriteButton from '../FavoriteButton';
import { Component } from '@/types/component';
import { FavoritesService } from '@/services/FavoritesService';
import { useToast } from '@/hooks/useToast';
import styles from './ComponentPreviewModal.module.css';

interface ComponentPreviewModalProps {
  component: Component;
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
  onFavoriteChange?: () => void;
}

type ViewMode = 'light' | 'dark' | 'system';
type DeviceSize = 'mobile' | 'tablet' | 'desktop';
type ActiveTab = 'preview' | 'html' | 'css';

export default function ComponentPreviewModal({
  component,
  isOpen,
  onClose,
  userId,
  onFavoriteChange
}: ComponentPreviewModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('system');
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop');
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [isFavorited, setIsFavorited] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scale, setScale] = useState(1);
  
  const previewRef = useRef<HTMLIFrameElement>(null);
  const htmlCodeRef = useRef<HTMLPreElement>(null);
  const cssCodeRef = useRef<HTMLPreElement>(null);
  
  const { showToast } = useToast();

  // Check if component is favorited on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (userId && component?.id) {
        try {
          const isCurrentlyFavorited = await FavoritesService.checkIfFavorited(userId, component.id);
          setIsFavorited(isCurrentlyFavorited);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };

    if (isOpen && component) {
      checkFavoriteStatus();
      setActiveTab('preview');
      setScale(1);
    }
  }, [isOpen, userId, component?.id]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleFavoriteToggle = async () => {
    if (!userId || !component?.id) {
      showToast('Você precisa estar logado para favoritar componentes.', { type: 'warning' });
      return;
    }

    try {
      setIsProcessing(true);
      
      if (isFavorited) {
        await FavoritesService.removeFavorite(userId, component.id);
        setIsFavorited(false);
        showToast('Componente removido dos favoritos', { type: 'success' });
      } else {
        await FavoritesService.addFavorite(userId, component.id);
        setIsFavorited(true);
        showToast('Componente adicionado aos favoritos', { type: 'success' });
      }
      
      onFavoriteChange?.();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Erro ao atualizar favoritos. Tente novamente.', { type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'HTML' | 'CSS') => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Código ${type} copiado para a área de transferência!`, { type: 'success' });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('Erro ao copiar código. Tente novamente.', { type: 'error' });
    }
  };

  const downloadCode = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${component.name}</title>
    <style>
${component.cssContent}
    </style>
</head>
<body>
${component.htmlContent || ''}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${component.name.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Download iniciado!', { type: 'success' });
  };

  const getDeviceWidth = () => {
    switch (deviceSize) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  const generatePreviewHTML = () => {
    const isDark = viewMode === 'dark' || (viewMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    return `
      <style>
        .preview-container * { box-sizing: border-box; }
        .preview-container { 
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          min-height: 100%;
          ${isDark ? 'background-color: #1a1a1a; color: #f0f0f0;' : 'background-color: #ffffff; color: #1a1a1a;'}
        }
        ${component.cssContent}
      </style>
      <div class="preview-container">${component.htmlContent || ''}</div>
    `;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.modalTitle}>{component.name}</h2>
            <span className={styles.categoryBadge}>{component.category || 'Outros'}</span>
          </div>
          
          <div className={styles.headerActions}>
            <button
              className={`${styles.favoriteButton} ${isFavorited ? styles.favoriteActive : ''}`}
              onClick={handleFavoriteToggle}
              disabled={isProcessing}
              title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" 
                      fill={isFavorited ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      strokeWidth="2"/>
              </svg>
            </button>
            
            <button
              className={styles.downloadButton}
              onClick={downloadCode}
              title="Baixar código completo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <button
              className={styles.closeButton}
              onClick={onClose}
              title="Fechar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.tabButtons}>
            <button
              className={`${styles.tabButton} ${activeTab === 'preview' ? styles.active : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Preview
            </button>
            
            <button
              className={`${styles.tabButton} ${activeTab === 'html' ? styles.active : ''}`}
              onClick={() => setActiveTab('html')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 17L18 12L13 7M6 7L11 12L6 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              HTML
            </button>
            
            <button
              className={`${styles.tabButton} ${activeTab === 'css' ? styles.active : ''}`}
              onClick={() => setActiveTab('css')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7V4C4 3.46957 4.21071 2.96086 4.58579 2.58579C4.96086 2.21071 5.46957 2 6 2H18C18.5304 2 19.0391 2.21071 19.4142 2.58579C19.7893 2.96086 20 3.46957 20 4V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 7H20L19 17H5L4 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              CSS
            </button>
          </div>

          {activeTab === 'preview' && (
            <div className={styles.previewControls}>
              <div className={styles.deviceButtons}>
                <button
                  className={`${styles.deviceButton} ${deviceSize === 'mobile' ? styles.active : ''}`}
                  onClick={() => setDeviceSize('mobile')}
                  title="Visualização Mobile"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                
                <button
                  className={`${styles.deviceButton} ${deviceSize === 'tablet' ? styles.active : ''}`}
                  onClick={() => setDeviceSize('tablet')}
                  title="Visualização Tablet"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="3" width="16" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                
                <button
                  className={`${styles.deviceButton} ${deviceSize === 'desktop' ? styles.active : ''}`}
                  onClick={() => setDeviceSize('desktop')}
                  title="Visualização Desktop"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>

              <div className={styles.themeButtons}>
                <button
                  className={`${styles.themeButton} ${viewMode === 'light' ? styles.active : ''}`}
                  onClick={() => setViewMode('light')}
                  title="Modo Claro"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2"/>
                    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2"/>
                    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                
                <button
                  className={`${styles.themeButton} ${viewMode === 'system' ? styles.active : ''}`}
                  onClick={() => setViewMode('system')}
                  title="Modo do Sistema"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                
                <button
                  className={`${styles.themeButton} ${viewMode === 'dark' ? styles.active : ''}`}
                  onClick={() => setViewMode('dark')}
                  title="Modo Escuro"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>

              <div className={styles.scaleControls}>
                <button
                  className={styles.scaleButton}
                  onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                  disabled={scale <= 0.5}
                  title="Diminuir zoom"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                
                <span className={styles.scaleValue}>{Math.round(scale * 100)}%</span>
                
                <button
                  className={styles.scaleButton}
                  onClick={() => setScale(Math.min(2, scale + 0.1))}
                  disabled={scale >= 2}
                  title="Aumentar zoom"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
                    <line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                
                <button
                  className={styles.resetButton}
                  onClick={() => setScale(1)}
                  title="Resetar zoom"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={styles.modalContent}>
          {activeTab === 'preview' && (
            <div className={styles.previewContainer}>
              <div 
                className={styles.previewFrame}
                style={{ 
                  width: getDeviceWidth(),
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center'
                }}
              >
                <iframe
                  ref={previewRef}
                  className={styles.previewIframe}
                  srcDoc={generatePreviewHTML()}
                  title="Component Preview"
                />
              </div>
            </div>
          )}

          {activeTab === 'html' && (
            <div className={styles.codeContainer}>
              <div className={styles.codeHeader}>
                <h3>Código HTML</h3>
                <button
                  className={styles.copyButton}
                  onClick={() => copyToClipboard(component.htmlContent || '', 'HTML')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Copiar
                </button>
              </div>
              <pre className={styles.codeBlock} ref={htmlCodeRef}>
                <code>{component.htmlContent || 'Nenhum código HTML disponível'}</code>
              </pre>
            </div>
          )}

          {activeTab === 'css' && (
            <div className={styles.codeContainer}>
              <div className={styles.codeHeader}>
                <h3>Código CSS</h3>
                <button
                  className={styles.copyButton}
                  onClick={() => copyToClipboard(component.cssContent, 'CSS')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Copiar
                </button>
              </div>
              <pre className={styles.codeBlock} ref={cssCodeRef}>
                <code>{component.cssContent}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
