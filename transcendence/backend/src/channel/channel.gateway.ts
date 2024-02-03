// import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { ChannelService } from './channel.service';
// import { UserService } from '../user/user.service';
// import { CreateChannelDto } from './dto/create-channel.dto';
// import { UpdateChannelDto } from './dto/update-channel.dto';
// import { ForbiddenException } from '@nestjs/common';
// import { Channel } from './channel.entity';

// @WebSocketGateway({
//     namespace: 'channels',
//     cors: {
//         origin: [`${process.env.BACKEND_URL}`, `${process.env.FRONTEND_URL}`, "http://[::1]:3000"],
//         methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//         allowedHeaders: ['Content-Type', 'Authorization'],
//         credentials: true,
//     },
// })
// export class ChannelGateway {
//     constructor(
//         private readonly channelService: ChannelService,
//         private readonly userService: UserService,
//     ) {}

//     @WebSocketServer()
//     server: Server;
//     private userSocketMap: Record<number, Socket> = {};

//     handleConnection(client: Socket, ...args: any[]) {
//         this.server.emit('connection', `User connected to channel namespace: ${client.id}`);
//     }
  
//     async handleDisconnect(client: Socket, userId: number) {
//       delete this.userSocketMap[userId];
//       this.server.emit('userDisconnected', userId);
//     }
  
  
//     @SubscribeMessage('setUserId')
//     async handleSetUserId(
//       @MessageBody() data: { userId: number },
//       @ConnectedSocket() client: Socket,
//     ): Promise<void> {
//       try {
//         const { userId } = data;
  
//         console.log(`User with ID ${userId} connected to channel namespace: ${client.id}`);
//         this.userSocketMap[userId] = client;
//         this.server.emit('userConnected', userId);
//       } catch (error) {
//         client.emit('error', error.message);
//       }
//     }

//     @SubscribeMessage('createChannel')
//     async createChannel(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() createChannelDto: CreateChannelDto,
//     ): Promise<Channel> {
//     try {
//         const { owner_id } = createChannelDto;
//         this.userSocketMap[owner_id] = client;

//         const channel = await this.channelService.createChannel(createChannelDto, owner_id);

//         // Emit the 'channelCreated' event to the user's socket
//         client.emit('channelCreated', channel);
//         return channel;
//     } catch (error) {
//         client.emit('createChannelError', { error: error.message });
//         throw error;
//     }
//     }

//     @SubscribeMessage('deleteChannel')
//     async handleDeleteChannel(
//       @MessageBody() data: { channelId: number, userId: number },
//       @ConnectedSocket() client: Socket
//     ) {
//       const { channelId, userId } = data;
    
//       try {
//         const userSocket = this.userSocketMap[userId];
    
//         if (userSocket) {
//           await this.channelService.deleteChannel(channelId, userId);
//           userSocket.emit('deleteChannelSuccess', { channelId });
//         } else {
//           client.emit('deleteChannelError', { error: 'User is not connected' });
//         }
//       } catch (error) {
//         client.emit('deleteChannelError', { error: error.message });
//       }
//     }
    
//     @SubscribeMessage('joinChannel')
//     async handleJoinChannel(
//     @MessageBody() data: { channelId: number; userId: number; token?: string; password?: string },
//     @ConnectedSocket() client: Socket
//     ) {
//     const { channelId, userId, token, password } = data;

//     try {
//         const userSocket = this.userSocketMap[userId];

//         if (userSocket) {
//         await this.channelService.joinChannel(channelId, userId, token, password);
//         userSocket.emit('JoinChannelSuccess', { channelId, userId });

//         // Join the channel room using the user's socket
//         userSocket.join(channelId.toString());
//         } else {
//         client.emit('JoinChannelError', { error: 'User is not connected' });
//         }
//     } catch (error) {
//         client.emit('JoinChannelError', { error: error.message });
//     }
//     }


//     @SubscribeMessage('leaveChannel')
//     async leaveChannel(
//       @ConnectedSocket() client: Socket,
//       @MessageBody() data: { channelId: number, userId: number },
//     ) {
//       const { channelId, userId } = data;
    
//       try {
//         const userSocket = this.userSocketMap[userId];
    
//         if (userSocket) {
//           await this.channelService.leaveChannel(channelId, userId);
    
//           // Unsubscribe the user's socket from the channel
//           userSocket.leave(channelId.toString());
//           userSocket.emit('leaveChannelSuccess', { channelId, userId });
//         } else {
//           client.emit('leaveChannelError', { error: 'User is not connected' });
//         }
//       } catch (error) {
//         client.emit('leaveChannelError', { error: error.message });
//       }
//     }
    

    
//     @SubscribeMessage('updateChannel')
//     async handleUpdateChannel(
//       @ConnectedSocket() client: Socket,
//       @MessageBody() data: { channelId: number, userId: number, updateChannelDto: UpdateChannelDto },
//     ) {
//       const { channelId, userId, updateChannelDto } = data;
    
//       try {
//         const userSocket = this.userSocketMap[userId];
    
//         if (userSocket) {
//           const updatedChannel = await this.channelService.updateChannel(channelId, updateChannelDto, userId);
//           userSocket.emit('updateChannelSuccess', updatedChannel);
//         } else {
//           client.emit('updateChannelError', { error: 'User is not connected' });
//         }
//       } catch (error) {
//         client.emit('updateChannelError', { error: error.message });
//       }
//     }
// }
