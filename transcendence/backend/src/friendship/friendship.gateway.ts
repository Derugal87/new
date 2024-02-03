import { 
    WebSocketGateway, 
    WebSocketServer, 
    SubscribeMessage, 
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendshipService } from './friendship.service';

@WebSocketGateway( { 
  namespace: 'friendship',
  cors: {
    origin: [`${process.env.BACKEND_URL}`, `${process.env.FRONTEND_URL}`, "http://[::1]:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
})
export class FriendshipGateway {
  constructor(private friendshipService: FriendshipService) {}
  
  @WebSocketServer()
  private server: Server;

  @SubscribeMessage('createFriendship')
  async handleCreateFriendship(@MessageBody() data: { userId: number, friendId: number }) {
    const friendship = await this.friendshipService.createFriendship(data.userId, data.friendId);
    this.server.emit('newFriendship', friendship);
  }

  @SubscribeMessage('deleteFriendship')
  async handleDeleteFriendship(@MessageBody() data: { friendshipId: number }) {
    await this.friendshipService.deleteFriendship(data.friendshipId);
    this.server.emit('deletedFriendship', data.friendshipId);
  }

}
