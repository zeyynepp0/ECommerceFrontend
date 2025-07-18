import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import "../css/LoginSignup.css";
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux'; // Redux hook'ları
import { login } from '../store/userSlice'; // Kullanıcı işlemleri
import { jwtDecode } from 'jwt-decode';
import { Formik, Form, Field, ErrorMessage } from 'formik'; // Formik ile form yönetimi
import * as Yup from 'yup'; // Yup ile validasyon
import { apiPost, parseApiError } from '../utils/api'; // Ortak API fonksiyonları

// Form için Yup validasyon şeması
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Geçerli bir e-posta giriniz').required('E-posta gereklidir'),
  password: Yup.string().min(6, 'Şifre en az 6 karakter olmalı').required('Şifre gereklidir'),
});

const LoginPage = ({ darkMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Google ile giriş fonksiyonu (dummy)
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

        {/* Formik ile form yönetimi */}
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setIsLoading(true);
            setError('');
            try {
              // const payload = new FormData();
              // payload.append('Email', values.email);
              // payload.append('Password', values.password);
              // Eğer e-posta admin ise admin login endpointine, değilse user login endpointine istek at
              const isAdmin = values.email.endsWith('@mail.com') || values.email.toLowerCase().includes('admin');
              const loginUrl = isAdmin ? 'https://localhost:7098/api/Admin/login' : 'https://localhost:7098/api/User/login';

              // JSON olarak gönder
              const payload = {
                Email: values.email,
                Password: values.password
              };
              const response = await apiPost(loginUrl, payload);
              const token = response.token;
              localStorage.setItem('isLoggedIn', 'true');
              localStorage.setItem('token', token);
              // JWT'den userId ve rolü decode et
              const decoded = jwtDecode(token);
              const userId =
                decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                decoded.nameid || decoded.sub || decoded.id || decoded.userId;
              const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
              if (!userId) {
                setError('Kullanıcı ID alınamadı. Lütfen tekrar deneyin.');
                setIsLoading(false);
                setSubmitting(false);
                return;
              }
              localStorage.setItem('userId', userId);
              localStorage.setItem('role', role);
              dispatch(login({ userId: userId, token: token }));
              if (role === 'Admin') {
                navigate('/admin');
              } else {
                navigate(`/profile/${userId}`);
              }
            } catch (error) {
              setError(parseApiError(error));
            } finally {
              setIsLoading(false);
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="input-group">
                <FiMail className="input-icon" />
                <Field
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                />
                <label>E-posta</label>
                <ErrorMessage name="email" component="div" className="error-message" />
              </div>

              <div className="input-group">
                <FiLock className="input-icon" />
                <Field
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                />
                <label>Şifre</label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
                <ErrorMessage name="password" component="div" className="error-message" />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading || isSubmitting}
              >
                {isLoading ? 'Yükleniyor...' : 'Giriş Yap'}
              </button>
            </Form>
          )}
        </Formik>

        <div className="auth-footer">
          Hesabınız yok mu?
          <Link to="/register" className="toggle-btn">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
// Açıklama: Login işlemi artık ortak apiPost fonksiyonu ile yapılmaktadır. Kodun her adımında Türkçe açıklamalar eklenmiştir.
