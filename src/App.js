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

function App() {
  const { user } = useAuth();
  const [pinnedAnnouncement, setPinnedAnnouncement] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useSocketMessageListener(); // Listen for new messages globally

  useEffect(() => {
    if (!user) return;
    API.get('/api/admin/public-announcements')
      .then(res => {
        const pinned = res.data[0];
        if (pinned) {
          setPinnedAnnouncement(pinned);
          setShowAnnouncement(true);
          setTimeout(() => setShowAnnouncement(false), 10000);
        }
      })
      .catch(() => {});
  }, [user]);

  return (
    <>
      <ToastContainer />
      {(user && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) && showAnnouncement && pinnedAnnouncement && (
        <div style={{
          background: '#ffeeba',
          color: '#856404',
          padding: '12px',
          borderBottom: '1px solid #f5c6cb',
          fontWeight: 'bold',
          textAlign: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 9999
        }}>
          {pinnedAnnouncement.text}
        </div>
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={user ? <Profile /> : <Login />} />
        <Route path="/search" element={user ? <UserSearch /> : <Login />} />
        <Route path="/user/:id" element={user ? <UserProfile /> : <Login />} />
        <Route path="/chat/:chatId" element={user ? <ChatWindow /> : <Login />} />
        <Route path="/" element={user ? <ChatList /> : <Login />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  );
}

export default App;
