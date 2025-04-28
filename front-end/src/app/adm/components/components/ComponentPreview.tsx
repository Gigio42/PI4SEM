import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import styles from '../components-preview.module.css';

interface ComponentPreviewProps {
  htmlContent: string;
  cssContent: string;
  initialMode?: 'light' | 'dark' | 'system';
  initialDevice?: 'desktop' | 'tablet' | 'mobile';
  showCode?: boolean;
}

/**
 * A reusable component for previewing HTML/CSS components
 * with support for different themes and device sizes
 */
export default function ComponentPreview({
  htmlContent,
  cssContent,
  initialMode = 'system',
  initialDevice = 'desktop',
  showCode = false
}: ComponentPreviewProps) {
  const { isDarkMode } = useTheme();
  const [previewMode, setPreviewMode] = useState<'light' | 'dark' | 'system'>(initialMode);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>(initialDevice);
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css'>('html');
  
  // Determine actual theme based on mode and system settings
  const actualTheme = previewMode === 'system' 
    ? (isDarkMode ? 'dark' : 'light')
    : previewMode;
  
  // Generate the preview HTML with appropriate CSS
  const generatePreviewHTML = () => {
    return `
      <style>
        /* Reset básico para o preview */
        .preview-wrapper * { box-sizing: border-box; }
        .preview-wrapper { 
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          margin: 0; 
          padding: 0; 
        }
        
        /* Tema escuro/claro */
        ${actualTheme === 'dark' ? '.preview-wrapper { background-color: #1a1a1a; color: #f0f0f0; }' : ''}
        
        /* Estilos do componente */
        ${cssContent}
      </style>
      <div class="preview-wrapper">${htmlContent}</div>
    `;
  };
  
  return (
    <div className={styles.previewWrapper}>
      <div className={styles.previewControls}>
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeButton} ${previewMode === 'light' ? styles.modeButtonActive : ''}`}
            onClick={() => setPreviewMode('light')}
            aria-label="Modo claro"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="currentColor"/>
              <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Claro
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${previewMode === 'system' ? styles.modeButtonActive : ''}`}
            onClick={() => setPreviewMode('system')}
            aria-label="Modo do sistema"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 15v4M10 15v4M6 19h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sistema
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${previewMode === 'dark' ? styles.modeButtonActive : ''}`}
            onClick={() => setPreviewMode('dark')}
            aria-label="Modo escuro"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM12 21.25C6.89137 21.25 2.75 17.1086 2.75 12H1.25C1.25 17.9371 6.06294 22.75 12 22.75V21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM12 2.75C12.1696 2.75 12.3373 2.75661 12.5034 2.76974L12.64 1.27642C12.4266 1.25879 12.2145 1.25 12 1.25V2.75ZM21.7092 12.2447C21.9234 11.8971 22.0638 11.5043 22.1304 11.093L20.6496 10.8437C20.6078 11.1171 20.5244 11.3815 20.4253 11.469L21.7092 12.2447ZM12.531 3.57467C12.6185 3.47556 12.8829 3.39225 13.1563 3.35036L12.907 1.86964C12.4957 1.93622 12.1029 2.07658 11.7553 2.29085L12.531 3.57467Z" fill="currentColor"/>
            </svg>
            Escuro
          </button>
        </div>
        
        <div className={styles.deviceControls}>
          <button 
            className={`${styles.deviceButton} ${previewDevice === 'desktop' ? styles.deviceButtonActive : ''}`} 
            title="Desktop"
            onClick={() => setPreviewDevice('desktop')}
            aria-label="Visualizar em desktop"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 21H16M12 17V21M6.8 17H17.2C18.8802 17 19.7202 17 20.362 16.673C20.9265 16.3854 21.3854 15.9265 21.673 15.362C22 14.7202 22 13.8802 22 12.2V7.8C22 6.11984 22 5.27976 21.673 4.63803C21.3854 4.07354 20.9265 3.6146 20.362 3.32698C19.7202 3 18.8802 3 17.2 3H6.8C5.11984 3 4.27976 3 3.63803 3.32698C3.07354 3.6146 2.6146 4.07354 2.32698 4.63803C2 5.27976 2 6.11984 2 7.8V12.2C2 13.8802 2 14.7202 2.32698 15.362C2.6146 15.9265 3.07354 16.3854 3.63803 16.673C4.27976 17 5.11984 17 6.8 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className={`${styles.deviceButton} ${previewDevice === 'tablet' ? styles.deviceButtonActive : ''}`} 
            title="Tablet"
            onClick={() => setPreviewDevice('tablet')}
            aria-label="Visualizar em tablet"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17.5V19.5M9.6 21.5H14.4C16.0509 21.5 16.8763 21.5 17.5 21.1481C18.0353 20.8381 18.4722 20.3539 18.74 19.76C19.05 19.0727 19.05 18.1618 19.05 16.34V7.66C19.05 5.83821 19.05 4.92731 18.74 4.24C18.4722 3.6461 18.0353 3.16188 17.5 2.85192C16.8763 2.5 16.0509 2.5 14.4 2.5H9.6C7.94912 2.5 7.12368 2.5 6.5 2.85192C5.96469 3.16188 5.52777 3.6461 5.26 4.24C4.95 4.92731 4.95 5.83821 4.95 7.66V16.34C4.95 18.1618 4.95 19.0727 5.26 19.76C5.52777 20.3539 5.96469 20.8381 6.5 21.1481C7.12368 21.5 7.94912 21.5 9.6 21.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className={`${styles.deviceButton} ${previewDevice === 'mobile' ? styles.deviceButtonActive : ''}`} 
            title="Mobile"
            onClick={() => setPreviewDevice('mobile')}
            aria-label="Visualizar em mobile"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 18V18.01M8.2 22H15.8C16.9201 22 17.4802 22 17.908 21.782C18.2843 21.5903 18.5903 21.2843 18.782 20.908C19 20.4802 19 19.9201 19 18.8V5.2C19 4.07989 19 3.51984 18.782 3.09202C18.5903 2.71569 18.2843 2.40973 17.908 2.21799C17.4802 2 16.9201 2 15.8 2H8.2C7.07989 2 6.51984 2 6.09202 2.21799C5.71569 2.40973 5.40973 2.71569 5.21799 3.09202C5 3.51984 5 4.07989 5 5.2V18.8C5 19.9201 5 20.4802 5.21799 20.908C5.40973 21.2843 5.71569 21.5903 6.09202 21.782C6.51984 22 7.07989 22 8.2 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className={`${styles.previewContainer} ${styles['preview' + actualTheme.charAt(0).toUpperCase() + actualTheme.slice(1)]}`}>
        <div 
          className={`${styles.previewFrame} ${styles['preview' + previewDevice.charAt(0).toUpperCase() + previewDevice.slice(1)]}`}
          dangerouslySetInnerHTML={{ 
            __html: generatePreviewHTML()
          }}
        />
      </div>
      
      {showCode && (
        <div className={styles.codeContainer}>
          <div className={styles.codeTabs}>
            <button
              type="button"
              className={`${styles.codeTab} ${activeCodeTab === 'html' ? styles.codeTabActive : ''}`}
              onClick={() => setActiveCodeTab('html')}
            >
              HTML
            </button>
            <button
              type="button"
              className={`${styles.codeTab} ${activeCodeTab === 'css' ? styles.codeTabActive : ''}`}
              onClick={() => setActiveCodeTab('css')}
            >
              CSS
            </button>
          </div>
          
          <div className={styles.codeContent}>
            <pre className={styles.codeBlock}>
              {activeCodeTab === 'html' ? htmlContent : cssContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
