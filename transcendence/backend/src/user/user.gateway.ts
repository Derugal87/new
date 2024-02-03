import { 
  WebSocketGateway, 
  OnGatewayConnection, 
  OnGatewayDisconnect, 
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
 } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

@WebSocketGateway({ 
    namespace: 'users',
    cors: {
      origin: [`${process.env.BACKEND_URL}`, `${process.env.FRONTEND_URL}`, "http://[::1]:3000"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
})
export class UserGateway {
  constructor(private readonly userService: UserService) {}

  @WebSocketServer()
  server: Server;

  private connectedUsers = new Set<Socket>();

  handleConnection(client: Socket): void {
    console.log(`Client connected to users namespace: ${client.id}`);
    this.connectedUsers.add(client);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected from users namespace: ${client.id}`);
    this.connectedUsers.delete(client);
  }

  @SubscribeMessage('getUserInfo')
  async handleGetUserInfo(@MessageBody() userId: number, client: Socket): Promise<void> {
    try {
      const user = await this.userService.findUserById(userId);

      const userDto: Partial<User> = {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        status: user.status,
        isInGame: user.isInGame,
        // Include other fields as needed
      };

      // Emit the user information to the client
      client.emit('userInfo', userDto);
    } catch (error) {
      // Handle errors, emit an error message, or handle them as needed
      console.error(error);
      throw new Error('Failed to get user information.');
    }
  }

}
