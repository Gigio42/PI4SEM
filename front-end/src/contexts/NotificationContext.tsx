"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastType } from '@/app/components/Toast/Toast';

type ToastData = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

interface NotificationContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const showToast = (message: string, type: ToastType = 'success', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    // Remover notificações duplicadas
    setToasts((prev) => {
      const filteredToasts = prev.filter(toast => toast.message !== message);
      return [...filteredToasts, { id, message, type, duration }];
    });
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
