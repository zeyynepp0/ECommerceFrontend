// src/components/UserContext.js
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const login = (id, token) => {
    setUserId(id);
    setIsLoggedIn(true);
    setToken(token);
    localStorage.setItem('userId', id);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUserId(null);
    setIsLoggedIn(false);
    setToken('');
    localStorage.clear();
  };

  return (
    <UserContext.Provider value={{ userId, isLoggedIn, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
