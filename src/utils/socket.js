import { io } from 'socket.io-client';

// Dynamically set SOCKET_URL for local, LAN, or any deployed/ngrok URL
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || window.location.origin;
let socket;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      secure: SOCKET_URL.startsWith('https'),
      rejectUnauthorized: false // allow self-signed for ngrok
    });
  }
  return socket;
}
