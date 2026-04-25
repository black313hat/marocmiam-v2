import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { requestNotificationPermission } from '../firebase';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const res = await API.post('/auth/login/', credentials);
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    localStorage.setItem('user', JSON.stringify(res.data.user));

    // Set token BEFORE calling notifications
    API.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;

    setUser(res.data.user);

    requestNotificationPermission().then(token => {
      if (token) {
        API.post('/notifications/token/', { token }).catch(() => { });
      }
    });
    return res;
  };

  const register = async (data) => {
    const res = await API.post('/auth/register/', data);
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    localStorage.setItem('user', JSON.stringify(res.data.user));

    // Set token BEFORE calling notifications
    API.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;

    setUser(res.data.user);
    requestNotificationPermission().then(token => {
      if (token) {
        API.post('/notifications/token/', { token }).catch(() => { });
      }
    });
    return res;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);