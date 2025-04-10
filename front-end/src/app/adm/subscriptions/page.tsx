"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import adminStyles from "../admin.module.css";
import styles from "./subscriptions.module.css";

export default function ManageSubscriptions() {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className={adminStyles.pageWrapper}>
      <Header />
      <div className={adminStyles.layoutContainer}>
        <Sidebar isAdmin={true} />
        <main className={`${adminStyles.mainContent} ${loaded ? adminStyles.loaded : ""}`}>
          <div className={adminStyles.contentHeader}>
            <h1 className={adminStyles.pageTitle}>Gerenciar Assinaturas</h1>
            <p className={adminStyles.pageDescription}>
              Gerencie todas as assinaturas e planos disponíveis na plataforma
            </p>
          </div>

          <div className={styles.tabsContainer}>
            <div className={styles.tabsHeader}>
              <button className={`${styles.tabButton} ${styles.active}`}>
                Assinaturas Ativas
              </button>
              <button className={styles.tabButton}>
                Planos
              </button>
              <button className={styles.tabButton}>
                Histórico
              </button>
            </div>
          </div>

          <div className={adminStyles.tableContainer}>
            <div className={adminStyles.tableHeader}>
              <div className={adminStyles.tableSearch}>
                <input type="text" placeholder="Buscar assinaturas..." />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={adminStyles.filterGroup}>
                <select className={adminStyles.filterSelect}>
                  <option value="">Todos os planos</option>
                  <option value="basic">Básico</option>
                  <option value="pro">Profissional</option>
                  <option value="enterprise">Empresarial</option>
                </select>
                <button className={adminStyles.addButton}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Adicionar Assinatura
                </button>
              </div>
            </div>

            <div className={adminStyles.table}>
              <div className={adminStyles.tableRow + ' ' + adminStyles.tableHead}>
                <div className={adminStyles.tableCell}>Usuário</div>
                <div className={adminStyles.tableCell}>Plano</div>
                <div className={adminStyles.tableCell}>Data de Início</div>
                <div className={adminStyles.tableCell}>Próxima Cobrança</div>
                <div className={adminStyles.tableCell}>Status</div>
                <div className={adminStyles.tableCell}>Ações</div>
              </div>

              <div className={adminStyles.tableRow}>
                <div className={adminStyles.tableCell}>
                  <div className={adminStyles.userInfo}>
                    <div className={adminStyles.userAvatar}>MS</div>
                    <div className={adminStyles.userName}>Maria Silva</div>
                  </div>
                </div>
                <div className={adminStyles.tableCell}>
                  <span className={adminStyles.planPro}>Profissional</span>
                </div>
                <div className={adminStyles.tableCell}>10/03/2025</div>
                <div className={adminStyles.tableCell}>10/05/2025</div>
                <div className={adminStyles.tableCell}>
                  <span className={adminStyles.statusActive}>Ativa</span>
                </div>
                <div className={adminStyles.tableCell}>
                  <div className={adminStyles.actionButtons}>
                    <button className={adminStyles.editButton}>Editar</button>
                    <button className={adminStyles.deleteButton}>Cancelar</button>
                  </div>
                </div>
              </div>

              <div className={adminStyles.tableRow}>
                <div className={adminStyles.tableCell}>
                  <div className={adminStyles.userInfo}>
                    <div className={adminStyles.userAvatar}>JC</div>
                    <div className={adminStyles.userName}>João Costa</div>
                  </div>
                </div>
                <div className={adminStyles.tableCell}>
                  <span className={adminStyles.planEnterprise}>Empresarial</span>
                </div>
                <div className={adminStyles.tableCell}>05/01/2025</div>
                <div className={adminStyles.tableCell}>05/07/2025</div>
                <div className={adminStyles.tableCell}>
                  <span className={adminStyles.statusActive}>Ativa</span>
                </div>
                <div className={adminStyles.tableCell}>
                  <div className={adminStyles.actionButtons}>
                    <button className={adminStyles.editButton}>Editar</button>
                    <button className={adminStyles.deleteButton}>Cancelar</button>
                  </div>
                </div>
              </div>

              <div className={adminStyles.tableRow}>
                <div className={adminStyles.tableCell}>
                  <div className={adminStyles.userInfo}>
                    <div className={adminStyles.userAvatar}>LR</div>
                    <div className={adminStyles.userName}>Lucas Ribeiro</div>
                  </div>
                </div>
                <div className={adminStyles.tableCell}>
                  <span className={adminStyles.planBasic}>Básico</span>
                </div>
                <div className={adminStyles.tableCell}>15/02/2025</div>
                <div className={adminStyles.tableCell}>15/03/2025</div>
                <div className={adminStyles.tableCell}>
                  <span className={adminStyles.statusPending}>Pendente</span>
                </div>
                <div className={adminStyles.tableCell}>
                  <div className={adminStyles.actionButtons}>
                    <button className={adminStyles.editButton}>Editar</button>
                    <button className={adminStyles.deleteButton}>Cancelar</button>
                  </div>
                </div>
              </div>
            </div>

            <div className={adminStyles.pagination}>
              <button className={adminStyles.paginationButton}>Anterior</button>
              <div className={adminStyles.paginationNumbers}>
                <button className={adminStyles.paginationNumber + ' ' + adminStyles.active}>1</button>
                <button className={adminStyles.paginationNumber}>2</button>
                <button className={adminStyles.paginationNumber}>3</button>
                <span>...</span>
                <button className={adminStyles.paginationNumber}>8</button>
              </div>
              <button className={adminStyles.paginationButton}>Próximo</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
