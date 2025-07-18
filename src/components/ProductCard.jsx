import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux'; // Redux hook'ları
import { addToCart, fetchCartFromBackend } from '../store/cartSlice'; // Sepet işlemleri
import { fetchFavorites, addFavorite, removeFavorite } from '../store/favoriteSlice'; // Favori işlemleri
import { apiPost } from '../utils/api'; // Ortak API fonksiyonları
import '../css/ProductCard.css';

const ProductCard = ({ product, darkMode, onFavoriteChange }) => {
  // Kullanıcı bilgilerini Redux store'dan alıyoruz
  const { userId, isLoggedIn } = useSelector(state => state.user);
  // Sepet verilerini Redux store'dan alıyoruz
  const { cartItems } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  // Favori verilerini Redux store'dan alıyoruz
  const { favorites } = useSelector(state => state.favorite);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const price = typeof product.price === 'number' ? product.price : null;
  const discount = typeof product.discount === 'number' ? product.discount : null;
  const stock = typeof product.stock === 'number' ? product.stock : 0;

  const hasValidDiscount = price !== null && discount !== null && discount > price;
  const discountPercent = hasValidDiscount
    ? Math.round((1 - price / discount) * 100)
    : null;

  // Ürün favori mi?
  const isFavorited = favorites.some(fav => fav.productId === product.id);

  // Sepetteki mevcut miktarı bul
  const cartItem = cartItems.find(item => item.id === product.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  // Favori butonuna tıklanınca
  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      alert('Favorilere eklemek için giriş yapmalısınız!');
      return;
    }
    setIsLoading(true);
    try {
      if (isFavorited) {
        await dispatch(removeFavorite(product.id));
      } else {
        await dispatch(addFavorite(product.id));
      }
      await dispatch(fetchFavorites());
      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } catch (error) {
      alert('Favori işlemi başarısız oldu!');
    } finally {
      setIsLoading(false);
    }
  };

  // Sepete ekle butonuna tıklandığında çalışır
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      alert('Sepete eklemek için giriş yapmalısınız!');
      return;
    }
    // Stok kontrolü
    if (stock === 0) {
      alert('Bu ürün stokta yok!');
      return;
    }
    if (cartQuantity >= stock) {
      alert(`Stok yetersiz! Bu üründen maksimum ${stock} adet ekleyebilirsiniz.`);
      return;
    }
    setIsAddingToCart(true);
    try {
      // Ortak API fonksiyonu ile backend'e sepete ekle
      await apiPost('https://localhost:7098/api/CartItem', {
        userId: userId,
        productId: product.id,
        quantity: 1
      });
      // Redux ile frontend sepetine ekle
      dispatch(addToCart({
        id: product.id,
        name: product.name,
        price: product.price || 0,
        image: product.imageUrl,
        quantity: 1
      }));
      // Sepeti backend'den güncelle
      dispatch(fetchCartFromBackend(userId));
      alert('Ürün sepete eklendi!');
    } catch (error) {
      alert('Sepete ekleme başarısız oldu! ' + error);
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
        <img 
          src={product.imageUrl || product.image || '/images/default-product.jpg'} 
          alt={product.name}
          onError={(e) => {
            e.target.src = '/images/default-product.jpg';
          }}
        />
      </Link>
      <div className="product-info">
        <span className="product-category">{product.categoryName || "Kategori Yok"}</span>
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
          disabled={isAddingToCart || stock === 0 || cartQuantity >= stock}
        >
          <FiShoppingCart size={16} />
          {stock === 0 ? 'Stokta Yok' : (isAddingToCart ? 'Ekleniyor...' : 'Sepete Ekle')}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
// Açıklama: Bu component, favori işlemlerini Redux Toolkit ile yönetir. Favori ekleme ve çıkarma işlemleri Redux store üzerinden yapılır. Kodun her adımında Türkçe açıklamalar eklenmiştir.
// Açıklama: Sepete ekleme işlemi artık ortak apiPost fonksiyonu ile yapılmaktadır. Kodun her adımında Türkçe açıklamalar eklenmiştir.
