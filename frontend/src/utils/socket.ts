import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';
    socketInstance = io(socketUrl);
  }
  return socketInstance;
}
