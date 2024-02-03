// import { Injectable } from '@nestjs/common';
// import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { DirectMessageService } from './direct-message.service';
// import { CreateDirectMessageDto } from './dto/create-direct-message.dto';

// @Injectable()
// @WebSocketGateway({
//   namespace: 'direct-messages',
//   cors: {
//     origin: [`${process.env.BACKEND_URL}`, `${process.env.FRONTEND_URL}`, "http://[::1]:3000"],
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//   },
// })
// export class DirectMessageGateway implements OnGatewayConnection, OnGatewayDisconnect {

//   constructor(
//     private readonly directMessageService: DirectMessageService,
//   ) {}

//   @WebSocketServer()
//   private server: Server;

//   private connectedUsers = new Map<string, Socket>();

//   async handleConnection(client: Socket) {
//     const userId = this.getUserIdFromConnection(client);
//     if (userId !== null) {
//       console.log(`User connected with ID: ${userId}`);
//       this.connectedUsers.set(userId.toString(), client);
//       await this.directMessageService.setUserOnlineStatus(userId, true);

//     }
//   }

//   async handleDisconnect(client: Socket) {
//     const userId = this.getUserIdFromConnection(client);
//     if (userId !== null) {
//       console.log(`User disconnected with ID: ${userId}`);
//       this.connectedUsers.delete(userId.toString());
//       await this.directMessageService.setUserOnlineStatus(userId, false);
//     }
//   }

//   @SubscribeMessage('sendDirectMessage')
//   async handleSendDirectMessage(
//     @MessageBody() createDirectMessageDto: CreateDirectMessageDto,
//     @ConnectedSocket() client: Socket,
//   ) {
//     try {
//       const createdDirectMessage = await this.directMessageService.createDirectMessage(createDirectMessageDto);
//       client.emit('directMessageSent', createdDirectMessage);
//       this.server.to(`user-${createDirectMessageDto.receiver_id}`).emit('directMessageReceived', createdDirectMessage);
//     } catch (error) {
//       client.emit('directMessageError', { error: error.message });
//     }
//   }

//   private getUserIdFromConnection(client: Socket): number | null {
//     const userId = parseInt(client.handshake.query.userId as string, 10);
//     console.log(`User id: ${userId}`);
//     return isNaN(userId) ? null : userId;
//   }

//   @SubscribeMessage('getUserMessages')
//   async handleGetUserMessages(client: Socket, payload: any): Promise<void> {
//     try {
//       const { senderId, receiverId } = payload;
//       const messages = await this.directMessageService.getUserMessages(senderId, receiverId);
//       this.server.to(client.id).emit('userMessages', messages);
//     } catch (error) {
//       this.server.to(client.id).emit('error', error.message);
//     }
//   }

//   @SubscribeMessage('getAllFriendsAndDirectMessageRecipients')
//   async handleGetAllFriendsAndDirectMessageRecipients(
//     @MessageBody() userId: number,
//     @ConnectedSocket() client: Socket,
//   ) {
//     try {
//       const result = await this.directMessageService.getAllFriendsAndDirectMessageRecipients(userId);
//       client.emit('friendsAndRecipients', result);
//     } catch (error) {
//       client.emit('error', error.message);
//     }
//   }
// }

import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DirectMessageService } from './direct-message.service';
import { CreateDirectMessageDto } from './dto/create-direct-message.dto';

@Injectable()
@WebSocketGateway({
  namespace: 'direct-messages',
  cors: {
    origin: [`${process.env.BACKEND_URL}`, `${process.env.FRONTEND_URL}`, "http://[::1]:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
})
export class DirectMessageGateway {
  constructor(
    private readonly directMessageService: DirectMessageService,
  ) {}

  @WebSocketServer()
  private server: Server;

  private userSocketMap: Record<number, Socket> = {};

  handleConnection(client: Socket, ...args: any[]) {
      this.server.emit('connection', `User connected to direct-message namespace: ${client.id}`);
  }

  // async handleDisconnect(client: Socket, userId: number) {
  //   delete this.userSocketMap[userId];
  //   this.server.emit('userDisconnected', userId);
  //   await this.directMessageService.setUserOnlineStatus(userId, false);
  // }

  async handleDisconnect(client: Socket) {
      const userId = this.getUserIdFromConnection(client);
      console.log(`User disconnected with ID: ${userId}`);
      if (userId !== null) {
          delete this.userSocketMap[userId];
          this.server.emit('userDisconnected', userId);
          await this.directMessageService.setUserOnlineStatus(userId, false);
      }
  }

  private getUserIdFromConnection(client: Socket): number | null {
      const userId = parseInt(client.handshake.query.userId as string, 10);
      console.log(`User id: ${userId}`);
      return isNaN(userId) ? null : userId;
  }



  @SubscribeMessage('setUserId')
  async handleSetUserId(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const { userId } = data;

      console.log(`User with ID ${userId} connected to direct-message namespace: ${client.id}`);
      this.userSocketMap[userId] = client;
      this.server.emit('userConnected', userId);
      await this.directMessageService.setUserOnlineStatus(userId, true);
    } catch (error) {
      client.emit('error', error.message);
    }
  }
  
  @SubscribeMessage('sendDirectMessage')
  async handleSendDirectMessage(
    @MessageBody() createDirectMessageDto: CreateDirectMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const createdDirectMessage = await this.directMessageService.createDirectMessage(createDirectMessageDto);
      
      // Emit the direct message to the sender
      client.emit('directMessageSent', createdDirectMessage);

      // Use the receiver's socket to emit the message to them
      const receiverUserId = createDirectMessageDto.receiver_id;
      const receiverSocket = this.userSocketMap[receiverUserId];
      if (receiverSocket) {
        receiverSocket.emit('directMessageReceived', createdDirectMessage);
      } else {
        client.emit('directMessageError', { error: 'Receiver is offline' });
      }
      // const senderUserId = createDirectMessageDto.sender_id;
      // const senderSocket = this.userSocketMap[senderUserId];
      // if (senderSocket) {
      //   const result = await this.directMessageService.getAllFriendsAndDirectMessageRecipients(senderUserId);
      //   senderSocket.emit('friendsAndRecipients', result);
      // }
      // if (receiverSocket) {
      //   const result = await this.directMessageService.getAllFriendsAndDirectMessageRecipients(receiverUserId);
      //   receiverSocket.emit('friendsAndRecipients', result);
      // }
    } catch (error) {
      client.emit('directMessageError', { error: error.message });
    }
  }

  @SubscribeMessage('getUserMessages')
  async handleGetUserMessages(
    @MessageBody() payload: { senderId: number; receiverId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const { senderId, receiverId } = payload;
      const receiverSocket = this.userSocketMap[receiverId];
      const senderSocket = this.userSocketMap[senderId];

      if (receiverSocket) {
        // Retrieve messages for the specified sender and receiver IDs
        const messages = await this.directMessageService.getUserMessages(senderId, receiverId);

        // Emit 'userMessages' event to the receiver's socket
        receiverSocket.emit('userMessages', messages);
      } if (senderSocket) {
        const messages = await this.directMessageService.getUserMessages(senderId, receiverId);

        // Emit 'userMessages' event to the receiver's socket
        senderSocket.emit('userMessages', messages);
      }
       else {
        client.emit('error', 'Receiver is not connected');
      }
    } catch (error) {
      // Handle errors and emit an 'error' event to the client's socket
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('getAllFriendsAndDirectMessageRecipients')
  async handleGetAllFriendsAndDirectMessageRecipients(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      // Get the user's socket
      const userSocket = this.userSocketMap[userId];

      if (userSocket) {
        const result = await this.directMessageService.getAllFriendsAndDirectMessageRecipients(userId);

        // Emit the 'friendsAndRecipients' event to the connected client's socket
        userSocket.emit('friendsAndRecipients', result);
      } else {
        client.emit('error', 'User is not connected');
      }
    } catch (error) {
      // Emit an 'error' event to the connected client's socket
      client.emit('error', error.message);
    }
  }


}
