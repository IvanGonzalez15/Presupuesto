import { useState, useEffect, useMemo } from 'react';
import { authService } from '../services/api';

const decodeJWT = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export default function useAuth() {
  const [theme, setTheme] = useState(localStorage.getItem('lx_theme_preference') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lx_theme_preference', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [token, setToken] = useState(localStorage.getItem('lx_token') || '');
  const currentUser = useMemo(() => decodeJWT(token), [token]);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (nombre, password, setStatus) => {
    try {
      setLoginError('');
      const { data } = await authService.login(nombre, password);
      localStorage.setItem('lx_token', data.token);
      setToken(data.token);
      if (setStatus) setStatus(`¡Bienvenido, ${data.user.nombre}!`);
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Error de red al conectar al servidor');
    }
  };

  const handleLogout = (clearPendingUpdates) => {
    if (clearPendingUpdates) {
      clearPendingUpdates();
    }
    localStorage.removeItem('lx_token');
    setToken('');
  };

  return {
    theme,
    toggleTheme,
    token,
    setToken,
    currentUser,
    loginError,
    setLoginError,
    handleLogin,
    handleLogout
  };
}
