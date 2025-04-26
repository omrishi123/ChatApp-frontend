import React, { useEffect, useState } from 'react';
import API from '../../utils/api.js';
import './AdminPanel.css';
import AiBotProfilePic from './AiBotProfilePic';

export default function AdminPanel({ token, onLogout }) {
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetUserId, setResetUserId] = useState('');
  const [tab, setTab] = useState('users');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // --- New: Admin Edit User ---
  const [editUserId, setEditUserId] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserUsername, setEditUserUsername] = useState('');
  const [editUserProfilePic, setEditUserProfilePic] = useState('');
  const [activityUserId, setActivityUserId] = useState('');
  const [userActivity, setUserActivity] = useState(null);

  // --- Analytics and Moderation State ---
  const [stats, setStats] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');

  // --- Announcements State ---
  const [announcements, setAnnouncements] = useState([]);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementPinned, setAnnouncementPinned] = useState(false);

  // --- Support & System Tools State ---
  const [impersonateUserId, setImpersonateUserId] = useState('');
  const [impersonateToken, setImpersonateToken] = useState('');
  const [chatHistoryUserId, setChatHistoryUserId] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [serverHealth, setServerHealth] = useState(null);
  const [backupStatus, setBackupStatus] = useState('');
  const [restoreStatus, setRestoreStatus] = useState('');

  // --- AI Bot Profile Pic ---
  const [aiBotPic, setAiBotPic] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([fetchUsers(), fetchChats(), fetchMessages()])
      .catch(e => setError('Failed to load admin data'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Fetch AI bot user profile pic on mount
    API.get('/api/users/ai-bot-profile').then(res => setAiBotPic(res.data.profilePic)).catch(() => {});
  }, []);

  async function fetchUsers() {
    try {
      const res = await API.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
    }
  }
  async function fetchChats() {
    try {
      const res = await API.get('/api/admin/chats', { headers: { Authorization: `Bearer ${token}` } });
      setChats(res.data);
    } catch (err) {
      setError('Failed to fetch chats: ' + (err.response?.data?.message || err.message));
    }
  }
  async function fetchMessages() {
    try {
      const res = await API.get('/api/admin/messages', { headers: { Authorization: `Bearer ${token}` } });
      setMessages(res.data);
    } catch (err) {
      setError('Failed to fetch messages: ' + (err.response?.data?.message || err.message));
    }
  }

  async function fetchStats() {
    try {
      const res = await API.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      setStats(res.data);
    } catch (err) {
      setError('Failed to fetch stats: ' + (err.response?.data?.message || err.message));
    }
  }

  async function fetchKeywords() {
    try {
      const res = await API.get('/api/admin/keywords', { headers: { Authorization: `Bearer ${token}` } });
      setKeywords(res.data);
    } catch (err) {
      setError('Failed to fetch keywords: ' + (err.response?.data?.message || err.message));
    }
  }

  async function fetchAnnouncements() {
    try {
      const res = await API.get('/api/admin/announcements', { headers: { Authorization: `Bearer ${token}` } });
      setAnnouncements(res.data);
    } catch (err) {
      setError('Failed to fetch announcements: ' + (err.response?.data?.message || err.message));
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!selectedUser || !messageContent) return;
    setStatus('Sending...');
    setError('');
    try {
      await API.post('/api/admin/message', {
        toUserId: selectedUser,
        content: messageContent
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMessageContent('');
      setStatus('Message sent!');
      fetchMessages();
    } catch (err) {
      setError('Failed to send message: ' + (err.response?.data?.message || err.message));
      setStatus('');
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!resetUserId || !resetPassword) return;
    setStatus('Resetting...');
    setError('');
    try {
      await API.post('/api/admin/reset-password', {
        userId: resetUserId,
        newPassword: resetPassword
      }, { headers: { Authorization: `Bearer ${token}` } });
      setResetPassword('');
      setStatus('Password reset!');
    } catch (err) {
      setError('Failed to reset password: ' + (err.response?.data?.message || err.message));
      setStatus('');
    }
  }

  async function handleBanUser(userId, banned) {
    setStatus(banned ? 'Unbanning user...' : 'Banning user...');
    setError('');
    try {
      const res = await API.post('/api/admin/ban', { userId }, { headers: { Authorization: `Bearer ${token}` } });
      setStatus(res.data.msg);
      fetchUsers();
    } catch (err) {
      setError('Failed to ban/unban user: ' + (err.response?.data?.message || err.message));
      setStatus('');
    }
  }

  async function handleEditUser(e) {
    e.preventDefault();
    setStatus('Updating user...');
    setError('');
    try {
      await API.post('/api/admin/edit-user', {
        userId: editUserId,
        email: editUserEmail,
        username: editUserUsername,
        profilePic: editUserProfilePic
      }, { headers: { Authorization: `Bearer ${token}` } });
      setStatus('User updated!');
      setEditUserId(''); setEditUserEmail(''); setEditUserUsername(''); setEditUserProfilePic('');
      fetchUsers();
    } catch (err) {
      setError('Failed to update user: ' + (err.response?.data?.message || err.message));
      setStatus('');
    }
  }

  async function handleGetUserActivity(userId) {
    setStatus('Fetching user activity...');
    setError('');
    try {
      const res = await API.get(`/api/admin/user-activity/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setUserActivity(res.data);
      setActivityUserId(userId);
      setStatus('');
    } catch (err) {
      setError('Failed to fetch user activity: ' + (err.response?.data?.message || err.message));
      setStatus('');
    }
  }

  async function handleDeleteMessage(messageId) {
    setStatus('Deleting message...');
    setError('');
    try {
      await API.post('/api/admin/delete-message', { messageId }, { headers: { Authorization: `Bearer ${token}` } });
      setStatus('Message deleted!');
      fetchMessages();
    } catch (err) {
      setError('Failed to delete message: ' + (err.response?.data?.message || err.message));
      setStatus('');
    }
  }

  async function handleDeleteChat(chatId) {
    setStatus('Deleting chat...');
    setError('');
    try {
      await API.post('/api/admin/delete-chat', { chatId }, { headers: { Authorization: `Bearer ${token}` } });
      setStatus('Chat deleted!');
      fetchChats();
      fetchMessages();
    } catch (err) {
      setError('Failed to delete chat: ' + (err.response?.data?.message || err.message));
      setStatus('');
    }
  }

  async function handleAddKeyword(e) {
    e.preventDefault();
    if (!newKeyword) return;
    setStatus('Adding keyword...');
    setError('');
    try {
      await API.post('/api/admin/add-keyword', { word: newKeyword }, { headers: { Authorization: `Bearer ${token}` } });
      setNewKeyword('');
      setStatus('Keyword added!');
      fetchKeywords();
    } catch (err) {
      setError('Failed to add keyword: ' + (err.response?.data?.message || err.message));
      setStatus('');
    }
  }

  async function handleRemoveKeyword(word) {
    setStatus('Removing keyword...');
    setError('');
    try {
      await API.post('/api/admin/remove-keyword', { word }, { headers: { Authorization: `Bearer ${token}` } });
      setStatus('Keyword removed!');
      fetchKeywords();
    } catch (err) {
      setError('Failed to remove keyword: ' + (err.response?.data?.message || err.message));
      setStatus('');
    }
  }

  async function handleSendAnnouncement(e) {
    e.preventDefault();
    if (!announcementText) return;
    setStatus('Sending announcement...');
    setError('');
    try {
      await API.post('/api/admin/announcement', { text: announcementText, pinned: announcementPinned }, { headers: { Authorization: `Bearer ${token}` } });
      setAnnouncementText(''); setAnnouncementPinned(false);
      setStatus('Announcement sent!');
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to send announcement: ' + (err.response?.data?.message || err.message));
      setStatus('');
    }
  }

  async function handlePinAnnouncement(announcementId, pinned) {
    setStatus(pinned ? 'Pinning...' : 'Unpinning...');
    setError('');
    try {
      await API.post('/api/admin/pin-announcement', { announcementId, pinned }, { headers: { Authorization: `Bearer ${token}` } });
      setStatus(pinned ? 'Announcement pinned!' : 'Announcement unpinned!');
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to update announcement: ' + (err.response?.data?.message || err.message));
      setStatus('');
    }
  }

  async function handleDeleteAnnouncement(announcementId) {
    setStatus('Deleting announcement...');
    setError('');
    try {
      await API.post('/api/admin/delete-announcement', { announcementId }, { headers: { Authorization: `Bearer ${token}` } });
      setStatus('Announcement deleted!');
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to delete announcement: ' + (err.response?.data?.msg || err.message));
      setStatus('');
    }
  }

  async function handleImpersonateUser(e) {
    e.preventDefault();
    setStatus('Impersonating...');
    setError('');
    // Only allow valid MongoDB ObjectId as userId
    if (!impersonateUserId.match(/^[a-fA-F0-9]{24}$/)) {
      setError('Invalid User ID: must be a valid MongoDB ObjectId');
      setStatus('');
      return;
    }
    try {
      const res = await API.post('/api/admin/impersonate', { userId: impersonateUserId }, { headers: { Authorization: `Bearer ${token}` } });
      setImpersonateToken(res.data.token);
      setStatus('Impersonation token generated!');
    } catch (err) {
      setError('Failed to impersonate: ' + (err.response?.data?.msg || err.message));
      setStatus('');
    }
  }

  async function handleGetChatHistory(e) {
    e.preventDefault();
    setStatus('Fetching chat history...');
    setError('');
    // Only allow valid MongoDB ObjectId as userId
    if (!chatHistoryUserId.match(/^[a-fA-F0-9]{24}$/)) {
      setError('Invalid User ID: must be a valid MongoDB ObjectId');
      setStatus('');
      return;
    }
    try {
      const res = await API.get(`/api/admin/user-chathistory/${chatHistoryUserId}`, { headers: { Authorization: `Bearer ${token}` } });
      setChatHistory(res.data);
      setStatus('');
    } catch (err) {
      setError('Failed to fetch chat history: ' + (err.response?.data?.msg || err.message));
      setStatus('');
    }
  }

  async function handleGetHealth() {
    setStatus('Checking server health...');
    setError('');
    try {
      const res = await API.get('/api/admin/health', { headers: { Authorization: `Bearer ${token}` } });
      setServerHealth(res.data);
      setStatus('');
    } catch (err) {
      setError('Failed to get server health: ' + (err.response?.data?.message || err.message));
      setStatus('');
    }
  }

  async function handleBackup() {
    setBackupStatus('Triggering backup...');
    setError('');
    try {
      const res = await API.post('/api/admin/backup', {}, { headers: { Authorization: `Bearer ${token}` } });
      setBackupStatus(res.data.msg || 'Backup triggered!');
    } catch (err) {
      setError('Failed to backup: ' + (err.response?.data?.message || err.message));
      setBackupStatus('');
    }
  }

  async function handleRestore() {
    setRestoreStatus('Triggering restore...');
    setError('');
    try {
      const res = await API.post('/api/admin/restore', {}, { headers: { Authorization: `Bearer ${token}` } });
      setRestoreStatus(res.data.msg || 'Restore triggered!');
    } catch (err) {
      setError('Failed to restore: ' + (err.response?.data?.message || err.message));
      setRestoreStatus('');
    }
  }

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([fetchUsers(), fetchChats(), fetchMessages()])
      .catch(e => setError('Failed to load admin data'))
      .finally(() => setLoading(false));
    if (tab === 'analytics') fetchStats();
    if (tab === 'moderation') fetchKeywords();
    if (tab === 'announcements') fetchAnnouncements();
    // eslint-disable-next-line
  }, [tab]);

  function renderUsers() {
    return (
      <div className="admin-section">
        <h3>All Users</h3>
        {loading ? <div>Loading users...</div> : users.length === 0 ? <div>No users found.</div> : (
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Email</th><th>Username</th><th>Password (hashed)</th><th>Reset</th><th>Status</th><th>Ban/Unban</th><th>Edit</th><th>Activity</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u._id}</td>
                <td>{u.email}</td>
                <td>{u.username}</td>
                <td className="admin-password">{u.password}</td>
                <td>
                  <button onClick={() => setResetUserId(u._id)}>Reset Password</button>
                </td>
                <td>{u.banned ? 'Banned' : 'Active'}</td>
                <td>
                  <button onClick={() => handleBanUser(u._id, u.banned)}>{u.banned ? 'Unban' : 'Ban'}</button>
                </td>
                <td>
                  <button onClick={() => {
                    setEditUserId(u._id);
                    setEditUserEmail(u.email);
                    setEditUserUsername(u.username);
                    setEditUserProfilePic(u.profilePic || '');
                  }}>Edit</button>
                </td>
                <td>
                  <button onClick={() => handleGetUserActivity(u._id)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
        {resetUserId && (
          <form className="admin-reset-form" onSubmit={handleResetPassword}>
            <input
              type="password"
              placeholder="New Password"
              value={resetPassword}
              onChange={e => setResetPassword(e.target.value)}
              required
            />
            <button type="submit">Confirm Reset</button>
            <button type="button" onClick={() => setResetUserId('')}>Cancel</button>
          </form>
        )}
        {editUserId && (
          <form className="admin-edit-form" onSubmit={handleEditUser}>
            <h4>Edit User</h4>
            <input type="email" placeholder="Email" value={editUserEmail} onChange={e => setEditUserEmail(e.target.value)} required />
            <input type="text" placeholder="Username" value={editUserUsername} onChange={e => setEditUserUsername(e.target.value)} required />
            <input type="text" placeholder="Profile Pic URL" value={editUserProfilePic} onChange={e => setEditUserProfilePic(e.target.value)} />
            <button type="submit">Save</button>
            <button type="button" onClick={() => { setEditUserId(''); setEditUserEmail(''); setEditUserUsername(''); setEditUserProfilePic(''); }}>Cancel</button>
          </form>
        )}
        {userActivity && activityUserId && (
          <div className="admin-activity-view">
            <h4>User Activity</h4>
            <div>User ID: {activityUserId}</div>
            <div>Last Seen: {userActivity.lastSeen || 'N/A'}</div>
            <div>Online: {userActivity.online ? 'Yes' : 'No'}</div>
            <div>Created At: {userActivity.createdAt}</div>
            <div>Updated At: {userActivity.updatedAt}</div>
            <button onClick={() => { setUserActivity(null); setActivityUserId(''); }}>Close</button>
          </div>
        )}
      </div>
    );
  }

  function renderChats() {
    return (
      <div className="admin-section">
        <h3>All Chats</h3>
        {loading ? <div>Loading chats...</div> : chats.length === 0 ? <div>No chats found.</div> : (
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Users</th></tr>
          </thead>
          <tbody>
            {chats.map(chat => (
              <tr key={chat._id} onClick={() => setSelectedChat(chat._id)} style={{ cursor: 'pointer' }}>
                <td>{chat._id}</td>
                <td>{(chat.participants || chat.users || []).map(u => u.username || u.email || u).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
        {selectedChat && (
          <div className="admin-messages">
            <h4>Messages in Chat {selectedChat}</h4>
            <ul>
              {messages.filter(m => m.chat === selectedChat).map(m => (
                <li key={m._id}>
                  <b>{m.sender?.email || m.sender?.username || 'Unknown'}:</b> {m.content || m.text || '[No content]'}
                  <button onClick={() => handleDeleteMessage(m._id)} style={{ marginLeft: 8 }}>Delete</button>
                </li>
              ))}
            </ul>
            <button onClick={() => handleDeleteChat(selectedChat)} style={{ marginRight: 8 }}>Delete Chat</button>
            <button onClick={() => setSelectedChat(null)}>Close</button>
          </div>
        )}
      </div>
    );
  }

  function renderSendMessage() {
    return (
      <div className="admin-section">
        <h3>Send Message as Admin</h3>
        <form className="admin-send-form" onSubmit={handleSendMessage}>
          <select value={selectedUser || ''} onChange={e => setSelectedUser(e.target.value)} required>
            <option value="">Select User</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.email} ({u.username})</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Message Content"
            value={messageContent}
            onChange={e => setMessageContent(e.target.value)}
            required
          />
          <button type="submit">Send</button>
        </form>
        {status && <div className="admin-status">{status}</div>}
      </div>
    );
  }

  function renderAnalytics() {
    return (
      <div className="admin-section">
        <h3>Analytics & Statistics</h3>
        {stats ? (
          <ul>
            <li>Total Users: {stats.totalUsers}</li>
            <li>Active Users: {stats.activeUsers}</li>
            <li>Total Chats: {stats.totalChats}</li>
            <li>Total Messages: {stats.totalMessages}</li>
          </ul>
        ) : <div>Loading stats...</div>}
      </div>
    );
  }

  function renderModeration() {
    return (
      <div className="admin-section">
        <h3>Keyword Filter</h3>
        <form onSubmit={handleAddKeyword} className="admin-keyword-form">
          <input type="text" placeholder="Add keyword" value={newKeyword} onChange={e => setNewKeyword(e.target.value)} required />
          <button type="submit">Add</button>
        </form>
        <ul>
          {keywords.map(k => (
            <li key={k._id}>{k.word} <button onClick={() => handleRemoveKeyword(k.word)}>Remove</button></li>
          ))}
        </ul>
      </div>
    );
  }

  function renderAnnouncements() {
    return (
      <div className="admin-section">
        <h3>Broadcast & Announcements</h3>
        <form onSubmit={handleSendAnnouncement} className="admin-announcement-form">
          <textarea placeholder="Announcement text" value={announcementText} onChange={e => setAnnouncementText(e.target.value)} required />
          <label>
            <input type="checkbox" checked={announcementPinned} onChange={e => setAnnouncementPinned(e.target.checked)} /> Pin this announcement
          </label>
          <button type="submit">Send</button>
        </form>
        <ul>
          {announcements.map(a => (
            <li key={a._id} style={{ background: a.pinned ? '#ffeeba' : undefined }}>
              <div>{a.text}</div>
              <div style={{ fontSize: '0.9em', color: '#888' }}>By: {a.createdBy?.username || a.createdBy?.email || 'Admin'} | {new Date(a.createdAt).toLocaleString()}</div>
              <button onClick={() => handlePinAnnouncement(a._id, !a.pinned)}>{a.pinned ? 'Unpin' : 'Pin'}</button>
              <button onClick={() => handleDeleteAnnouncement(a._id)} style={{ color: 'red', marginLeft: 8 }}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  function renderSupport() {
    return (
      <div className="admin-section">
        <h3>Support Tools</h3>
        <form onSubmit={handleImpersonateUser} className="admin-support-form">
          <input type="text" placeholder="User ID to impersonate" value={impersonateUserId} onChange={e => setImpersonateUserId(e.target.value)} required />
          <button type="submit">Get Impersonation Token</button>
        </form>
        {impersonateToken && (
          <div style={{ wordBreak: 'break-all', background: '#f8f9fa', padding: 8, margin: '8px 0' }}>
            <b>Impersonation Token:</b> {impersonateToken}
          </div>
        )}
        <form onSubmit={handleGetChatHistory} className="admin-support-form">
          <input type="text" placeholder="User ID for chat history" value={chatHistoryUserId} onChange={e => setChatHistoryUserId(e.target.value)} required />
          <button type="submit">Get Chat History</button>
        </form>
        {chatHistory.length > 0 && (
          <div className="admin-chat-history">
            <h4>Chat History</h4>
            <ul>
              {chatHistory.map(m => (
                <li key={m._id}><b>{m.sender}</b> to <b>{m.receiver}</b>: {m.text || m.content || '[No content]'} <span style={{ color: '#888', fontSize: '0.9em' }}>{new Date(m.createdAt).toLocaleString()}</span></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  function renderSystem() {
    return (
      <div className="admin-section">
        <h3>System Tools</h3>
        <AiBotProfilePic token={token} currentPic={aiBotPic} onUploaded={setAiBotPic} />
        <button onClick={handleGetHealth}>Check Server Health</button>
        {serverHealth && (
          <pre className="admin-health" style={{ background: '#f8f9fa', padding: 8 }}>{JSON.stringify(serverHealth, null, 2)}</pre>
        )}
        <button onClick={handleBackup}>Trigger Backup</button>
        {backupStatus && <div>{backupStatus}</div>}
        <button onClick={handleRestore}>Trigger Restore</button>
        {restoreStatus && <div>{restoreStatus}</div>}
      </div>
    );
  }

  return (
    <div className="admin-panel-container">
      <div className="admin-panel-header">
        <h2>Admin Dashboard</h2>
        <button onClick={onLogout}>Logout</button>
      </div>
      {error && <div className="admin-error">{error}</div>}
      <div className="admin-panel-tabs">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
        <button className={tab === 'chats' ? 'active' : ''} onClick={() => setTab('chats')}>Chats</button>
        <button className={tab === 'send' ? 'active' : ''} onClick={() => setTab('send')}>Send Message</button>
        <button className={tab === 'analytics' ? 'active' : ''} onClick={() => setTab('analytics')}>Analytics</button>
        <button className={tab === 'moderation' ? 'active' : ''} onClick={() => setTab('moderation')}>Moderation</button>
        <button className={tab === 'announcements' ? 'active' : ''} onClick={() => setTab('announcements')}>Announcements</button>
        <button className={tab === 'support' ? 'active' : ''} onClick={() => setTab('support')}>Support Tools</button>
        <button className={tab === 'system' ? 'active' : ''} onClick={() => setTab('system')}>System Tools</button>
      </div>
      <div className="admin-panel-body">
        {tab === 'users' && renderUsers()}
        {tab === 'chats' && renderChats()}
        {tab === 'send' && renderSendMessage()}
        {tab === 'analytics' && renderAnalytics()}
        {tab === 'moderation' && renderModeration()}
        {tab === 'announcements' && renderAnnouncements()}
        {tab === 'support' && renderSupport()}
        {tab === 'system' && renderSystem()}
      </div>
    </div>
  );
}
