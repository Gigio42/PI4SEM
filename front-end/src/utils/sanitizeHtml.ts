"use client";

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML to prevent XSS attacks
 * @param html HTML content to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  // Client-side only
  if (typeof window === 'undefined') {
    return html;
  }
  
  // Configure DOMPurify to allow necessary attributes and tags for components
  const config = {
    ADD_TAGS: ['style'],
    ADD_ATTR: ['target', 'class', 'id', 'tabindex', 'role', 'aria-*', 'data-*'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  };
  
  return DOMPurify.sanitize(html, config);
}
