import React, { useEffect, useRef, useState } from 'react';
import './ImagePreviewModal.css';
import { FaSearchPlus, FaSearchMinus, FaDownload, FaShareAlt } from 'react-icons/fa';

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
  async function handleDownload() {
    try {
      // Fetch the image as a blob to ensure download works on all platforms
      const response = await fetch(src, { mode: 'cors' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = src.split('/').pop();
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
    } catch (e) {
      alert('Failed to download. Try long-press and save on your device.');
    }
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
        <div className="preview-actions top">
          <button onClick={handleZoomIn} title="Zoom In"><FaSearchPlus /></button>
          <button onClick={handleZoomOut} title="Zoom Out"><FaSearchMinus /></button>
          <button onClick={handleDownload} title="Download"><FaDownload /></button>
          <button onClick={handleShare} title="Share"><FaShareAlt /></button>
        </div>
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
      </div>
    </div>
  );
}
