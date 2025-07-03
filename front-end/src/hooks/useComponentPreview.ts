import { useState } from 'react';
import { Component } from '@/types/component';

export function useComponentPreview() {
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPreview = (component: Component) => {
    setSelectedComponent(component);
    setIsModalOpen(true);
  };

  const closePreview = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedComponent(null), 300);
  };

  return {
    selectedComponent,
    isModalOpen,
    openPreview,
    closePreview,
  };
}
