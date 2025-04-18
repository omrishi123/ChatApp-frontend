import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);

  // Add a resetMessages helper to clear messages when changing chats
  const resetMessages = () => setMessages([]);

  return (
    <ChatContext.Provider value={{ chats, setChats, activeChat, setActiveChat, messages, setMessages, resetMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
