import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GroupMessageService } from './group-message.service';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';

@WebSocketGateway({
    namespace: 'group-messages',
    cors: {
        origin: [`${process.env.BACKEND_URL}`, `${process.env.FRONTEND_URL}`, "http://[::1]:3000"],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    },
})
export class GroupMessageGateway {
    constructor(private readonly groupMessageService: GroupMessageService) {}

    @WebSocketServer()
    server: Server;

    private userSocketMap: Record<number, Socket> = {};

    handleConnection(client: Socket, ...args: any[]) {
        this.server.emit('connection', `User connected to group-messages namespace: ${client.id}`);
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
  
        console.log(`User with ID ${userId} connected to group-message namespace: ${client.id}`);
        this.userSocketMap[userId] = client;
        this.server.emit('userConnected', userId);
      } catch (error) {
        client.emit('error', error.message);
      }
    }

    @SubscribeMessage('startTyping')
    handleStartTyping(
        @MessageBody() data: { userId: number, channelId: number },
        @ConnectedSocket() client: Socket,
    ): void {
        try {
            const { userId, channelId } = data;
    
            // Associate the user's ID with their socket ID
            this.userSocketMap[userId] = client;

            // Broadcast a "userTyping" event to the channel
            client.to(`channel_${channelId}`).emit('userTyping', { userId, isTyping: true });
        } catch (error) {
            client.emit('error', error.message);
        }
    }
    

    @SubscribeMessage('createGroupMessage')
    async handleCreateGroupMessage(
        @MessageBody() dto: CreateGroupMessageDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            const { userId, channelId } = dto;

            // Associate the user's ID with their socket ID
            this.userSocketMap[userId] = client;

            const message = await this.groupMessageService.createGroupMessage(dto);

            console.log(`Broadcasting message to channel_${channelId}`);
            client.to(`channel_${channelId}`).emit('groupMessage', message);
            console.log(`'groupMessage' event emitted to 'channel_${channelId}'`);
        } catch (error) {
            client.emit('error', error.message);
        }
    }


    @SubscribeMessage('getAllGroupMessages')
    async handleGetAllGroupMessages(
        @MessageBody() data: { channelId: number, userId: number },
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            const { channelId, userId } = data;

            // Associate the user's ID with their socket ID
            this.userSocketMap[userId] = client;

            const messages = await this.groupMessageService.getAllGroupMessages(channelId, userId);

            client.emit('allGroupMessages', messages);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('getGroupMessagesWithPagination')
    async handleGetGroupMessagesWithPagination(
        @MessageBody() data: { channelId: number, userId: number, page: number },
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            const { channelId, userId, page } = data;
    
            // Associate the user's ID with their socket ID
            this.userSocketMap[userId] = client;
    
            const messages = await this.groupMessageService.getGroupMessagesWithPagination(channelId, userId, page);
    
            client.emit('paginatedGroupMessages', messages);
        } catch (error) {
            client.emit('error', error.message);
        }
    }
    
}
