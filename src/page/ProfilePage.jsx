import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux'; // Redux hook'ları
import { fetchFavorites, removeFavorite } from '../store/favoriteSlice'; // Favori işlemleri
import { useNavigate, useParams } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import '../css/ProfilePage.css';
import { useFavorites } from '../components/FavoriteContext';
import { Formik, Form, Field, ErrorMessage } from 'formik'; // Formik ile form yönetimi
import * as Yup from 'yup'; // Yup ile validasyon
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api'; // Ortak API fonksiyonları

const ProfilePage = () => {
  // Kullanıcı bilgilerini Redux store'dan alıyoruz
  const { userId, isLoggedIn } = useSelector(state => state.user);
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const userIdFromContext = userId || routeUserId;

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  //const [activeTab, setActiveTab] = useState('profile');
  const [searchParams] = useSearchParams();
const tabFromUrl = searchParams.get('tab');
const [activeTab, setActiveTab] = useState(tabFromUrl || 'profile');

  // Favori verilerini Redux store'dan alıyoruz
  const { favorites: contextFavorites } = useSelector(state => state.favorite);
  const dispatch = useDispatch();
  const [favoriteProducts, setFavoriteProducts] = useState([]);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !userIdFromContext) {
      navigate('/login');
      return;
    }
    // Kullanıcı, adres, favori ve sipariş verilerini çekiyoruz
    const fetchData = async () => {
      try {
        const [userRes, addressRes, orderRes] = await Promise.all([
          apiGet(`https://localhost:7098/api/User/${userIdFromContext}`),
          apiGet(`https://localhost:7098/api/Address/user/${userIdFromContext}`),
          apiGet(`https://localhost:7098/api/Order/user/${userIdFromContext}`)
        ]);
        setUser(userRes);
        setAddresses(addressRes);
        setOrders(orderRes);
        setLoading(false);
        // Favorileri Redux ile çek
        dispatch(fetchFavorites());
      } catch (error) {
        console.error('Profil verileri alınamadı:', error);
        navigate('/login');
      }
    };
    fetchData();
  }, [userIdFromContext, navigate, dispatch]);

  useEffect(() => {
  setActiveTab(tabFromUrl);
}, [tabFromUrl]);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      if (!contextFavorites || contextFavorites.length === 0) {
        setFavoriteProducts([]);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const productDetails = await Promise.all(
          contextFavorites.map(async fav => {
            const res = await axios.get(`https://localhost:7098/api/Product/${fav.productId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
          })
        );
        setFavoriteProducts(productDetails);
      } catch (err) {
        setFavoriteProducts([]);
      }
    };
    fetchFavoriteProducts();
  }, [contextFavorites]);

  const handleUserChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const saveUser = async () => {
    try {
      await axios.put(`https://localhost:7098/api/User`, user, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Kullanıcı bilgileri güncellendi!');
    } catch (error) {
      alert('Güncelleme başarısız.');
    }
  };

  const handleAddressChange = (index, field, value) => {
    const updated = [...addresses];
    updated[index][field] = value;
    setAddresses(updated);
  };

  // Adres kaydetme fonksiyonu
  const saveAddress = async (address) => {
    const sanitizedAddress = {
      ...address,
      id: address.id?.toString().startsWith('temp') ? 0 : parseInt(address.id),
      userId: parseInt(address.userId),
    };
    try {
      if (address.id?.toString().startsWith('temp')) {
        await apiPost(`https://localhost:7098/api/Address`, sanitizedAddress);
      } else {
        await apiPut(`https://localhost:7098/api/Address`, sanitizedAddress);
      }
      const refreshed = await apiGet(`https://localhost:7098/api/Address/user/${userIdFromContext}`);
      setAddresses(refreshed);
    } catch (err) {
      alert('Adres kaydedilemedi. ' + err);
    }
  };

  // Adres silme fonksiyonu
  const deleteAddress = async (id) => {
    try {
      await apiDelete(`https://localhost:7098/api/Address/${id}`);
      const refreshed = await apiGet(`https://localhost:7098/api/Address/user/${userIdFromContext}`);
      setAddresses(refreshed);
    } catch (err) {
      alert('Adres silinemedi. ' + err);
    }
  };

  const addEmptyAddress = () => {
    setAddresses([
      ...addresses,
      {
        id: `temp-${Date.now()}`,
        addressTitle: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        contactName: '',
        contactSurname: '',
        contactPhone: '',
        userId: userIdFromContext,
      },
    ]);
  };

  // Favorilerden çıkarma işlemi
  const handleRemoveFavorite = (productId) => {
    dispatch(removeFavorite(productId));
  };

  // Profil güncelleme için Yup validasyon şeması
  const ProfileSchema = Yup.object().shape({
    firstName: Yup.string().min(2, 'Adınız en az 2 karakter olmalı').required('Adınız gereklidir'),
    lastName: Yup.string().min(2, 'Soyadınız en az 2 karakter olmalı').required('Soyadınız gereklidir'),
    email: Yup.string().email('Geçerli bir e-posta giriniz').required('E-posta gereklidir'),
    phone: Yup.string()
      .matches(/^(\+90|0)?\d{10}$/,
        'Telefon numarası geçersiz. Başında 0 veya +90 olmadan 10 haneli girin.')
      .required('Telefon numarası gereklidir'),
  });

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Yükleniyor...</p>
    </div>
  );

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Hesabım</h1>
        <div className="welcome-message">
          {user && <p>Hoş geldiniz, <strong>{user.firstName} {user.lastName}</strong>!</p>}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="user-info-card">
            {user && (
              <div className="user-avatar">
                <div className="avatar-circle">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
                <h3>{user.firstName} {user.lastName}</h3>
                <p>{user.email}</p>
              </div>
            )}
          </div>

          <nav className="profile-menu">
            <button 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              <i className="icon-user"></i> Profil Bilgileri
            </button>
            <button 
              className={activeTab === 'address' ? 'active' : ''}
              onClick={() => setActiveTab('address')}
            >
              <i className="icon-map-marker"></i> Adreslerim
            </button>
            <button 
              className={activeTab === 'favorites' ? 'active' : ''}
              onClick={() => setActiveTab('favorites')}
            >
              <i className="icon-heart"></i> Favorilerim
            </button>
            <button 
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              <i className="icon-shopping-bag"></i> Siparişlerim
            </button>
          </nav>
        </div>

        <div className="profile-main">
          {activeTab === 'profile' && user && (
            <div className="profile-section card">
              <h2>Profil Bilgileri</h2>
              {/* Formik ile profil güncelleme formu */}
              <Formik
                enableReinitialize
                initialValues={{
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  email: user.email || '',
                  phone: user.phone || ''
                }}
                validationSchema={ProfileSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    await axios.put(`https://localhost:7098/api/User`, { ...user, ...values }, {
                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                    alert('Kullanıcı bilgileri güncellendi!');
                  } catch (error) {
                    alert('Güncelleme başarısız.');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ isSubmitting, values, handleChange }) => (
                  <Form className="profile-form">
                    <div className="form-group">
                      <label>Ad</label>
                      <Field
                        name="firstName"
                        value={values.firstName}
                        onChange={handleChange}
                        className="form-input"
                      />
                      <ErrorMessage name="firstName" component="div" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label>Soyad</label>
                      <Field
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        className="form-input"
                      />
                      <ErrorMessage name="lastName" component="div" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <Field
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        className="form-input"
                      />
                      <ErrorMessage name="email" component="div" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label>Telefon</label>
                      <Field
                        name="phone"
                        type="tel"
                        value={values.phone}
                        onChange={handleChange}
                        className="form-input"
                      />
                      <ErrorMessage name="phone" component="div" className="error-message" />
                    </div>
                    <button
                      type="submit"
                      className="save-button primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Kaydediliyor...' : 'Bilgilerimi Güncelle'}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="address-section card">
              <div className="section-header">
                <h2>Adreslerim</h2>
                <button 
                  onClick={addEmptyAddress} 
                  className="add-button primary"
                >
                  <i className="icon-plus"></i> Yeni Adres Ekle
                </button>
              </div>
              
              <div className="address-list">
                {addresses.map((addr, idx) => (
                  <div key={addr.id} className="address-card">
                    <div className="address-header">
                      <input 
                        value={addr.addressTitle} 
                        onChange={(e) => handleAddressChange(idx, 'addressTitle', e.target.value)}
                        placeholder="Adres Başlığı"
                        className="address-title-input"
                      />
                    </div>
                    <div className="address-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Sokak</label>
                          <input 
                            value={addr.street} 
                            onChange={(e) => handleAddressChange(idx, 'street', e.target.value)}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Şehir</label>
                          <input 
                            value={addr.city} 
                            onChange={(e) => handleAddressChange(idx, 'city', e.target.value)}
                            className="form-input"
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>İlçe</label>
                          <input 
                            value={addr.state} 
                            onChange={(e) => handleAddressChange(idx, 'state', e.target.value)}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Posta Kodu</label>
                          <input 
                            value={addr.postalCode} 
                            onChange={(e) => handleAddressChange(idx, 'postalCode', e.target.value)}
                            className="form-input"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Ülke</label>
                        <input 
                          value={addr.country} 
                          onChange={(e) => handleAddressChange(idx, 'country', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>İletişim Adı</label>
                          <input 
                            value={addr.contactName} 
                            onChange={(e) => handleAddressChange(idx, 'contactName', e.target.value)}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>İletişim Soyadı</label>
                          <input 
                            value={addr.contactSurname} 
                            onChange={(e) => handleAddressChange(idx, 'contactSurname', e.target.value)}
                            className="form-input"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>İletişim Telefonu</label>
                        <input 
                          value={addr.contactPhone} 
                          onChange={(e) => handleAddressChange(idx, 'contactPhone', e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>
                    <div className="address-actions">
                      <button 
                        onClick={() => saveAddress(addr)} 
                        className="save-button primary"
                      >
                        Kaydet
                      </button>
                      <button 
                        onClick={() => deleteAddress(addr.id)} 
                        className="delete-button"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="favorites-section card">
              <h2>Favorilerim</h2>
              {favoriteProducts.length === 0 ? (
                <div className="empty-state">
                  <i className="icon-heart-o"></i>
                  <p>Henüz favori ürününüz bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="favorites-grid">
                  {favoriteProducts.map(product => (
                    <div 
                      key={product.id} 
                      className="favorite-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <div className="favorite-image">
                        <img 
                          src={product.imageUrl || '/images/default-product.jpg'} 
                          alt={product.name} 
                          onError={e => { e.target.src = '/images/default-product.jpg'; }}
                        />
                      </div>
                      <div className="favorite-details">
                        <h3>{product.name} <span style={{fontWeight: 'normal', fontSize: '0.9em', color: '#888'}}>#{product.id}</span></h3>
                        <p className="description">{product.description}</p>
                        <p className="price">Fiyat: {product.price} TL</p>
                        <p className="stock">Stok: {product.stock}</p>
                        <p className="category">Kategori: {product.category?.name}</p>
                        <button 
                          onClick={e => { e.stopPropagation(); handleRemoveFavorite(product.id); }}
                          className="remove-button"
                        >
                          <i className="icon-trash"></i> Favorilerden Kaldır
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section card">
              <h2>Siparişlerim</h2>
              {orders.length === 0 ? (
                <div className="empty-state">
                  <i className="icon-shopping-bag"></i>
                  <p>Henüz siparişiniz bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div>
                          <span className="order-id">Sipariş No: #{order.id}</span>
                          <span className={`order-status ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="order-date">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="order-summary">
                        <div className="order-address">
                          <strong>Adres:</strong> {order.address?.addressTitle}
                        </div>
                        <div className="order-total">
                          <strong>Toplam Tutar:</strong> {order.totalAmount} TL
                        </div>
                      </div>
                      <div className="order-items">
                        <h4>Sipariş İçeriği</h4>
                        {order.orderItems?.map(item => (
                          <div key={item.id} className="order-item">
                            <div className="item-image">
                              <img src={item.productImage || 'https://via.placeholder.com/50'} alt={item.productName} />
                            </div>
                            <div className="item-details">
                              <p className="item-name">{item.productName}</p>
                              <p className="item-quantity">{item.quantity} adet × {item.unitPrice} TL</p>
                            </div>
                            <div className="item-total">
                              {(item.quantity * item.unitPrice).toFixed(2)} TL
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;