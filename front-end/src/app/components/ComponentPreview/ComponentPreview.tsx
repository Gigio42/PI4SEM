"use client";

import React, { useState } from 'react';
import styles from './component-preview.module.css';

interface ComponentPreviewProps {
  htmlContent: string;
  cssContent: string;
  initialMode?: 'light' | 'dark' | 'system';
  initialDevice?: 'desktop' | 'tablet' | 'mobile';
  showCode?: boolean;
  showControls?: boolean;
}

export default function ComponentPreview({
  htmlContent,
  cssContent,
  initialMode = 'light',
  initialDevice = 'desktop',
  showCode = false,
  showControls = true
}: ComponentPreviewProps) {
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>(initialMode === 'system' ? 'light' : initialMode);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>(initialDevice);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
    console.log(`${type} copiado para área de transferência`);
  };

  return (
    <div className={styles.componentPreview}>
      {showControls && (
        <div className={styles.previewControls}>
          <div className={styles.previewTabs}>
            <button
              className={`${styles.previewTab} ${activeTab === 'preview' ? styles.active : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Preview
            </button>
            {showCode && (
              <button
                className={`${styles.previewTab} ${activeTab === 'code' ? styles.active : ''}`}
                onClick={() => setActiveTab('code')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 7L21 12L17 17M7 7L3 12L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Código
              </button>
            )}
          </div>

          {activeTab === 'preview' && (
            <div className={styles.previewActions}>
              <div className={styles.modeToggle}>
                <button
                  className={`${styles.modeButton} ${previewMode === 'light' ? styles.active : ''}`}
                  onClick={() => setPreviewMode('light')}
                  title="Modo claro"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="currentColor"/>
                    <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  className={`${styles.modeButton} ${previewMode === 'dark' ? styles.active : ''}`}
                  onClick={() => setPreviewMode('dark')}
                  title="Modo escuro"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className={styles.deviceToggle}>
                <button
                  className={`${styles.deviceButton} ${previewDevice === 'desktop' ? styles.active : ''}`}
                  onClick={() => setPreviewDevice('desktop')}
                  title="Desktop"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 21H16M12 17V21M6.8 17H17.2C18.8802 17 19.7202 17 20.362 16.673C20.9265 16.3854 21.3854 15.9265 21.673 15.362C22 14.7202 22 13.8802 22 12.2V7.8C22 6.11984 22 5.27976 21.673 4.63803C21.3854 4.07354 20.9265 3.6146 20.362 3.32698C19.7202 3 18.8802 3 17.2 3H6.8C5.11984 3 4.27976 3 3.63803 3.32698C3.07354 3.6146 2.6146 4.07354 2.32698 4.63803C2 5.27976 2 6.11984 2 7.8V12.2C2 13.8802 2 14.7202 2.32698 15.362C2.6146 15.9265 3.07354 16.3854 3.63803 16.673C4.27976 17 5.11984 17 6.8 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  className={`${styles.deviceButton} ${previewDevice === 'tablet' ? styles.active : ''}`}
                  onClick={() => setPreviewDevice('tablet')}
                  title="Tablet"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 17.5V19.5M9.6 21.5H14.4C16.0509 21.5 16.8763 21.5 17.5 21.1481C18.0353 20.8381 18.4722 20.3539 18.74 19.76C19.05 19.0727 19.05 18.1618 19.05 16.34V7.66C19.05 5.83821 19.05 4.92731 18.74 4.24C18.4722 3.6461 18.0353 3.16188 17.5 2.85192C16.8763 2.5 16.0509 2.5 14.4 2.5H9.6C7.94912 2.5 7.12368 2.5 6.5 2.85192C5.96469 3.16188 5.52777 3.6461 5.26 4.24C4.95 4.92731 4.95 5.83821 4.95 7.66V16.34C4.95 18.1618 4.95 19.0727 5.26 19.76C5.52777 20.3539 5.96469 20.8381 6.5 21.1481C7.12368 21.5 7.94912 21.5 9.6 21.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  className={`${styles.deviceButton} ${previewDevice === 'mobile' ? styles.active : ''}`}
                  onClick={() => setPreviewDevice('mobile')}
                  title="Mobile"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 18V18.01M8.2 22H15.8C16.9201 22 17.4802 22 17.908 21.782C18.2843 21.5903 18.5903 21.2843 18.782 20.908C19 20.4802 19 19.9201 19 18.8V5.2C19 4.07989 19 3.51984 18.782 3.09202C18.5903 2.71569 18.2843 2.40973 17.908 2.21799C17.4802 2 16.9201 2 15.8 2H8.2C7.07989 2 6.51984 2 6.09202 2.21799C5.71569 2.40973 5.40973 2.71569 5.21799 3.09202C5 3.51984 5 4.07989 5 5.2V18.8C5 19.9201 5 20.4802 5.21799 20.908C5.40973 21.2843 5.71569 21.5903 6.09202 21.782C6.51984 22 7.07989 22 8.2 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={styles.previewContent}>
        {activeTab === 'preview' ? (
          <div className={`${styles.previewFrame} ${styles[`device-${previewDevice}`]} ${styles[`mode-${previewMode}`]}`}>
            {htmlContent ? (
              <div 
                className={styles.previewContainer}
                dangerouslySetInnerHTML={{ 
                  __html: `
                  <style>
                    /* Reset básico para o preview */
                    .preview-wrapper * { box-sizing: border-box; }
                    .preview-wrapper { 
                      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                      margin: 0; 
                      padding: 20px;
                      ${previewMode === 'dark' ? 'background-color: #1a1a1a; color: #ffffff;' : 'background-color: #ffffff; color: #000000;'}
                    }
                    
                    /* Estilos do componente */
                    ${cssContent}
                  </style>
                  <div class="preview-wrapper">${htmlContent}</div>
                  ` 
                }}
              />
            ) : (
              <div className={styles.noPreview}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <p>Nenhum conteúdo HTML para visualizar</p>
                <small>Adicione código HTML para ver o preview</small>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.codeView}>
            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span>HTML</span>
                <button 
                  className={styles.copyButton}
                  onClick={() => handleCopy(htmlContent || '', 'HTML')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V17M8 5C8 6.10457 8.89543 7 10 7H14C15.1046 7 16 6.10457 16 5M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5M16 5H18C19.1046 5 20 5.89543 20 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Copiar
                </button>
              </div>
              <pre className={styles.codeContent}>{htmlContent || 'Sem conteúdo HTML'}</pre>
            </div>

            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span>CSS</span>
                <button 
                  className={styles.copyButton}
                  onClick={() => handleCopy(cssContent, 'CSS')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V17M8 5C8 6.10457 8.89543 7 10 7H14C15.1046 7 16 6.10457 16 5M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5M16 5H18C19.1046 5 20 5.89543 20 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Copiar
                </button>
              </div>
              <pre className={styles.codeContent}>{cssContent}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
