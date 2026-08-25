import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ConnectedUser {
  userId: string;
  socketId: string;
  workspaceId?: string;
  projectId?: string;
}

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
  namespace: '/ws',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private connectedUsers: Map<string, ConnectedUser> = new Map();

  handleConnection(client: Socket) {
    console.log(`[WS] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    console.log(`[WS] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:workspace')
  handleJoinWorkspace(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string; workspaceId: string }) {
    client.join(`workspace:${data.workspaceId}`);
    this.connectedUsers.set(client.id, { userId: data.userId, socketId: client.id, workspaceId: data.workspaceId });
    this.broadcastOnlineUsers(data.workspaceId);
  }

  @SubscribeMessage('join:project')
  handleJoinProject(@ConnectedSocket() client: Socket, @MessageBody() data: { projectId: string }) {
    client.join(`project:${data.projectId}`);
    const user = this.connectedUsers.get(client.id);
    if (user) user.projectId = data.projectId;
  }

  @SubscribeMessage('leave:project')
  handleLeaveProject(@ConnectedSocket() client: Socket, @MessageBody() data: { projectId: string }) {
    client.leave(`project:${data.projectId}`);
  }

  @SubscribeMessage('task:move')
  handleTaskMove(@ConnectedSocket() client: Socket, @MessageBody() data: { projectId: string; taskId: string; columnId: string; position: number }) {
    client.to(`project:${data.projectId}`).emit('task:moved', data);
  }

  @SubscribeMessage('task:update')
  handleTaskUpdate(@ConnectedSocket() client: Socket, @MessageBody() data: { projectId: string; task: any }) {
    client.to(`project:${data.projectId}`).emit('task:updated', data);
  }

  @SubscribeMessage('task:create')
  handleTaskCreate(@ConnectedSocket() client: Socket, @MessageBody() data: { projectId: string; task: any }) {
    client.to(`project:${data.projectId}`).emit('task:created', data);
  }

  @SubscribeMessage('task:delete')
  handleTaskDelete(@ConnectedSocket() client: Socket, @MessageBody() data: { projectId: string; taskId: string }) {
    client.to(`project:${data.projectId}`).emit('task:deleted', data);
  }

  @SubscribeMessage('comment:new')
  handleNewComment(@ConnectedSocket() client: Socket, @MessageBody() data: { projectId: string; taskId: string; comment: any }) {
    client.to(`project:${data.projectId}`).emit('comment:added', data);
  }

  @SubscribeMessage('cursor:move')
  handleCursorMove(@ConnectedSocket() client: Socket, @MessageBody() data: { projectId: string; userId: string; x: number; y: number }) {
    client.to(`project:${data.projectId}`).emit('cursor:moved', data);
  }

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { projectId: string; taskId: string; userId: string; isTyping: boolean }) {
    client.to(`project:${data.projectId}`).emit('user:typing', data);
  }

  // Emit to workspace
  emitToWorkspace(workspaceId: string, event: string, data: any) {
    this.server.to(`workspace:${workspaceId}`).emit(event, data);
  }

  // Emit to project
  emitToProject(projectId: string, event: string, data: any) {
    this.server.to(`project:${projectId}`).emit(event, data);
  }

  private broadcastOnlineUsers(workspaceId: string) {
    const online = Array.from(this.connectedUsers.values())
      .filter(u => u.workspaceId === workspaceId)
      .map(u => u.userId);
    this.server.to(`workspace:${workspaceId}`).emit('users:online', [...new Set(online)]);
  }
}
