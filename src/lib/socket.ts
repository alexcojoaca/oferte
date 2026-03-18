import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';
    socket = io(socketUrl, { withCredentials: true });
  }
  return socket;
}

