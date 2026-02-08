import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'sapphire_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // Storage might be full or disabled
    }
  }, [favorites]);

  const toggleFavorite = useCallback((gameId: number) => {
    setFavorites((prev) => {
      if (prev.includes(gameId)) {
        return prev.filter((id) => id !== gameId);
      }
      return [...prev, gameId];
    });
  }, []);

  const isFavorite = useCallback(
    (gameId: number) => favorites.includes(gameId),
    [favorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
  };
}
