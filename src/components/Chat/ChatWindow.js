import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { getMessages, sendMessage } from '../../utils/api';
import { getSocket } from '../../utils/socket';
import MessageInput from './MessageInput';
import ImagePreviewModal from './ImagePreviewModal';
import { formatTime } from '../../utils/helpers';
import { linkify } from '../../utils/linkify';
import '../../whatsapp-theme.css';

export default function ChatWindow() {
  const { chatId } = useParams();
  const { user, token } = useAuth();
  console.log('user:', user);
  const { chats, messages, setMessages } = useChat();
  const [typing, setTyping] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const deleteTimeoutRef = useRef(null);
  const messagesEndRef = useRef();
  const messagesListRef = useRef();

  // Track if user is at bottom
  const [isAtBottom, setIsAtBottom] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!chatId || !token) return;
    getMessages(token, chatId).then(setMessages);
    const socket = getSocket();
    socket.emit('joinChat', { chatId });
    // Mark all received (not yet seen) messages as seen
    const unseen = messages.filter(m => m.receiver === user.id && !m.seen);
    unseen.forEach(m => {
      socket.emit('seenMessage', { chatId, messageId: m._id, userId: user.id });
    });
    // Real-time: update messages in-memory on newMessage, no reload
    socket.on('newMessage', m => {
      if (m.chat === chatId) {
        setMessages(prev => {
          // Avoid duplicates by _id
          if (prev.some(msg => msg._id === m._id)) return prev;
          // Always sort by createdAt after adding
          const updated = [...prev, m].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          return updated;
        });
      }
    });
    // Listen for messageSeen event
    socket.on('messageSeen', ({ messageId, userId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, seen: true } : m));
    });
    socket.on('typing', ({ chatId: cId, userId }) => {
      if (cId === chatId && userId !== user.id) setTyping(true);
    });
    socket.on('stopTyping', ({ chatId: cId, userId }) => {
      if (cId === chatId && userId !== user.id) setTyping(false);
    });
    return () => {
      socket.off('newMessage');
      socket.off('messageSeen');
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [chatId, token, setMessages, chats, user, messages]);

  useEffect(() => {
    const chat = chats.find(c => c._id === chatId);
    if (chat) {
      setOtherUser(chat.otherUser || chat.participants.find(u => u._id !== user.id));
    }
  }, [chatId, chats, user.id]);

  useEffect(() => {
    // Only scroll to bottom if user is already at bottom
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  // Scroll handler
  const handleScroll = () => {
    const el = messagesListRef.current;
    if (!el) return;
    // If user is within 40px of bottom, treat as "at bottom"
    setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 40);
  };

  // Delete message API call
  async function handleDeleteMessage() {
    if (!selectedMessageId) return;
    try {
      await fetch(`${process.env.REACT_APP_API_URL || ''}/api/messages/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messageId: selectedMessageId, forEveryone: false })
      });
      setMessages(prev => prev.filter(m => m._id !== selectedMessageId));
      setSelectedMessageId(null);
      setShowDelete(false);
    } catch (err) {
      setSelectedMessageId(null);
      setShowDelete(false);
      alert('Failed to delete message');
    }
  }

  // Clear chat API call
  async function handleClearChat() {
    if (!chatId) return;
    try {
      await fetch(`${process.env.REACT_APP_API_URL || ''}/api/messages/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chatId })
      });
      setMessages([]);
      setSelectedMessageId(null);
      setShowDelete(false);
    } catch (err) {
      alert('Failed to clear chat');
    }
  }

  function handleLongPressStart(messageId) {
    deleteTimeoutRef.current = setTimeout(() => {
      setSelectedMessageId(messageId);
      setShowDelete(true);
    }, 500); // 0.5 seconds
  }
  function handleLongPressEnd() {
    clearTimeout(deleteTimeoutRef.current);
  }

  const [sending, setSending] = useState(false);

  // Find if this is AI chat
  const isAiChat = otherUser && (otherUser.ai_bot || otherUser.username === "OM'S AI");

  // Custom send handler for AI chat
  async function handleSendAi(text) {
    setSending(true);
    try {
      const res = await sendMessage(token, text, chatId);
      setMessages(prev => [...prev, res]);
    } catch (err) {
      alert('Error sending message: ' + (err?.response?.data?.msg || err.message));
    }
    setSending(false);
  }

  const [previewMedia, setPreviewMedia] = useState(null); // {src, type}

  return (
    <div className="chat-window-container">
      <header className="chat-header">
        <span
          onClick={() => otherUser && navigate(`/user/${otherUser._id || otherUser.id}`)}
          style={{ cursor: 'pointer', display: 'inline-block' }}
        >
          <img
            src={
              otherUser?.profilePic
                ? otherUser.profilePic.startsWith('/uploads/')
                  ? `${process.env.REACT_APP_API_URL}${otherUser.profilePic}`
                  : `${process.env.REACT_APP_API_URL}/uploads/${otherUser.profilePic}`
                : '/default-avatar.png'
            }
            alt={otherUser?.username}
            className="profile-pic"
          />
        </span>
        <span className="chat-user-name">{otherUser?.username}</span>
        <span className="typing-indicator">{typing && 'Typing...'}</span>
      </header>
      <div className="messages-list" style={{ marginBottom: '70px' }}
        ref={messagesListRef}
        onScroll={handleScroll}
      >
        {[...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(m => {
          const senderId = typeof m.sender === 'object' ? m.sender._id : m.sender;
          const isMe = senderId === user.id;
          console.log('msg:', m.text, '| sender:', m.sender, '| senderId:', senderId, '| user.id:', user.id, '| isMe:', isMe);
          return (
            <div
              key={m._id}
              className={`message${isMe ? ' me' : ' other'}${selectedMessageId === m._id ? ' selected' : ''}`}
              style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                textAlign: isMe ? 'right' : 'left',
                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                marginLeft: isMe ? 'auto' : 0,
                marginRight: isMe ? 0 : 'auto',
                maxWidth: '60%',
                fontSize: '0.95em',
                padding: '7px 12px',
                marginBottom: '6px',
                boxShadow: '0 1px 2px #0001',
                wordBreak: 'break-word',
                border: selectedMessageId === m._id ? '2px solid #25d366' : 'none',
                opacity: selectedMessageId && selectedMessageId !== m._id ? 0.65 : 1
              }}
              onMouseDown={e => { if (e.button === 0) handleLongPressStart(m._id); }}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onTouchStart={() => handleLongPressStart(m._id)}
              onTouchEnd={handleLongPressEnd}
            >
              {m.media && (
                m.media.match(/\.(mp4|webm|ogg)$/i)
                  ? <video src={m.media.startsWith('http') ? m.media : `${process.env.REACT_APP_API_URL}/uploads/${m.media.replace(/^.*[\\/]/, '')}`} controls className="media-preview" style={{maxWidth:'100%',borderRadius:'8px',marginBottom:'4px',cursor:'pointer'}} onClick={() => setPreviewMedia({src: m.media.startsWith('http') ? m.media : `${process.env.REACT_APP_API_URL}/uploads/${m.media.replace(/^.*[\\/]/, '')}`, type: 'video', username: otherUser?.username})} />
                  : <img src={m.media.startsWith('http') ? m.media : `${process.env.REACT_APP_API_URL}/uploads/${m.media.replace(/^.*[\\/]/, '')}`} alt="media" className="media-preview" style={{maxWidth:'100%',borderRadius:'8px',marginBottom:'4px',cursor:'pointer'}} onClick={() => setPreviewMedia({src: m.media.startsWith('http') ? m.media : `${process.env.REACT_APP_API_URL}/uploads/${m.media.replace(/^.*[\\/]/, '')}`, type: 'image', username: otherUser?.username})} />
              )}
              <span
                className="text"
                dangerouslySetInnerHTML={{ __html: linkify(m.text || m.content || '') }}
              />
              <span className="meta" style={{fontSize:'0.75em',color:'#555',display:'block',marginTop:'2px'}}>
                {formatTime(m.createdAt)}
                {isMe && (
                  <span className={`tick${m.seen ? ' seen' : ''}`}>{m.seen ? '✔✔' : '✔'}</span>
                )}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {showDelete && selectedMessageId && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1000,
            display: 'flex',
            gap: 10
          }}
        >
          <button
            style={{
              background: '#ff5252',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              fontSize: '1.4em',
              boxShadow: '0 2px 8px #0002',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            title="Delete message"
            onClick={handleDeleteMessage}
          >
            🗑️
          </button>
          <button
            style={{
              background: '#008069',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              fontSize: '1.4em',
              boxShadow: '0 2px 8px #0002',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            title="Clear chat"
            onClick={handleClearChat}
          >
            🧹
          </button>
        </div>
      )}
      {previewMedia && (
        <ImagePreviewModal
          src={previewMedia.src}
          type={previewMedia.type}
          username={previewMedia.username}
          onClose={() => setPreviewMedia(null)}
        />
      )}
      <MessageInput
        chatId={chatId}
        onSend={handleSendAi}
        disabled={sending}
      />
    </div>
  );
}
