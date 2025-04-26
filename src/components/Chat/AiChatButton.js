import React from 'react';

export default function AiChatButton({ onClick }) {
  return (
    <button className="ai-chat-btn" onClick={onClick} style={{ marginLeft: 8, background: '#ffe082', color: '#222', borderRadius: 20, padding: '6px 18px', fontWeight: 600 }}>
      OM'S AI
    </button>
  );
}
