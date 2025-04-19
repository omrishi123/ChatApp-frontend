import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { getChats } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../../utils/socket';
import { formatTime } from '../../utils/helpers';

export default function ChatList() {
  const { user, token, logout } = useAuth();
  const { chats, setChats, setActiveChat, resetMessages } = useChat();
  const navigate = useNavigate();

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

  return (
    <div className="chat-list-container">
      <header>
        <img
          src={
            user.profilePic
              ? user.profilePic.startsWith('/uploads/')
                ? `${process.env.REACT_APP_API_URL}${user.profilePic}`
                : `${process.env.REACT_APP_API_URL}/uploads/${user.profilePic}`
              : '/default-avatar.png'
          }
          alt="Me"
          className="profile-pic"
          onClick={() => navigate('/profile')}
        />
        <button onClick={() => navigate('/search')}>New Chat</button>
        <button onClick={logout}>Logout</button>
      </header>
      <h2>Chats</h2>
      <ul className="chat-list">
        {chats.map(chat => {
          const other = chat.otherUser || chat.participants.find(u => u._id !== user.id);
          return (
            <li key={chat._id} className="chat-list-item" onClick={() => openChat(chat)}>
              <img
                src={
                  other.profilePic
                    ? other.profilePic.startsWith('/uploads/')
                      ? `${process.env.REACT_APP_API_URL}${other.profilePic}`
                      : `${process.env.REACT_APP_API_URL}/uploads/${other.profilePic}`
                    : '/default-avatar.png'
                }
                alt={other.username}
                className="profile-pic"
              />
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
    </div>
  );
}
