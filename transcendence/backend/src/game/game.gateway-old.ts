// game.gateway.ts

import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MatchService } from '../match/match.service';
import { PongGame } from './pong-game';
import { UserService } from '../user/user.service';
import { parse } from 'path';

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

    // map for tracking ready status of users
    private userIdToReadyStatusMap = new Map<string, boolean>();

    async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
        const userId = client.handshake.query.userId ? client.handshake.query.userId.toString() : '';
        if (!userId) {
            this.logger.log(`Warning: ${userId} is an invalid user id.`);
            return;
        }
        await this.updateUserSocketAndReconnect(client, userId);
    }

    private async updateUserSocketAndReconnect(client: Socket, userId: string): Promise<void> {
        // Reconnection logic with room and game state synchronization
        if (this.userIdToSocketIdMap.has(userId)) {
            this.logger.log(`User ${userId} reconnected. Synchronizing game state.`);
            this.userIdToSocketIdMap.set(userId, client.id);
            const room = this.userIdToRoomIdMap.get(userId);
            if (room) {
                client.join(room);
                this.logger.log(`User ${userId} rejoined room ${room} with socket id ${client.id}`);
                const game = this.rooms.get(room)?.game;
                if (game) {
                    const gameState = game.getState();
                    client.emit('resumeGame', gameState);
                }
            }
        } else {
            this.userIdToSocketIdMap.set(userId, client.id);
            this.logger.log(`Client connected to Game Gateway: ${client.id} with user id: ${userId}`);
        }
    }

    // async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    //     const userId = Array.from(this.userIdToSocketIdMap.keys()).find((key) => this.userIdToSocketIdMap.get(key) === client.id);
    //     if (!userId) {
    //         this.logger.log(`Disconnection event received for unknown user: ${client.id}`);
    //         return;
    //     }
    //     else {
    //         this.logger.log(`Disconnection event received for user: ${client.id} with userId: ${userId}`);
    //     }

    //     console.log(`User with id: ${userId} disconnected`);
    //     this.logger.log(`Client disconnected from Game Gateway: ${client.id}`);
    //     const room = this.userIdToRoomIdMap.get(userId);

    //     // this.userIdToSocketIdMap.delete(userId);

    //     if (room) {
    //         // leave the room
    //         client.leave(room);
    //         const otherPlayerId = Array.from(this.userIdToRoomIdMap.keys()).find((key) => key !== userId && this.userIdToRoomIdMap.get(key) === room);
    //         if (otherPlayerId) {
    //             const socketId = this.userIdToSocketIdMap.get(otherPlayerId);
    //             const otherPlayerClient = await this.server.fetchSockets().then((sockets) => {
    //                 return sockets.find((socket) => socket.id === socketId);
    //             });
    //             // if (otherPlayerClient) {
    //             //     otherPlayerClient.emit('opponentDisconnect');
    //             // }
    //         }
    //     }
    //     if (room) {
    //         console.log("Cleaning up room" + room);
    //         this.cleanUpRoom(room);
    //     }

    //     for (const room of this.rooms.keys()) {
    //         this.cleanUpRoom(room);
    //     }
    // }

    async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
        const userId = this.getUserIdBySocketId(client.id);
        if (!userId) {
            this.logger.log(`Disconnection event received for unknown user: ${client.id}`);
            return;
        }
        this.logger.log(`Disconnection event received for user: ${client.id} with userId: ${userId}`);
        await this.handleUserDisconnect(userId, client);
    }

    private async handleUserDisconnect(userId: string, client: Socket): Promise<void> {
        const room = this.userIdToRoomIdMap.get(userId);
        if (room) {
            client.leave(room);
        }
        this.cleanUpRooms();
        // Additional cleanup logic here
    }

    private getUserIdBySocketId(socketId: string): string | undefined {
        for (const [userId, id] of this.userIdToSocketIdMap.entries()) {
            if (id === socketId) return userId;
        }
        return undefined;
    }

    @SubscribeMessage('sendGameInvitation')
    async handleSendGameInvitation(@ConnectedSocket() client: Socket, @MessageBody() data: { inviterId: string, inviteeId: string, settings: any }): Promise<void> {
        this.cleanUpRooms();
        console.log("Handling send game invitation");

        // check if user is already ready
        if (this.userIdToReadyStatusMap.has(data.inviterId)) {
            this.logger.log(`User ${data.inviterId} is already ready`);
            return;
        }
        // mark user as ready
        this.userIdToReadyStatusMap.set(data.inviterId, true);

        // ignore if user is already in a game
        const userInGame = await this.userService.isUserInGame(parseInt(data.inviterId, 10));
        if (userInGame) {
            this.logger.log(`User ${data.inviterId} is already in a game`);
            // client.emit('alreadyInGameError', 'You are already in a game.');
            return;
        }
        // this.logger.log(`User ${data.userId} is not in a game yet`);
        // if user is already in a room, ignore
        if (this.userIdToRoomIdMap.has(data.inviterId)) {
            this.logger.log(`User ${data.inviterId} is already in a room`);
            // client.emit('alreadyInRoomError', 'You are already in a room.');
            return;
        }
        // this.logger.log(`User ${data.userId} is not in a room yet`);



        this.logger.log(`User ${data.inviterId} is ready after sending invitation`);


        const room = uuidv4();
        // this.rooms.set(room, { creator: data.inviterId, settings: data.settings });
        const game = new PongGame(data.settings, data.inviterId, data.inviteeId);
        this.rooms.set(room, { creator: data.inviterId, game, settings: data.settings });
        this.userIdToRoomIdMap.set(data.inviterId, room);
        client.join(room);
        this.logger.log(`User ${data.inviterId} created room ${room}`);

        const inviteeSocketId = this.userIdToSocketIdMap.get(data.inviteeId);
        if (inviteeSocketId) {
            const inviteeSocket = await this.server.fetchSockets().then((sockets) => {
                return sockets.find((socket) => socket.id === inviteeSocketId);
            });
            if (inviteeSocket) {
                inviteeSocket.emit('invitationReceived', { inviterId: data.inviterId });
                this.logger.log(`Invitation sent from ${data.inviterId} to ${data.inviteeId}`);
            } else {
                client.emit('invitationError', 'Invitee is not online');
            }
        } else {
            client.emit('invitationError', 'Invitee not found');
        }
    }


    @SubscribeMessage('acceptGameInvitation')
    async handleAcceptGameInvitation(@ConnectedSocket() client: Socket, @MessageBody() data: { inviterId: string, inviteeId: string }): Promise<void> {
        // call clean up room for all rooms
        for (const room of this.rooms.keys()) {
            console.log("Cleaning up room" + room);
            this.cleanUpRoom(room);
        }

        // check if user is already ready
        if (this.userIdToReadyStatusMap.has(data.inviteeId)) {
            this.logger.log(`User ${data.inviteeId} is already ready`);
            return;
        }
        // mark user as ready
        this.userIdToReadyStatusMap.set(data.inviteeId, true);

        // ignore if user is already in a game
        const userInGame = await this.userService.isUserInGame(parseInt(data.inviteeId, 10));
        if (userInGame) {
            this.logger.log(`User ${data.inviteeId} is already in a game`);
            // client.emit('alreadyInGameError', 'You are already in a game.');
            return;
        }
        // this.logger.log(`User ${data.userId} is not in a game yet`);
        // if user is already in a room, ignore
        if (this.userIdToRoomIdMap.has(data.inviteeId)) {
            this.logger.log(`User ${data.inviteeId} is already in a room`);
            // client.emit('alreadyInRoomError', 'You are already in a room.');
            return;
        }
        // this.logger.log(`User ${data.userId} is not in a room yet`);



        this.logger.log(`User ${data.inviteeId} is ready after accepting invitation`);
        const room = this.userIdToRoomIdMap.get(data.inviterId);
        if (room) {
            this.userIdToRoomIdMap.set(data.inviteeId, room);
            client.join(room);
            this.logger.log(`User ${data.inviteeId} joined room ${room}`);
            

            // Mark the user and the opponent as in a game when the game starts
            this.userService.markUserInGame(parseInt(data.inviterId, 10));
            this.userService.markUserInGame(parseInt(data.inviteeId, 10));

            this.server.to(room).emit('startGame', data.inviterId, data.inviteeId, this.rooms.get(room).settings, this.rooms.get(room).game.getState());
            this.startGameUpdateLoop(room);
        } else {
            client.emit('invitationError', 'Room not found');
            this.logger.log(`Room not found for inviter user ${data.inviterId}`);
        }
    }

    @SubscribeMessage('rejectGameInvitation')
    handleRejectGameInvitation(@ConnectedSocket() client: Socket, @MessageBody() data: { inviterId: string, inviteeId: string }): void {
        console.log("Handling reject game invitation:", data.inviterId, data.inviteeId);
        const room = this.userIdToRoomIdMap.get(data.inviterId);
        // if room creator isnt inviter, or room has 2 players, ignore
        if (room && this.rooms.get(room)?.game?.getState().creatorId === data.inviterId && this.rooms.get(room)?.game?.getState().joinerId === data.inviteeId) {
            const socketId = this.userIdToSocketIdMap.get(data.inviterId);
            const inviterClient = this.server.sockets.sockets.get(socketId);
            if (inviterClient) {
                inviterClient.emit('invitationRejected', { inviteeId: data.inviteeId });
                inviterClient.leave(room);
            }
            this.userIdToRoomIdMap.delete(data.inviterId);
            this.userIdToReadyStatusMap.set(data.inviterId, false);
            console.log("Cleaning up room" + room);
            this.cleanUpRoom(room);
        }
    }

    @SubscribeMessage('ready')
    async handlePlayerReady(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string, settings?: any }): Promise<void> {
        // call clean up room for all rooms
        for (const room of this.rooms.keys()) {
            console.log("Cleaning up room" + room);
            this.cleanUpRoom(room);
        }

        // check if user is true in ready status map
        if (this.userIdToReadyStatusMap.has(data.userId)) {
            this.logger.log(`User ${data.userId} is already ready`);
            return;
        }
        // mark user as ready
        this.userIdToReadyStatusMap.set(data.userId, true);

        // ignore if user is already in a game
        const userInGame = await this.userService.isUserInGame(parseInt(data.userId, 10));
        if (userInGame) {
            this.logger.log(`User ${data.userId} is already in a game`);
            // client.emit('alreadyInGameError', 'You are already in a game.');
            return;
        }
        // this.logger.log(`User ${data.userId} is not in a game yet`);
        // if user is already in a room, ignore
        if (this.userIdToRoomIdMap.has(data.userId)) {
            this.logger.log(`User ${data.userId} is already in a room`);
            // client.emit('alreadyInRoomError', 'You are already in a room.');
            return;
        }
        // this.logger.log(`User ${data.userId} is not in a room yet`);



        this.logger.log(`User ${data.userId} is ready`);

        // Check if the user has 0 points
        const userPoints = await this.userService.getUserPoints(parseInt(data.userId, 10));
        console.log("User points: ", userPoints);

        if (userPoints === 0) {
            this.logger.log(`User ${data.userId} has 0 points and cannot play.`);
            client.emit('zeroPointsError', 'You cannot play with 0 points.');
            return;
        }

        if (data.settings) {
            const room = uuidv4();
            // this.rooms.set(room, { creator: data.userId, settings: data.settings });
            const game = new PongGame(data.settings, data.userId, '');
            this.rooms.set(room, { creator: data.userId, game, settings: data.settings });
            console.log('creator', data.userId)
            this.userIdToRoomIdMap.set(data.userId, room);
            client.join(room);
            this.logger.log(`User ${data.userId} created room ${room}`);
            // print all rooms
            // console.log(this.rooms);
            this.processWaitingQueue();
        } else {
            const availableRoom = this.findAvailableRoom();
            if (availableRoom) {
                const game = this.rooms.get(availableRoom)?.game;
                if (game) {
                    game.setJoinerId(data.userId);
                }
                this.userIdToRoomIdMap.set(data.userId, availableRoom);
                client.join(availableRoom);
                this.logger.log(`User ${data.userId} joined room ${availableRoom}`);
                // get other user id
                // find this by finding the creator of the room
                const otherPlayerId = this.rooms.get(availableRoom)?.creator;
                // log all users in room by getting it directly from this.rooms.get(availableRoom)
                this.logger.log(`Users in room ${availableRoom}:`);
                for (const [key, value] of this.userIdToRoomIdMap.entries()) {
                    if (value === availableRoom) {
                        console.log(key, value);
                    }
                }
                this.logger.log(`User ${data.userId} joined room with other player ${otherPlayerId}`);
                console.log('settings', this.rooms.get(availableRoom).settings);
                this.server.to(availableRoom).emit('startGame', otherPlayerId, data.userId, this.rooms.get(availableRoom).settings, this.rooms.get(availableRoom).game.getState());

                // Mark the user as in a game when the game starts
                this.userService.markUserInGame(parseInt(data.userId, 10));
                console.log(`Marking user ${data.userId} as in a game`)
                const creatorId = game?.getState().creatorId;
                if (creatorId) {
                    this.userService.markUserInGame(parseInt(creatorId, 10));
                    console.log(`Marking user ${creatorId} as in a game`)
                }

                this.startGameUpdateLoop(availableRoom);
            } else {
                this.logger.log(`No available rooms for user ${data.userId}, adding to waiting queue`);
                this.waitingQueue.push(data.userId);
            }
        }
    }

    @SubscribeMessage('paddleMove')
    handlePaddleMove(@ConnectedSocket() client: Socket, @MessageBody() body: { userId: string, paddleY: number }): void {
        const room = this.userIdToRoomIdMap.get(body.userId);
        if (room) {
            const game = this.rooms.get(room)?.game;
            if (game) {
                game.handleClientUpdate(body.userId, { paddleY: body.paddleY });
                this.server.to(room).emit('gameState', game.getState());
            }
        }
    }


    async startGameUpdateLoop(room: string) {
        const game = this.rooms.get(room)?.game;
        if (game) {
            setTimeout(() => {
                const intervalId = setInterval(() => {
                    const winner = game.update();
                    this.server.to(room).emit('gameState', game.getState());
                    if (winner) {
                        clearInterval(intervalId); // Stop the game loop
                        this.server.to(room).emit('gameOver', { winner });
                        this.saveGame(game, room);
                        for (const room of this.rooms.keys()) {
                            this.cleanUpRoom(room);
                        }
                        return;
                    }
                }, 1000 / 30); // Update at 30 FPS
            }, 4200); // 4.2 seconds delay before starting the game
        }
    }

    async saveGame(game: PongGame, room: string) {
        // Explicitly convert player1Id and player2Id to numbers
        const player1 = parseInt(game.getState().creatorId, 10);
        const player2 = parseInt(game.getState().joinerId, 10);
        this.logger.log(`saveGame has been called by server for room ${room}`);
        this.logger.log(`Player1Id: ${player1} Player2Id: ${player2}`);
        this.logger.log(`Player1Score: ${game.getState().score.creator} Player2Score: ${game.getState().score.joiner}`);

        // abort if players already marked as not in a game
        const player1InGame = await this.userService.isUserInGame(player1);
        const player2InGame = await this.userService.isUserInGame(player2);
        if (!player1InGame || !player2InGame) {
            this.logger.log("One or both players already marked as not in a game");
            // count number of rooms in server
            this.logger.log("Number of rooms in server: ", this.rooms.size);
            return;
        }
        // Mark the users as not in a game when the game ends
        console.log(`Marking user ${player1} as not in a game`)
        console.log(`Marking user ${player2} as not in a game`)

        await this.userService.markUserNotInGame(player1);
        await this.userService.markUserNotInGame(player2);

        console.log("Saving scores to the database");
        await this.matchService.createMatchScore(player1, player2, game.getState().score.creator, game.getState().score.joiner);
        console.log("Scores saved to the database");

        console.log("Updating wins and losses");
        await this.userService.updateWinsAndLosses(player1, game.getState().score.creator > game.getState().score.joiner);
        await this.userService.updateWinsAndLosses(player2, game.getState().score.creator < game.getState().score.joiner);
        console.log("Wins and losses updated");

        console.log("Updating achievements");
        await this.userService.updateAchievements(player1);
        await this.userService.updateAchievements(player2);
        console.log("Achievements updated");

        // Update points based on the game result
        console.log("Updating points");
        await this.matchService.updatePoints(player1, player2, game.getState().score.creator, game.getState().score.joiner);

        // leave the room for both players
        const socketId1 = this.userIdToSocketIdMap.get(game.getState().creatorId);
        const socketId2 = this.userIdToSocketIdMap.get(game.getState().joinerId);
        const client1 = await this.server.fetchSockets().then((sockets) => {
            return sockets.find((socket) => socket.id === socketId1);
        });
        const client2 = await this.server.fetchSockets().then((sockets) => {
            return sockets.find((socket) => socket.id === socketId2);
        });
        if (client1) {
            client1.leave(room);
        }
        if (client2) {
            client2.leave(room);
        }
        this.rooms.delete(room);
        this.userIdToRoomIdMap.delete(game.getState().creatorId);
        this.userIdToRoomIdMap.delete(game.getState().joinerId);
        this.userIdToReadyStatusMap.set(game.getState().creatorId, false);
        this.userIdToReadyStatusMap.set(game.getState().joinerId, false);
    }

    private getRoomForUser(userId: string): string | undefined {
        return this.userIdToRoomIdMap.get(userId);
    }

    private async processWaitingQueue(): Promise<void> {
        while (this.waitingQueue.length > 0 && this.rooms.size > 0) {
            const userId = this.waitingQueue.shift();
            const availableRoom = this.findAvailableRoom();
            if (availableRoom && userId) {
                const socketId = this.userIdToSocketIdMap.get(userId);
                const client = await this.server.fetchSockets().then((sockets) => {
                    return sockets.find((socket) => socket.id === socketId);
                });
                if (client) {
                    this.userIdToRoomIdMap.set(userId, availableRoom);
                    client.join(availableRoom);
                    const game = this.rooms.get(availableRoom)?.game;
                    if (game) {
                        game.setJoinerId(userId);
                    }
                    this.logger.log(`User ${userId} joined room ${availableRoom} from waiting queue`);
                    // get other user id
                    const otherPlayerId = this.rooms.get(availableRoom)?.creator;
                    // log all users in room by getting it directly from this.rooms.get(availableRoom)
                    this.logger.log(`Users in room ${availableRoom}:`);
                    for (const [key, value] of this.userIdToRoomIdMap.entries()) {
                        if (value === availableRoom) {
                            console.log(key, value);
                        }
                    }
                    console.log('settings', this.rooms.get(availableRoom).settings);
                    this.server.to(availableRoom).emit('startGame', otherPlayerId, userId, this.rooms.get(availableRoom).settings, this.rooms.get(availableRoom).game.getState());
                    this.startGameUpdateLoop(availableRoom);
                }
            }
        }
    }

    private findAvailableRoom(): string | undefined {
        return Array.from(this.rooms.keys())[0]; // Get the first available room
    }

    private cleanUpRoom(room: string): void {
        // Check if the room exists
        if (!this.rooms.has(room)) {
            return;
        }

        // Check if there are no users associated with this room
        const isRoomEmpty = Array.from(this.userIdToRoomIdMap.values()).every(roomId => roomId !== room);

        if (isRoomEmpty) {
            // If the room is empty, delete it from the rooms map
            this.rooms.delete(room);
            this.logger.log(`Cleaned up room: ${room}`);
        } else {
            this.logger.log(`Room ${room} not cleaned up as it's not empty.`);
        }
    }

    private cleanUpRooms(): void {
        for (const room of this.rooms.keys()) {
            this.cleanUpRoom(room);
        }
    }

}


