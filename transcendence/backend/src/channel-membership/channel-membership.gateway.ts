
import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelMembershipService } from './channel-membership.service';
import { CreateChannelMembershipDto } from './dto/create-channel-membership.dto';
import { UpdateChannelMembershipDto } from './dto/update-channel-membership.dto';
import { User } from '../user/user.entity';
import { Channel } from '../channel/channel.entity';
import { ChannelMembership } from './channel-membership.entity';
import { ParseIntPipe } from '@nestjs/common';

@WebSocketGateway({
    namespace: 'channel-memberships',
    cors: {
        origin: [`${process.env.BACKEND_URL}`, `${process.env.FRONTEND_URL}`, "http://[::1]:3000"],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    },
})
export class ChannelMembershipGateway {
    constructor(private readonly channelMembershipService: ChannelMembershipService) {}

    @WebSocketServer()
    server: Server;

    // private connectedUsers = new Set<Socket>();
    private userSocketMap: Record<number, Socket> = {};

    handleConnection(client: Socket, ...args: any[]) {
        this.server.emit('connection', `User connected to channel membership namespace: ${client.id}`);
    }
  
    handleDisconnect(client: Socket, userId: number) {
      delete this.userSocketMap[userId];
      this.server.emit('userDisconnected', userId);
    }

    @SubscribeMessage('setUserId')
    async handleSetUserId(
      @MessageBody() data: { userId: number },
      @ConnectedSocket() client: Socket,
    ): Promise<void> {
      try {
        const { userId } = data;
  
        console.log(`User with ID ${userId} connected to channel-membership namespace: ${client.id}`);
        this.userSocketMap[userId] = client;
        this.server.emit('userConnected', userId);
      } catch (error) {
        client.emit('error', error.message);
      }
    }

    @SubscribeMessage('getUserChannelMemberships')
    async handleGetUserChannelMemberships(
      @MessageBody() userId: number,
      @ConnectedSocket() client: Socket,
    ) {
      try {
        const userSocket = this.userSocketMap[userId];

        if (userSocket) {
          const memberships = await this.channelMembershipService.getUserChannelMemberships(userId);
          userSocket.emit('userChannelMemberships', memberships);
        } else {
          client.emit('userChannelMembershipsError', { message: 'User is not connected' });
        }
      } catch (error) {
        console.error(error);
        client.emit('userChannelMembershipsError', { message: 'Failed to retrieve user channel memberships.' });
      }
    }

    @SubscribeMessage('banUser')
    async handleBanUser(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { channelId: number, currentUserId: number, targetUserId: number },
    ) {
      const { channelId, currentUserId, targetUserId } = data;

      try {
        const currentSocket = this.userSocketMap[currentUserId];
        const targetSocket = this.userSocketMap[targetUserId];

        if (currentSocket && targetSocket) {
          await this.channelMembershipService.banMember(currentUserId, targetUserId, channelId);
          currentSocket.emit('banUserSuccess', { channelId, currentUserId, targetUserId });
          targetSocket.emit('banUserSuccess', { channelId, currentUserId, targetUserId });
        } else {
          client.emit('banUserError', { error: 'User or target user is not connected' });
        }
      } catch (error) {
        client.emit('banUserError', { error: error.message });
      }
    }

    @SubscribeMessage('muteUser')
    async handleMuteUser(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { channelId: number, currentUserId: number, targetUserId: number },
    ) {
      const { channelId, currentUserId, targetUserId } = data;

      try {
        const currentSocket = this.userSocketMap[currentUserId];
        const targetSocket = this.userSocketMap[targetUserId];

        if (currentSocket && targetSocket) {
          await this.channelMembershipService.muteMember(currentUserId, targetUserId, channelId);
          currentSocket.emit('muteUserSuccess', { channelId, currentUserId, targetUserId });
          targetSocket.emit('muteUserSuccess', { channelId, currentUserId, targetUserId });
        } else {
          client.emit('muteUserError', { error: 'User or target user is not connected' });
        }
      } catch (error) {
        client.emit('muteUserError', { error: error.message });
      }
    }

    @SubscribeMessage('getChannelMembersWithMembership')
    async handleGetChannelMembersWithMembership(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { channelId: number, userId: number },
    ): Promise<void> {
      const { channelId, userId } = data;

      try {
        const currentSocket = this.userSocketMap[userId];

        if (currentSocket) {
          const { channel, members } = await this.channelMembershipService.getChannelMembersWithMembership(channelId);
          currentSocket.emit('channelMembersWithMembership', { channel, members });
        } else {
          client.emit('channelMembersWithMembershipError', { message: 'User is not connected' });
        }
      } catch (error) {
        client.emit('channelMembersWithMembershipError', { message: 'Failed to retrieve channel members with membership.' });
      }
    }

}
