// src/chat/presence/presence.service.ts
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

export interface Sender {
  type: 'user' | 'page';
  id: string;
}

@Injectable()
export class PresenceService {
  private onlineUsers: Map<string, Set<string>> = new Map();

  getOnlineUsers() {
    return Array.from(this.onlineUsers.keys());
  }

  handleUserConnected(sender: Sender, socketId: string, server: Server) {
    if (sender.type !== 'user') {
      return;
    }
    const key = `user:${sender.id}`;
    if (!this.onlineUsers.has(key)) {
      this.onlineUsers.set(key, new Set());
      server.emit('SenderOnline', {
        SenderType: sender.type,
        SenderId: sender.id,
      });
    }
    this.onlineUsers.get(key)?.add(socketId);
  }

  handleUserDisconnected(Sender: Sender, socketId: string, server: Server) {
    if (Sender.type !== 'user') {
      return;
    }
    const key = `user:${Sender.id}`;
    const sockets = this.onlineUsers.get(key);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.onlineUsers.delete(key);
        server.emit('SenderOffline', {
          SenderType: Sender.type,
          SenderId: Sender.id,
        });
      }
    }
  }
}
