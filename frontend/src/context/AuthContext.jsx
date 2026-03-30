import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure Axios Defaults globally
axios.defaults.baseURL = 'http://localhost:5000/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if(pad) {
      if(pad === 1) {
        throw new Error('Invalid base64 string');
      }
      base64 += new Array(5 - pad).join('=');
    }
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Token decode error:", e);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('nivas_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync Axios headers with token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      sessionStorage.setItem('nivas_token', token);
      
      // Decode JWT safely to get role/id in real systems or fetch profile
      // For MVP, we'll store basic role in localStorage locally upon login
      const storedRole = sessionStorage.getItem('nivas_role');
      const decodedUser = decodeToken(token);
      if (decodedUser) {
        setUser({ 
          id: decodedUser.id, 
          role: decodedUser.role || storedRole, 
          isVerified: decodedUser.isVerified,
          token 
        });
      } else if (storedRole) {
        setUser({ role: storedRole, token });
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      sessionStorage.removeItem('nivas_token');
      sessionStorage.removeItem('nivas_role');
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, role } = res.data.data;
        sessionStorage.setItem('nivas_role', role);
        setToken(token);
        return { success: true };
      }
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await axios.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        const { token, role: userRole } = res.data.data;
        sessionStorage.setItem('nivas_role', userRole);
        setToken(token);
        return { success: true };
      }
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
