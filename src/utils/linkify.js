export function linkify(text) {
  if (!text) return '';
  // Match URLs, but exclude only trailing punctuation if present
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  // Replace URLs with anchor tags, but trim trailing punctuation from the link
  let linked = text.replace(urlRegex, url => {
    // Remove trailing punctuation from the URL for the link, but keep it in the text
    const match = url.match(/^(.*?)([.,!?")\]]*)$/);
    const realUrl = match ? match[1] : url;
    const trailing = match ? match[2] : '';
    return `<a href="${realUrl}" target="_blank" rel="noopener noreferrer" class="chat-link">${realUrl}</a>${trailing}`;
  });
  linked = linked.replace(/\n/g, '<br>');
  return linked;
}