import { useEffect, useRef } from 'react';
import { getSocket } from '../utils/socket';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

// This hook listens globally for new messages and updates the relevant chat/message state
export default function useSocketMessageListener() {
  const { activeChat, messages, setMessages, setChats } = useChat();
  const { user } = useAuth();
  // Refs to always access latest values inside handler
  const activeChatRef = useRef(activeChat);
  const messagesRef = useRef(messages);
  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    const socket = getSocket();
    function handleNewMessage(msg) {
      console.log('Received newMessage:', msg);
      setChats(prevChats => {
        let found = false;
        const updated = prevChats.map(chat => {
          if (chat._id === msg.chat) {
            found = true;
            return {
              ...chat,
              lastMessage: msg,
              unreadCount: (!activeChatRef.current || chat._id !== activeChatRef.current._id) ? (chat.unreadCount || 0) + 1 : 0
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
      if (activeChatRef.current && msg.chat === activeChatRef.current._id) {
        if (!messagesRef.current.some(m => m._id === msg._id)) {
          setMessages(prev => [...prev, msg].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        }
      }
      // Always play notification sound for any new message not sent by me
      if (msg.sender !== user._id && (!activeChatRef.current || msg.chat !== activeChatRef.current._id || !document.hasFocus())) {
        try {
          const audio = new window.Audio('/notification.mp3');
          audio.play().catch(() => {});
        } catch {}
      }
    }
    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [setChats, setMessages, user._id]);
}
