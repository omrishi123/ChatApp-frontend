import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { searchUsers, startChat } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function UserSearch() {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async e => {
    e.preventDefault();
    if (!query) return;
    try {
      const users = await searchUsers(token, query);
      setResults(users);
    } catch (err) {
      toast.error('Search failed');
    }
  };

  const handleStartChat = async userId => {
    try {
      const chat = await startChat(token, userId);
      navigate(`/chat/${chat._id}`);
    } catch (err) {
      toast.error('Could not start chat');
    }
  };

  return (
    <div className="user-search-container">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Search username" value={query} onChange={e => setQuery(e.target.value)} />
        <button type="submit">Search</button>
      </form>
      <ul className="user-search-results">
        {results.map(u => (
          <li key={u._id}>
            <img src={
              u.profilePic
                ? (u.profilePic.startsWith('/uploads/') 
                  ? `${process.env.REACT_APP_API_URL}${u.profilePic}` 
                  : `${process.env.REACT_APP_API_URL}/uploads/${u.profilePic}`)
                : '/default-avatar.png'
            } alt={u.username} className="profile-pic" />
            <span>{u.username}</span>
            <button onClick={() => handleStartChat(u._id)}>Chat</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
