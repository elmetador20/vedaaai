import { Server } from 'socket.io';

let ioInstance: Server | null = null;

export function initSocketServer(server: any) {
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  ioInstance.on('connection', (socket) => {
    socket.on('join', (room) => {
      socket.join(room);
    });

    socket.on('disconnect', () => {
    });
  });
}

export function notifyClient(assignmentId: string, payload: any) {
  if (ioInstance) {
    ioInstance.to(assignmentId).emit('status-update', payload);
  }
}
