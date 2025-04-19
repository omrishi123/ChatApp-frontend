import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, blockUser, unblockUser } from '../../utils/api.js';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function UserProfile() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    getUserProfile(token, id).then(setProfile);
    if (user.blockedUsers?.includes(id)) setBlocked(true);
  }, [id, token, user]);

  const handleBlock = async () => {
    try {
      await blockUser(token, id);
      setBlocked(true);
      toast.success('User blocked');
    } catch {
      toast.error('Failed to block');
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockUser(token, id);
      setBlocked(false);
      toast.success('User unblocked');
    } catch {
      toast.error('Failed to unblock');
    }
  };

  if (!profile) return <div>Loading...</div>;
  return (
    <div className="user-profile-container">
      <img src={profile.profilePic || '/default-avatar.png'} alt={profile.username} className="profile-pic" />
      <h2>{profile.username}</h2>
      <div>Last seen: {profile.lastSeen ? new Date(profile.lastSeen).toLocaleString() : 'Unknown'}</div>
      <div>Status: {profile.online ? 'Online' : 'Offline'}</div>
      {blocked ? (
        <button onClick={handleUnblock}>Unblock</button>
      ) : (
        <button onClick={handleBlock}>Block</button>
      )}
    </div>
  );
}
