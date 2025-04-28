import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, blockUser, unblockUser } from '../../utils/api';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function UserProfile() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    async function fetchProfileAndBlock() {
      const prof = await getUserProfile(token, id);
      setProfile(prof);
      setBlocked(!!prof.blockedByMe);
    }
    fetchProfileAndBlock();
  }, [id, token]);

  // Always re-calculate blocked from profile when profile changes
  useEffect(() => {
    if (profile) setBlocked(!!profile.blockedByMe);
  }, [profile]);

  const handleBlock = async () => {
    try {
      await blockUser(token, id);
      // Instead of setBlocked(true), always refresh profile and derive blocked from backend
      const updated = await getUserProfile(token, id);
      setProfile(updated);
      toast.success('User blocked');
    } catch {
      toast.error('Failed to block');
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockUser(token, id);
      // Instead of setBlocked(false), always refresh profile and derive blocked from backend
      const updated = await getUserProfile(token, id);
      setProfile(updated);
      toast.success('User unblocked');
    } catch {
      toast.error('Failed to unblock');
    }
  };

  if (!profile) return <div>Loading...</div>;
  return (
    <div className="user-profile-container">
      <img src={
        profile.profilePic
          ? profile.profilePic.startsWith('/uploads/')
            ? `${process.env.REACT_APP_API_URL}${profile.profilePic}`
            : `${process.env.REACT_APP_API_URL}/uploads/${profile.profilePic}`
          : '/default-avatar.png'
      } alt={profile.username} className="profile-pic" />
      <h2>
        {profile.username}
        {profile.online ? <span style={{ color: 'green', marginLeft: 8 }}>ONLINE</span> : ''}
      </h2>
      <div>
        {profile.online
          ? null
          : <>Last seen: {profile.lastSeen ? new Date(profile.lastSeen).toLocaleString() : 'Unknown'}</>}
      </div>
      {blocked ? (
        <button onClick={handleUnblock}>Unblock</button>
      ) : (
        <button onClick={handleBlock}>Block</button>
      )}
    </div>
  );
}
