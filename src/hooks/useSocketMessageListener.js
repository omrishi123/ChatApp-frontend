import { useEffect } from 'react';
import { getSocket } from '../utils/socket';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

// This hook listens globally for new messages and updates the relevant chat/message state
export default function useSocketMessageListener() {
  const { activeChat, messages, setMessages, chats, setChats } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    const socket = getSocket();
    function handleNewMessage(msg) {
      console.log('Received newMessage:', msg);
      // Update chat preview/unread even if chat is not open
      setChats(prevChats => {
        return prevChats.map(chat =>
          chat._id === msg.chat
            ? { ...chat, lastMessage: msg, unreadCount: chat._id === (activeChat && activeChat._id) ? 0 : (chat.unreadCount || 0) + 1 }
            : chat
        );
      });
      // If active chat is open, append message
      if (activeChat && msg.chat === activeChat._id) {
        if (!messages.some(m => m._id === msg._id)) {
          setMessages(prev => [...prev, msg].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        }
      }
      // Play notification sound if chat is not open
      if (!activeChat || msg.chat !== activeChat._id) {
        const apiUrl = process.env.REACT_APP_API_URL || '';
        const audio = new window.Audio(`${apiUrl}/public/notification.mp3`);
        audio.play();
      }
    }
    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [activeChat, messages, setMessages, setChats]);
}
