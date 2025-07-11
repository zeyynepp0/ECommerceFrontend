import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Header from './components/Header';
import HomePage from './page/HomePage';
import LoginPage from './page/LoginPage';
import RegisterPage from './page/RegisterPage';
import Footer from './components/Footer';
import ProductsPage from './page/ProductsPage';
import ProductDetailsPage from './page/ProductDetailsPage'; 
import { CartProvider } from './components/CartContext';
import './App.css';
import axios from 'axios';
import CartPage from './page/CartPage';
import CheckoutPage from './page/CheckoutPage';
import { useUser } from './components/UserContext';
import { UserProvider } from './components/UserContext';

import ProfilePage from './page/ProfilePage';

const API = axios.create({
  baseURL: 'https://your-api-endpoint.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});


function App() {
  const [darkMode, setDarkMode] = useState(false);
  const { isLoggedIn, login, logout, userId } = useUser();


  return (
    <UserProvider>
    <CartProvider>
    <Router>
      <div className={`app ${darkMode ? 'dark' : ''}`}></div>
        <Header 
          darkMode={darkMode} 
          setDarkMode={setDarkMode}
        />
        <Routes>
          <Route path="/" element={<HomePage darkMode={darkMode} setDarkMode={setDarkMode} isLoggedIn={isLoggedIn} />} /> 
          <Route path="/products" element={<ProductsPage darkMode={darkMode} />} />
          <Route path="/products/:id" element={<ProductDetailsPage darkMode={darkMode} />} />
          <Route path="/cart" element={<CartPage darkMode={darkMode} />} />
          <Route path="/checkout" element={<CheckoutPage darkMode={darkMode} />} />
          <Route path="/profile/:userId" element={<ProfilePage darkMode={darkMode} />} />
          <Route path="/login" element={<LoginPage darkMode={darkMode} />} />
          <Route path="/register" element={<RegisterPage darkMode={darkMode} />} />
        </Routes>

      <div className={`app ${darkMode ? 'dark' : ''}`}></div>
      <Footer darkMode={darkMode} />
    
    </Router>
    </CartProvider>
    </UserProvider>
     
  );
}

export default App;