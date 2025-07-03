import React from 'react';

// Suppress useLayoutEffect warning for SSR
if (typeof window === 'undefined') {
  React.useLayoutEffect = React.useEffect;
}

export {};
