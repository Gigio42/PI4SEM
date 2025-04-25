import React from 'react';
import styles from '../subscription.module.css';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      <h2 className={styles.errorTitle}>Ocorreu um erro</h2>
      
      <p className={styles.errorDescription}>
        {message}
      </p>
      
      <div className={styles.errorActions}>
        <button 
          className={styles.retryButton}
          onClick={onRetry}
        >
          Tentar novamente
        </button>
        
        <a 
          href="http://localhost:3000/api/subscriptions/plans?onlyActive=true" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.checkServerButton}
        >
          Verificar API
        </a>
      </div>
    </div>
  );
};

export default ErrorState;
