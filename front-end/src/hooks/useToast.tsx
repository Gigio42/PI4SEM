import { useState, useCallback, useRef, useEffect } from 'react';

export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  position: string;
}

let toastId = 0;
const toasts: Toast[] = [];
const listeners: Set<() => void> = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const useToast = () => {
  const [, forceUpdate] = useState({});
  const listenerRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    const listener = () => forceUpdate({});
    listenerRef.current = listener;
    listeners.add(listener);

    return () => {
      if (listenerRef.current) {
        listeners.delete(listenerRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const toast: Toast = {
      id: `toast-${++toastId}`,
      message,
      type: options.type || 'info',
      duration: options.duration || 4000,
      position: options.position || 'top-right'
    };

    toasts.push(toast);
    notifyListeners();

    // Auto remove after duration
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === toast.id);
      if (index > -1) {
        toasts.splice(index, 1);
        notifyListeners();
      }
    }, toast.duration);

    return toast.id;
  }, []);

  const removeToast = useCallback((id: string) => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      notifyListeners();
    }
  }, []);

  return {
    showToast,
    removeToast,
    toasts: [...toasts]
  };
};
