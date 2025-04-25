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

  // Helper for online status
  function renderStatus(user) {
    if (!user) return null;
    if (user.online) return <span style={{color:'#25d366',fontWeight:'bold',fontSize:'0.9em',marginLeft:8}}>● Online</span>;
    if (user.lastSeen) {
      const last = new Date(user.lastSeen);
      const now = new Date();
      const diff = Math.floor((now - last)/60000);
      if (diff < 1) return <span style={{color:'#888',fontSize:'0.9em',marginLeft:8}}>last seen just now</span>;
      if (diff < 60) return <span style={{color:'#888',fontSize:'0.9em',marginLeft:8}}>last seen {diff} min ago</span>;
      return <span style={{color:'#888',fontSize:'0.9em',marginLeft:8}}>last seen {last.toLocaleString()}</span>;
    }
    return null;
  }

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
      <h2>{profile.username} {renderStatus(profile)}</h2>
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
