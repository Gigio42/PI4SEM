import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Component } from '@/types/component';
import { FavoritosService } from '@/services/FavoritosService';
import styles from '../components-detail.module.css';
import aiStyles from '../components-ai.module.css';
import compStyles from '../components.module.css';
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
  // Este é apenas um exemplo, você deve obter o ID real do usuário logado
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

  const detailContent = (
    <div className={styles.detailSidebar}>      <div className={styles.detailHeader}>
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
          Visualização
        </button>
        <button 
          className={`${styles.detailTab} ${activeTab === 'code' ? styles.active : ''}`}
          onClick={() => setActiveTab('code')}
        >
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
                  Claro
                </button>
                <button
                  type="button"
                  className={`${aiStyles.previewModeButton} ${previewMode === 'dark' ? aiStyles.previewModeActive : ''}`}
                  onClick={() => setPreviewMode('dark')}
                >
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

            <div className={`${aiStyles.componentPreviewContainer} ${previewMode === 'light' ? aiStyles.previewLight : aiStyles.previewDark} ${aiStyles['preview' + previewDevice.charAt(0).toUpperCase() + previewDevice.slice(1)]}`}>
              {component.htmlContent ? (
                <div 
                  className={`${aiStyles.componentPreviewFrame}`}
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
          </div>        )}      </div>      <div className={styles.detailActions}>
        <div className={styles.actionsGroup}>
          <button className={styles.downloadButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download
          </button>        </div>
      </div>
    </div>
  );

  const backdropOverlay = (
    <div className={compStyles.backdropOverlay} onClick={onClose}></div>
  );

  // Renderizando diretamente no root do DOM
  return (
    <>
      {mounted && createPortal(
        <>
          {backdropOverlay}
          {detailContent}
        </>,
        document.body
      )}
    </>
  );
}
