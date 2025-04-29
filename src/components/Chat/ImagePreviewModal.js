import React, { useEffect, useRef, useState } from 'react';
import './ImagePreviewModal.css';

export default function ImagePreviewModal({
  src,
  type = 'image',
  onClose,
  username = '',
}) {
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef();

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  function handleZoomIn() {
    setZoom(z => Math.min(z + 0.2, 3));
  }
  function handleZoomOut() {
    setZoom(z => Math.max(z - 0.2, 1));
  }
  function handleDownload() {
    const link = document.createElement('a');
    link.href = src;
    link.download = src.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  function handleShare() {
    if (navigator.share) {
      navigator.share({ url: src, title: username + ' media' });
    } else {
      alert('Share not supported on this device.');
    }
  }

  return (
    <div className="image-preview-modal" onClick={onClose}>
      <div className="image-preview-modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&#x2715;</button>
        {type === 'image' ? (
          <img
            ref={imgRef}
            src={src}
            alt="preview"
            style={{ transform: `scale(${zoom})` }}
            className="preview-img"
          />
        ) : (
          <video src={src} controls className="preview-video" />
        )}
        <div className="preview-actions">
          <button onClick={handleZoomIn}>Zoom In</button>
          <button onClick={handleZoomOut}>Zoom Out</button>
          <button onClick={handleDownload}>Download</button>
          <button onClick={handleShare}>Share</button>
        </div>
      </div>
    </div>
  );
}
