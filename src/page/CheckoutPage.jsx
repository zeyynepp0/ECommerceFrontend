import React, { useState, useEffect } from 'react';
import { useUser } from '../components/UserContext';
import { useNavigate } from 'react-router-dom';
import '../css/CheckoutPage.css';

const CheckoutPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    contactName: '',
    contactSurname: '',
    contactPhone: '',
    city: '',
    district: '',
    fullAddress: ''
  });
  const [shippingCompany, setShippingCompany] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const shippingCompanies = [
    { id: 'aras', name: 'Aras Kargo', price: 0 },
    { id: 'mng', name: 'MNG Kargo', price: 0 },
    { id: 'ups', name: 'UPS Kargo', price: 15 },
    { id: 'ptt', name: 'PTT Kargo', price: 10 }
  ];

  const paymentMethods = [
    { id: 'credit', name: 'Kredi Kartı' },
    { id: 'debit', name: 'Banka Kartı' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCartItems();
    fetchAddresses();
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`https://localhost:7098/api/CartItem/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
        const total = data.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        setCartTotal(total);
      }
    } catch (error) {
      console.error('Sepet yüklenirken hata:', error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`https://localhost:7098/api/Address/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Adresler yüklenirken hata:', error);
    }
  };

  const handleAddNewAddress = async () => {
    try {
      const response = await fetch('https://localhost:7098/api/Address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newAddress,
          userId: user.id
        })
      });

      if (response.ok) {
        await fetchAddresses();
        setShowNewAddressForm(false);
        setNewAddress({
          title: '',
          contactName: '',
          contactSurname: '',
          contactPhone: '',
          city: '',
          district: '',
          fullAddress: ''
        });
      }
    } catch (error) {
      console.error('Adres eklenirken hata:', error);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedAddress || !shippingCompany || !paymentMethod) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    try {
      const orderData = {
        userId: user.id,
        addressId: selectedAddress.id,
        shippingCompany: shippingCompany,
        paymentMethod: paymentMethod,
        totalAmount: cartTotal,
        orderItems: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.price
        }))
      };

      const response = await fetch('https://localhost:7098/api/Order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        setOrderId(result.orderId);
        setStep(4); // Ödeme adımına geç
      }
    } catch (error) {
      console.error('Sipariş oluşturulurken hata:', error);
    }
  };

  const handlePayment = async () => {
    if (!orderId) return;

    try {
      const paymentResponse = await fetch('https://localhost:7098/api/Order/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentData,
          orderId: orderId
        })
      });

      if (paymentResponse.ok) {
        alert('Ödeme başarıyla alındı! Siparişiniz onaylandı.');
        navigate('/profile');
      } else {
        const error = await paymentResponse.json();
        alert(error.message || 'Ödeme işlemi başarısız!');
      }
    } catch (error) {
      console.error('Ödeme işlemi sırasında hata:', error);
      alert('Ödeme işlemi sırasında hata oluştu!');
    }
  };

  const renderAddressStep = () => (
    <div className="checkout-step">
      <h3>Adres Seçimi</h3>
      {addresses.length > 0 && (
        <div className="address-list">
          {addresses.map(address => (
            <div 
              key={address.id} 
              className={`address-item ${selectedAddress?.id === address.id ? 'selected' : ''}`}
              onClick={() => setSelectedAddress(address)}
            >
              <h4>{address.title}</h4>
              <p>{address.contactName} {address.contactSurname}</p>
              <p>{address.contactPhone}</p>
              <p>{address.fullAddress}</p>
              <p>{address.district}, {address.city}</p>
            </div>
          ))}
        </div>
      )}
      
      <button 
        className="btn-secondary"
        onClick={() => setShowNewAddressForm(!showNewAddressForm)}
      >
        {showNewAddressForm ? 'İptal' : 'Yeni Adres Ekle'}
      </button>

      {showNewAddressForm && (
        <div className="new-address-form">
          <h4>Yeni Adres Ekle</h4>
          <input
            type="text"
            placeholder="Adres Başlığı"
            value={newAddress.title}
            onChange={(e) => setNewAddress({...newAddress, title: e.target.value})}
          />
          <input
            type="text"
            placeholder="Ad Soyad"
            value={newAddress.contactName}
            onChange={(e) => setNewAddress({...newAddress, contactName: e.target.value})}
          />
          <input
            type="text"
            placeholder="Soyad"
            value={newAddress.contactSurname}
            onChange={(e) => setNewAddress({...newAddress, contactSurname: e.target.value})}
          />
          <input
            type="text"
            placeholder="Telefon"
            value={newAddress.contactPhone}
            onChange={(e) => setNewAddress({...newAddress, contactPhone: e.target.value})}
          />
          <input
            type="text"
            placeholder="Şehir"
            value={newAddress.city}
            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
          />
          <input
            type="text"
            placeholder="İlçe"
            value={newAddress.district}
            onChange={(e) => setNewAddress({...newAddress, district: e.target.value})}
          />
          <textarea
            placeholder="Tam Adres"
            value={newAddress.fullAddress}
            onChange={(e) => setNewAddress({...newAddress, fullAddress: e.target.value})}
          />
          <button onClick={handleAddNewAddress} className="btn-primary">
            Adres Ekle
          </button>
        </div>
      )}

      {selectedAddress && (
        <button onClick={() => setStep(2)} className="btn-primary">
          Devam Et
        </button>
      )}
    </div>
  );

  const renderShippingStep = () => (
    <div className="checkout-step">
      <h3>Kargo Firması Seçimi</h3>
      <div className="shipping-options">
        {shippingCompanies.map(company => (
          <div 
            key={company.id}
            className={`shipping-option ${shippingCompany === company.id ? 'selected' : ''}`}
            onClick={() => setShippingCompany(company.id)}
          >
            <div>
              <h4>{company.name}</h4>
              <p>{company.price === 0 ? 'Ücretsiz' : `${company.price}₺`}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="payment-methods">
        <h4>Ödeme Yöntemi</h4>
        {paymentMethods.map(method => (
          <div 
            key={method.id}
            className={`payment-option ${paymentMethod === method.id ? 'selected' : ''}`}
            onClick={() => setPaymentMethod(method.id)}
          >
            {method.name}
          </div>
        ))}
      </div>

      {shippingCompany && paymentMethod && (
        <button onClick={handleCreateOrder} className="btn-primary">
          Siparişi Oluştur
        </button>
      )}
    </div>
  );

  const renderPaymentStep = () => (
    <div className="checkout-step">
      <h3>Ödeme Bilgileri</h3>
      <div className="payment-form">
        <input
          type="text"
          placeholder="Kart Numarası"
          value={paymentData.cardNumber}
          onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
          maxLength="19"
        />
        <input
          type="text"
          placeholder="Kart Sahibinin Adı"
          value={paymentData.cardHolderName}
          onChange={(e) => setPaymentData({...paymentData, cardHolderName: e.target.value})}
        />
        <div className="card-details">
          <input
            type="text"
            placeholder="AA"
            value={paymentData.expiryMonth}
            onChange={(e) => setPaymentData({...paymentData, expiryMonth: e.target.value})}
            maxLength="2"
          />
          <input
            type="text"
            placeholder="YYYY"
            value={paymentData.expiryYear}
            onChange={(e) => setPaymentData({...paymentData, expiryYear: e.target.value})}
            maxLength="4"
          />
          <input
            type="text"
            placeholder="CVV"
            value={paymentData.cvv}
            onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
            maxLength="4"
          />
        </div>
        <button onClick={handlePayment} className="btn-primary">
          Ödemeyi Tamamla
        </button>
      </div>
    </div>
  );

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h2>Sipariş Tamamla</h2>
          <div className="step-indicator">
            <span className={step >= 1 ? 'active' : ''}>1. Adres</span>
            <span className={step >= 2 ? 'active' : ''}>2. Kargo</span>
            <span className={step >= 3 ? 'active' : ''}>3. Ödeme</span>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-main">
            {step === 1 && renderAddressStep()}
            {step === 2 && renderShippingStep()}
            {step === 4 && renderPaymentStep()}
          </div>

          <div className="checkout-summary">
            <h3>Sipariş Özeti</h3>
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>{(item.product.price * item.quantity).toFixed(2)}₺</span>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <span>Toplam:</span>
              <span>{cartTotal.toFixed(2)}₺</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 