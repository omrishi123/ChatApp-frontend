import axios from 'axios';

export async function sendAiMessage(token, text, chatId) {
  const res = await axios.post(
    process.env.REACT_APP_API_URL + '/api/ai/message',
    { text, chatId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export async function updateAiProfilePic(token, file) {
  const formData = new FormData();
  formData.append('profilePic', file);
  const res = await axios.post(
    process.env.REACT_APP_API_URL + '/api/ai/profile-pic',
    formData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}
