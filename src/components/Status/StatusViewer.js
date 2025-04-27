import React, { useEffect, useRef, useState } from 'react';
import './StatusViewer.css';

export default function StatusViewer({ usersWithStatuses, initialUserIdx, onClose }) {
  const [userIdx, setUserIdx] = useState(initialUserIdx);
  const [statusIdx, setStatusIdx] = useState(0);
  const [timer, setTimer] = useState(null);
  const videoRef = useRef();

  const currentUser = usersWithStatuses[userIdx];
  const statuses = currentUser.items;
  const currentStatus = statuses[statusIdx];

  useEffect(() => {
    // Clear timer on unmount
    return () => timer && clearTimeout(timer);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!currentStatus) return;
    if (currentStatus.media && currentStatus.media.endsWith('.mp4')) {
      // For video, wait for video duration
      const video = videoRef.current;
      if (video) {
        video.onloadedmetadata = () => {
          setTimer(setTimeout(nextStatus, video.duration * 1000));
          video.play();
        };
      }
    } else {
      // For image/text, 10s
      setTimer(setTimeout(nextStatus, 10000));
    }
    // eslint-disable-next-line
  }, [userIdx, statusIdx]);

  function nextStatus() {
    if (statusIdx < statuses.length - 1) {
      setStatusIdx(statusIdx + 1);
    } else if (userIdx < usersWithStatuses.length - 1) {
      setUserIdx(userIdx + 1);
      setStatusIdx(0);
    } else {
      onClose();
    }
  }

  function prevStatus() {
    if (statusIdx > 0) {
      setStatusIdx(statusIdx - 1);
    } else if (userIdx > 0) {
      setUserIdx(userIdx - 1);
      setStatusIdx(usersWithStatuses[userIdx - 1].items.length - 1);
    }
  }

  if (!currentStatus) return null;

  return (
    <div className="status-viewer-overlay" onClick={onClose}>
      <div className="status-viewer-content" onClick={e => e.stopPropagation()}>
        <div className="status-viewer-header">
          <img
            src={currentUser.user.profilePic ? (currentUser.user.profilePic.startsWith('/uploads/') ? `${process.env.REACT_APP_API_URL}${currentUser.user.profilePic}` : `${process.env.REACT_APP_API_URL}/uploads/${currentUser.user.profilePic}`) : '/default-avatar.png'}
            alt={currentUser.user.username}
            className="status-viewer-avatar"
          />
          <span className="status-viewer-username">{currentUser.user.username}</span>
          <button className="status-viewer-close" onClick={onClose}>×</button>
        </div>
        <div className="status-viewer-body">
          {currentStatus.media ? (
            currentStatus.media.endsWith('.mp4') ? (
              <video ref={videoRef} src={currentStatus.media.startsWith('http') ? currentStatus.media : `/uploads/${currentStatus.media}`} controls autoPlay className="status-viewer-media" />
            ) : (
              <img src={currentStatus.media.startsWith('http') ? currentStatus.media : `/uploads/${currentStatus.media}`} alt="status" className="status-viewer-media" />
            )
          ) : (
            <div className="status-viewer-text">{currentStatus.text}</div>
          )}
        </div>
        <div className="status-viewer-controls">
          <button onClick={prevStatus} disabled={userIdx === 0 && statusIdx === 0}>⟨</button>
          <button onClick={nextStatus} disabled={userIdx === usersWithStatuses.length - 1 && statusIdx === statuses.length - 1}>⟩</button>
        </div>
      </div>
    </div>
  );
}
