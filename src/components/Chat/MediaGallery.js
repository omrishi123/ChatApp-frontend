import React from 'react';
import { useChat } from '../../context/ChatContext';
import { isImage, isVideo, isAudio } from '../../utils/helpers';

export default function MediaGallery() {
  const { messages } = useChat();
  const medias = messages.filter(m => m.media);

  return (
    <div className="media-gallery">
      <h4>Media Gallery</h4>
      <div className="media-list">
        {medias.map(m => (
          <div key={m._id} className="media-item">
            {isImage(m.mediaType) && <img src={(m.media.startsWith('http') ? m.media : `${window.location.origin}/uploads/${m.media.replace(/^.*[\\/]/, '')}`)} alt="media" />}
            {isVideo(m.mediaType) && <video src={m.media} controls />}
            {isAudio(m.mediaType) && <audio src={m.media} controls />}
          </div>
        ))}
      </div>
    </div>
  );
}
