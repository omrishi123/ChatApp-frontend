import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import './StatusList.css';

export default function StatusList({ token, user, chatContacts, onOpenViewer }) {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatuses();
    // eslint-disable-next-line
  }, []);

  async function fetchStatuses() {
    setLoading(true);
    try {
      const res = await API.get('/api/status', { headers: { Authorization: `Bearer ${token}` } });
      // Group statuses by user
      const grouped = {};
      res.data.forEach(s => {
        if (!grouped[s.user._id]) grouped[s.user._id] = { user: s.user, items: [] };
        grouped[s.user._id].items.push(s);
      });
      setStatuses(Object.values(grouped));
    } catch (err) {
      setError('Failed to load statuses');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="status-list-loading">Loading...</div>;
  if (error) return <div className="status-list-error">{error}</div>;

  return (
    <div className="status-list">
      <h3>Recent Statuses</h3>
      {statuses.length === 0 ? (
        <div>No statuses from contacts.</div>
      ) : (
        <ul>
          {statuses.map(s => (
            <li key={s.user._id} className="status-list-item" onClick={() => onOpenViewer(s)}>
              <img
                src={s.user.profilePic ? (s.user.profilePic.startsWith('/uploads/') ? `${process.env.REACT_APP_API_URL}${s.user.profilePic}` : `${process.env.REACT_APP_API_URL}/uploads/${s.user.profilePic}`) : '/default-avatar.png'}
                alt={s.user.username}
                className="status-list-avatar"
              />
              <span className="status-list-username">{s.user.username}</span>
              {s.items[0].media && (
                <img src={s.items[0].media.startsWith('http') ? s.items[0].media : `/uploads/${s.items[0].media}`} alt="thumb" className="status-list-thumb" />
              )}
              {s.items[0].text && !s.items[0].media && <span className="status-list-thumb-text">{s.items[0].text.slice(0, 20)}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
