import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Component } from '@/types/component';
import { FavoritosService } from '@/services/FavoritosService';
import styles from '../components-detail.module.css';
import aiStyles from '../components-ai.module.css';
import FavoriteButton from '@/components/FavoriteButton/FavoriteButton';
import { useNotification } from '@/contexts/NotificationContext';

interface ComponentDetailProps {
  component: Component | null;
  onClose: () => void;
}

export default function ComponentDetail({ component, onClose }: ComponentDetailProps) {
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [mounted, setMounted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const { showToast } = useNotification();
  // ID do usuário atual (normalmente viria de um contexto de autenticação)
  const userId = 1; // Substitua pelo ID real do usuário logado

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (component) {
      checkIsFavorite();
    }
  }, [component]);

  const checkIsFavorite = async () => {
    if (!component) return;
    try {
      setIsLoadingFavorite(true);
      const { isFavorito, favoritoData } = await FavoritosService.checkIsFavorito(userId, component.id);
      setIsFavorite(isFavorito);
      setFavoriteId(favoritoData?.id || null);
    } catch (error) {
      console.error('Erro ao verificar status de favorito:', error);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const toggleFavorite = async () => {
    if (!component) return;
    
    try {
      setIsLoadingFavorite(true);
      
      if (isFavorite && favoriteId) {
        // Remover dos favoritos
        await FavoritosService.removeFavorito(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
        showToast('Componente removido dos favoritos', 'success');
      } else {
        // Adicionar aos favoritos
        const response = await FavoritosService.addFavorito(userId, component.id);
        setIsFavorite(true);
        setFavoriteId(response.id);
        showToast('Componente adicionado aos favoritos', 'success');
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
      showToast('Erro ao atualizar favoritos', 'error');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  if (!component) {
    return null;
  }

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    showToast(`${type} copiado com sucesso!`, 'success');
  };

  const handleDownload = () => {
    // Create a Blob with CSS and HTML content
    const fileContent = `/* ${component.name} CSS */\n${component.cssContent}\n\n/* ${component.name} HTML */\n${component.htmlContent || '<!-- Sem conteúdo HTML -->'}`;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${component.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
    
    // Show toast message
    showToast('Componente baixado com sucesso!', 'success');
  };

  const detailContent = (
    <div className={styles.detailSidebar}>
      <div className={styles.detailHeader}>
        <button 
          type="button" 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fechar detalhes"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className={styles.detailTitle}>{component.name}</h2>
        <FavoriteButton 
          componentId={component.id}
          userId={userId}
          initialState={isFavorite}
          size="medium"
          onToggle={(isFavorited) => {
            if (isFavorited) {
              setIsFavorite(true);
              showToast('Componente adicionado aos favoritos', 'success');
            } else {
              setIsFavorite(false);
              showToast('Componente removido dos favoritos', 'success');
            }
          }}
        />
      </div>

      <div className={styles.detailTabs}>
        <button 
          className={`${styles.detailTab} ${activeTab === 'preview' ? styles.active : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '6px'}}>
            <path d="M12 5.25V3M12 5.25C15.7279 5.25 18.75 8.27208 18.75 12C18.75 15.7279 15.7279 18.75 12 18.75M12 5.25C8.27208 5.25 5.25 8.27208 5.25 12C5.25 15.7279 8.27208 18.75 12 18.75M12 18.75V21M18.75 12H21M3 12H5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Visualização
        </button>
        <button 
          className={`${styles.detailTab} ${activeTab === 'code' ? styles.active : ''}`}
          onClick={() => setActiveTab('code')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '6px'}}>
            <path d="M17 7L21 12L17 17M7 7L3 12L7 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Código
        </button>
      </div>

      <div className={styles.detailContent}>
        {activeTab === 'preview' && (
          <div className={styles.previewSection}>
            <div className={styles.componentInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Categoria:</span>
                <span className={styles.infoValue}>{component.category || 'Outros'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Cor:</span>
                <span className={styles.colorPreview} style={{ backgroundColor: component.color }}></span>
              </div>
              {component.downloads !== undefined && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Downloads:</span>
                  <span className={styles.infoValue}>{component.downloads}</span>
                </div>
              )}
            </div>

            <div className={aiStyles.previewControls}>
              <div className={aiStyles.previewModeToggle}>
                <button
                  type="button"
                  className={`${aiStyles.previewModeButton} ${previewMode === 'light' ? aiStyles.previewModeActive : ''}`}
                  onClick={() => setPreviewMode('light')}
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
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '4px'}}>
                    <path d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM12 21.25C6.89137 21.25 2.75 17.1086 2.75 12H1.25C1.25 17.9371 6.06294 22.75 12 22.75V21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM12 2.75C12.1696 2.75 12.3373 2.75661 12.5034 2.76974L12.64 1.27642C12.4266 1.25879 12.2145 1.25 12 1.25V2.75ZM21.7092 12.2447C21.9234 11.8971 22.0638 11.5043 22.1304 11.093L20.6496 10.8437C20.6078 11.1171 20.5244 11.3815 20.4253 11.469L21.7092 12.2447ZM12.531 3.57467C12.6185 3.47556 12.8829 3.39225 13.1563 3.35036L12.907 1.86964C12.4957 1.93622 12.1029 2.07658 11.7553 2.29085L12.531 3.57467Z" fill="currentColor"/>
                  </svg>
                  Escuro
                </button>
              </div>
            </div>
            
            <div className={aiStyles.previewResponsiveControls}>
              <button 
                className={`${aiStyles.previewResponsiveButton} ${previewDevice === 'desktop' ? aiStyles.previewResponsiveActive : ''}`} 
                title="Desktop"
                onClick={() => setPreviewDevice('desktop')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 21H16M12 17V21M6.8 17H17.2C18.8802 17 19.7202 17 20.362 16.673C20.9265 16.3854 21.3854 15.9265 21.673 15.362C22 14.7202 22 13.8802 22 12.2V7.8C22 6.11984 22 5.27976 21.673 4.63803C21.3854 4.07354 20.9265 3.6146 20.362 3.32698C19.7202 3 18.8802 3 17.2 3H6.8C5.11984 3 4.27976 3 3.63803 3.32698C3.07354 3.6146 2.6146 4.07354 2.32698 4.63803C2 5.27976 2 6.11984 2 7.8V12.2C2 13.8802 2 14.7202 2.32698 15.362C2.6146 15.9265 3.07354 16.3854 3.63803 16.673C4.27976 17 5.11984 17 6.8 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className={`${aiStyles.previewResponsiveButton} ${previewDevice === 'tablet' ? aiStyles.previewResponsiveActive : ''}`} 
                title="Tablet"
                onClick={() => setPreviewDevice('tablet')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 17.5V19.5M9.6 21.5H14.4C16.0509 21.5 16.8763 21.5 17.5 21.1481C18.0353 20.8381 18.4722 20.3539 18.74 19.76C19.05 19.0727 19.05 18.1618 19.05 16.34V7.66C19.05 5.83821 19.05 4.92731 18.74 4.24C18.4722 3.6461 18.0353 3.16188 17.5 2.85192C16.8763 2.5 16.0509 2.5 14.4 2.5H9.6C7.94912 2.5 7.12368 2.5 6.5 2.85192C5.96469 3.16188 5.52777 3.6461 5.26 4.24C4.95 4.92731 4.95 5.83821 4.95 7.66V16.34C4.95 18.1618 4.95 19.0727 5.26 19.76C5.52777 20.3539 5.96469 20.8381 6.5 21.1481C7.12368 21.5 7.94912 21.5 9.6 21.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className={`${aiStyles.previewResponsiveButton} ${previewDevice === 'mobile' ? aiStyles.previewResponsiveActive : ''}`} 
                title="Mobile"
                onClick={() => setPreviewDevice('mobile')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 18V18.01M8.2 22H15.8C16.9201 22 17.4802 22 17.908 21.782C18.2843 21.5903 18.5903 21.2843 18.782 20.908C19 20.4802 19 19.9201 19 18.8V5.2C19 4.07989 19 3.51984 18.782 3.09202C18.5903 2.71569 18.2843 2.40973 17.908 2.21799C17.4802 2 16.9201 2 15.8 2H8.2C7.07989 2 6.51984 2 6.09202 2.21799C5.71569 2.40973 5.40973 2.71569 5.21799 3.09202C5 3.51984 5 4.07989 5 5.2V18.8C5 19.9201 5 20.4802 5.21799 20.908C5.40973 21.2843 5.71569 21.5903 6.09202 21.782C6.51984 22 7.07989 22 8.2 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className={`${aiStyles.componentPreviewContainer} ${previewMode === 'light' ? aiStyles.previewLight : aiStyles.previewDark}`}>
              {component.htmlContent ? (
                <div 
                  className={`${aiStyles.componentPreviewFrame} ${aiStyles['preview' + previewDevice.charAt(0).toUpperCase() + previewDevice.slice(1)]}`}
                  dangerouslySetInnerHTML={{ 
                    __html: `
                    <style>
                      /* Reset básico para o preview */
                      .preview-wrapper * { box-sizing: border-box; }
                      .preview-wrapper { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; }
                      
                      /* Estilos do componente */
                      ${component.cssContent}
                    </style>
                    <div class="preview-wrapper">${component.htmlContent}</div>
                    ` 
                  }}
                />
              ) : (
                <div className={styles.noHtmlPreview} style={{ backgroundColor: component.color }}>
                  <p>Este componente não possui visualização HTML.</p>
                  <p>Cor: {component.color}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className={styles.codeSection}>
            <div className={aiStyles.codeBlock}>
              <div className={aiStyles.codeHeader}>
                <span>HTML</span>
                <button 
                  className={styles.copyButton}
                  onClick={() => handleCopy(component.htmlContent || '', 'HTML')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V17M8 5C8 6.10457 8.89543 7 10 7H14C15.1046 7 16 6.10457 16 5M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5M16 5H18C19.1046 5 20 5.89543 20 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Copiar
                </button>
              </div>
              <pre className={styles.codeContent}>{component.htmlContent || 'Sem conteúdo HTML'}</pre>
            </div>

            <div className={aiStyles.codeBlock}>
              <div className={aiStyles.codeHeader}>
                <span>CSS</span>
                <button 
                  className={styles.copyButton}
                  onClick={() => handleCopy(component.cssContent, 'CSS')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V17M8 5C8 6.10457 8.89543 7 10 7H14C15.1046 7 16 6.10457 16 5M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5M16 5H18C19.1046 5 20 5.89543 20 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Copiar
                </button>
              </div>
              <pre className={styles.codeContent}>{component.cssContent}</pre>
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.detailActions}>
        <div className={styles.actionsGroup}>
          <button 
            className={styles.downloadButton}
            onClick={handleDownload}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizando diretamente no root do DOM
  return (
    <>
      {mounted && createPortal(
        detailContent,
        document.body
      )}
    </>
  );
}
