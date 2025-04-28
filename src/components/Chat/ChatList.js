import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { getChats } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../../utils/socket';
import { formatTime } from '../../utils/helpers';
import StatusTab from './StatusTab'; // Import StatusTab component

export default function ChatList() {
  const { user, token, logout } = useAuth();
  const { chats, setChats, setActiveChat, resetMessages } = useChat();
  const navigate = useNavigate();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (!token) return;
    getChats(token).then(chats => {
      setChats(chats);
      const socket = getSocket();
      // Join all user chats for global real-time updates (chat list and chat window)
      socket.emit('joinAllUserChats', { userId: user.id });
      socket.emit('userOnline', { userId: user.id });
      return () => socket.disconnect();
    });
  }, [token, setChats, user]);

  const openChat = chat => {
    resetMessages(); // Clear previous chat messages before navigating
    setActiveChat(chat);
    // Reset unread count
    setChats(prevChats => prevChats.map(c => c._id === chat._id ? { ...c, unreadCount: 0 } : c));
    navigate(`/chat/${chat._id}`);
  };

  // Helper for online status
  function renderStatus(user) {
    if (user.online) return <span style={{color:'#25d366',fontWeight:'bold',fontSize:'0.8em',marginLeft:6}}>● Online</span>;
    if (user.lastSeen) {
      const last = new Date(user.lastSeen);
      const now = new Date();
      const diff = Math.floor((now - last)/60000);
      if (diff < 1) return <span style={{color:'#888',fontSize:'0.8em',marginLeft:6}}>last seen just now</span>;
      if (diff < 60) return <span style={{color:'#888',fontSize:'0.8em',marginLeft:6}}>last seen {diff} min ago</span>;
      return <span style={{color:'#888',fontSize:'0.8em',marginLeft:6}}>last seen {last.toLocaleString()}</span>;
    }
    return null;
  }

  return (
    <div className="chat-list-container">
      <header>
        <img
          src={user && user.profilePic ? user.profilePic.startsWith('/uploads/') ? `${process.env.REACT_APP_API_URL}${user.profilePic}` : `${process.env.REACT_APP_API_URL}/uploads/${user.profilePic}` : '/default-avatar.png'}
          alt="Me"
          className="profile-pic"
          onClick={() => navigate('/profile')}
        />
        <button onClick={() => navigate('/search')}>New Chat</button>
        <button onClick={() => setShowStatus(true)} style={{marginLeft:8}}>
          <span role="img" aria-label="Status">🟢</span> Status
        </button>
        <button onClick={logout}>Logout</button>
      </header>
      {showStatus ? (
        <StatusTab
          token={token}
          user={user}
          chatContacts={chats.map(chat => chat.otherUser || chat.participants.find(u => u._id !== user.id))}
          onBack={() => setShowStatus(false)}
        />
      ) : (
        <>
          <h2>Chats</h2>
          <ul className="chat-list">
            {chats.map(chat => {
              const other = chat.otherUser || chat.participants.find(u => u._id !== user.id);
              return (
                <li key={chat._id} className="chat-list-item" onClick={() => openChat(chat)}>
                  <img
                    src={other && other.profilePic ? other.profilePic.startsWith('/uploads/') ? `${process.env.REACT_APP_API_URL}${other.profilePic}` : `${process.env.REACT_APP_API_URL}/uploads/${other.profilePic}` : '/default-avatar.png'}
                    alt={other.username}
                    className="profile-pic"
                    onClick={e => { e.stopPropagation(); navigate(`/user/${other._id || other.id}`); }}
                    style={{ cursor: 'pointer' }}
                  />
                  {renderStatus(other)}
                  <div>
                    <div className="chat-title">{other.username}</div>
                    <div className="last-message">{chat.lastMessage?.text || (chat.lastMessage?.media ? '[Media]' : '')}</div>
                  </div>
                  <div className="chat-meta">
                    <span>{chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : ''}</span>
                    {chat.unreadCount > 0 && (
                      <span className="unread-badge">{chat.unreadCount}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
