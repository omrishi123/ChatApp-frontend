export function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

export function isImage(type) {
  return type.startsWith('image');
}

export function isVideo(type) {
  return type.startsWith('video');
}

export function isAudio(type) {
  return type.startsWith('audio');
}
