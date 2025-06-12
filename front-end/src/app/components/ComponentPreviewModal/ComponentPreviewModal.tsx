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

export default function ComponentPreviewModal({
  component,
  isOpen,
  onClose,
  userId,
  onFavoriteChange
}: ComponentPreviewModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('system');
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop');
  const [isFavorited, setIsFavorited] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scale, setScale] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const previewRef = useRef<HTMLIFrameElement>(null);
  const htmlCodeRef = useRef<HTMLPreElement>(null);
  const cssCodeRef = useRef<HTMLPreElement>(null);
  
  const { showToast } = useToast();

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Check if component is favorited on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (userId && component?.id) {
        try {
          const isCurrentlyFavorited = await FavoritesService.checkIfFavorited(userId, component.id);
          setIsFavorited(isCurrentlyFavorited);
        } catch (error) {
          console.error('Error checking favorite status:', error);
          // Se der erro 404 ou outro erro, assumir como não favoritado
          setIsFavorited(false);
        }
      } else {
        // Se não tiver userId ou componentId, não está favoritado
        setIsFavorited(false);
      }
    };
    
    if (isOpen && component) {
      checkFavoriteStatus();
      setScale(1);
      setIsFullscreen(false);
    }
  }, [isOpen, userId, component?.id]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isFullscreen]);

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
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      
      // Tratamento específico para diferentes tipos de erro
      if (error?.response?.status === 404) {
        showToast('Serviço de favoritos temporariamente indisponível.', { type: 'warning' });
      } else if (error?.response?.status === 401) {
        showToast('Sessão expirada. Faça login novamente.', { type: 'error' });
      } else {
        showToast('Erro ao atualizar favoritos. Tente novamente.', { type: 'error' });
      }
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
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${component.name} - Preview</title>
        <style>
          * { 
            box-sizing: border-box; 
            margin: 0; 
            padding: 0; 
          }
          
          body { 
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 16px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            ${isDark ? 
              'background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); color: #f0f0f0;' : 
              'background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); color: #1a1a1a;'
            }
          }
          
          .preview-wrapper {
            width: 100%;
            max-width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px 0;
          }
          
          ${component.cssContent}
        </style>
      </head>
      <body>
        <div class="preview-wrapper">
          ${component.htmlContent || '<p style="color: #999; text-align: center; margin-top: 2rem;">Nenhum conteúdo HTML disponível</p>'}
        </div>
      </body>
      </html>
    `;
  };

  // Don't render anything on server-side or if modal is closed
  if (!mounted || !isOpen) return null;
  
  // Render fullscreen component preview
  if (isFullscreen) {
    return createPortal(
      <div className={styles.fullscreenOverlay} onClick={() => setIsFullscreen(false)}>
        <div className={styles.fullscreenControls}>
          <button 
            className={styles.exitFullscreenButton}
            onClick={() => setIsFullscreen(false)}
            title="Sair do modo tela cheia"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3V5H4V9H2V3H8ZM2 15V21H8V19H4V15H2ZM22 9V3H16V5H20V9H22ZM20 19H16V21H22V15H20V19Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <iframe
          className={styles.fullscreenIframe}
          srcDoc={generatePreviewHTML()}
          title={`${component.name} - Preview`}
        />
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.modalTitle}>{component.name}</h2>
            <span className={styles.categoryBadge}>{component.category || 'Outros'}</span>
          </div>
          
          <div className={styles.headerActions}>
            <button
              className={styles.fullscreenButton}
              onClick={() => setIsFullscreen(true)}
              title="Visualizar em tela cheia"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 14H5V19H10V17H7V14ZM5 10H7V7H10V5H5V10ZM17 17H14V19H19V14H17V17ZM14 5V7H17V10H19V5H14Z" fill="currentColor"/>
              </svg>
            </button>
            
            <button
              className={`${styles.favoriteButton} ${isFavorited ? styles.favoriteActive : ''}`}
              onClick={handleFavoriteToggle}
              disabled={isProcessing}
              title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                      fill={isFavorited ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeLinejoin="round"/>
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
        </div>

        {/* Content - All sections visible at once */}
        <div className={styles.modalContent}>
          <div className={styles.allContentContainer}>
            {/* Preview Section */}
            <div className={styles.previewContainer}>
              <div className={styles.codeHeader}>
                <h3>Preview</h3>
              </div>
              <div 
                className={styles.previewFrameWrapper}
              >
                <div 
                  className={styles.previewFrame}
                  style={{ 
                    width: getDeviceWidth(),
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center'
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
            </div>

            {/* HTML Section */}
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

            {/* CSS Section */}
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
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
