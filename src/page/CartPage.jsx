import React, { useState, useEffect } from 'react';
import { useCart } from '../components/CartContext';
import { useUser } from '../components/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import '../css/CartPage.css';

const CartPage = ({ darkMode }) => {
  const { isLoggedIn, userId } = useUser();
  const { fetchCartFromBackend } = useCart();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchUserCart();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, userId]);

  const fetchUserCart = async () => {
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
        setCartItems(data || []);
        calculateTotal(data || []);
      } else {
        console.error('Sepet yüklenemedi:', response.status);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Sepet yüklenirken hata:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
    setCartTotal(total);
  };

  const updateQuantity = async (cartItemId, newQuantity, productId) => {
    if (newQuantity < 1) return;

    const cartItem = cartItems.find(item => item.id === cartItemId);
    if (!cartItem) return;
    const stock = typeof cartItem.product?.stock === 'number' ? cartItem.product.stock : 0;
    const currentQuantity = cartItem.quantity || 1;

    if (newQuantity > stock) {
      alert(`Stok yetersiz! Bu üründen maksimum ${stock} adet ekleyebilirsiniz.`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (newQuantity > currentQuantity) {
        // Fark kadar ekle
        const diff = newQuantity - currentQuantity;
        const response = await fetch('https://localhost:7098/api/CartItem', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            productId: productId,
            quantity: diff
          })
        });
        if (!response.ok) throw new Error();
      } else if (newQuantity < currentQuantity) {
        // Azaltma için: önce sil, sonra yeni miktarla ekle
        // 1. Ürünü sil
        await fetch(`https://localhost:7098/api/CartItem/${cartItemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        // 2. Yeni miktar > 0 ise tekrar ekle
        if (newQuantity > 0) {
          const response = await fetch('https://localhost:7098/api/CartItem', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userId,
              productId: productId,
              quantity: newQuantity
            })
          });
          if (!response.ok) throw new Error();
        }
      }
      await fetchUserCart();
      fetchCartFromBackend();
    } catch (error) {
      alert('Miktar güncellenirken bir hata oluştu!');
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:7098/api/CartItem/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchUserCart(); // Sepeti yenile
        fetchCartFromBackend(); // CartContext'i güncelle
      } else {
        console.error('Ürün kaldırılamadı:', response.status);
      }
    } catch (error) {
      console.error('Ürün kaldırılırken hata:', error);
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:7098/api/CartItem/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCartItems([]);
        setCartTotal(0);
        fetchCartFromBackend(); // CartContext'i güncelle
      } else {
        console.error('Sepet temizlenemedi:', response.status);
      }
    } catch (error) {
      console.error('Sepet temizlenirken hata:', error);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Sepetiniz boş!');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return <div className="cart-page">Yükleniyor...</div>;
  }

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
              const stock = typeof item.product?.stock === 'number' ? item.product.stock : 0;
              const currentQuantity = item.quantity || 1;
              const itemTotal = (item.product?.price || 0) * currentQuantity;
              
              return (
                <div key={item.id} className="cart-item">
                  <img 
                    src={item.product?.imageUrl || '/images/default-product.jpg'} 
                    alt={item.product?.name || 'Ürün'} 
                    className="cart-item-image"
                    onClick={() => navigate(`/products/${item.product?.id}`)}
                    style={{ cursor: 'pointer' }}
                    onError={(e) => {
                      e.target.src = '/images/default-product.jpg';
                    }}
                  />
                  <div className="cart-item-info">
                    <h4 
                      style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                      onClick={() => navigate(`/products/${item.product?.id}`)}
                    >
                      {item.product?.name || 'Ürün İsmi Yok'}
                    </h4>
                    <p className="cart-item-price">{(item.product?.price || 0).toFixed(2)}₺</p>
                    <div className="cart-item-qty">
                      <button 
                        onClick={() => updateQuantity(item.id, currentQuantity - 1, item.product?.id)} 
                        disabled={currentQuantity <= 1}
                        className="qty-btn"
                      >
                        -
                      </button>
                      <span>{currentQuantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, currentQuantity + 1, item.product?.id)}
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
                      onClick={() => removeFromCart(item.id)}
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
              <button onClick={clearCart} className="btn-secondary">
                Sepeti Temizle
              </button>
              <Link to="/" className="btn-secondary">
                Alışverişe Devam Et
              </Link>
              <Link to="" className="btn-secondary">
                Alışverişi Tamamla
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage; 