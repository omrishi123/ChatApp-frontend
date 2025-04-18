import axios from 'axios';

// Always use the same origin for API requests when serving frontend+backend together
const API_BASE_URL = '/api';

export const register = async (data) => {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value) form.append(key, value);
  });
  const res = await axios.post(`${API_BASE_URL}/auth/register`, form);
  return res.data;
};

export const login = async (email, password) => {
  const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
  return res.data;
};

export const getProfile = async (token) => {
  const res = await axios.get(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const updateProfile = async (token, data) => {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value) form.append(key, value);
  });
  const res = await axios.put(`${API_BASE_URL}/auth/me`, form, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const searchUsers = async (token, username) => {
  const res = await axios.get(`${API_BASE_URL}/users/search?username=${username}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getUserProfile = async (token, id) => {
  const res = await axios.get(`${API_BASE_URL}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const blockUser = async (token, userId) => {
  const res = await axios.post(`${API_BASE_URL}/users/block`, { userId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const unblockUser = async (token, userId) => {
  const res = await axios.post(`${API_BASE_URL}/users/unblock`, { userId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getChats = async (token) => {
  const res = await axios.get(`${API_BASE_URL}/chats`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const startChat = async (token, userId) => {
  const res = await axios.post(`${API_BASE_URL}/chats/start`, { userId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const muteChat = async (token, chatId) => {
  const res = await axios.post(`${API_BASE_URL}/chats/mute`, { chatId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const unmuteChat = async (token, chatId) => {
  const res = await axios.post(`${API_BASE_URL}/chats/unmute`, { chatId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getMessages = async (token, chatId) => {
  const res = await axios.get(`${API_BASE_URL}/messages/${chatId}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const sendMessage = async (token, data) => {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value) form.append(key, value);
  });
  const res = await axios.post(`${API_BASE_URL}/messages/send`, form, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const deleteMessage = async (token, messageId, forEveryone) => {
  const res = await axios.post(`${API_BASE_URL}/messages/delete`, { messageId, forEveryone }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const starMessage = async (token, messageId) => {
  const res = await axios.post(`${API_BASE_URL}/messages/star`, { messageId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const unstarMessage = async (token, messageId) => {
  const res = await axios.post(`${API_BASE_URL}/messages/unstar`, { messageId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};
