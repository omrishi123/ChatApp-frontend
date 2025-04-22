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
      // Always update chat preview/unread (even if chat is not open)
      setChats(prevChats => {
        let found = false;
        const updated = prevChats.map(chat => {
          if (chat._id === msg.chat) {
            found = true;
            return {
              ...chat,
              lastMessage: msg,
              unreadCount: (!activeChat || chat._id !== activeChat._id) ? (chat.unreadCount || 0) + 1 : 0
            };
          }
          return chat;
        });
        // If chat is not in list (e.g. new chat started), add it
        if (!found) {
          updated.unshift({
            _id: msg.chat,
            lastMessage: msg,
            unreadCount: 1,
            participants: msg.participants || [],
            otherUser: msg.sender // fallback
          });
        }
        return updated;
      });
      // If active chat is open, append message
      if (activeChat && msg.chat === activeChat._id) {
        if (!messages.some(m => m._id === msg._id)) {
          setMessages(prev => [...prev, msg].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        }
      }
      // Always play notification sound for any new message not sent by me
      if (msg.sender !== user._id && (!activeChat || msg.chat !== activeChat._id || !document.hasFocus())) {
        try {
          const apiUrl = process.env.REACT_APP_API_URL || '';
          const audio = new window.Audio(`${apiUrl}/notification.mp3`);
          audio.play().catch(() => {});
        } catch {}
      }
    }
    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [activeChat, messages, setMessages, setChats, user]);
}
