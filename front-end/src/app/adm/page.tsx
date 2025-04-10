"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminDashboard() {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layoutContainer}>
        <Sidebar isAdmin={true} />
        <main className={`${styles.mainContent} ${loaded ? styles.loaded : ""}`}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Dashboard Administrativo</h1>
            <p className={styles.pageDescription}>
              Gerencie todos os aspectos do UXperiment Labs
            </p>
          </div>
          
          <div className={styles.dashboardGrid}>
            <div className={styles.dashboardCard}>
              <div className={styles.cardHeader}>
                <h2>Usuários</h2>
                <span className={styles.badge}>120</span>
              </div>              <div className={styles.cardBody}>
                <p>Total de usuários registrados na plataforma</p>
              </div>              <div className={styles.cardFooter}>
                <a href="/adm/users" className={styles.cardLink}>Gerenciar usuários</a>
              </div>
            </div>
            
            <div className={styles.dashboardCard}>
              <div className={styles.cardHeader}>
                <h2>Componentes</h2>
                <span className={styles.badge}>45</span>
              </div>              <div className={styles.cardBody}>
                <p>Componentes disponíveis na plataforma</p>
              </div>              <div className={styles.cardFooter}>
                <a href="/adm/components" className={styles.cardLink}>Gerenciar componentes</a>
              </div>
            </div>
            
            <div className={styles.dashboardCard}>
              <div className={styles.cardHeader}>
                <h2>Assinaturas</h2>
                <span className={styles.badge}>38</span>
              </div>              <div className={styles.cardBody}>
                <p>Usuários com assinatura ativa</p>
              </div>              <div className={styles.cardFooter}>
                <a href="/adm/subscriptions" className={styles.cardLink}>Gerenciar assinaturas</a>
              </div>
            </div>
            
            <div className={styles.dashboardCard}>
              <div className={styles.cardHeader}>
                <h2>Receita Mensal</h2>
                <span className={styles.revenue}>R$ 9.450,00</span>
              </div>              <div className={styles.cardBody}>
                <p>Faturamento do mês atual</p>
              </div>              <div className={styles.cardFooter}>
                <a href="/adm/stats" className={styles.cardLink}>Ver estatísticas</a>
              </div>
            </div>
          </div>
          
          <div className={styles.recentActivity}>
            <h2 className={styles.sectionTitle}>Atividade Recente</h2>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.activityContent}>
                  <p><strong>Novo usuário</strong> cadastrado: Maria Silva</p>
                  <span className={styles.activityTime}>15 minutos atrás</span>
                </div>
              </div>
              
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.activityContent}>
                  <p><strong>Nova assinatura</strong> - Plano Premium: João Costa</p>
                  <span className={styles.activityTime}>2 horas atrás</span>
                </div>
              </div>
              
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 13C4 12.4477 4.44772 12 5 12H11C11.5523 12 12 12.4477 12 13V19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13C16 12.4477 16.4477 12 17 12H19C19.5523 12 20 12.4477 20 13V19C20 19.5523 19.5523 20 19 20H17C16.4477 20 16 19.5523 16 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.activityContent}>
                  <p><strong>Novo componente</strong> adicionado: Card Glassmórfico</p>
                  <span className={styles.activityTime}>1 dia atrás</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
