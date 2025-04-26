import { useState, useCallback } from 'react';

interface ToastOptions {
  duration?: number;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    visible: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    message: '',
    visible: false,
    type: 'info'
  });

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    const { duration = 3000, type = 'info' } = options || {};
    
    setToast({
      message,
      visible: true,
      type
    });

    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, duration);
  }, []);

  return { toast, showToast };
}
