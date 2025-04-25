import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { sendMessage } from '../../utils/api';
import { getSocket } from '../../utils/socket';

export default function MessageInput({ chatId }) {
  const { user, token } = useAuth();
  const { setMessages } = useChat();
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  const socket = getSocket();

  const handleSend = async e => {
    e.preventDefault();
    if (!text && !media) return;
    setUploading(true);
    try {
      const data = { chatId, text, media, mediaType: media ? media.type.split('/')[0] : 'none' };
      const msg = await sendMessage(token, data);
      setMessages(prev => [...prev, msg]);
      socket.emit('sendMessage', msg);
      setText('');
      setMedia(null);
    } catch (err) {
      // handle error
    }
    setUploading(false);
  };

  const handleTyping = () => {
    socket.emit('typing', { chatId, userId: user.id });
    setTimeout(() => socket.emit('stopTyping', { chatId, userId: user.id }), 1500);
  };

  const handleFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
      setSelectedFileName(e.target.files[0].name);
    } else {
      setMedia(null);
      setSelectedFileName('');
    }
  };

  return (
    <form className="message-input" onSubmit={handleSend} style={{display:'flex',alignItems:'center',gap:8}}>
      <input
        type="text"
        value={text}
        onChange={e => { setText(e.target.value); handleTyping(); }}
        placeholder="Type a message"
        disabled={uploading}
        style={{flex:1,minWidth:0}}
      />
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginRight:4}}>
        {selectedFileName && (
          <span style={{fontSize:'0.8em',marginBottom:2,wordBreak:'break-all',maxWidth:70,textAlign:'center'}}>{selectedFileName}</span>
        )}
        <label htmlFor="msg-file-upload" style={{cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',background:'none',border:'none',padding:0}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19V5a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2z"></path><circle cx="12" cy="13" r="4"></circle><path d="M12 9v4l2 2"></path></svg>
          <input
            id="msg-file-upload"
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
            disabled={uploading}
            style={{display:'none'}}
          />
        </label>
      </div>
      <button type="submit" disabled={uploading || (!text && !media)} style={{marginLeft:0,marginRight:0,background:'#25d366',color:'#fff',border:'none',borderRadius:'50%',width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2em',boxShadow:'0 1px 2px #0001',cursor: uploading ? 'not-allowed' : 'pointer'}}>
        <span role="img" aria-label="Send">➤</span>
      </button>
    </form>
  );
}
