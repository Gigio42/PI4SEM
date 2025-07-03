"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ComponentProvider, useComponents, Component } from '@/contexts/ComponentContext';
import { useNotification } from '@/contexts/NotificationContext';
import ComponentActions from './ComponentActions/ComponentActions';
import ComponentCard from '@/app/components/ComponentCard/ComponentCard';
import ComponentPreviewModal from '@/app/components/ComponentPreviewModal/ComponentPreviewModal';
import Header from "@/app/components/Header/Header";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import styles from './components.module.css';
import adminStyles from "../admin.module.css";

function ComponentsPageContent() {
  const [loaded, setLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  
  const {
    components,
    loading,
    error,
    selectedComponent,
    fetchComponents,
    deleteComponent,
    setSelectedComponent,
    clearError,
    apiConnected,
    testAPIConnection
  } = useComponents();

  const { showToast } = useNotification();
  
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const loadComponents = async () => {
      try {
        console.log('🔄 Admin: Loading components...');
        await fetchComponents();
        console.log('✅ Admin: Components loaded successfully');
        setLoaded(true);
        setRetryCount(0);
      } catch (err) {
        console.error('❌ Admin: Failed to load components on mount:', err);
        setLoaded(true); // Marcar como carregado mesmo com erro
        
        // Tentar reconectar automaticamente apenas algumas vezes
        if (retryCount < 3) {
          console.log(`🔄 Admin: Retrying... (${retryCount + 1}/3)`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            loadComponents();
          }, 2000 * (retryCount + 1));
        }
      }
    };

    loadComponents();
  }, [fetchComponents, retryCount]);

  useEffect(() => {
    if (error) {
      showToast(error, { type: 'error' } as any);
      // Não limpar o erro automaticamente para permitir retry manual
    }
  }, [error, showToast]);

  const handleRetry = async () => {
    console.log('🔄 Admin: Manual retry initiated');
    setRetryCount(0);
    clearError();
    try {
      await fetchComponents();
      console.log('✅ Admin: Manual retry successful');
      showToast('Componentes carregados com sucesso!', { type: 'success' } as any);
    } catch (err) {
      console.error('❌ Admin: Manual retry failed:', err);
      showToast('Erro ao recarregar componentes. Verifique a conexão.', { type: 'error' } as any);
    }
  };

  const handleCreateComponent = () => {
    router.push('/adm/components/create');
  };

  const handleEditComponent = (component: Component) => {
    router.push(`/adm/components/create?edit=${component.id}`);
  };

  const handleDeleteComponent = async (component: Component) => {
    if (window.confirm(`Tem certeza que deseja excluir o componente "${component.name}"?`)) {
      try {
        await deleteComponent(component.id);
        showToast('Componente excluído com sucesso!', { type: 'success' } as any);
      } catch (err) {
        console.error('Error deleting component:', err);
      }
    }
  };

  const handlePreview = (component: Component) => {
    setSelectedComponent(component);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setTimeout(() => setSelectedComponent(null), 300);
  };

  return (
    <div className={adminStyles.pageWrapper}>
      <Header />
      <div className={adminStyles.layoutContainer}>
        <Sidebar isAdmin={true} />
        <main className={`${adminStyles.mainContent} ${loaded ? adminStyles.loaded : ""} ${styles.componentsPage}`}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Gerenciar Componentes</h1>
            <p className={styles.pageDescription}>
              Gerencie, crie e organize componentes da biblioteca.
            </p>
            {apiConnected === false && (
              <div className={styles.connectionAlert}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Backend desconectado - Modo offline
              </div>
            )}
          </div>

          <ComponentActions
            onCreateClick={handleCreateComponent}
            onAIGenerateClick={() => router.push('/adm/components/create?tab=ai')}
            onRefresh={handleRetry}
            componentsCount={components.length}
            isLoading={loading}
          />

          {error && (
            <div className={styles.errorAlert}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <strong>Erro ao carregar componentes:</strong>
                <p>{error}</p>
                {apiConnected === false && (
                  <p className={styles.offlineHint}>
                    💡 Verifique se o servidor backend está rodando na porta 3000
                  </p>
                )}
                <button 
                  className={styles.retryButton}
                  onClick={handleRetry}
                  disabled={loading}
                >
                  {loading ? 'Tentando...' : 'Tentar Novamente'}
                </button>
              </div>
            </div>
          )}

          {loading && components.length === 0 && !error ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <span>Conectando com o servidor...</span>
              {retryCount > 0 && (
                <small>Tentativa {retryCount + 1} de 4</small>
              )}
            </div>
          ) : !loading && components.length === 0 && !error ? (
            <div className={styles.emptyState}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M20 7L9 18L4 13"
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <h3 className={styles.emptyTitle}>Banco de dados vazio</h3>
              <p className={styles.emptyDescription}>
                {apiConnected === false 
                  ? 'Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3000.'
                  : 'O banco de dados não possui componentes. Comece criando seu primeiro componente ou gerando um com IA.'
                }
              </p>
              {apiConnected !== false && (
                <div className={styles.emptyActions}>
                  <button 
                    className={styles.createFirstButton}
                    onClick={handleCreateComponent}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Criar Primeiro Componente
                  </button>
                  <button 
                    className={styles.generateFirstButton}
                    onClick={() => router.push('/adm/components/create?tab=ai')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L3.09 8.26L12 14L20.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.09 8.26V15.74L12 22L20.91 15.74V8.26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Gerar com IA
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.componentsGrid}>
              {components.map((component) => (
                <ComponentCard
                  key={component.id}
                  component={component}
                  onPreview={handlePreview}
                  onEdit={handleEditComponent}
                  onDelete={handleDeleteComponent}
                  showAdminActions={true}
                  showFavorite={false}
                  showDetailsLink={false}
                  variant="admin"
                />
              ))}
            </div>
          )}

          {selectedComponent && (
            <ComponentPreviewModal
              isOpen={previewOpen}
              component={selectedComponent}
              onClose={closePreview}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function ComponentsPage() {  return (
    <ComponentProvider>
      <ComponentsPageContent />
    </ComponentProvider>
  );
}
