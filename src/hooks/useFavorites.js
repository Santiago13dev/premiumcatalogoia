import { useState, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage('ai-catalog-favorites', []);

  const addFavorite = (componentId) => {
    if (!favorites.includes(componentId)) {
      setFavorites([...favorites, componentId]);
      return true;
    }
    return false;
  };

  const removeFavorite = (componentId) => {
    setFavorites(favorites.filter(id => id !== componentId));
  };

  const toggleFavorite = (componentId) => {
    if (favorites.includes(componentId)) {
      removeFavorite(componentId);
      return false;
    } else {
      addFavorite(componentId);
      return true;
    }
  };

  const isFavorite = (componentId) => {
    return favorites.includes(componentId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites
  };
}

export default useFavorites;