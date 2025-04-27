import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ onSelectSection, selectedSection }) {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="sidebar">
      <button
        className={selectedSection === 'chats' ? 'sidebar-btn active' : 'sidebar-btn'}
        onClick={() => onSelectSection('chats')}
      >
        Chats
      </button>
      {/* REMOVE Status button from Sidebar, Status is now only in ChatList */}
    </div>
  );
}
