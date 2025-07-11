import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from './UserContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { isLoggedIn, userId } = useUser();

  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prevItems, item];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Backend'den sepet verilerini çek
  const fetchCartFromBackend = async () => {
    if (!isLoggedIn || !userId) {
      setCartItems([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:7098/api/CartItem/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Backend'den gelen veriyi CartContext formatına çevir
        const formattedItems = data.map(item => ({
          id: item.product?.id || item.productId,
          name: item.product?.name || 'Ürün',
          price: item.product?.price || 0,
          image: item.product?.imageUrl || '/images/default-product.jpg',
          quantity: item.quantity || 1
        }));
        setCartItems(formattedItems);
      }
    } catch (error) {
      console.error('Sepet verileri çekilemedi:', error);
    }
  };

  // Kullanıcı giriş yaptığında sepeti backend'den çek
  useEffect(() => {
    fetchCartFromBackend();
  }, [isLoggedIn, userId]);

  // Otomatik yenileme - her 5 saniyede bir sepeti güncelle
  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    const interval = setInterval(() => {
      fetchCartFromBackend();
    }, 5000); // 5 saniye

    return () => clearInterval(interval);
  }, [isLoggedIn, userId]);

  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity), 0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        fetchCartFromBackend
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);