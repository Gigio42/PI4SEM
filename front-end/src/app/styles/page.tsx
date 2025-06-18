"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header/Header";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import { useNotification } from "@/contexts/NotificationContext";
import styles from "../components/components.module.css";
import stylesPage from "./styles.module.css";

interface StyleCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
  examples: StyleExample[];
}

interface StyleExample {
  id: number;
  name: string;
  preview: string;
  cssCode: string;
  htmlCode: string;
  category: string;
  isPremium?: boolean;
  backgroundColor?: string;
}

export default function StylesPage() {
  const [loaded, setLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStyle, setSelectedStyle] = useState<StyleExample | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { showToast } = useNotification();

  const styleCategories: StyleCategory[] = [
    {
      id: "buttons",
      name: "Botões",
      description: "Estilos modernos para botões interativos",
      icon: "🔘",
      count: 24,
      examples: [
        {
          id: 1,
          name: "Botão Glassmórfico",
          preview: `<button class="glass-btn">Clique aqui</button>`,
          htmlCode: `<button class="glass-btn">Clique aqui</button>`,
          cssCode: `.glass-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
}
.glass-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}`,
          category: "buttons",
          backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        },
        {
          id: 2,
          name: "Botão Neon",
          preview: `<button class="neon-btn">Neon Effect</button>`,
          htmlCode: `<button class="neon-btn">Neon Effect</button>`,
          cssCode: `.neon-btn {
  background: transparent;
  border: 2px solid #00ff88;
  color: #00ff88;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
}
.neon-btn:hover {
  color: #000;
  background: #00ff88;
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.8);
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}`,
          category: "buttons",
          backgroundColor: "#1a1a1a",
          isPremium: true,
        },
        {
          id: 5,
          name: "Botão Gradiente",
          preview: `<button class="gradient-btn">Gradient Button</button>`,
          htmlCode: `<button class="gradient-btn">Gradient Button</button>`,
          cssCode: `.gradient-btn {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
.gradient-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  filter: brightness(1.1);
}`,
          category: "buttons",
          backgroundColor: "#f8f9fa",
        },
      ],
    },
    {
      id: "cards",
      name: "Cards",
      description: "Designs de cards para diferentes contextos",
      icon: "🃏",
      count: 18,
      examples: [
        {
          id: 3,
          name: "Card Flutuante",
          preview: `<div class="floating-card"><h3>Card Title</h3><p>Este é um exemplo de card com efeito flutuante elegante.</p></div>`,
          htmlCode: `<div class="floating-card">
  <h3>Card Title</h3>
  <p>Este é um exemplo de card com efeito flutuante elegante.</p>
</div>`,
          cssCode: `.floating-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  max-width: 300px;
  margin: 20px auto;
}
.floating-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}
.floating-card h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}
.floating-card p {
  margin: 0;
  color: #666;
  line-height: 1.5;
  font-size: 14px;
}`,
          category: "cards",
          backgroundColor: "#f8f9fa",
        },
        {
          id: 6,
          name: "Card Glassmórfico",
          preview: `<div class="glass-card"><h3>Glass Card</h3><p>Card com efeito de vidro moderno.</p></div>`,
          htmlCode: `<div class="glass-card">
  <h3>Glass Card</h3>
  <p>Card com efeito de vidro moderno.</p>
</div>`,
          cssCode: `.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 24px;
  color: white;
  max-width: 300px;
  margin: 20px auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
.glass-card h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
}
.glass-card p {
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
  font-size: 14px;
}`,
          category: "cards",
          backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          isPremium: true,
        },
      ],
    },
    {
      id: "animations",
      name: "Animações",
      description: "Efeitos de animação para enriquecer a UX",
      icon: "⚡",
      count: 32,
      examples: [
        {
          id: 4,
          name: "Loading Pulse",
          preview: `<div class="pulse-loader"></div>`,
          htmlCode: `<div class="pulse-loader"></div>`,
          cssCode: `.pulse-loader {
  width: 40px;
  height: 40px;
  background: #6366f1;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
  margin: 20px auto;
}
@keyframes pulse {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}`,
          category: "animations",
          backgroundColor: "#f8f9fa",
          isPremium: true,
        },
      ],
    },
  ];

  useEffect(() => {
    setLoaded(true);
  }, []);

  const allStyles = styleCategories.flatMap((category) => category.examples);
  const filteredStyles = selectedCategory === "all" ? allStyles : allStyles.filter((style) => style.category === selectedCategory);

  const handleCopyCSS = (cssCode: string, styleName: string) => {
    navigator.clipboard.writeText(cssCode);
    showToast(`${styleName} copiado!`, "success");
  };

  const handlePreviewStyle = (style: StyleExample) => {
    setSelectedStyle(style);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedStyle(null);
  };

  const generatePreviewHTML = (htmlCode: string, cssCode: string) => {
    return `
      <style>
        /* Reset básico para o preview */
        .preview-wrapper * { box-sizing: border-box; }
        .preview-wrapper { 
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          margin: 0; 
          padding: 0; 
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Estilos do componente */
        ${cssCode}
      </style>
      <div class="preview-wrapper">${htmlCode}</div>
    `;
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layoutContainer}>
        <Sidebar />
        <main className={`${styles.mainContent} ${loaded ? styles.loaded : ""}`}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Biblioteca de Estilos</h1>
            <p className={styles.pageDescription}>Explore nossa coleção de estilos CSS prontos para uso em seus projetos</p>
          </div>

          {/* Categorias */}
          <div className={stylesPage.categoriesSection}>
            <h2 className={stylesPage.sectionTitle}>Categorias de Estilos</h2>
            <div className={stylesPage.categoriesGrid}>
              <div className={`${stylesPage.categoryCard} ${selectedCategory === "all" ? stylesPage.active : ""}`} onClick={() => setSelectedCategory("all")}>
                <div className={stylesPage.categoryIcon}>🎨</div>
                <h3>Todos os Estilos</h3>
                <p>{allStyles.length} estilos disponíveis</p>
              </div>
              {styleCategories.map((category) => (
                <div
                  key={category.id}
                  className={`${stylesPage.categoryCard} ${selectedCategory === category.id ? stylesPage.active : ""}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className={stylesPage.categoryIcon}>{category.icon}</div>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <span className={stylesPage.categoryCount}>{category.count} estilos</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estilos Filtrados */}
          <div className={stylesPage.stylesSection}>
            <div className={stylesPage.sectionHeader}>
              <h2 className={stylesPage.sectionTitle}>{selectedCategory === "all" ? "Todos os Estilos" : styleCategories.find((cat) => cat.id === selectedCategory)?.name}</h2>
              <span className={stylesPage.resultsCount}>{filteredStyles.length} estilos encontrados</span>
            </div>

            <div className={styles.componentsGrid}>
              {filteredStyles.map((style) => (
                <div key={style.id} className={stylesPage.styleCard}>
                  <div className={stylesPage.styleHeader}>
                    <h3 className={stylesPage.styleName}>{style.name}</h3>
                    {style.isPremium && <span className={stylesPage.premiumBadge}>Premium</span>}
                  </div>

                  <div
                    className={stylesPage.stylePreview}
                    style={{
                      background: style.backgroundColor || "#f8fafc",
                    }}
                  >
                    <div
                      className={stylesPage.previewFrame}
                      dangerouslySetInnerHTML={{
                        __html: generatePreviewHTML(style.htmlCode, style.cssCode),
                      }}
                    />
                    <div className={stylesPage.previewOverlay}>
                      <button className={stylesPage.previewButton} onClick={() => handlePreviewStyle(style)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        Visualizar
                      </button>
                    </div>
                  </div>

                  <div className={stylesPage.styleActions}>
                    <button className={stylesPage.copyButton} onClick={() => handleCopyCSS(style.cssCode, style.name)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M5 15H4A2 2 0 0 1 2 13V4A2 2 0 0 1 4 2H13A2 2 0 0 1 15 4V5" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      Copiar CSS
                    </button>
                    <button className={stylesPage.viewButton} onClick={() => handlePreviewStyle(style)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal de Preview */}
          {showPreview && selectedStyle && (
            <div className={stylesPage.modalOverlay} onClick={closePreview}>
              <div className={stylesPage.previewModal} onClick={(e) => e.stopPropagation()}>
                <div className={stylesPage.modalHeader}>
                  <h2>{selectedStyle.name}</h2>
                  <button className={stylesPage.closeButton} onClick={closePreview}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <div className={stylesPage.modalContent}>
                  <div className={stylesPage.previewSection}>
                    <h3>Preview</h3>
                    <div
                      className={stylesPage.largePreviewFrame}
                      style={{
                        background: selectedStyle.backgroundColor || "#f8fafc",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: generatePreviewHTML(selectedStyle.htmlCode, selectedStyle.cssCode),
                      }}
                    />
                  </div>

                  <div className={stylesPage.codeSection}>
                    <div className={stylesPage.codeHeader}>
                      <h3>HTML</h3>
                      <button className={stylesPage.copyCodeButton} onClick={() => handleCopyCSS(selectedStyle.htmlCode, `HTML do ${selectedStyle.name}`)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                          <path d="M5 15H4A2 2 0 0 1 2 13V4A2 2 0 0 1 4 2H13A2 2 0 0 1 15 4V5" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        Copiar HTML
                      </button>
                    </div>
                    <pre className={stylesPage.codeBlock}>
                      <code>{selectedStyle.htmlCode}</code>
                    </pre>

                    <div className={stylesPage.codeHeader} style={{ marginTop: "1.5rem" }}>
                      <h3>CSS</h3>
                      <button className={stylesPage.copyCodeButton} onClick={() => handleCopyCSS(selectedStyle.cssCode, `CSS do ${selectedStyle.name}`)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                          <path d="M5 15H4A2 2 0 0 1 2 13V4A2 2 0 0 1 4 2H13A2 2 0 0 1 15 4V5" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        Copiar CSS
                      </button>
                    </div>
                    <pre className={stylesPage.codeBlock}>
                      <code>{selectedStyle.cssCode}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}