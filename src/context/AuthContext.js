import React, { createContext, useState, useContext, useEffect } from 'react';
import { getProfile } from '../utils/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      getProfile(token)
  .then(u => setUser({ ...u, id: u.id || u._id }))
  .catch(() => { setUser(null); setToken(null); localStorage.removeItem('token'); });
    }
  }, [token]);

  const login = (token, user) => {
    setToken(token);
    // Ensure user.id is always set, even if backend sends _id
    setUser({ ...user, id: user.id || user._id });
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
