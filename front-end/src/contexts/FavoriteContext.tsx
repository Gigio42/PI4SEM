'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type FavoriteStateMap = Record<string, boolean>;

interface FavoriteContextType {
  favoriteStates: FavoriteStateMap;
  updateFavoriteState: (componentId: number, userId: number, isFavorite: boolean) => void;
  subscribeToFavoriteChanges: (callback: () => void) => () => void;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export function FavoriteProvider({ children }: { children: React.ReactNode }) {
  const [favoriteStates, setFavoriteStates] = useState<FavoriteStateMap>({});
  const [changeListeners, setChangeListeners] = useState<Array<() => void>>([]);

  // Update favorite state for a specific component
  const updateFavoriteState = useCallback((componentId: number, userId: number, isFavorite: boolean) => {
    const key = `${userId}_${componentId}`;
    setFavoriteStates(prev => {
      // Only update if the state is actually different
      if (prev[key] === isFavorite) {
        return prev;
      }
      return {
        ...prev,
        [key]: isFavorite
      };
    });
  }, []);
  
  // Optimize notification by using useCallback to prevent recreating this function
  const notifyListeners = useCallback(() => {
    changeListeners.forEach(listener => listener());
  }, [changeListeners]);
  
  // Watch for changes in favoriteStates and notify listeners
  useEffect(() => {
    notifyListeners();
  }, [favoriteStates, notifyListeners]);

  // Subscribe to favorite changes and return unsubscribe function
  const subscribeToFavoriteChanges = useCallback((callback: () => void) => {
    setChangeListeners(prev => [...prev, callback]);
    
    // Return unsubscribe function
    return () => {
      setChangeListeners(prev => prev.filter(listener => listener !== callback));
    };
  }, []);

  // Memoize the context value to prevent unnecessary renders
  const value = React.useMemo(() => ({
    favoriteStates,
    updateFavoriteState,
    subscribeToFavoriteChanges
  }), [favoriteStates, updateFavoriteState, subscribeToFavoriteChanges]);

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorite() {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorite must be used within a FavoriteProvider');
  }
  return context;
}
