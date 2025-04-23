import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../utils/api';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user, token, logout } = useAuth();
  const [form, setForm] = useState({ username: user.username, password: '', profilePic: null });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'profilePic' && files && files[0]) {
      setPreview(URL.createObjectURL(files[0]));
    }
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(token, form);
      toast.success('Profile updated!');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Update failed');
    }
    setLoading(false);
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      <img
        src={
          preview
            ? preview
            : user.profilePic
              ? user.profilePic.startsWith('/uploads/')
                ? `${process.env.REACT_APP_API_URL}${user.profilePic}`
                : `${process.env.REACT_APP_API_URL}/uploads/${user.profilePic}`
              : '/default-avatar.png'
        }
        alt="Profile"
        className="profile-pic"
      />
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" value={form.username} onChange={handleChange} required />
        <input type="password" name="password" placeholder="New Password" value={form.password} onChange={handleChange} />
        <input type="file" name="profilePic" accept="image/png, image/jpeg, image/jpg" onChange={handleChange} />
        <button type="submit" disabled={loading}>Update</button>
      </form>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
