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
import { useSelector, useDispatch } from 'react-redux'; // Redux hook'ları
import { login } from '../store/userSlice'; // Kullanıcı işlemleri
import { Formik, Form, Field, ErrorMessage } from 'formik'; // Formik ile form yönetimi
import * as Yup from 'yup'; // Yup ile validasyon
import { apiPost, parseApiError } from '../utils/api'; // Ortak API fonksiyonları

// Form için Yup validasyon şeması
const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().min(2, 'Adınız en az 2 karakter olmalı').required('Adınız gereklidir'),
  lastName: Yup.string().min(2, 'Soyadınız en az 2 karakter olmalı').required('Soyadınız gereklidir'),
  email: Yup.string().email('Geçerli bir e-posta giriniz').required('E-posta gereklidir'),
  password: Yup.string().min(6, 'Şifre en az 6 karakter olmalı').required('Şifre gereklidir'),
  birthDate: Yup.date().max(new Date(), 'Doğum tarihi ileri bir tarih olamaz').required('Doğum tarihi gereklidir'),
  phone: Yup.string()
    .matches(/^(\+90|0)?\d{10}$/,
      'Telefon numarası geçersiz. Başında 0 veya +90 olmadan 10 haneli girin.')
    .required('Telefon numarası gereklidir'),
});

const RegisterPage = ({ darkMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Google ile kayıt fonksiyonu (dummy)
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

        {/* Formik ile form yönetimi */}
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            birthDate: '',
            phone: ''
          }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setIsLoading(true);
            setError('');
            try {
              // Ortak API fonksiyonu ile backend'e kayıt isteği gönder
              const payload = new FormData();
              payload.append('FirstName', values.firstName);
              payload.append('LastName', values.lastName);
              payload.append('Email', values.email);
              payload.append('PasswordHash', values.password); // Backend hash'leyecek
              payload.append('BirthDate', values.birthDate);
              payload.append('Phone', values.phone);
              payload.append('Role', 'User');
              const response = await apiPost('https://localhost:7098/api/User', payload);
              // Başarılı kayıtta Redux ile kullanıcıyı güncelle
              dispatch(login({ userId: response.userId, token: response.token }));
              navigate('/login');
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
                <FiUser className="input-icon" />
                <Field
                  type="text"
                  name="firstName"
                  required
                />
                <label>Adınız</label>
                <ErrorMessage name="firstName" component="div" className="error-message" />
              </div>

              <div className="input-group">
                <FiUser className="input-icon" />
                <Field
                  type="text"
                  name="lastName"
                  required
                />
                <label>Soyadınız</label>
                <ErrorMessage name="lastName" component="div" className="error-message" />
              </div>

              <div className="input-group">
                <FiMail className="input-icon" />
                <Field
                  type="email"
                  name="email"
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

              <div className="input-group">
                <FiCalendar className="input-icon" />
                <Field
                  type="date"
                  name="birthDate"
                  required
                  max={today}
                />
                <label>Doğum Tarihi</label>
                <ErrorMessage name="birthDate" component="div" className="error-message" />
              </div>

              <div className="input-group">
                <FiPhoneCall className="input-icon" />
                <Field
                  type="tel"
                  name="phone"
                  required
                />
                <label>Telefon</label>
                <ErrorMessage name="phone" component="div" className="error-message" />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading || isSubmitting}
              >
                {isLoading ? 'Yükleniyor...' : 'Kayıt Ol'}
              </button>
            </Form>
          )}
        </Formik>

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
// Açıklama: Kayıt işlemi artık ortak apiPost fonksiyonu ile yapılmaktadır. Kodun her adımında Türkçe açıklamalar eklenmiştir.