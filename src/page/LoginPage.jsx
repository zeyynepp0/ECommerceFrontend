import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import "../css/LoginSignup.css";
import axios from 'axios';
import { useUser } from '../components/UserContext';
import { jwtDecode } from 'jwt-decode';


const LoginPage = ({ darkMode }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('Email', formData.email);
      payload.append('Password', formData.password);

      const res = await axios.post('https://localhost:7098/api/User/login', payload);
      const token = res.data.token;

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', token);

      // JWT'den userId'yi decode et
      const decoded = jwtDecode(token);
      const userId =
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
        decoded.nameid || decoded.sub || decoded.id || decoded.userId;

      if (!userId) {
        setError('Kullanıcı ID alınamadı. Lütfen tekrar deneyin.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('userId', userId);
      login(userId, token);
      navigate(`/profile/${userId}`);
    } catch (err) {
      const data = err?.response?.data;
      if (typeof data === 'string') {
        setError(data);
      } else if (data?.errors) {
        const messages = Object.values(data.errors).flat().join(' ');
        setError(messages);
      } else if (data?.title) {
        setError(data.title);
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google ile giriş yapılıyor');
    // Google auth işlemi buraya entegre edilebilir
  };

  return (
    <div className={`auth-container ${darkMode ? 'dark' : ''}`}>
      <div className="auth-card">
        <div className="auth-header">
          <h2>
            <FiLogIn size={24} />
            Giriş Yap
          </h2>
          <p>Hesabınıza giriş yapın</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button className="google-btn" onClick={handleGoogleLogin} type="button">
          <FcGoogle size={20} />
          <span>Google ile Giriş Yap</span>
        </button>

        <div className="divider"><span>veya</span></div>

        <form onSubmit={handleSubmit}>
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

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Yükleniyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="auth-footer">
          Hesabınız yok mu?
          <Link to="/register" className="toggle-btn">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
