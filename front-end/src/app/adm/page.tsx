"use client";

import React from 'react';
import styles from './page.module.css';

export default function AdminDashboard() {
  return (
    <div className={styles.dashboardContainer}>
      <h1>Dashboard Administrativo</h1>
      <div className={styles.dashboardCards}>
        <div className={styles.card}>
          <h3>Assinaturas</h3>
          <p className={styles.count}>Gerenciar assinaturas e planos</p>
          <a href="/adm/subscriptions" className={styles.cardLink}>Ver detalhes</a>
        </div>
        <div className={styles.card}>
          <h3>Usuários</h3>
          <p className={styles.count}>Gerenciar usuários do sistema</p>
          <a href="/adm/users" className={styles.cardLink}>Ver detalhes</a>
        </div>
      </div>
    </div>
  );
}
