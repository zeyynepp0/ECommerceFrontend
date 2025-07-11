import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import axios from 'axios';
import { useUser } from './UserContext';
import { useCart } from './CartContext';
import '../css/ProductCard.css';

const ProductCard = ({ product, darkMode, onFavoriteChange }) => {
  const { userId, isLoggedIn } = useUser();
  const { addToCart } = useCart();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const price = typeof product.price === 'number' ? product.price : null;
  const discount = typeof product.discount === 'number' ? product.discount : null;

  const hasValidDiscount = price !== null && discount !== null && discount > price;
  const discountPercent = hasValidDiscount
    ? Math.round((1 - price / discount) * 100)
    : null;

  // Check if product is favorited on component mount
  useEffect(() => {
    if (isLoggedIn && userId) {
      checkFavoriteStatus();
    }
  }, [userId, isLoggedIn, product.id]);

  const checkFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://localhost:7098/api/Favorite/check/${userId}/${product.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFavorited(response.data.isFavorited);
    } catch (error) {
      console.error('Favori durumu kontrol edilemedi:', error);
    }
  };

  const handleFavoriteClick = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (!isLoggedIn) {
    alert('Favorilere eklemek için giriş yapmalısınız!');
    return;
  }

  setIsLoading(true);
  const token = localStorage.getItem('token');

  const payload = {
    UserId: parseInt(userId),
    ProductId: parseInt(product.id)
  };

  try {
    if (isFavorited) {
      await axios.delete('https://localhost:7098/api/Favorite/remove', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: payload
      });
      setIsFavorited(false);
    } else {
      await axios.post('https://localhost:7098/api/Favorite/add', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setIsFavorited(true);
    }

    if (onFavoriteChange) {
      onFavoriteChange(); // Favori sekmesinde otomatik güncelleme tetikle
    }
  } catch (error) {
    console.error('Favori işlemi başarısız:', error.response?.data || error.message);
    alert('Favori işlemi başarısız oldu!');
  } finally {
    setIsLoading(false);
  }
};





  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      alert('Sepete eklemek için giriş yapmalısınız!');
      return;
    }

    setIsAddingToCart(true);
    try {
      const token = localStorage.getItem('token');
      
      // Backend'e sepete ekle
      const response = await axios.post('http://localhost:7098/api/CartItem', {
        userId: userId,
        productId: product.id,
        quantity: 1
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        // Frontend CartContext'e de ekle
        const cartItem = {
          id: product.id,
          name: product.name,
          price: product.price || 0,
          image: product.imageUrl,
          quantity: 1
        };
        addToCart(cartItem);
        
        // Başarı mesajı
        alert('Ürün sepete eklendi!');
      }
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      alert('Sepete ekleme başarısız oldu!');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className={`product-card ${darkMode ? 'dark' : ''}`}>
      {hasValidDiscount && (
        <div className="product-badge">%{discountPercent}</div>
      )}

      <button 
        className={`wishlist-button ${isFavorited ? 'favorited' : ''} ${isLoading ? 'loading' : ''}`}
        onClick={handleFavoriteClick}
        disabled={isLoading}
      >
        <FiHeart size={18} fill={isFavorited ? '#e74c3c' : 'none'} />
      </button>

      <Link to={`/products/${product.id}`} className="product-image">
        <img src={product.imageUrl || product.image} alt={product.name} />
      </Link>

      <div className="product-info">
        <span className="product-category">{product.category?.name || "Kategori Yok"}</span>

        <h3 className="product-title">
          <Link to={`/products/${product.id}`}>{product.name || "Ürün İsmi Yok"}</Link>
        </h3>

        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <FiStar 
              key={i}
              fill={i < Math.floor(product.rating || 0) ? '#FFD700' : 'none'}
              color={i < Math.floor(product.rating || 0) ? '#FFD700' : '#ccc'}
            />
          ))}
          <span>({product.rating ?? 0})</span>
        </div>

        <div className="product-pricing">
          {price !== null ? (
            <p>{price.toFixed(2)} ₺</p>
          ) : (
            <p>Fiyat bilgisi yok</p>
          )}

          {hasValidDiscount && (
            <span className="product-discount">
              {discount.toFixed(2)}₺
            </span>
          )}
        </div>

        <button 
          className={`add-to-cart ${isAddingToCart ? 'loading' : ''}`}
          onClick={handleAddToCart}
          disabled={isAddingToCart}
        >
          <FiShoppingCart size={16} />
          {isAddingToCart ? 'Ekleniyor...' : 'Sepete Ekle'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
