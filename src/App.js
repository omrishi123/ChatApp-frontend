import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Auth/Profile';
import ChatList from './components/Chat/ChatList';
import ChatWindow from './components/Chat/ChatWindow';
import UserSearch from './components/User/UserSearch';
import UserProfile from './components/User/UserProfile';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './context/AuthContext';
import useSocketMessageListener from './hooks/useSocketMessageListener';
import API from './utils/api.js';
import AdminPage from './pages/AdminPage';
import AdminLogin from './components/Admin/AdminLogin';

function App() {
  const { user, token, chatContacts } = useAuth();
  const [pinnedAnnouncement, setPinnedAnnouncement] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useSocketMessageListener(); // Listen for new messages globally

  useEffect(() => {
    if (!user) return;
    API.get('/api/admin/announcement', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(res => {
        setPinnedAnnouncement(res.data);
        setShowAnnouncement(true);
      })
      .catch(() => {});
  }, [user]);

  // Only show main app if user is logged in and not admin
  if (!user || user.isAdmin) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // For regular users, show all chat/user routes
  return (
    <Routes>
      <Route path="/profile" element={<Profile />} />
      <Route path="/search" element={<UserSearch />} />
      <Route path="/user/:id" element={<UserProfile />} />
      <Route path="/chat/:chatId" element={<ChatWindow />} />
      <Route path="/" element={<ChatList />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
