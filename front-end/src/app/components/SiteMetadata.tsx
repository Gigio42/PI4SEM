"use client";

import { useEffect, useState } from 'react';

export default function SiteMetadata() {
  const [mounted, setMounted] = useState(false);
  
  // Only execute on client to avoid hydration errors
  useEffect(() => {
    setMounted(true);
    
    // Set default site metadata
    if (typeof document !== 'undefined') {
      document.title = 'UXperiment Labs';
      
      // Update meta description if it exists
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Plataforma de componentes UX/UI para desenvolvedores');
      }
    }
  }, []);
  
  // Don't render anything during SSR
  if (!mounted) return null;
  
  return null;
}
