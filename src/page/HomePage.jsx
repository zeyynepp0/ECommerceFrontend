import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/HomePage.css';
import { useSelector } from 'react-redux'; // Redux hook'u
import { useCart } from '../components/CartContext';
import axios from 'axios';
import { apiGet, parseApiError } from '../utils/api'; // Ortak API fonksiyonları

const HomePage = ({ darkMode, setDarkMode }) => {
  // Kullanıcı bilgilerini Redux store'dan alıyoruz
  const { isLoggedIn, userId } = useSelector(state => state.user);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        // Ürünleri ve kategorileri aynı anda çek
        const [productsRes, categoriesRes] = await Promise.all([
          apiGet('https://localhost:7098/api/Product'),
          apiGet('https://localhost:7098/api/Category')
        ]);
        setProducts(productsRes);
        setCategories(categoriesRes);
        setLoading(false);
      } catch (error) {
        console.error('Veri çekme hatası:', parseApiError(error));
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Arama fonksiyonu
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Arama işlemi
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Enter tuşu ile arama
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Favori değişikliği callback'i
  const handleFavoriteChange = () => {
    // Favori değişikliği olduğunda yapılacak işlemler
    console.log('Favori değişikliği algılandı');
  };
  

  return (
    <div className={`home-page ${darkMode ? 'dark' : ''}`}>
      {/* <Header 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        isLoggedIn={isLoggedIn} 
      /> */}
      
      <main className="home-container">
        {/* Hero Banner */}
        <section className="hero-banner">
          <div className="hero-content">
            <h1>Yeni Sezon Ürünler Keşfedin</h1>
            <p>%30'a varan indirimler sizi bekliyor</p>
            <Link to="/products" className="cta-button">Alışverişe Başla</Link>
          </div>
        </section>

        {/* Ürün Arama */}
        <section className="product-search">
          <div className="search-container">
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="search-button" onClick={handleSearch}>
              <FiSearch size={20} />
            </button>
          </div>
        </section>

        {/* Kategoriler ve Tüm Ürünler */}
        <section className="categories-and-products">
          <div className="categories-section">
            <h2>Kategoriler</h2>
            <div className="category-grid">
              {categories.map(category => (
                <Link 
                  to={`/products?category=${category.id}`} 
                  key={category.id} 
                  className="category-card"
                >
                  <div className="category-image">
                    <img 
                      src={category.imageUrl || '/images/default-category.jpg'} 
                      alt={category.name}
                      onError={(e) => {
                        e.target.src = '/images/default-category.jpg';
                      }}
                    />
                  </div>
                  <h3>{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>

          <div className="all-products-section">
            <div className="section-header">
              <h2>Tüm Ürünler</h2>
              <Link to="/products" className="view-all-link">Tümünü Gör</Link>
            </div>
            {loading ? (
              <div className="loading-spinner">Yükleniyor...</div>
            ) : (
              <div className="product-grid">
                {filteredProducts.slice(0, 8).map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    darkMode={darkMode}
                    onFavoriteChange={handleFavoriteChange}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Kampanya Banner */}
        <section className="promo-banner">
          <div className="promo-content">
            <h2>Özel Fırsatlar</h2>
            <p>Seçili ürünlerde ekstra %15 indirim</p>
            <Link to="/products?discount=true" className="promo-button">Hemen Keşfet</Link>
          </div>
        </section>
      </main>

      
    </div>
  );
};

export default HomePage;