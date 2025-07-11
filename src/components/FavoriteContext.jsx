import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const fetchFavorites = async () => {
    if (!userId || !token) return;

    try {
      const res = await axios.get(`https://localhost:7098/api/Favorite/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data);
    } catch (err) {
      console.error("Favoriler alınamadı:", err);
    }
  };

  const addFavorite = async (productId) => {
    if (!userId || !token) return;

    try {
      const payload = {
        UserId: parseInt(userId),
        ProductId: parseInt(productId)
      };

      await axios.post('https://localhost:7098/api/Favorite/add', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Favorileri yeniden çek
      await fetchFavorites();
    } catch (error) {
      console.error('Favori ekleme hatası:', error);
      throw error;
    }
  };

  const removeFavorite = async (productId) => {
    if (!userId || !token) return;

    try {
      const payload = {
        UserId: parseInt(userId),
        ProductId: parseInt(productId)
      };

      await axios.delete('https://localhost:7098/api/Favorite/remove', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: payload
      });

      // Favorileri yeniden çek
      await fetchFavorites();
    } catch (error) {
      console.error('Favori silme hatası:', error);
      throw error;
    }
  };

  const toggleFavorite = async (productId) => {
    const isFavorited = favorites.some(fav => fav.productId === productId);
    
    if (isFavorited) {
      await removeFavorite(productId);
    } else {
      await addFavorite(productId);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [userId, token]);

  // Otomatik yenileme - her 5 saniyede bir favorileri güncelle
  useEffect(() => {
    if (!userId || !token) return;

    const interval = setInterval(() => {
      fetchFavorites();
    }, 5000); // 5 saniye

    return () => clearInterval(interval);
  }, [userId, token]);

  return (
    <FavoriteContext.Provider value={{ 
      favorites, 
      fetchFavorites, 
      addFavorite, 
      removeFavorite, 
      toggleFavorite,
      favoritesCount: favorites.length 
    }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoriteContext);
