import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { FiCamera } from 'react-icons/fi';
import { IoSend } from 'react-icons/io5';
import { BsThreeDotsVertical } from 'react-icons/bs';
import './StatusTab.css';

export default function StatusTab({ token, user, chatContacts, onBack }) {
  const [statuses, setStatuses] = useState([]);
  const [myStatus, setMyStatus] = useState([]);
  const [statusText, setStatusText] = useState('');
  const [statusMedia, setStatusMedia] = useState(null);
  const [hideFrom, setHideFrom] = useState([]);
  const [showHideMenu, setShowHideMenu] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatuses();
    fetchMyStatus();
    // eslint-disable-next-line
  }, []);

  async function fetchStatuses() {
    setLoading(true);
    try {
      const res = await API.get('/api/status', { headers: { Authorization: `Bearer ${token}` } });
      setStatuses(res.data);
    } catch (err) {
      setError('Failed to load statuses');
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyStatus() {
    try {
      const res = await API.get('/api/status', { headers: { Authorization: `Bearer ${token}` } });
      setMyStatus(res.data.filter(s => s.user._id === user._id));
    } catch {}
  }

  async function handlePostStatus(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('text', statusText);
    if (statusMedia) formData.append('media', statusMedia);
    setError('');
    try {
      await API.post('/api/status', formData, { headers: { Authorization: `Bearer ${token}` } });
      setStatusText(''); setStatusMedia(null);
      fetchStatuses();
      fetchMyStatus();
    } catch {
      setError('Failed to post status');
    }
  }

  async function handleHideFromSave() {
    try {
      await API.post('/api/status/hide', { hideFromIds: hideFrom }, { headers: { Authorization: `Bearer ${token}` } });
      setShowHideMenu(false);
      fetchStatuses();
    } catch {
      setError('Failed to update hidden list');
    }
  }

  return (
    <div className="status-tab-container">
      <button onClick={onBack} className="status-back-btn">Back</button>
      <h2>Status</h2>
      <form className="status-upload-form" onSubmit={handlePostStatus}>
        <input type="text" placeholder="Type a status..." value={statusText} onChange={e => setStatusText(e.target.value)} />
        <label className="status-upload-camera">
          <FiCamera size={22} />
          <input type="file" accept="image/*,video/*" onChange={e => setStatusMedia(e.target.files[0])} style={{ display: 'none' }} />
        </label>
        <button type="submit" className="status-upload-send"><IoSend size={22} /></button>
        <button type="button" className="status-upload-menu" onClick={() => setShowMenu(!showMenu)}><BsThreeDotsVertical size={20} /></button>
      </form>
      {showMenu && (
        <div className="status-menu-dropdown">
          <button onClick={() => setShowHideMenu(true)}>Hide status from...</button>
          {/* More menu features can be added here */}
        </div>
      )}
      {showHideMenu && (
        <div className="hide-status-menu">
          <h4>Hide status from:</h4>
          <ul>
            {chatContacts.map(c => (
              <li key={c._id}>
                <label>
                  <input
                    type="checkbox"
                    checked={hideFrom.includes(c._id)}
                    onChange={e => {
                      if (e.target.checked) setHideFrom([...hideFrom, c._id]);
                      else setHideFrom(hideFrom.filter(id => id !== c._id));
                    }}
                  />
                  {c.username || c.email}
                </label>
              </li>
            ))}
          </ul>
          <button onClick={handleHideFromSave}>Save</button>
          <button onClick={() => setShowHideMenu(false)}>Cancel</button>
        </div>
      )}
      <div className="status-feed">
        <h3>My Status</h3>
        {myStatus.length === 0 ? <div>No status posted.</div> : myStatus.map(s => (
          <div className="status-item" key={s._id}>
            {s.media && <img src={s.media.startsWith('http') ? s.media : `/uploads/${s.media}`} alt="status" className="status-media" />}
            <div>{s.text}</div>
            <div className="status-meta">{new Date(s.createdAt).toLocaleString()}</div>
          </div>
        ))}
        <h3>Recent Statuses</h3>
        {loading ? <div>Loading...</div> : statuses.length === 0 ? <div>No statuses from contacts.</div> : statuses.map(s => (
          <div className="status-item" key={s._id}>
            <div className="status-user">{s.user.username || s.user.email}</div>
            {s.media && <img src={s.media.startsWith('http') ? s.media : `/uploads/${s.media}`} alt="status" className="status-media" />}
            <div>{s.text}</div>
            <div className="status-meta">{new Date(s.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
      {error && <div className="status-error">{error}</div>}
    </div>
  );
}
