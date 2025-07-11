import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiEye, 
  FiEyeOff, 
  FiUser, 
  FiMail, 
  FiLock, 
  FiPhone,
  FiCalendar,
  FiPhoneCall,
  FiUserPlus
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import "../css/LoginSignup.css"; 
import axios from 'axios';
import { useUser } from '../components/UserContext';

const RegisterPage = ({ darkMode }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthDate: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const navigate = useNavigate();
  const { login } = useUser();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) return true;
    if (cleaned.length === 11 && cleaned.startsWith('0')) return true;
    if (cleaned.length === 12 && cleaned.startsWith('90')) return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPhoneError('');

    try {
      if (!formData.phone) {
        setPhoneError('Telefon numarası gereklidir');
        setIsLoading(false);
        return;
      }
      if (!validatePhone(formData.phone)) {
        setPhoneError('Telefon numarası geçersiz. Lütfen başında 0 veya +90 olmadan 10 haneli girin.');
        setIsLoading(false);
        return;
      }
      // Backend'e kayıt isteği gönder
      const payload = new FormData();
      payload.append('FirstName', formData.firstName);
      payload.append('LastName', formData.lastName);
      payload.append('Email', formData.email);
      payload.append('PasswordHash', formData.password); // Backend hash'leyecek
      payload.append('BirthDate', formData.birthDate);
      payload.append('Phone', formData.phone);
      payload.append('Role', 'User');
      const res = await axios.post('https://localhost:7098/api/User', payload);
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('Bir hata oluştu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google ile kayıt olunuyor');
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={`auth-container ${darkMode ? 'dark' : ''}`}>
      <div className="auth-card">
        <div className="auth-header">
          <h2>
            <FiUserPlus size={24} />
            Kayıt Ol
          </h2>
          <p>Yeni hesap oluşturun</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          className="google-btn"
          onClick={handleGoogleLogin}
          type="button"
        >
          <FcGoogle size={20} />
          <span>Google ile Kayıt Ol</span>
        </button>

        <div className="divider">
          <span>veya</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FiUser className="input-icon" />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <label className={formData.firstName ? 'filled' : ''}>Adınız</label>
          </div>

          <div className="input-group">
            <FiUser className="input-icon" />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <label className={formData.lastName ? 'filled' : ''}>Soyadınız</label>
          </div>

          <div className="input-group">
            <FiMail className="input-icon" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label className={formData.email ? 'filled' : ''}>E-posta</label>
          </div>

          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label className={formData.password ? 'filled' : ''}>Şifre</label>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="input-group">
            <FiCalendar className="input-icon" />
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
              max={today}
            />
            <label className={formData.birthDate ? 'filled' : ''}>Doğum Tarihi</label>
          </div>

          <div className="input-group">
            <FiPhoneCall className="input-icon" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <label className={formData.phone ? 'filled' : ''}>Telefon</label>
            {phoneError && <div className="error-message">{phoneError}</div>}
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Yükleniyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="auth-footer">
          Zaten hesabınız var mı?
          <Link to="/login" className="toggle-btn">
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;