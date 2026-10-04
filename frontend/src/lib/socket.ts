import { io, Socket } from 'socket.io-client';

/**
 * Temps réel (Socket.IO).
 *
 * Activé uniquement si VITE_WS_URL est défini (ex: backend hébergé sur
 * Render/Railway/Fly). Sur Vercel (serverless) il n'y a pas de WebSocket :
 * on ne définit pas VITE_WS_URL et toutes les fonctions ci-dessous deviennent
 * des no-op, l'app fonctionne alors en REST pur.
 */
const WS_URL = import.meta.env.VITE_WS_URL as string | undefined;
export const realtimeEnabled = Boolean(WS_URL);

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (!WS_URL) return null;
  if (!socket) {
    // Le gateway NestJS écoute sur le namespace "/ws" (chemin Socket.IO par défaut).
    socket = io(`${WS_URL.replace(/\/$/, '')}/ws`, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(userId: string, workspaceId: string) {
  const s = getSocket();
  if (!s) return null;
  if (!s.connected) s.connect();
  s.emit('join:workspace', { userId, workspaceId });
  return s;
}

export function joinProject(projectId: string) {
  getSocket()?.emit('join:project', { projectId });
}

export function leaveProject(projectId: string) {
  getSocket()?.emit('leave:project', { projectId });
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
