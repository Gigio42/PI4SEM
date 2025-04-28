"use client";

interface SiteTitleProps {
  className?: string;
}

export default function SiteTitle({ className = '' }: SiteTitleProps) {
  // Default site name
  const siteName = 'UXperiment Labs';
  
  return (
    <span className={className}>{siteName}</span>
  );
}
