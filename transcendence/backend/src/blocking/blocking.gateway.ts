import { Injectable } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BlockingService } from './blocking.service';
import { ConnectedSocket, MessageBody } from '@nestjs/websockets';

@Injectable()
@WebSocketGateway({
  namespace: 'blocking',
  cors: {
    origin: [`${process.env.BACKEND_URL}`, `${process.env.FRONTEND_URL}`, "http://[::1]:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
})
export class BlockingGateway {
    @WebSocketServer() server: Server;
    private userSocketMap: Record<number, Socket> = {};

    constructor(private readonly blockingService: BlockingService) {}

    @SubscribeMessage('setUserId')
    async handleSetUserId(
      @MessageBody() data: { userId: number },
      @ConnectedSocket() client: Socket,
    ): Promise<void> {
      try {
        const { userId } = data;

        console.log(`User with ID ${userId} connected to blocking namespace: ${client.id}`);
        this.userSocketMap[userId] = client;
      } catch (error) {
        client.emit('error', error.message);
      }
    }

    @SubscribeMessage('blockUser')
    async handleBlockUser(
      @MessageBody() data: { userId: number, blockedUserId: number },
    ): Promise<void> {
      const { userId, blockedUserId } = data;

      const client = this.userSocketMap[userId];

      if (client) {
        await this.blockingService.blockUser(userId, blockedUserId);
        client.emit('blockUserSuccess', { blockedUserId });
      } else {
        client.emit('blockUserError', { error: 'User is not connected' });
      }
    }

    @SubscribeMessage('unblockUser')
    async handleUnblockUser(
      @MessageBody() data: { userId: number, unblockedUserId: number },
    ): Promise<void> {
      const { userId, unblockedUserId } = data;

      const client = this.userSocketMap[userId];

      if (client) {
        await this.blockingService.unblockUser(userId, unblockedUserId);
        client.emit('unblockUserSuccess', { unblockedUserId });
      } else {
        client.emit('unblockUserError', { error: 'User is not connected' });
      }
    }
}