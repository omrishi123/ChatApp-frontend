// Converts URLs in text to clickable anchor tags (styled like WhatsApp)
export function linkify(text) {
  if (!text) return '';
  // Match URLs, but don't include trailing punctuation
  const urlRegex = /(https?:\/\/[^\s.,!?")\]]+)/g;
  // Replace URLs with anchor tags
  let linked = text.replace(urlRegex, url =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`
  );
  // Optionally: replace line breaks with <br> for chat formatting
  linked = linked.replace(/\n/g, '<br>');
  return linked;
}