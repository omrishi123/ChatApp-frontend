import React, { useState } from 'react.js';
import { useAuth } from '../../context/AuthContext.js';
import { useChat } from '../../context/ChatContext.js';
import { sendMessage } from '../../utils/api.js';
import { getSocket } from '../../utils/socket.js';

export default function MessageInput({ chatId }) {
  const { user, token } = useAuth();
  const { setMessages } = useChat();
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  return (
    <form className="message-input" onSubmit={handleSend}>
      <input
        type="text"
        value={text}
        onChange={e => { setText(e.target.value); handleTyping(); }}
        placeholder="Type a message"
        disabled={uploading}
      />
      <input
        type="file"
        accept="image/png,image/jpeg"
        onChange={e => setMedia(e.target.files[0])}
        disabled={uploading}
      />
      <button type="submit" disabled={uploading || (!text && !media)}>Send</button>
    </form>
  );
}
