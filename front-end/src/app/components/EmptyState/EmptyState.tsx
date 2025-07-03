import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({ 
  title = "Nenhum componente encontrado",
  description = "Não encontramos componentes que correspondam aos seus critérios de pesquisa.",
  icon,
  action
}: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateContent}>
        {icon && (
          <div className={styles.iconContainer}>
            {icon}
          </div>
        )}
        
        <div className={styles.textContent}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
        
        {action && (
          <div className={styles.actionContainer}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
