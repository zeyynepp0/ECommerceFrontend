import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../components/UserContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import '../css/ProfilePage.css';

const ProfilePage = () => {
  const { userId: contextUserId, isLoggedIn } = useUser();
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const userId = contextUserId || routeUserId;

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  //const [activeTab, setActiveTab] = useState('profile');
  const [searchParams] = useSearchParams();
const tabFromUrl = searchParams.get('tab');
const [activeTab, setActiveTab] = useState(tabFromUrl || 'profile');


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !userId) {
      navigate('/login');
      return;
      
    }
    

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [userRes, addressRes, favoriteRes, orderRes] = await Promise.all([
          axios.get(`https://localhost:7098/api/User/${userId}`, { headers }),
          axios.get(`https://localhost:7098/api/Address/user/${userId}`, { headers }),
          axios.get(`https://localhost:7098/api/Favorite/user/${userId}`, { headers }),
          axios.get(`https://localhost:7098/api/Order/user/${userId}`, { headers })
        ]);

        setUser(userRes.data);
        setAddresses(addressRes.data);
        setFavorites(favoriteRes.data);
        setOrders(orderRes.data);
        setLoading(false);
        
      } catch (error) {
        console.error('Profil verileri alınamadı:', error);
        navigate('/login');
      }
    };

    fetchData();
  }, [userId, navigate]);

  useEffect(() => {
  setActiveTab(tabFromUrl);
}, [tabFromUrl]);

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

  const saveAddress = async (address) => {
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

 const sanitizedAddress = {
    ...address,
    id: address.id?.toString().startsWith('temp') ? 0 : parseInt(address.id),
    userId: parseInt(address.userId),
  };

  try {
    if (address.id?.toString().startsWith('temp')) {
      await axios.post(`https://localhost:7098/api/Address`, sanitizedAddress, { headers });
    } else {
      await axios.put(`https://localhost:7098/api/Address`, sanitizedAddress, { headers });
    }

    const refreshed = await axios.get(`https://localhost:7098/api/Address/user/${userId}`, { headers });
    setAddresses(refreshed.data);
  } catch (err) {
    console.error('Adres kaydetme hatası:', err);
    alert('Adres kaydedilemedi.');
  }
};

  const deleteAddress = async (id) => {
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`
    };

    try {
      await axios.delete(`https://localhost:7098/api/Address/${id}`, { headers });

      const refreshed = await axios.get(`https://localhost:7098/api/Address/user/${userId}`, { headers });
      setAddresses(refreshed.data);
    } catch (err) {
      console.error('Adres silme hatası:', err);
      alert('Adres silinemedi.');
    }
  };

  const removeFavorite = async (productId) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    await axios.delete(`https://localhost:7098/api/Favorite/remove/user/${userId}`, {
      headers,
      data: { userId, productId },
    });
    const refreshed = await axios.get(`https://localhost:7098/api/Favorite/user/${userId}`, { headers });
    setFavorites(refreshed.data);
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
        userId,
      },
    ]);
  };

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
              <form className="profile-form">
                <div className="form-group">
                  <label>Ad</label>
                  <input 
                    name="firstName" 
                    value={user.firstName} 
                    onChange={handleUserChange} 
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Soyad</label>
                  <input 
                    name="lastName" 
                    value={user.lastName} 
                    onChange={handleUserChange} 
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    name="email" 
                    value={user.email} 
                    onChange={handleUserChange} 
                    className="form-input"
                    type="email"
                  />
                </div>
                <div className="form-group">
                  <label>Telefon</label>
                  <input 
                    name="phone" 
                    value={user.phone} 
                    onChange={handleUserChange} 
                    className="form-input"
                    type="tel"
                  />
                </div>
                <button 
                  onClick={saveUser} 
                  className="save-button primary"
                  type="button"
                >
                  Bilgilerimi Güncelle
                </button>
              </form>
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
              {favorites.length === 0 ? (
                <div className="empty-state">
                  <i className="icon-heart-o"></i>
                  <p>Henüz favori ürününüz bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="favorites-grid">
                  {favorites.map(fav => (
                    <div key={fav.productId} className="favorite-item">
                      <div className="favorite-image">
                        <img src={fav.product?.imageUrl || 'https://via.placeholder.com/150'} alt={fav.product?.name} />
                      </div>
                      <div className="favorite-details">
                        <h3>{fav.product?.name}</h3>
                        <p className="description">{fav.product?.description}</p>
                        <p className="price">{fav.product?.price} TL</p>
                        <button 
                          onClick={() => removeFavorite(fav.productId)}
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