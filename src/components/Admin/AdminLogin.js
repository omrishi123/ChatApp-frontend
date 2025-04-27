import React, { useState } from 'react';
import API from '../../utils/api.js';
import './AdminPanel.css';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/api/auth/login', { email, password });
      if (!res.data.user.isAdmin) {
        setError('Not an admin account');
        setLoading(false);
        return;
      }
      onLogin(res.data.token);
    } catch (err) {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
}
