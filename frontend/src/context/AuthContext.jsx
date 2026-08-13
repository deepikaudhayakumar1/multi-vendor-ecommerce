import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      API.get('/users/profile')
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      setToken(res.data.token);
      setUser({
        id: res.data.userId,
        email: res.data.email,
        name: res.data.name,
        role: res.data.role,
      });
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Invalid credentials. Please check your email and password.';
    }
  };

  const register = async (userData) => {
    try {
      const res = await API.post('/auth/register', userData);
      setToken(res.data.token);
      setUser({
        id: res.data.userId,
        email: res.data.email,
        name: res.data.name,
        role: res.data.role,
      });
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Registration failed. Please check your input.';
    }
  };

  const logout = () => {
    API.post('/auth/logout').catch(() => {});
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
