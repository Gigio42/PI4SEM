"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header/Header"; 
import Sidebar from "../../components/Sidebar/Sidebar";
import adminStyles from "../admin.module.css";
import styles from "./settings.module.css";

// Mock settings data - seria buscado de uma API
const mockSettings = {
  general: {
    siteName: "UXperiment Labs",
    siteDescription: "Plataforma de componentes UX/UI para desenvolvedores",
    contactEmail: "contato@uxperimentlabs.com",
    maxUploadSize: 10
  },
  appearance: {
    theme: "system",
    primaryColor: "#6366F1",
    secondaryColor: "#8B5CF6",
    showLoginLogo: true,
    enableDarkMode: true
  },
  security: {
    twoFactorAuth: false,
    passwordExpiry: 90,
    sessionTimeout: 30,
    allowRegistration: true
  },
  notifications: {
    emailNotifications: true,
    componentUpdates: true,
    securityAlerts: true,
    marketingEmails: false
  }
};

export default function Settings() {
  const [loaded, setLoaded] = useState(false); // Controla animação de entrada
  const [isLoading, setIsLoading] = useState(true); // Controla o estado de carregamento inicial
  const [activeTab, setActiveTab] = useState("general"); // Aba ativa
  const [settings, setSettings] = useState(mockSettings); // Configurações atuais (do "banco")
  const [unsavedChanges, setUnsavedChanges] = useState({}); // Alterações não salvas
  const [saving, setSaving] = useState(false); // Controla o estado de salvamento
  const [successMessage, setSuccessMessage] = useState(""); // Mensagem de sucesso
  const [showDiscardModal, setShowDiscardModal] = useState(false); // Controla a visibilidade do modal de descarte

  // Carrega as configurações ao montar o componente
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true); // Inicia o carregamento
      try {
        // Simula atraso da API
        await new Promise(resolve => setTimeout(resolve, 800));

        // Em um cenário real, seria uma chamada de API:
        // const response = await fetch('/api/admin/settings');
        // const data = await response.json();
        // setSettings(data);

        // Usando dados mockados por enquanto
        setSettings(mockSettings);
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        // Tratar erro (ex: mostrar mensagem para o usuário)
      } finally {
        setIsLoading(false); // Finaliza o carregamento
      }
    };

    fetchSettings();
    setLoaded(true); // Ativa a animação de entrada (pode ser ajustado se necessário)
  }, []);

  // Limpa a mensagem de sucesso após exibí-la
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000); // Mensagem some após 3 segundos

      return () => clearTimeout(timer); // Limpa o timeout se o componente desmontar
    }
  }, [successMessage]);

  // Lida com mudanças nos campos do formulário
  const handleChange = (section, field, value) => {
    // Rastreia alterações não salvas
    setUnsavedChanges(prevChanges => ({
      ...prevChanges,
      [`${section}.${field}`]: value
    }));
    // Limpa a mensagem de sucesso ao fazer uma nova alteração
    if (successMessage) setSuccessMessage("");
  };

  // Verifica se um campo específico tem alterações não salvas
  const fieldHasUnsavedChanges = (section, field) => {
    return unsavedChanges.hasOwnProperty(`${section}.${field}`);
  };

  // Obtém o valor atual (não salvo ou das configurações salvas)
  const getCurrentValue = (section, field) => {
    const unsavedKey = `${section}.${field}`;
    return unsavedChanges.hasOwnProperty(unsavedKey)
      ? unsavedChanges[unsavedKey]
      : settings[section]?.[field]; // Usar optional chaining para segurança
  };

  // Lida com o salvamento das alterações
  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(""); // Limpa qualquer mensagem anterior

    try {
      // Aplica as alterações ao objeto de configurações
      // Criando uma cópia profunda para evitar mutações diretas no estado original
      const updatedSettings = JSON.parse(JSON.stringify(settings));

      Object.entries(unsavedChanges).forEach(([key, value]) => {
        const [section, field] = key.split('.');
        if (updatedSettings[section]) { // Garante que a seção existe
          updatedSettings[section][field] = value;
        }
      });

      // Simula requisição à API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Em um cenário real, seria uma chamada de API:
      // await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedSettings)
      // });

      setSettings(updatedSettings); // Atualiza o estado principal com as novas configurações
      setUnsavedChanges({}); // Limpa as alterações não salvas
      setSuccessMessage("Configurações atualizadas com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      // Mostrar mensagem de erro para o usuário
    } finally {
      setSaving(false);
    }
  };

  // Descarta todas as alterações não salvas
  const handleDiscardChanges = () => {
    setUnsavedChanges({});
    setShowDiscardModal(false);
    setSuccessMessage(""); // Limpa a msg de sucesso caso ela estivesse visível
  };

  // Verifica se há qualquer alteração não salva
  const hasAnyUnsavedChanges = Object.keys(unsavedChanges).length > 0;

  // Componente de Loading
  const LoadingSpinner = () => (
    <div className={adminStyles.loadingContainer} aria-live="polite">
      <div className={adminStyles.loadingSpinner}></div>
      <p>Carregando configurações...</p>
    </div>
  );

  // Renderização Principal
  return (
    <div className={adminStyles.pageWrapper}>
      <Header />
      <div className={adminStyles.layoutContainer}>
        <Sidebar isAdmin={true} />
        <main className={`${adminStyles.mainContent} ${loaded ? adminStyles.loaded : ""}`}>
          <div className={adminStyles.contentHeader}>
            <h1 className={adminStyles.pageTitle}>Configurações da Plataforma</h1>
            <p className={adminStyles.pageDescription}>
              Gerencie as configurações gerais do site e da aplicação
            </p>
          </div>

          {successMessage && (
            <div className={styles.successAlert} role="alert" aria-live="polite">
              {/* Ícone de Check */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {successMessage}
            </div>
          )}

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className={styles.settingsContainer}>
              {/* Abas de Navegação */}
              <div className={styles.settingsTabs} role="tablist" aria-orientation="horizontal">
                {['general', 'appearance', 'security', 'notifications'].map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.settingsTab} ${activeTab === tab ? styles.active : ''}`}
                    onClick={() => setActiveTab(tab)}
                    role="tab"
                    aria-selected={activeTab === tab}
                    aria-controls={`${tab}Panel`}
                    id={`${tab}Tab`}
                  >
                    {/* Ícones (simplificado, adicione os SVGs corretos se necessário) */}
                    <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  </button>
                ))}
              </div>

              {/* Conteúdo das Abas */}
              <div className={styles.settingsContent}>
                {/* ----- Painel Geral ----- */}
                <div
                  className={`${styles.settingsPanel} ${activeTab === 'general' ? styles.active : ''}`}
                  id="generalPanel"
                  role="tabpanel"
                  aria-labelledby="generalTab"
                  hidden={activeTab !== 'general'} // Melhora acessibilidade
                >
                  <div className={styles.settingGroup}>
                    <label htmlFor="siteName" className={styles.settingLabel}>Nome do Site</label>
                    <input
                      id="siteName"
                      type="text"
                      className={`${styles.settingInput} ${fieldHasUnsavedChanges('general', 'siteName') ? styles.unsaved : ''}`}
                      value={getCurrentValue('general', 'siteName') ?? ''} // Usar value e fallback ''
                      onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                      aria-describedby="siteNameHelp"
                    />
                    <small id="siteNameHelp" className={styles.settingHelp}>
                      Nome que aparecerá no título do site e emails
                    </small>
                  </div>

                  <div className={styles.settingGroup}>
                    <label htmlFor="siteDescription" className={styles.settingLabel}>Descrição do Site</label>
                    <textarea
                      id="siteDescription"
                      className={`${styles.settingTextarea} ${fieldHasUnsavedChanges('general', 'siteDescription') ? styles.unsaved : ''}`}
                      value={getCurrentValue('general', 'siteDescription') ?? ''} // Usar value
                      onChange={(e) => handleChange('general', 'siteDescription', e.target.value)}
                      rows={3}
                      aria-describedby="siteDescHelp"
                    ></textarea>
                    <small id="siteDescHelp" className={styles.settingHelp}>
                      Uma breve descrição que aparecerá em mecanismos de busca
                    </small>
                  </div>

                  <div className={styles.settingGroup}>
                    <label htmlFor="contactEmail" className={styles.settingLabel}>Email de Contato</label>
                    <input
                      id="contactEmail"
                      type="email"
                      className={`${styles.settingInput} ${fieldHasUnsavedChanges('general', 'contactEmail') ? styles.unsaved : ''}`}
                      value={getCurrentValue('general', 'contactEmail') ?? ''} // Usar value
                      onChange={(e) => handleChange('general', 'contactEmail', e.target.value)}
                      aria-describedby="emailHelp"
                    />
                    <small id="emailHelp" className={styles.settingHelp}>
                      Email para receber mensagens de contato
                    </small>
                  </div>

                  <div className={styles.settingGroup}>
                    <label htmlFor="maxUploadSize" className={styles.settingLabel}>Tamanho Máximo de Upload (MB)</label>
                    <input
                      id="maxUploadSize"
                      type="number"
                      min="1"
                      max="100" // Aumentado o max para exemplo
                      className={`${styles.settingInput} ${fieldHasUnsavedChanges('general', 'maxUploadSize') ? styles.unsaved : ''}`}
                      value={getCurrentValue('general', 'maxUploadSize') ?? 1} // Usar value e fallback 1
                      onChange={(e) => handleChange('general', 'maxUploadSize', parseInt(e.target.value, 10) || 1)} // Parse com base 10 e fallback
                      aria-describedby="uploadHelp"
                    />
                    <small id="uploadHelp" className={styles.settingHelp}>
                      Tamanho máximo permitido para upload de arquivos (entre 1 e 100 MB)
                    </small>
                  </div>
                </div>

                {/* ----- Painel Aparência ----- */}
                <div
                  className={`${styles.settingsPanel} ${activeTab === 'appearance' ? styles.active : ''}`}
                  id="appearancePanel"
                  role="tabpanel"
                  aria-labelledby="appearanceTab"
                  hidden={activeTab !== 'appearance'}
                >
                  <div className={styles.settingGroup}>
                    <label htmlFor="theme" className={styles.settingLabel}>Tema do Site</label>
                    <select
                      id="theme"
                      className={`${styles.settingSelect} ${fieldHasUnsavedChanges('appearance', 'theme') ? styles.unsaved : ''}`}
                      value={getCurrentValue('appearance', 'theme') ?? 'system'} // Usar value
                      onChange={(e) => handleChange('appearance', 'theme', e.target.value)}
                      aria-describedby="themeHelp"
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Escuro</option>
                      <option value="system">Seguir Sistema</option>
                    </select>
                    <small id="themeHelp" className={styles.settingHelp}>
                      Escolha o tema padrão para novos usuários
                    </small>
                  </div>

                   {/* Inputs de Cor */}
                  <div className={styles.settingGroup}>
                    <label htmlFor="primaryColor" className={styles.settingLabel}>Cor Primária</label>
                    <div className={styles.colorPickerWrapper}>
                      <input
                        id="primaryColor"
                        type="color"
                        className={`${styles.colorPicker} ${fieldHasUnsavedChanges('appearance', 'primaryColor') ? styles.unsaved : ''}`}
                        value={getCurrentValue('appearance', 'primaryColor') ?? '#000000'} // Usar value
                        onChange={(e) => handleChange('appearance', 'primaryColor', e.target.value)}
                        aria-describedby="primaryColorHelp"
                      />
                      {/* Input de texto para exibir/editar o código da cor */}
                      <input
                        type="text"
                         className={`${styles.colorCode} ${fieldHasUnsavedChanges('appearance', 'primaryColor') ? styles.unsaved : ''}`}
                        value={getCurrentValue('appearance', 'primaryColor') ?? '#000000'}
                        onChange={(e) => handleChange('appearance', 'primaryColor', e.target.value)}
                         aria-label="Código da Cor Primária"
                         maxLength={7} // # mais 6 hex
                         pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" // Validação básica
                      />
                    </div>
                    <small id="primaryColorHelp" className={styles.settingHelp}>
                      Cor principal da interface (ex: #6366F1)
                    </small>
                  </div>

                  <div className={styles.settingGroup}>
                    <label htmlFor="secondaryColor" className={styles.settingLabel}>Cor Secundária</label>
                     <div className={styles.colorPickerWrapper}>
                      <input
                        id="secondaryColor"
                        type="color"
                        className={`${styles.colorPicker} ${fieldHasUnsavedChanges('appearance', 'secondaryColor') ? styles.unsaved : ''}`}
                        value={getCurrentValue('appearance', 'secondaryColor') ?? '#000000'} // Usar value
                        onChange={(e) => handleChange('appearance', 'secondaryColor', e.target.value)}
                         aria-describedby="secondaryColorHelp"
                      />
                       <input
                         type="text"
                         className={`${styles.colorCode} ${fieldHasUnsavedChanges('appearance', 'secondaryColor') ? styles.unsaved : ''}`}
                         value={getCurrentValue('appearance', 'secondaryColor') ?? '#000000'}
                         onChange={(e) => handleChange('appearance', 'secondaryColor', e.target.value)}
                         aria-label="Código da Cor Secundária"
                         maxLength={7}
                         pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                      />
                     </div>
                    <small id="secondaryColorHelp" className={styles.settingHelp}>
                       Cor secundária para destaques (ex: #8B5CF6)
                    </small>
                   </div>

                  {/* Toggle Switches */}
                  <div className={styles.settingGroup}>
                    <div className={styles.settingToggleRow}>
                       <div>
                        <label htmlFor="showLoginLogo" className={styles.settingLabel}>Exibir Logo na Tela de Login</label>
                         <small className={styles.settingHelp} id="logoHelp">
                          Mostra o logo da empresa na página de login
                        </small>
                       </div>
                       <div className={styles.toggleSwitch}>
                         <input
                          id="showLoginLogo"
                           type="checkbox"
                          checked={!!getCurrentValue('appearance', 'showLoginLogo')} // Usar checked
                           onChange={(e) => handleChange('appearance', 'showLoginLogo', e.target.checked)}
                           aria-describedby="logoHelp"
                        />
                         {/* Labels e spans para o visual do toggle */}
                         <label htmlFor="showLoginLogo" className={styles.toggleLabel}>
                          <span className={styles.toggleInner}></span>
                           <span className={styles.toggleSwitch}></span>
                         </label>
                       </div>
                     </div>
                  </div>

                   <div className={styles.settingGroup}>
                    <div className={styles.settingToggleRow}>
                      <div>
                        <label htmlFor="enableDarkMode" className={styles.settingLabel}>Permitir Modo Escuro</label>
                        <small className={styles.settingHelp} id="darkModeHelp">
                          Permite que usuários alternem entre temas claro e escuro
                         </small>
                      </div>
                       <div className={styles.toggleSwitch}>
                         <input
                          id="enableDarkMode"
                          type="checkbox"
                          checked={!!getCurrentValue('appearance', 'enableDarkMode')} // Usar checked
                          onChange={(e) => handleChange('appearance', 'enableDarkMode', e.target.checked)}
                           aria-describedby="darkModeHelp"
                         />
                        <label htmlFor="enableDarkMode" className={styles.toggleLabel}>
                           <span className={styles.toggleInner}></span>
                          <span className={styles.toggleSwitch}></span>
                        </label>
                       </div>
                    </div>
                  </div>
                </div>

                {/* ----- Painel Segurança ----- */}
                {/* CORREÇÃO: A div agora engloba todo o conteúdo de segurança */}
                <div
                  className={`${styles.settingsPanel} ${activeTab === 'security' ? styles.active : ''}`}
                  id="securityPanel"
                  role="tabpanel"
                  aria-labelledby="securityTab"
                  hidden={activeTab !== 'security'}
                >
                   {/* Toggle Switches */}
                  <div className={styles.settingGroup}>
                     <div className={styles.settingToggleRow}>
                       <div>
                        <label htmlFor="twoFactorAuth" className={styles.settingLabel}>Autenticação de Dois Fatores (2FA)</label>
                        <small className={styles.settingHelp} id="2faHelp">
                          Exigir 2FA para todas as contas de administrador
                         </small>
                       </div>
                      <div className={styles.toggleSwitch}>
                         <input
                          id="twoFactorAuth"
                          type="checkbox"
                          checked={!!getCurrentValue('security', 'twoFactorAuth')} // Usar checked
                          onChange={(e) => handleChange('security', 'twoFactorAuth', e.target.checked)}
                          aria-describedby="2faHelp"
                         />
                        <label htmlFor="twoFactorAuth" className={styles.toggleLabel}>
                           <span className={styles.toggleInner}></span>
                           <span className={styles.toggleSwitch}></span>
                         </label>
                       </div>
                     </div>
                  </div>

                  {/* Inputs Numéricos */}
                  <div className={styles.settingGroup}>
                    <label htmlFor="passwordExpiry" className={styles.settingLabel}>Expiração de Senha (dias)</label>
                     <input
                      id="passwordExpiry"
                      type="number"
                       min="0" // 0 significa nunca expirar
                       max="365"
                       className={`${styles.settingInput} ${fieldHasUnsavedChanges('security', 'passwordExpiry') ? styles.unsaved : ''}`}
                      value={getCurrentValue('security', 'passwordExpiry') ?? 0} // Usar value
                       onChange={(e) => handleChange('security', 'passwordExpiry', parseInt(e.target.value, 10) || 0)}
                      aria-describedby="passwordExpiryHelp"
                    />
                     <small id="passwordExpiryHelp" className={styles.settingHelp}>
                      Número de dias até que as senhas expirem (0 para nunca expirar)
                    </small>
                   </div>

                  <div className={styles.settingGroup}>
                    <label htmlFor="sessionTimeout" className={styles.settingLabel}>Tempo Limite de Sessão (minutos)</label>
                    <input
                       id="sessionTimeout"
                      type="number"
                      min="5" // Mínimo de 5 minutos
                      max="1440" // Máximo de 24 horas
                      className={`${styles.settingInput} ${fieldHasUnsavedChanges('security', 'sessionTimeout') ? styles.unsaved : ''}`}
                      value={getCurrentValue('security', 'sessionTimeout') ?? 30} // Usar value
                      onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value, 10) || 30)}
                       aria-describedby="sessionTimeoutHelp"
                     />
                    <small id="sessionTimeoutHelp" className={styles.settingHelp}>
                      Tempo de inatividade até encerrar sessão do usuário (5-1440 min)
                    </small>
                  </div>

                  {/* Outro Toggle */}
                   <div className={styles.settingGroup}>
                    <div className={styles.settingToggleRow}>
                       <div>
                         <label htmlFor="allowRegistration" className={styles.settingLabel}>Permitir Novos Registros</label>
                        <small className={styles.settingHelp} id="registrationHelp">
                           Permite que novos usuários se registrem na plataforma
                         </small>
                       </div>
                       <div className={styles.toggleSwitch}>
                        <input
                           id="allowRegistration"
                          type="checkbox"
                           checked={!!getCurrentValue('security', 'allowRegistration')} // Usar checked
                           onChange={(e) => handleChange('security', 'allowRegistration', e.target.checked)}
                          aria-describedby="registrationHelp"
                         />
                        <label htmlFor="allowRegistration" className={styles.toggleLabel}>
                           <span className={styles.toggleInner}></span>
                           <span className={styles.toggleSwitch}></span>
                         </label>
                       </div>
                    </div>
                   </div>
                 </div> {/* Fim do Painel de Segurança */}

                {/* ----- Painel Notificações ----- */}
                 <div
                  className={`${styles.settingsPanel} ${activeTab === 'notifications' ? styles.active : ''}`}
                  id="notificationsPanel"
                  role="tabpanel"
                  aria-labelledby="notificationsTab"
                   hidden={activeTab !== 'notifications'}
                >
                  {/* Toggle Principal */}
                  <div className={styles.settingGroup}>
                    <div className={styles.settingToggleRow}>
                      <div>
                         <label htmlFor="emailNotifications" className={styles.settingLabel}>Notificações por Email</label>
                        <small className={styles.settingHelp} id="emailNotifyHelp">
                           Habilitar envio de notificações por email para usuários
                        </small>
                       </div>
                      <div className={styles.toggleSwitch}>
                         <input
                           id="emailNotifications"
                          type="checkbox"
                          checked={!!getCurrentValue('notifications', 'emailNotifications')} // Usar checked
                           onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.checked)}
                           aria-describedby="emailNotifyHelp"
                         />
                         <label htmlFor="emailNotifications" className={styles.toggleLabel}>
                           <span className={styles.toggleInner}></span>
                           <span className={styles.toggleSwitch}></span>
                        </label>
                       </div>
                    </div>
                  </div>

                  {/* Toggles Condicionais */}
                  <div className={styles.settingGroup}>
                    <div className={styles.settingToggleRow}>
                       <div>
                         <label htmlFor="componentUpdates" className={styles.settingLabel}>Atualizações de Componentes</label>
                        <small className={styles.settingHelp} id="componentUpdatesHelp">
                           Notificar usuários sobre atualizações nos componentes
                        </small>
                       </div>
                       <div className={styles.toggleSwitch}>
                        <input
                          id="componentUpdates"
                          type="checkbox"
                          checked={!!getCurrentValue('notifications', 'componentUpdates')} // Usar checked
                           onChange={(e) => handleChange('notifications', 'componentUpdates', e.target.checked)}
                          disabled={!getCurrentValue('notifications', 'emailNotifications')} // Desabilita se email geral estiver desligado
                           aria-describedby="componentUpdatesHelp"
                        />
                         <label htmlFor="componentUpdates" className={styles.toggleLabel}>
                          <span className={styles.toggleInner}></span>
                           <span className={styles.toggleSwitch}></span>
                        </label>
                       </div>
                     </div>
                  </div>

                  <div className={styles.settingGroup}>
                     <div className={styles.settingToggleRow}>
                      <div>
                        <label htmlFor="securityAlerts" className={styles.settingLabel}>Alertas de Segurança</label>
                         <small className={styles.settingHelp} id="securityAlertsHelp">
                          Notificar sobre tentativas de login e mudanças de senha
                        </small>
                       </div>
                       <div className={styles.toggleSwitch}>
                         <input
                          id="securityAlerts"
                          type="checkbox"
                          checked={!!getCurrentValue('notifications', 'securityAlerts')} // Usar checked
                           onChange={(e) => handleChange('notifications', 'securityAlerts', e.target.checked)}
                          disabled={!getCurrentValue('notifications', 'emailNotifications')}
                          aria-describedby="securityAlertsHelp"
                         />
                         <label htmlFor="securityAlerts" className={styles.toggleLabel}>
                           <span className={styles.toggleInner}></span>
                          <span className={styles.toggleSwitch}></span>
                        </label>
                       </div>
                    </div>
                   </div>

                  <div className={styles.settingGroup}>
                    <div className={styles.settingToggleRow}>
                       <div>
                         <label htmlFor="marketingEmails" className={styles.settingLabel}>Emails de Marketing</label>
                         <small className={styles.settingHelp} id="marketingHelp">
                          Enviar informações sobre atualizações e promoções
                        </small>
                      </div>
                       <div className={styles.toggleSwitch}>
                         <input
                           id="marketingEmails"
                          type="checkbox"
                           checked={!!getCurrentValue('notifications', 'marketingEmails')} // Usar checked
                           onChange={(e) => handleChange('notifications', 'marketingEmails', e.target.checked)}
                           disabled={!getCurrentValue('notifications', 'emailNotifications')}
                           aria-describedby="marketingHelp"
                        />
                        <label htmlFor="marketingEmails" className={styles.toggleLabel}>
                           <span className={styles.toggleInner}></span>
                           <span className={styles.toggleSwitch}></span>
                         </label>
                       </div>
                     </div>
                  </div>
                </div> {/* Fim do Painel de Notificações */}

              </div> {/* Fim do Conteúdo das Abas */}

              {/* Botões de Ação (Salvar/Descartar) */}
              {hasAnyUnsavedChanges && (
                <div className={styles.settingsActions}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => setShowDiscardModal(true)}
                    disabled={saving} // Desabilitar enquanto salva
                    aria-label="Descartar alterações não salvas"
                  >
                    Descartar Alterações
                  </button>
                  <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={saving}
                    aria-label="Salvar configurações"
                    aria-live="polite" // Anuncia mudança de estado (saving)
                  >
                    {saving ? (
                      <>
                        <span className={styles.smallSpinner} aria-hidden="true"></span> Salvando...
                      </>
                    ) : 'Salvar Configurações'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Modal de Confirmação para Descartar */}
          {showDiscardModal && (
            <div className={styles.modalOverlay} onClick={() => setShowDiscardModal(false)}>
              <div
                className={styles.modalContent}
                role="dialog"
                aria-modal="true" // Indica que é modal
                aria-labelledby="discardModalTitle"
                aria-describedby="discardModalDesc"
                onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar dentro
              >
                <h2 id="discardModalTitle" className={styles.modalTitle}>Descartar alterações?</h2>
                <p id="discardModalDesc">
                  Você tem alterações não salvas. Tem certeza que deseja descartá-las? Esta ação não pode ser desfeita.
                </p>
                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => setShowDiscardModal(false)}
                    aria-label="Cancelar e continuar editando"
                  >
                    Continuar Editando
                  </button>
                  <button
                    className={styles.dangerButton} // Estilo para ação destrutiva
                    onClick={handleDiscardChanges}
                    aria-label="Confirmar descarte das alterações"
                  >
                    Descartar Alterações
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}