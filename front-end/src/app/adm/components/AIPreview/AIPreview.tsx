"use client";

import React, { useMemo } from 'react';
import styles from './AIPreview.module.css';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface AIPreviewProps {
  html: string;
  css: string;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export default function AIPreview({ 
  html, 
  css, 
  isLoading = false, 
  error = '',
  onRetry 
}: AIPreviewProps) {
  // Sanitize HTML for security
  const sanitizedHtml = useMemo(() => sanitizeHtml(html), [html]);
  
  // Create styling for the iframe
  const styleTag = `<style>${css}</style>`;
  
  // Complete HTML document for the iframe
  const previewContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${styleTag}
      <style>
        body {
          margin: 0;
          padding: 16px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
      </style>
    </head>
    <body>
      ${sanitizedHtml}
    </body>
    </html>
  `;
  
  if (isLoading) {
    return (
      <div className={styles.previewContainer}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.previewContainer}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorMessage}>{error}</p>
          {onRetry && (
            <button className={styles.retryButton} onClick={onRetry}>
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.previewContainer}>
      <iframe
        className={styles.previewFrame}
        srcDoc={previewContent}
        title="Component Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
