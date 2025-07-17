import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  FiSearch, 
  FiShoppingCart, 
  FiHeart, 
  FiUser, 
  FiSun, 
  FiMoon, 
  FiMenu, 
  FiX,
  FiChevronDown,
  FiLogIn,
  FiUserPlus,
  FiLogOut,
  FiHome,
  FiStar,
  FiPercent,
  FiInfo,
  FiMail
} from 'react-icons/fi';
import { AiOutlineProduct } from "react-icons/ai";
import '../css/Header.css';
import Modal from 'react-modal';
import { useSelector, useDispatch } from 'react-redux'; // Redux hook'ları
import { fetchCartFromBackend, clearCart } from '../store/cartSlice'; // Sepet işlemleri
import { fetchFavorites, clearFavorites, selectFavoritesCount } from '../store/favoriteSlice'; // Favori işlemleri
import { logout } from '../store/userSlice'; // Kullanıcı çıkışı için action import edildi
import axios from 'axios';

Modal.setAppElement('#root');

const Header = ({ darkMode, setDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const navigate = useNavigate();
  // Sepet verilerini Redux store'dan alıyoruz
  const { cartItems } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  // Kullanıcı bilgilerini Redux store'dan alıyoruz
  const { isLoggedIn, userId } = useSelector(state => state.user);
  // Favori verilerini Redux store'dan alıyoruz
  const favoritesCount = useSelector(selectFavoritesCount);

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setShowDropdown(false);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  // Çıkış işlemi
  const handleLogout = () => {
    dispatch(logout()); // Kullanıcıyı Redux'tan çıkış yaptır
    dispatch(clearCart()); // Sepeti temizle
    dispatch(clearFavorites()); // Favorileri temizle
    setShowDropdown(false); // Dropdown menüyü kapat
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sayfa değiştiğinde header'ı güncelle
  useEffect(() => {
    if (isLoggedIn && userId) {
      dispatch(fetchCartFromBackend(userId)); // Redux ile sepeti güncelle
      dispatch(fetchFavorites()); // Redux ile favorileri güncelle
    }
  }, [isLoggedIn, userId, dispatch]);

  // Manuel yenileme fonksiyonu
  const refreshHeader = () => {
    if (isLoggedIn && userId) {
      dispatch(fetchCartFromBackend(userId)); // Redux ile sepeti güncelle
      dispatch(fetchFavorites()); // Redux ile favorileri güncelle
    }
  };

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

  return (
    <header className={`header ${darkMode ? 'dark' : ''} ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-top">
        <div className="container">
          <div className="header-left">
            <button 
              className="theme-toggle" 
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <Link to="/" className="logo" onClick={refreshHeader}>
              {darkMode ? (
                <span className="logo-text">SHOP<span className="logo-highlight">DARK</span></span>
              ) : (
                <span className="logo-text">SHOP<span className="logo-highlight">LIGHT</span></span>
              )}
            </Link>
          </div>

          <div className="header-center">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                className="search-button"
                onClick={handleSearch}
              >
                <FiSearch size={18} />
              </button>
            </div>
          </div>

          <div className="header-right">
            <div className="profile-section">
              <button 
                className="profile-button"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-expanded={showDropdown}
                aria-label="Profil menüsü"
              >
                <div className="profile-avatar">
                  <FiUser size={16} />
                </div>
                <span className="profile-name">{isLoggedIn ? 'Hesabım' : 'Giriş Yap'}</span>
                <FiChevronDown size={14} className={`dropdown-icon ${showDropdown ? 'open' : ''}`} />
              </button>

              {showDropdown && (
                <div className="profile-dropdown">
                 
                      {!isLoggedIn ? (
  <>
    <Link 
      to="/login" 
      className="dropdown-item"
      onClick={() => setShowDropdown(false)} // Dropdown'ı kapat
    >
      <FiLogIn size={16} />
      <span>Giriş Yap</span>
    </Link>
    <Link 
      to="/register"  // /signup yerine /register kullanımı daha yaygın
      className="dropdown-item"
      onClick={() => setShowDropdown(false)} // Dropdown'ı kapat
    >
      <FiUserPlus size={16} />
      <span>Kayıt Ol</span>
    </Link>
  </>
) : (
                    <>
                      <Link to={`/profile/${userId}`} className="dropdown-item">
                        <FiUser size={16} />
                        <span>Profilim</span>
                      </Link>
                      <Link to={`/profile/${userId}?tab=orders`} className="dropdown-item">
                      <FiShoppingCart size={16} />
                      <span>Siparişlerim</span>
                      </Link>
                      <Link to={`/profile/${userId}?tab=favorites`} className="dropdown-item">
                        <FiHeart size={16} />
                        
                        <span>Favorilerim</span>
                      </Link>
                      <button 
                        className="dropdown-item" 
                        onClick={handleLogout}
                      >
                        <FiLogOut size={16} />
                        <span>Çıkış Yap</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <Link to={`/profile/${userId}?tab=favorites`} className="header-icon" aria-label="Favoriler" onClick={refreshHeader}>
              <FiHeart size={20} />
              <span className="icon-label">Favoriler</span>
              <span className="icon-badge">{favoritesCount}</span>
            </Link>
            
            <Link to="/cart" className="header-icon cart" aria-label="Sepet" onClick={refreshHeader}>
              <FiShoppingCart size={20} />
              <span className="icon-label">Sepet</span>
              <span className="icon-badge">{cartItems.length}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="header-bottom">
        <div className="container">
          <nav className="main-nav">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={refreshHeader}>
                  <FiHome size={16} />
                  Ana Sayfa
                </Link>
              </li>
              

              
              <li className="nav-item">
                <Link to="/products" className="nav-link" onClick={refreshHeader}>
                  <AiOutlineProduct size={16} />
                  Tüm Ürünler
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/products?discount=true" className="nav-link" onClick={refreshHeader}>
                  <FiPercent size={16} />
                  İndirimler
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/about" className="nav-link" onClick={refreshHeader}>
                  <FiInfo size={16} />
                  Hakkımızda
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/contact" className="nav-link" onClick={refreshHeader}>
                  <FiMail size={16} />
                  İletişim
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Auth Modal */}
      <Modal
        isOpen={showAuthModal}
        onRequestClose={closeAuthModal}
        className="auth-modal"
        overlayClassName="auth-modal-overlay"
      >
        
      </Modal>
    </header>
  );
};

export default Header;