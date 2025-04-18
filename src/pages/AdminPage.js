import React, { useState } from 'react';
import AdminLogin from '../components/Admin/AdminLogin';
import AdminPanel from '../components/Admin/AdminPanel';

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');

  function handleLogin(newToken) {
    setToken(newToken);
    localStorage.setItem('admin_token', newToken);
  }
  function handleLogout() {
    setToken('');
    localStorage.removeItem('admin_token');
  }

  return (
    <div>
      {!token ? (
        <AdminLogin onLogin={handleLogin} />
      ) : (
        <AdminPanel token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}
