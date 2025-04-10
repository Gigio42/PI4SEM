"use client";

import { useState, useEffect } from "react";
import styles from "./home.module.css";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";

const cssStyles = [
  { id: 1, name: "Estilo Moderno", description: "Um design limpo e moderno." },
  { id: 2, name: "Estilo Minimalista", description: "Foco na simplicidade e funcionalidade." },
  { id: 3, name: "Estilo Retro", description: "Design inspirado nos anos 80 e 90." },
  { id: 4, name: "Estilo Futurista", description: "Visual inovador e tecnológico." },
  { id: 5, name: "Estilo Neumórfico", description: "Design suave com efeito 3D sutil." },
  { id: 6, name: "Estilo Glassmórfico", description: "Visual com efeito de vidro translúcido." },
];

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);
    return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layoutContainer}>
        {/* Sidebar para navegação */}
        <Sidebar isAdmin={false} />
        <main className={`${styles.mainContent} ${loaded ? styles.loaded : ""}`}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Estilos de CSS Disponíveis</h1>
            <p className={styles.pageDescription}>
              Explore nossa coleção de estilos para seus projetos UX
            </p>
          </div>
          
          <div className={styles.grid}>
            {cssStyles.map((style) => (
              <div key={style.id} className={styles.card}>
                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{style.name}</h2>
                  <p className={styles.cardDescription}>{style.description}</p>
                </div>
                <div className={styles.cardFooter}>
                  <button className={styles.cardButton}>Visualizar</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}