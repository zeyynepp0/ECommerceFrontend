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
import { useSelector, useDispatch } from 'react-redux'; // Redux hook'ları
import { addToCart, fetchCartFromBackend } from '../store/cartSlice'; // Sepet işlemleri
import { fetchFavorites, addFavorite, removeFavorite } from '../store/favoriteSlice'; // Favori işlemleri
import { apiGet, apiPost, apiPut, apiDelete, parseApiError } from '../utils/api'; // Ortak API fonksiyonları

const API_BASE = "https://localhost:7098";

const ProductDetailsPage = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Kullanıcı bilgilerini Redux store'dan alıyoruz
  const { userId, isLoggedIn } = useSelector(state => state.user);
  // Sepet verilerini Redux store'dan alıyoruz
  const { cartItems } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  // Favori verilerini Redux store'dan alıyoruz
  const { favorites } = useSelector(state => state.favorite);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const images = product?.imageUrl ? [product.imageUrl.startsWith('http') ? product.imageUrl : API_BASE + product.imageUrl] : [];
  const mainImage = images[selectedImage] || (product?.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : API_BASE + product.imageUrl) : '');

  // Ürün favori mi?
  const isFavorited = favorites.some(fav => fav.productId === parseInt(id));

  // Stok ve sepetteki miktar
  const stock = typeof product?.stock === 'number' ? product.stock : 0;
  // Sepetteki mevcut miktar
  const cartItem = cartItems.find(item => item.id === (product?.id || parseInt(id)));
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  // useEffect ile ürün, ilgili ürünler ve yorumları çekme
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, relatedRes, reviewsRes] = await Promise.all([
          apiGet(`https://localhost:7098/api/Product/${id}`),
          apiGet(`https://localhost:7098/api/Product/related/${id}`),
          apiGet(`https://localhost:7098/api/Review?productId=${id}`)
        ]);
        setProduct(productRes);
        setRelatedProducts(relatedRes || []);
        setReviews(reviewsRes || []);
      } catch (error) {
        console.error('Veri çekme hatası:', error);
        if (error.response?.status === 404) {
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

  // Favori butonuna tıklanınca
  const handleFavoriteClick = async () => {
    if (!isLoggedIn) {
      alert('Favorilere eklemek için giriş yapmalısınız!');
      return;
    }
    setIsFavoriteLoading(true);
    try {
      if (isFavorited) {
        await dispatch(removeFavorite(parseInt(id)));
      } else {
        await dispatch(addFavorite(parseInt(id)));
      }
      await dispatch(fetchFavorites());
    } catch (error) {
      alert('Favori işlemi başarısız oldu!');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleQuantityChange = (value) => {
    // Sepetteki miktar + seçili miktar toplamı stoktan fazla olamaz
    const newValue = Math.max(1, Math.min(stock - cartQuantity, quantity + value));
    setQuantity(newValue);
  };

  // Sepete ekle butonuna tıklandığında çalışır
  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      alert('Sepete eklemek için giriş yapmalısınız!');
      return;
    }
    if (stock === 0) {
      alert('Bu ürün stokta yok!');
      return;
    }
    if (cartQuantity + quantity > stock) {
      alert(`Stok yetersiz! Bu üründen maksimum ${stock} adet ekleyebilirsiniz.`);
      return;
    }
    try {
      // Ortak API fonksiyonu ile backend'e sepete ekle
      await apiPost('https://localhost:7098/api/CartItem', {
        userId: userId,
        productId: product.id,
        quantity: quantity
      });
      // Redux ile frontend sepetine ekle
      dispatch(addToCart({
        id: product.id,
        name: product.name,
        price: product.price || 0,
        image: product.imageUrl,
        quantity: quantity
      }));
      // Sepeti backend'den güncelle
      dispatch(fetchCartFromBackend(userId));
      alert('Ürün sepete eklendi!');
      // Sepet animasyonu için
      const cartButton = document.querySelector('.cart-notification');
      if (cartButton) {
        cartButton.classList.add('animate');
        setTimeout(() => cartButton.classList.remove('animate'), 1000);
      }
    } catch (error) {
      alert('Sepete ekleme başarısız oldu! ' + parseApiError(error));
    }
  };

  // Yorum ekleme/güncelleme
  const handleReviewSubmit = async (reviewData) => {
    if (!isLoggedIn || !userId) {
      alert('Yorum yapmak için giriş yapmalısınız!');
      return;
    }
    if (!reviewData.comment || !reviewData.rating) {
      alert('Yorum ve puan zorunludur!');
      return;
    }
    const payload = {
      productId: parseInt(id),
      userId: parseInt(userId),
      comment: reviewData.comment,
      rating: reviewData.rating
    };
    if (!payload.productId || !payload.userId || !payload.comment || !payload.rating) {
      alert('Eksik veya hatalı veri!');
      return;
    }
    try {
      console.log('Yorum gönder payload:', payload);
      if (reviewData.isUpdate && reviewData.reviewId) {
        // Güncelleme
        await apiPut(`https://localhost:7098/api/Review`, {
          id: reviewData.reviewId,
          content: reviewData.comment,
          rating: reviewData.rating,
          lastModifiedBy: 'user'
        });
        setReviews(reviews.map(r => r.id === reviewData.reviewId ? { ...r, comment: reviewData.comment, rating: reviewData.rating, lastModifiedBy: 'user', lastModifiedAt: new Date().toISOString() } : r));
      } else {
        // Ekleme
        const res = await apiPost(`https://localhost:7098/api/Review`, payload);
        setReviews([...reviews, res]);
      }
      setShowReviewForm(false);
      setEditingReview(null);
    } catch (err) {
      alert('Yorum gönderilemedi: ' + parseApiError(err));
    }
  };

  // Yorum silme
  const handleReviewDelete = async (review) => {
    if (!window.confirm('Yorumu silmek istediğinize emin misiniz?')) return;
    try {
      await apiDelete(`https://localhost:7098/api/Review/${review.id}?deletedBy=user`);
      setReviews(reviews.map(r => r.id === review.id ? { ...r, comment: 'Bu yorum silinmiştir' } : r));
    } catch (err) {
      alert('Yorum silinemedi: ' + parseApiError(err));
    }
  };

  // Yorum düzenleme
  const handleReviewEdit = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  // Sadece o ürüne ait yorumlar
  const filteredReviews = reviews.filter(r => r.productId === parseInt(id));

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
                  disabled={quantity >= (stock - cartQuantity)}
                >
                  <FiPlus />
                </button>
              </div>
              <button 
                className="add-to-cart"
                onClick={handleAddToCart}
                disabled={stock === 0 || (cartQuantity + quantity > stock)}
              >
                <FiShoppingCart /> {stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
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
              <FiMessageSquare /> Kullanıcı Yorumları ({filteredReviews.length})
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
              review={editingReview}
            />
          )}

          {filteredReviews && filteredReviews.length > 0 ? (
            <div className="reviews-list">
              {filteredReviews.map(review => (
                <ReviewItem 
                  key={review.id}
                  review={review}
                  darkMode={darkMode}
                  isOwn={isLoggedIn && review.userId === userId}
                  onEdit={handleReviewEdit}
                  onDelete={handleReviewDelete}
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
                      src={product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : API_BASE + product.imageUrl) : '/images/default-product.jpg'} 
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