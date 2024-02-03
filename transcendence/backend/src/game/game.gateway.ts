// game.gateway.ts

import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MatchService } from '../match/match.service';
import { PongGame } from './pong-game';
import { UserService } from '../user/user.service';

@WebSocketGateway({ namespace: '/pong' })
export class GameGateway {
    @WebSocketServer()
    private server: Server;

    constructor(
        private readonly matchService: MatchService,
        private readonly userService: UserService,
    ) { }
    private logger: Logger = new Logger('GameGateway');

    private userIdToRoomIdMap = new Map<string, string>();
    private rooms = new Map<string, { creator: string, game: PongGame, settings: any }>();
    private userIdToSocketIdMap = new Map<string, string>();
    private waitingQueue: string[] = [];
    private userIdToReadyStatusMap = new Map<string, boolean>();
    // map for storing userId to last ready timestamp
    private userIdToReadyTimestampMap = new Map<string, number>();

    async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
        const userId = this.getUserIdFromClient(client);
        if (!userId) return;
        await this.updateUserSocketAndReconnect(client, userId);
    }

    async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
        const userId = this.getUserIdBySocketId(client.id);
        if (!userId) return;
        await this.handleUserDisconnect(userId, client);
    }

    @SubscribeMessage('sendGameInvitation')
    async handleSendGameInvitation(@ConnectedSocket() client: Socket, @MessageBody() data: { inviterId: string, inviteeId: string, settings: any }): Promise<void> {
        this.logger.log(`Inviter ${data.inviterId} emits sendGameInvitation for invitee ${data.inviteeId}`);
        if (await this.preGameChecks(data.inviterId, client)) return;
        this.setupGameRoom(data.inviterId, data.inviteeId, data.settings, client);
    }

    @SubscribeMessage('acceptGameInvitation')
    async handleAcceptGameInvitation(@ConnectedSocket() client: Socket, @MessageBody() data: { inviterId: string, inviteeId: string }): Promise<void> {
        this.logger.log(`Invitee ${data.inviteeId} emits acceptGameInvitation from inviter ${data.inviterId}`);
        if (await this.preGameChecks(data.inviteeId, client)) return;
        this.joinGameRoom(data.inviterId, data.inviteeId, client);
    }

    @SubscribeMessage('rejectGameInvitation')
    handleRejectGameInvitation(@ConnectedSocket() client: Socket, @MessageBody() data: { inviterId: string, inviteeId: string }): void {
        this.logger.log(`Invitee ${data.inviteeId} emits rejectGameInvitation from inviter ${data.inviterId}`);
        this.rejectInvitation(data.inviterId, data.inviteeId);
    }

    @SubscribeMessage('ready')
    async handlePlayerReady(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string, settings?: any }): Promise<void> {
        this.logger.log(`User ${data.userId} emits ready with settings ${data.settings}`);
        if (await this.preGameChecks(data.userId, client, data.settings)) return;
        await this.matchOrQueuePlayer(data.userId, data.settings, client);
    }

    @SubscribeMessage('quit')
    async handlePlayerQuit(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }): Promise<void> {
        this.logger.log(`User ${data.userId} emits quit`);
        const room = this.getRoomForUser(data.userId);
        if (!room) // user might be in waiting queue 
        {
            this.logger.log(`User ${data.userId} not in a room`);
            // if user is in waiting queue, remove from queue
            const index = this.waitingQueue.indexOf(data.userId);
            if (index > -1) {
                this.waitingQueue.splice(index, 1);
                this.logger.log(`User ${data.userId} removed from waiting queue  (quit)`);
            }
            return;
        }

        // if user is creator with no match, leave room
        if (this.rooms.get(room)?.game.getState().joinerId === '') {
            this.logger.log(`User ${data.userId} is creator with no match, leaving room ${room} (quit)`);
            this.leaveRoom(data.userId);
            return;
        }

        const game = this.rooms.get(room)?.game;
        if (!game) return;
        this.logger.log(`User ${data.userId} quit room ${room} during game, setting quit to userId (quit)`);
        game.setQuit(data.userId);
        this.server.to(room).emit('gameState', game.getState());
    }


    @SubscribeMessage('paddleMove')
    handlePaddleMove(@ConnectedSocket() client: Socket, @MessageBody() body: { userId: string, paddleY: number }): void {
        this.updateGameOnPaddleMove(body.userId, body.paddleY);
    }

    private async updateUserSocketAndReconnect(client: Socket, userId: string): Promise<void> {
        this.userIdToSocketIdMap.set(userId, client.id);
        this.logger.log(`User ${userId} connected with socket id ${client.id}`);
        this.reconnectUserToGame(client, userId);
    }

    private async handleUserDisconnect(userId: string, client: Socket): Promise<void> {
        client.leave(this.getRoomForUser(userId));
        this.logger.log(`User ${userId} disconnected with socket id ${client.id}`);
        this.cleanUpRooms();
    }

    private async setupGameRoom(inviterId: string, inviteeId: string, settings: any, client: Socket): Promise<void> {
        const room = uuidv4();
        const game = new PongGame(settings, inviterId, inviteeId);
        this.rooms.set(room, { creator: inviterId, game, settings });
        this.userIdToRoomIdMap.set(inviterId, room);
        client.join(room);
        this.logger.log(`Inviter ${inviterId} created room ${room} for invitee ${inviteeId}`);
        this.emitToSocket(inviteeId, 'invitationReceived', { inviterId });
    }

    private async joinGameRoom(inviterId: string, inviteeId: string, client: Socket): Promise<void> {
        const room = this.userIdToRoomIdMap.get(inviterId);
        if (!room) return;
        this.userIdToRoomIdMap.set(inviteeId, room);
        client.join(room);
        this.logger.log(`Invitee ${inviteeId} joined room ${room} with inviter ${inviterId}`);
        this.startGame(room);
    }

    private rejectInvitation(inviterId: string, inviteeId: string): void {
        const room = this.userIdToRoomIdMap.get(inviterId);
        if (!room) return;
        this.logger.log(`Invitee ${inviteeId} rejected invitation from inviter ${inviterId}`);
        this.emitToSocket(inviterId, 'invitationRejected', { inviteeId });
        this.cleanUpRoom(room);
    }

    private updateGameOnPaddleMove(userId: string, paddleY: number): void {
        const room = this.userIdToRoomIdMap.get(userId);
        if (!room) return;
        const game = this.rooms.get(room)?.game;
        if (!game) return;
        game.handleClientUpdate(userId, { paddleY });
        this.server.to(room).emit('gameState', game.getState());
    }

    private async preGameChecks(userId: string, client: Socket, settings?: any): Promise<boolean> {
        // get timestamp from map
        const timestamp = this.userIdToReadyTimestampMap.get(userId);
        if (timestamp) {
            // if timestamp is less than 5 seconds ago, return true
            if (Date.now() - timestamp < 1000) {
                // client.emit('gameError', 'Please wait 1 second before readying up again');
                this.logger.log('Please wait 1 second before readying up again');
                return true;
            }
        }
        this.userIdToReadyTimestampMap.set(userId, Date.now());
        if (await this.userService.isUserInGame(parseInt(userId, 10))) {
            // client.emit('gameError', 'Already in a game or room');
            this.logger.log(`User ${userId} already in a game or room`);
            this.reconnectUserToGame(client, userId);
            return true;
        }

        // Clear any previous room association
        this.leaveRoom(userId);
        this.userIdToReadyStatusMap.set(userId, true);
        if (settings && (await this.userService.getUserPoints(parseInt(userId, 10))) === 0) {
            client.emit('zeroPointsError', 'Cannot play with 0 points');
            this.logger.log(`User ${userId} has 0 points and cannot play with settings ${settings.toString()}`);
            return true;
        }
        return false;
    }

    private async matchOrQueuePlayer(userId: string, settings: any, client: Socket): Promise<void> {
        this.logger.log(`Determining whether to match or queue player ${userId} with settings ${settings}`);
        if (settings) {
            this.createRoomWithSettings(userId, settings, client);
        } else {
            this.attemptToJoinRoom(userId, client);
        }
    }

    private createRoomWithSettings(userId: string, settings: any, client: Socket): void {
        this.logger.log(`User ${userId} is creating a room with ballX ${settings.ballX}`);
        const room = uuidv4();
        const game = new PongGame(settings, userId, '');
        this.rooms.set(room, { creator: userId, game, settings });
        this.userIdToRoomIdMap.set(userId, room);
        client.join(room);
        this.logger.log(`User ${userId} created room ${room} (open matchmaking)`);
        this.processWaitingQueue();
    }

    private attemptToJoinRoom(userId: string, client: Socket): void {
        const room = this.findAvailableRoom(userId);
        if (!room) {
            this.waitingQueue.push(userId);
            return;
        }
        const game = this.rooms.get(room)?.game;
        if (!game) return;
        game.setJoinerId(userId);
        this.userIdToRoomIdMap.set(userId, room);
        client.join(room);
        this.startGame(room);
    }

    private startGame(room: string, doNotBroadcast?: boolean): void {
        const { creator, game, settings } = this.rooms.get(room);
        this.logger.log(`Starting game in room ${room} with creator ${creator} and joiner ${game.getState().joinerId}`);
        this.logger.log(`Settings for room ${room}: ${settings.toString()}`);
        if (!doNotBroadcast)
            this.server.to(room).emit('startGame', creator, game.getState().joinerId, settings, game.getState());
        // mark users as in game
        this.userService.markUserInGame(parseInt(creator, 10));
        this.userService.markUserInGame(parseInt(game.getState().joinerId, 10));
        this.startGameUpdateLoop(room);
    }

    private getUserIdFromClient(client: Socket): string | undefined {
        return client.handshake.query.userId?.toString();
    }

    private getUserIdBySocketId(socketId: string): string | undefined {
        return [...this.userIdToSocketIdMap.entries()].find(([_, id]) => id === socketId)?.[0];
    }

    private async emitToSocket(userId: string, event: string, data: any): Promise<void> {
        const socketId = this.userIdToSocketIdMap.get(userId);
        if (!socketId) return;
        const socket = await this.findSocketById(socketId);
        socket?.emit(event, data);
    }

    private reconnectUserToGame(client: Socket, userId: string): void {
        const room = this.userIdToRoomIdMap.get(userId);
        if (!room) return;
        this.logger.log(`Reconnecting user ${userId} to room ${room}`);
        client.join(room);
        const game = this.rooms.get(room)?.game;
        if (game) 
            client.emit('resumeGame', game.getState().creatorId, userId, this.rooms.get(room).settings, game.getState());
    }

    private getRoomForUser(userId: string): string | undefined {
        return this.userIdToRoomIdMap.get(userId);
    }

    private async startGameUpdateLoop(room: string): Promise<void> {
        const game = this.rooms.get(room)?.game;
        if (!game) return;

        // Delay before starting the game loop to allow clients to prepare
        await new Promise(resolve => setTimeout(resolve, 4200)); // 4.2 seconds delay

        const update = () => {
            const winner = game.update();
            this.server.to(room).emit('gameState', game.getState());
            if (winner) {
                clearInterval(intervalId); // Stop the game loop
                this.server.to(room).emit('gameOver', { winner });
                this.saveGame(game, room).then(() => {
                    this.logger.log(`Game saved for room ${room}, cleaning up...`);
                    this.cleanUpAfterGame(room);
                });
            }
            if (game.getState().quit) {
                clearInterval(intervalId); // Stop the game loop
                const winner = game.getState().quit === game.getState().creatorId ? game.getState().joinerId : game.getState().creatorId;
                if (winner === game.getState().creatorId) {
                    game.setScore({ creator: game.getState().scoreLimit, joiner: 0 });
                }
                else {
                    game.setScore({ creator: 0, joiner: game.getState().scoreLimit });
                }
                this.server.to(room).emit('gameOver', { winner });
                this.saveGame(game, room).then(() => {
                    this.logger.log(`Game saved for room ${room}, cleaning up...`);
                    this.cleanUpAfterGame(room);
                });
            }

        };

        const intervalId = setInterval(update, 1000 / 30); // Update game state at 30 FPS
    }

    private async saveGame(game: PongGame, room: string): Promise<void> {
        const player1 = parseInt(game.getState().creatorId, 10);
        const player2 = parseInt(game.getState().joinerId, 10);

        // Logic to save the game result to the database
        await this.matchService.createMatchScore(player1, player2, game.getState().score.creator, game.getState().score.joiner);
        await this.userService.updateWinsAndLosses(player1, game.getState().score.creator > game.getState().score.joiner);
        await this.userService.updateWinsAndLosses(player2, game.getState().score.creator < game.getState().score.joiner);
        await this.userService.updateAchievements(player1);
        await this.userService.updateAchievements(player2);
        await this.matchService.updatePoints(player1, player2, game.getState().score.creator, game.getState().score.joiner);
        // Additional logic for handling achievements, etc.
    }

    private cleanUpAfterGame(room: string): void {
        const game = this.rooms.get(room)?.game;
        if (!game) return;


        // Remove the room and cleanup mappings
        this.userIdToRoomIdMap.delete(game.getState().creatorId);
        this.userIdToRoomIdMap.delete(game.getState().joinerId);
        this.server.socketsLeave(room);
        this.cleanUpRooms();
        // Additional cleanup logic as needed

        // Mark the users as not in a game
        this.userService.markUserNotInGame(parseInt(game.getState().creatorId, 10));
        this.userService.markUserNotInGame(parseInt(game.getState().joinerId, 10));

        // reset ready status
        this.userIdToReadyStatusMap.delete(game.getState().creatorId);
        this.userIdToReadyStatusMap.delete(game.getState().joinerId);
    }

    private async processWaitingQueue(): Promise<void> {
        this.logger.log(`Processing waiting queue: ${this.waitingQueue}`);
        while (this.waitingQueue.length > 0) {
            const userId = this.waitingQueue.shift();
            this.logger.log(`Processing user ${userId} from waiting queue`);
            const availableRoom = this.findAvailableRoom(userId);
            this.logger.log(`Available room: ${availableRoom}`);
            if (!availableRoom || !userId) break; // Exit if no available room or userId is undefined

            const socketId = this.userIdToSocketIdMap.get(userId);
            const client = await this.findSocketById(socketId);
            this.logger.log(`Client for waiting queue user: ${client}`);
            if (!client) continue; // Skip to the next user if the client socket is not found

            this.addUserToRoomAndNotify(userId, availableRoom, client);
            this.startGame(availableRoom, true); // Start the game update loop if not started already
        }
    }

    private async findSocketById(socketId: string | undefined): Promise<any | undefined> {
        if (!socketId) return undefined;
        const sockets = await this.server.fetchSockets();
        return sockets.find(socket => socket.id === socketId);
    }

    private addUserToRoomAndNotify(userId: string, room: string, client: Socket): void {
        const game = this.rooms.get(room)?.game;
        if (!game) return;

        this.userIdToRoomIdMap.set(userId, room);
        client.join(room);
        game.setJoinerId(userId);

        // Log and notify about the joined room
        this.logger.log(`User ${userId} joined room ${room} from waiting queue`);
        // log settings
        this.logger.log(`Settings for room ${room}: ${this.rooms.get(room)?.settings}`);
        this.server.to(room).emit('startGame', game.getState().creatorId, userId, this.rooms.get(room).settings, game.getState());
    }

    private findAvailableRoom(userId: string): string | undefined {
        for (const [roomId, { game }] of this.rooms) {
            if (!game.getState().joinerId && game.getState().creatorId != userId) return roomId; // Return the first room without a joiner
        }
        return undefined; // Return undefined if no available room is found
    }

    private async leaveRoom(userId: string): Promise<void> {
        const room = this.userIdToRoomIdMap.get(userId);
        if (room) {
            this.logger.log(`deleting userIdToRoomIdMap entry for user ${userId}: ${room} (leaveRoom)`);
            this.userIdToRoomIdMap.delete(userId);
            this.userIdToReadyStatusMap.delete(userId);
            await this.userService.markUserNotInGame(parseInt(userId, 10));
    
            const client = await this.findSocketById(this.userIdToSocketIdMap.get(userId));
            client?.leave(room);
            if (!client) {
                this.logger.log(`Client not found for user ${userId} when trying to leave room ${room}`);
                return;
            }
            this.logger.log(`Cleaning up room ${room} after leaving by user with id ${userId} (leaveRoom)`)
            this.cleanUpRoom(room);
            this.logger.log(`User ${userId} left room ${room}`);
            this.cleanUpRooms();
        }
    }

    private cleanUpRoom(room: string): void {
        if (!this.rooms.has(room)) return; // Exit if the room does not exist

        const roomIsEmpty = ![...this.userIdToRoomIdMap.values()].includes(room); // Check if no users are in the room
        if (roomIsEmpty) {
            // this.server.socketsLeave(room); // Remove all sockets from the room
            this.rooms.delete(room); // Delete the room
            this.logger.log(`Cleaned up room: ${room}`);
        } else {
            // Optionally handle scenarios where the room isn't empty but still requires cleanup or maintenance
            this.logger.log(`Room ${room} not cleaned up as it's not empty.`);
        }
        this.logger.log(`Number of rooms after cleanUpRoom: ${this.rooms.size}`);
        // print all rooms
        for (const [roomId, { game }] of this.rooms) {
            const currentRoom = this.rooms.get(roomId);
            this.logger.log(`Room ${roomId} has creator ${game.getState().creatorId} and joiner ${game.getState().joinerId} and speedX ${currentRoom?.settings.speedX}`);
        }
    }

    private cleanUpRooms(): void {
        const roomsToClean = [...this.rooms.keys()];
        roomsToClean.forEach(room => this.cleanUpRoom(room));
        // This could potentially modify the rooms collection while iterating over it,
        // hence copying the keys to a separate array
        // print number of rooms
    }

}
