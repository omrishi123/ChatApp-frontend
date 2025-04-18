import axios from 'axios';

// Use the environment variable for API base URL, fallback to relative '/api' for local dev
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
});

export const register = async (data) => {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value) form.append(key, value);
  });
  const res = await API.post('/api/auth/register', form);
  return res.data;
};

export const login = async (email, password) => {
  const res = await API.post('/api/auth/login', { email, password });
  return res.data;
};

export const getProfile = async (token) => {
  const res = await API.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const updateProfile = async (token, data) => {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value) form.append(key, value);
  });
  const res = await API.put('/api/auth/me', form, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const searchUsers = async (token, username) => {
  const res = await API.get(`/api/users/search?username=${username}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getUserProfile = async (token, id) => {
  const res = await API.get(`/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const blockUser = async (token, userId) => {
  const res = await API.post('/api/users/block', { userId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const unblockUser = async (token, userId) => {
  const res = await API.post('/api/users/unblock', { userId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getChats = async (token) => {
  const res = await API.get('/api/chats', { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const startChat = async (token, userId) => {
  const res = await API.post('/api/chats/start', { userId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const muteChat = async (token, chatId) => {
  const res = await API.post('/api/chats/mute', { chatId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const unmuteChat = async (token, chatId) => {
  const res = await API.post('/api/chats/unmute', { chatId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getMessages = async (token, chatId) => {
  const res = await API.get(`/api/messages/${chatId}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const sendMessage = async (token, data) => {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value) form.append(key, value);
  });
  const res = await API.post('/api/messages/send', form, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const deleteMessage = async (token, messageId, forEveryone) => {
  const res = await API.post('/api/messages/delete', { messageId, forEveryone }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const starMessage = async (token, messageId) => {
  const res = await API.post('/api/messages/star', { messageId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const unstarMessage = async (token, messageId) => {
  const res = await API.post('/api/messages/unstar', { messageId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};
