// import { Injectable } from '@nestjs/common';
// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { NotificationService } from './notification.service';
// import { ConnectedSocket, MessageBody } from '@nestjs/websockets';

// @Injectable()
// @WebSocketGateway({
//   namespace: 'notifications',
//   cors: {
//     origin: [`${process.env.BACKEND_URL}`, `${process.env.FRONTEND_URL}`, "http://[::1]:3000"],
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//   },
// })
// export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer() server: Server;

//   constructor(private readonly notificationService: NotificationService) {}

//   handleConnection(client: Socket) {
//     console.log(`Client connected: ${client.id}`);
//   }

//   handleDisconnect(client: Socket) {
//     console.log(`Client disconnected: ${client.id}`);
    
//     // Find the user ID associated with this socket and remove it
//     const userId = Object.entries(this.userSocketMap).find(([key, socket]) => socket === client)?.[0];

//     if (userId) {
//       delete this.userSocketMap[userId];
//     }
//   }

//   @SubscribeMessage('setUserId')
//   async handleSetUserId(
//     @MessageBody() data: { userId: number },
//     @ConnectedSocket() client: Socket,
//   ): Promise<void> {
//     try {
//       const { userId } = data;

//       console.log(`User with ID ${userId} connected to notifications namespace: ${client.id}`);
//       this.userSocketMap[userId] = client;
//       // Optionally emit an event to notify others that the user connected
//     } catch (error) {
//       client.emit('error', error.message);
//     }
//   }

//   @SubscribeMessage('markNotificationAsRead')
//   async handleMarkNotificationAsRead(client: Socket, data: { senderId: number, receiverId: number, type: string }) {
//     const { senderId, receiverId, type } = data;
//     await this.notificationService.markNotificationAsRead(senderId, receiverId, type);
//     client.emit('notificationMarkedAsRead', { senderId, receiverId, type });
//   }

//   @SubscribeMessage('markGroupNotificationAsRead')
//   async handleMarkGroupNotificationAsRead(client: Socket, data: { channelId: number, userId: number, type: string }) {
//     const { channelId, userId, type } = data;
//     await this.notificationService.markGroupNotificationAsRead(channelId, userId, type);
//     client.emit('groupNotificationMarkedAsRead', { channelId, userId, type });

//   }

//     // Handle getting the unread count of direct messages
//     @SubscribeMessage('getUnreadDirectMessagesCount')
//     async getUnreadDirectMessagesCount(client: Socket, userId: number) {
//       const count = await this.notificationService.getUnreadDirectMessagesCount(userId);
//       client.emit('unreadDirectMessagesCount', count);
//     }

//     // Handle getting the unread count of group messages using user id and channel id
//     @SubscribeMessage('getUnreadGroupMessagesCount')
//     async getUnreadGroupMessagesCount(client: Socket, data: { userId: number, channelId: number }) {
//       try {
//         const { userId, channelId } = data;
//         const count = await this.notificationService.getUnreadGroupMessagesCount(
//           channelId,
//           userId,
//         );
//         client.emit('unreadGroupMessagesCount', count);
//       } catch (error) {
//         // Handle the error and emit an error event to the client
//         client.emit('unreadGroupMessagesCountError', { message: 'An error occurred while fetching the unread message count.' });
//       }
//     }  

//     // Implement the gateway for 'findUnreadByUser' method
//     @SubscribeMessage('findUnreadByUser')
//     async findUnreadByUser(client: Socket, userId: number) {
//       try {
//         const unreadNotifications = await this.notificationService.getUnreadNotifications(userId);

//         // Emit the unread notifications to the connected client
//         client.emit('unreadNotifications', unreadNotifications);
//       } catch (error) {
//         // Handle errors and emit an error message if needed
//         console.error(`Error in findUnreadByUser: ${error.message}`);
//         client.emit('error', { message: 'Error fetching unread notifications.' });
//       }
//     }


// }

import { Injectable } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';
import { ConnectedSocket, MessageBody } from '@nestjs/websockets';

@Injectable()
@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: [`${process.env.BACKEND_URL}`, `${process.env.FRONTEND_URL}`, "http://[::1]:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private userSocketMap: Record<number, Socket> = {};

  constructor(private readonly notificationService: NotificationService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected to notification namespace: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const userId = Object.entries(this.userSocketMap).find(([key, socket]) => socket === client)?.[0];

    if (userId) {
      delete this.userSocketMap[userId];
    }
  }

  @SubscribeMessage('setUserId')
  async handleSetUserId(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const { userId } = data;

      console.log(`User with ID ${userId} connected to notifications namespace: ${client.id}`);
      this.userSocketMap[userId] = client;
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('markNotificationAsRead')
  async handleMarkNotificationAsRead(
    @MessageBody() data: { senderId: number, receiverId: number, type: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { senderId, receiverId, type } = data;
    await this.notificationService.markNotificationAsRead(senderId, receiverId, type);
    
    // Use the user's socket to emit the 'notificationMarkedAsRead' event
    const userSocket = this.userSocketMap[receiverId];
    if (userSocket) {
      userSocket.emit('notificationMarkedAsRead', { senderId, receiverId, type });
    }
  }

  @SubscribeMessage('markGroupNotificationAsRead')
  async handleMarkGroupNotificationAsRead(
    @MessageBody() data: { channelId: number, userId: number, type: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { channelId, userId, type } = data;
    await this.notificationService.markGroupNotificationAsRead(channelId, userId, type);

    const userSocket = this.userSocketMap[userId];
    if (userSocket) {
      userSocket.emit('groupNotificationMarkedAsRead', { channelId, userId, type });
    } else {
      // Handle the case where the user's socket is not found (user is not connected)
      client.emit('error', 'User is not connected');
    }
  }


    @SubscribeMessage('getUnreadDirectMessagesCount')
    async getUnreadDirectMessagesCount(
      @MessageBody() data: { userId: number },
      @ConnectedSocket() client: Socket,
    ): Promise<void> {
      const { userId } = data;
      const count = await this.notificationService.getUnreadDirectMessagesCount(userId);

      // Use the user's socket to emit the 'unreadDirectMessagesCount' event
      const userSocket = this.userSocketMap[userId];
      if (userSocket) {
        userSocket.emit('unreadDirectMessagesCount', count);
        console.log(`Unread direct messages count emitted to user ${userId}: ${count}`);
      } else {
        // Handle the case where the user's socket is not found (user is not connected)
        client.emit('error', 'User is not connected');
      }
    }

    @SubscribeMessage('getUnreadGroupMessagesCount')
    async getUnreadGroupMessagesCount(
      @MessageBody() data: { userId: number, channelId: number },
      @ConnectedSocket() client: Socket,
    ): Promise<void> {
      try {
        const { userId, channelId } = data;

        // Use the user's socket to emit the 'unreadGroupMessagesCount' event
        const userSocket = this.userSocketMap[userId];
        if (userSocket) {
          const count = await this.notificationService.getUnreadGroupMessagesCount(channelId, userId);
          userSocket.emit('unreadGroupMessagesCount', count);
        } else {
          // Handle the case where the user's socket is not found (user is not connected)
          client.emit('unreadGroupMessagesCountError', { message: 'User is not connected' });
        }
      } catch (error) {
        // Handle other errors and emit an error event to the client
        client.emit('unreadGroupMessagesCountError', {
          message: 'An error occurred while fetching the unread message count.',
        });
      }
    }

    @SubscribeMessage('findUnreadByUser')
    async findUnreadByUser(
      @MessageBody() data: { userId: number },
      @ConnectedSocket() client: Socket,
    ): Promise<void> {
      try {
        // Use the user's socket to emit the 'unreadNotifications' event
        const { userId } = data;
        const userSocket = this.userSocketMap[userId];
        if (userSocket) {
          const unreadNotifications = await this.notificationService.getUnreadNotifications(userId);
          userSocket.emit('unreadNotifications', unreadNotifications);
        } else {
          // Handle the case where the user's socket is not found (user is not connected)
          client.emit('unreadNotificationsError', { message: 'User is not connected' });
        }
      } catch (error) {
        // Handle other errors and emit an error event to the client
        client.emit('unreadNotificationsError', {
          message: 'An error occurred while fetching unread notifications.',
        });
      }
    }
}
