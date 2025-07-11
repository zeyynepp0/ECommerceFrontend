import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiShoppingCart, 
  FiHeart, 
  FiStar, 
  FiChevronLeft,
  FiShare2,
  FiTruck,
  FiCheckCircle,
  FiCreditCard,
  FiMinus,
  FiPlus,
  FiMessageSquare
} from 'react-icons/fi';
import axios from 'axios';
import ReviewForm from '../components/ReviewForm';
import ReviewItem from '../components/ReviewItem';
import '../css/ProductDetailsPage.css';
import { useCart } from '../components/CartContext';
import { useUser } from '../components/UserContext';
import { useFavorites } from '../components/FavoriteContext';

const ProductDetailsPage = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useUser();
  const { favorites, toggleFavorite, fetchFavorites } = useFavorites();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const { addToCart, fetchCartFromBackend } = useCart();
  const images = product?.imageUrl ? [product.imageUrl] : [];
  const mainImage = images[selectedImage] || product?.imageUrl || '';

  // Check if product is favorited
  const isFavorited = favorites.some(fav => fav.productId === parseInt(id));

  // Ürün detaylarını, ilgili ürünleri ve yorumları çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, relatedRes, reviewsRes] = await Promise.all([
          axios.get(`https://localhost:7098/api/Product/${id}`),
          axios.get(`https://localhost:7098/api/Product/related/${id}`),
          axios.get(`https://localhost:7098/api/Review?productId=${id}`)
        ]);
        setProduct(productRes.data);
        setRelatedProducts(relatedRes.data || []);
        setReviews(reviewsRes.data || []);
      } catch (error) {
        console.error('Veri çekme hatası:', error);
        if (error.response?.status === 404) {
          // Ürün bulunamadı
          setProduct(null);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleFavoriteClick = async () => {
    if (!isLoggedIn) {
      alert('Favorilere eklemek için giriş yapmalısınız!');
      return;
    }

    setIsFavoriteLoading(true);
    try {
      await toggleFavorite(parseInt(id));
      
      // Header'ı güncelle
      fetchFavorites();
    } catch (error) {
      console.error('Favori işlemi başarısız:', error);
      alert('Favori işlemi başarısız oldu!');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleQuantityChange = (value) => {
    const newValue = Math.max(1, Math.min(99, quantity + value));
    setQuantity(newValue);
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      alert('Sepete eklemek için giriş yapmalısınız!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Backend'e sepete ekle
      const response = await axios.post('https://localhost:7098/api/CartItem', {
        userId: userId,
        productId: product.id,
        quantity: quantity
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        // Frontend CartContext'e de ekle
        const item = {
          id: product.id,
          name: product.name,
          price: product.price || 0,
          image: product.imageUrl,
          quantity: quantity
        };
        addToCart(item);
        
        // Header'ı güncelle
        fetchCartFromBackend();
        
        // Başarı mesajı
        alert('Ürün sepete eklendi!');
        
        // Sepet animasyonu için
        const cartButton = document.querySelector('.cart-notification');
        if (cartButton) {
          cartButton.classList.add('animate');
          setTimeout(() => cartButton.classList.remove('animate'), 1000);
        }
      }
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      alert('Sepete ekleme başarısız oldu!');
    }
  };

  const handleReviewSubmit = (reviewData) => {
    // API'ye yorum gönderme
    axios.post('/api/reviews', { ...reviewData, productId: id })
      .then(res => {
        setReviews([...reviews, res.data]);
        setShowReviewForm(false);
      })
      .catch(err => console.error('Yorum gönderme hatası:', err));
  };

  if (loading) {
    return (
      <div className={`product-details-page ${darkMode ? 'dark' : ''}`}>
        <div className="product-details-container">
          <div className="loading-spinner">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`product-details-page ${darkMode ? 'dark' : ''}`}>
        <div className="product-details-container">
          <div className="product-not-found">
            <h2>Ürün Bulunamadı</h2>
            <p>Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
            <button onClick={() => navigate('/products')} className="back-to-products">
              Tüm Ürünlere Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`product-details-page ${darkMode ? 'dark' : ''}`}>
      <div className="product-details-container">
        {/* Üst Navigasyon */}
        <div className="breadcrumb-nav">
          <button onClick={() => navigate(-1)} className="back-button">
            <FiChevronLeft /> Geri
          </button>
          <span>
            {product.category?.name || 'Kategori Yok'}
          </span>
        </div>

        {/* Ürün Detayları */}
        <div className="product-main">
          {/* Ürün Görselleri */}
          <div className="product-images">
            {images.length > 1 && (
              <div className="thumbnail-list">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img || '/images/default-product.jpg'}
                    alt={`${product.name} ${index + 1}`}
                    className={selectedImage === index ? 'active' : ''}
                    onClick={() => setSelectedImage(index)}
                    onError={(e) => {
                      e.target.src = '/images/default-product.jpg';
                    }}
                  />
                ))}
              </div>
            )}
            <div className="main-image">
              <img 
                src={mainImage || '/images/default-product.jpg'} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = '/images/default-product.jpg';
                }}
              />
            </div>
          </div>

          {/* Ürün Bilgileri */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-meta">
              <div className="product-rating">
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    fill={i < Math.floor(product.rating || 0) ? '#FFD700' : 'none'} 
                  />
                ))}
                <span>({product.rating || 0}) {product.reviewCount || 0} Değerlendirme</span>
              </div>
              <div className="product-sku">SKU: {product.sku || 'N/A'}</div>
            </div>

            <div className="product-pricing">
              {product.discount > 0 && (
                <div className="discount-badge">%{product.discount}</div>
              )}
              <div className="price-container">
                <span className="current-price">{(product.price || 0).toFixed(2)}₺</span>
                {product.originalPrice && (
                  <span className="original-price">
                    {product.originalPrice.toFixed(2)}₺
                  </span>
                )}
              </div>
              <div className="tax-info">KDV Dahil</div>
            </div>

            <div className="product-description">
              <h3>Ürün Açıklaması</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <FiMinus />
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 99}
                >
                  <FiPlus />
                </button>
              </div>
              <button 
                className="add-to-cart"
                onClick={handleAddToCart}
              >
                <FiShoppingCart /> Sepete Ekle
              </button>
              <button 
                className={`wishlist-button ${isFavorited ? 'favorited' : ''} ${isFavoriteLoading ? 'loading' : ''}`}
                onClick={handleFavoriteClick}
                disabled={isFavoriteLoading}
              >
                <FiHeart fill={isFavorited ? '#e74c3c' : 'none'} />
                {isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              </button>
            </div>

            <div className="delivery-info">
              <div className="delivery-option">
                <FiTruck />
                <div>
                  <strong>Ücretsiz Kargo</strong>
                  <span>Yarın kargoda</span>
                </div>
              </div>
              <div className="delivery-option">
                <FiCheckCircle />
                <div>
                  <strong>Güvenli Alışveriş</strong>
                  <span>256-bit SSL ile korunmaktadır</span>
                </div>
              </div>
              <div className="delivery-option">
                <FiCreditCard />
                <div>
                  <strong>Kolay Ödeme</strong>
                  <span>Tüm kartlara taksit imkanı</span>
                </div>
              </div>
            </div>

            <button className="share-button">
              <FiShare2 /> Paylaş
            </button>
          </div>
        </div>

        {/* Ürün Detayları */}
        <div className="product-specs">
          <h2>Ürün Özellikleri</h2>
          {/* <table>
            <tbody>
              {product.description.map((spec, index) => (
                <tr key={index}>
                  <td>{spec.name}</td>
                  <td>{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table> */}
        </div>

        {/* Kullanıcı Yorumları */}
        <div className="product-reviews">
          <div className="reviews-header">
            <h2>
              <FiMessageSquare /> Kullanıcı Yorumları ({reviews.length})
            </h2>
            <button 
              className="add-review-button"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? 'Vazgeç' : 'Yorum Yap'}
            </button>
          </div>

          {showReviewForm && (
            <ReviewForm 
              onSubmit={handleReviewSubmit}
              darkMode={darkMode}
            />
          )}

          {reviews && reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map(review => (
                <ReviewItem 
                  key={review.id}
                  review={review}
                  darkMode={darkMode}
                />
              ))}
            </div>
          ) : (
            <p className="no-reviews">Henüz yorum yapılmamış</p>
          )}
        </div>

        {/* Benzer Ürünler */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Benzer Ürünler</h2>
            <div className="related-products-grid">
              {relatedProducts.map(product => (
                <div key={product.id} className="related-product-card">
                  <Link to={`/products/${product.id}`} className="related-product-image">
                    <img 
                      src={product.imageUrl || '/images/default-product.jpg'} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/images/default-product.jpg';
                      }}
                    />
                  </Link>
                  <div className="related-product-info">
                    <h3>
                      <Link to={`/products/${product.id}`}>{product.name}</Link>
                    </h3>
                    <div className="related-product-price">
                      {(product.price || 0).toFixed(2)}₺
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;