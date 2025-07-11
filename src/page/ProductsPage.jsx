import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiFilter, 
  FiSearch, 
  FiChevronDown, 
  FiStar, 
  FiShoppingCart,
  FiHeart
} from 'react-icons/fi';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import '../css/ProductsPage.css';
import { useCart } from '../components/CartContext';

const ProductsPage = ({ darkMode }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({
    searchQuery: '',
    minPrice: '',
    maxPrice: '',
    categoryId: '',
    sortBy: 'default',
  });
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // URL parametrelerini işle
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');
    const discountParam = urlParams.get('discount');

    const newFilters = { ...filters };
    
    if (searchParam) {
      newFilters.searchQuery = searchParam;
    }
    
    if (categoryParam) {
      newFilters.categoryId = categoryParam;
    }

    setFilters(newFilters);

    // Eğer indirim parametresi varsa, indirimli ürünleri filtrele
    if (discountParam === 'true') {
      // Burada indirimli ürünleri filtreleyebilirsiniz
      console.log('İndirimli ürünler gösteriliyor');
    }
  }, [location.search]);

  // Veritabanından ürünleri ve kategorileri çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Backend'den ürün ve kategori verilerini aynı anda çek
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get('https://localhost:7098/api/Product'),
          axios.get('https://localhost:7098/api/Category')
        ]);

        // Cevaplardan gelen verileri state'lere yerleştir
        setProducts(productsRes.data);
        setFilteredProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Veri çekme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtreleme fonksiyonu
  useEffect(() => {
    let result = [...products];

    // Arama sorgusuna göre filtrele
    if (filters.searchQuery) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Fiyat aralığına göre filtrele
    if (filters.minPrice) {
      result = result.filter(product => product.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(product => product.price <= Number(filters.maxPrice));
    }

    // Kategoriye göre filtrele
    if (filters.categoryId) {
      result = result.filter(product => String(product.categoryId) === String(filters.categoryId));
    }

    // Sıralama
    switch (filters.sortBy) {
      case 'priceLowToHigh':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceHighToLow':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [filters, products]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      minPrice: '',
      maxPrice: '',
      categoryId: '',
      sortBy: 'default',
    });
    // URL'yi temizle
    navigate('/products');
  };

  useEffect(() => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  if (!token || !userId) return;

  const fetchFavorites = async () => {
    try {
      const res = await axios.get(`https://localhost:7098/api/Favorite/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data);
    } catch (err) {
      console.error('Favoriler alınamadı:', err);
    }
  };

  fetchFavorites();
}, []);


// Favori değişikliği callback'i
 const handleFavoriteClick = async () => {
  const token = localStorage.getItem('token');

  try {
    const res = await axios.post("https://localhost:7098/api/Favorite/add", {
      userId: userId,
      productId: productId
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("Favoriye eklendi:", res.data);
  } catch (error) {
    console.error("Favori işlemi başarısız:", error.response?.data || error.message);
  }
};



  return (
    <div className={`products-page ${darkMode ? 'dark' : ''}`}>
      <div className="products-container">
        {/* Filtreleme Sidebar */}
        <div className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
          <h3>Filtreleme</h3>
          
          <div className="filter-group">
            <label>Arama</label>
            <input
              type="text"
              name="searchQuery"
              value={filters.searchQuery}
              onChange={handleFilterChange}
              placeholder="Ürün adı veya açıklama"
            />
          </div>

          <div className="filter-group">
            <label>Fiyat Aralığı</label>
            <div className="price-range">
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min ₺"
                min="0"
              />
              <span>-</span>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max ₺"
                min="0"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Kategori</label>
            <select
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sırala</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
            >
              <option value="default">Varsayılan</option>
              <option value="priceLowToHigh">Fiyat (Düşükten Yükseğe)</option>
              <option value="priceHighToLow">Fiyat (Yüksekten Düşüğe)</option>
              <option value="rating">Değerlendirme</option>
              <option value="newest">En Yeniler</option>
            </select>
          </div>

          <button className="reset-filters" onClick={resetFilters}>
            Filtreleri Sıfırla
          </button>
        </div>

        {/* Ürün Listesi */}
        <div className="products-list">
          <div className="products-header">
            <h2>Tüm Ürünler</h2>
            <div className="products-actions">
              <button 
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter /> Filtrele
              </button>
              <div className="products-count">
                {filteredProducts.length} ürün bulundu
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">Yükleniyor...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>Filtrelerinize uygun ürün bulunamadı</p>
              <button onClick={resetFilters}>Filtreleri Sıfırla</button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  darkMode={darkMode}
                  favorites={favorites}
                  setFavorites={setFavorites}
                  onFavoriteChange={handleFavoriteClick}
                  
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;