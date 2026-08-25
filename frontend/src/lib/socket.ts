import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_WS_URL || window.location.origin, {
      path: '/ws',
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(userId: string, workspaceId: string) {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit('join:workspace', { userId, workspaceId });
  return s;
}

export function joinProject(projectId: string) {
  getSocket().emit('join:project', { projectId });
}

export function leaveProject(projectId: string) {
  getSocket().emit('leave:project', { projectId });
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
