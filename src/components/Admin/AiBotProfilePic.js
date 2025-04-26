import React, { useState } from 'react';
import axios from 'axios';

export default function AiBotProfilePic({ token, currentPic, onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setFile(e.target.files[0]);
  const handleUpload = async e => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('profilePic', file);
    try {
      const res = await axios.post(
        process.env.REACT_APP_API_URL + '/api/ai/profile-pic',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUploaded(res.data.profilePic);
    } catch (err) {
      alert('Upload failed');
    }
    setLoading(false);
  };
  return (
    <div style={{ margin: '18px 0' }}>
      <h4>AI Bot Profile Picture</h4>
      <img src={currentPic ? process.env.REACT_APP_API_URL + currentPic : '/default-avatar.png'} alt="AI Bot Avatar" style={{ width: 80, height: 80, borderRadius: 40, objectFit: 'cover', marginBottom: 8 }} />
      <form onSubmit={handleUpload}>
        <input type="file" accept="image/*" onChange={handleChange} />
        <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
      </form>
    </div>
  );
}
