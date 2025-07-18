import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // Redux hook'ları
import { fetchCartFromBackend, addToCart, removeFromCart, updateQuantity, clearCart, selectCartTotal } from '../store/cartSlice';
import { useSelector as useUserSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import '../css/CartPage.css';
import { apiDelete, apiPost, parseApiError } from '../utils/api'; // Ortak API fonksiyonları

const API_BASE = "https://localhost:7098";

const CartPage = ({ darkMode }) => {
  // Redux store'dan kullanıcı bilgilerini alıyoruz
  const { userId, isLoggedIn } = useSelector(state => state.user);
  // Redux store'dan sepet verilerini alıyoruz
  const { cartItems, status, error } = useSelector(state => state.cart);
  // Sepet toplam tutarını selector ile alıyoruz
  const cartTotal = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Kullanıcı giriş yaptığında sepeti backend'den çekiyoruz
  useEffect(() => {
    if (isLoggedIn && userId) {
      dispatch(fetchCartFromBackend(userId));
    }
  }, [isLoggedIn, userId, dispatch]);

  // Ürün miktarını güncelleme fonksiyonu
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;
    const stock = typeof item.stock === 'number' ? item.stock : 99;

    if (newQuantity < 1) return;
    if (newQuantity > stock) {
      alert(`Stok yetersiz! Bu üründen maksimum ${stock} adet ekleyebilirsiniz.`);
      return;
    }

    try {
      // Önce ürünü tamamen sil
      await apiDelete(`https://localhost:7098/api/CartItem/${itemId}`);
      // Sonra yeni miktar > 0 ise tekrar ekle
      if (newQuantity > 0) {
        await apiPost('https://localhost:7098/api/CartItem', {
          userId: userId,
          productId: item.productId,
          quantity: newQuantity
        });
      }
      await dispatch(fetchCartFromBackend(userId));
    } catch (error) {
      alert('Miktar güncellenirken hata oluştu! ' + parseApiError(error));
      await dispatch(fetchCartFromBackend(userId));
    }
  };

  // Sepetten ürün çıkarma fonksiyonu
  const handleRemoveFromCart = async (cartItemId) => {
    try {
      await apiDelete(`https://localhost:7098/api/CartItem/${cartItemId}`);
      await dispatch(fetchCartFromBackend(userId));
    } catch (error) {
      alert('Ürün kaldırılırken hata oluştu! ' + parseApiError(error));
      await dispatch(fetchCartFromBackend(userId));
    }
  };

  // Sepeti temizleme fonksiyonu
  const handleClearCart = async () => {
    dispatch(clearCart());
    try {
      await apiDelete(`https://localhost:7098/api/CartItem/user/${userId}`);
      await dispatch(fetchCartFromBackend(userId));
    } catch (error) {
      alert('Sepet temizlenirken hata oluştu! ' + parseApiError(error));
      await dispatch(fetchCartFromBackend(userId));
    }
  };

  // Alışverişi tamamlama fonksiyonu
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Sepetiniz boş!');
      return;
    }
    navigate('/checkout');
  };

  // Yüklenme durumu
  if (status === 'loading') {
    return <div className="cart-page">Yükleniyor...</div>;
  }

  // Kullanıcı giriş yapmamışsa
  if (!isLoggedIn || !userId) {
    return (
      <div className={`cart-page ${darkMode ? 'dark' : ''}`}>
        <h2>Sepetim</h2>
        <p>Sepetinizi görüntülemek için giriş yapmalısınız.</p>
        <Link to="/login" className="btn-primary">Giriş Yap</Link>
      </div>
    );
  }

  return (
    <div className={`cart-page ${darkMode ? 'dark' : ''}`}>
      <h2>Sepetim</h2>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Sepetiniz boş.</p>
          <Link to="/" className="btn-primary">Alışverişe Devam Et</Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map(item => {
              // Ürün stok ve miktar bilgisi
              const stock = typeof item.stock === 'number' ? item.stock : 0;
              const currentQuantity = item.quantity || 1;
              const itemTotal = (item.price || 0) * currentQuantity;
              return (
                <div key={item.id} className="cart-item">
                  <img 
                    src={item.image ? (item.image.startsWith('http') ? item.image : API_BASE + item.image) : '/images/default-product.jpg'} 
                    alt={item.name || 'Ürün'} 
                    className="cart-item-image"
                    onClick={() => navigate(`/products/${item.id}`)}
                    style={{ cursor: 'pointer' }}
                    onError={(e) => {
                      e.target.src = '/images/default-product.jpg';
                    }}
                  />
                  <div className="cart-item-info">
                    <h4 
                      style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                      onClick={() => navigate(`/products/${item.id}`)}
                    >
                      {item.name || 'Ürün İsmi Yok'}
                    </h4>
                    <p className="cart-item-price">{(item.price || 0).toFixed(2)}₺</p>
                    <div className="cart-item-qty">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, currentQuantity - 1)} 
                        disabled={currentQuantity <= 1}
                        className="qty-btn"
                      >
                        -
                      </button>
                      <span>{currentQuantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, currentQuantity + 1)}
                        className="qty-btn"
                        disabled={currentQuantity >= stock}
                      >
                        +
                      </button>
                    </div>
                    <p className="cart-item-total">
                      {itemTotal.toFixed(2)}₺
                    </p>
                    <button 
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="btn-remove"
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="cart-summary">
            <h3>Sipariş Özeti</h3>
            <div className="summary-item">
              <span>Ara Toplam:</span>
              <span>{cartTotal.toFixed(2)}₺</span>
            </div>
            <div className="summary-item">
              <span>Kargo:</span>
              <span>Ücretsiz</span>
            </div>
            <div className="summary-item total">
              <span>Toplam:</span>
              <span>{cartTotal.toFixed(2)}₺</span>
            </div>
            <div className="cart-actions">
              <button onClick={handleClearCart} className="btn-secondary">
                Sepeti Temizle
              </button>
              <Link to="/" className="btn-secondary">
                Alışverişe Devam Et
              </Link>
              <button onClick={handleCheckout} className="btn-secondary">
                Alışverişi Tamamla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
// Açıklama: Bu sayfa, sepet işlemlerini Redux Toolkit ile merkezi olarak yönetir. Tüm işlemler (ekleme, çıkarma, miktar güncelleme, temizleme) slice üzerinden yapılır. Kodun her adımında Türkçe açıklamalar eklenmiştir. 
// Açıklama: handleUpdateQuantity fonksiyonu artık miktar artırma veya azaltmada önce ürünü siler, sonra yeni miktar kadar tekrar ekler. Kodun her adımında Türkçe açıklamalar eklenmiştir. 
// Açıklama: handleUpdateQuantity azaltma için önce sil, sonra yeni miktar kadar ekler. handleRemoveFromCart sadece apiDelete ve fetchCartFromBackend ile çalışır. Kodun her adımında Türkçe açıklamalar eklenmiştir. 
// Açıklama: Stok kontrolü sadece artırma yönünde yapılır. Sepet verisinde artık ürünün stok bilgisi de bulunur. Kodun her adımında Türkçe açıklamalar eklenmiştir. 
// Açıklama: handleRemoveFromCart fonksiyonu ve kaldır butonu artık backend'in beklediği cartItemId ile çalışır. Kodun her adımında Türkçe açıklamalar eklenmiştir. 