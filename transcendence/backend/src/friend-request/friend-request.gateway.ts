import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendRequestService } from './friend-request.service';

@WebSocketGateway( { 
namespace: 'friend-request',
cors: {
  origin: [`${process.env.BACKEND_URL}`, `${process.env.FRONTEND_URL}`, "http://[::1]:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
},
})
export class FriendRequestGateway {
  private userSocketMap: Record<number, Socket> = {};
  constructor(
      private readonly friendRequestService: FriendRequestService,
      ) {}

  @WebSocketServer()
  server: Server;


  // handleConnection(client: Socket) {
  //   // Associate the user's ID with their socket ID

  //   // console.log(`User with ID ${userId} connected to friend-request namespace: ${client.id}`);

  //   // this.userSocketMap[userId] = client;
  //   // this.server.emit('userConnected', userId); // Optionally emit an event to notify others
  // }

      handleConnection(client: Socket, ...args: any[]) {
        this.server.emit('connection', `User connected to friend-request namespace: ${client.id}`);
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

      console.log(`User with ID ${userId} connected to friend-request namespace: ${client.id}`);
      this.userSocketMap[userId] = client;
      this.server.emit('userConnected', userId);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('sendFriendRequest')
  async handleSendFriendRequest(
    @MessageBody() data: { senderId: number, receiverId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const { senderId, receiverId } = data;
      const receiverSocket = this.userSocketMap[receiverId];
      
      if (receiverSocket) {
        const savedRequest = await this.friendRequestService.createFriendRequest(senderId, receiverId);
        receiverSocket.emit('new-friend-request', savedRequest);
      } else {
        client.emit('error', 'Receiver is offline');
      }
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('getFriendRequests')
  async handleGetFriendRequests(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const { userId } = data;
      // Get the user's socket
      const userSocket = this.userSocketMap[userId];

      if (userSocket) {
        const friendRequests = await this.friendRequestService.getPendingFriendRequests(userId);
        userSocket.emit('friendRequests', friendRequests);
      } else {
        client.emit('error', 'User is not connected');
      }
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('acceptFriendRequest')
  async handleAcceptFriendRequest(
    @MessageBody() data: { requestId: number, userId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const { requestId, userId } = data;

      const userSocket = this.userSocketMap[userId];

      if (userSocket) {
        await this.friendRequestService.acceptFriendRequest(requestId);
        userSocket.emit('friendRequestAccepted', requestId);
      } else {
        client.emit('error', 'User is not connected');
      }
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('deleteFriendRequest')
  async handleDeleteFriendRequest(
    @MessageBody() data: { requestId: number, userId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const { requestId, userId } = data;
      const userSocket = this.userSocketMap[userId];

      if (userSocket) {
        await this.friendRequestService.deleteFriendRequest(requestId);
        userSocket.emit('friendRequestDeleted', requestId);
      } else {
        client.emit('error', 'User is not connected');
      }
    } catch (error) {
      client.emit('error', error.message);
    }
  }

}



