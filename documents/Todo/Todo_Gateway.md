The issue you're facing with players being placed into rooms incorrectly after a refresh can be resolved by ensuring that the server keeps track of game state and reassigns players to their respective rooms upon reconnection. Here's an approach to fix this issue:

1. **Use a Data Store**: Implement a data store (e.g., a database) to persistently store game state, including room assignments and player statuses.

2. **Player Identification**: When a player initially connects, they should provide a unique identifier (e.g., user ID) that can be used to associate them with their previous game. You can also use sessions or tokens for this purpose.

3. **Handle Reconnections**: When a player reconnects (e.g., after a refresh), check their unique identifier and retrieve their previous game state, including the room they were in and game settings.

4. **Reassign Players**: If the player is rejoining an existing game, assign them to the correct room with their opponent.

5. **Clean Up**: Implement logic to handle cases where a player disconnects permanently or leaves the game. Remove them from the room and update the game state accordingly.

Here's an updated version of your `GameGateway` that includes basic logic for handling reconnections:

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

@WebSocketGateway({ namespace: "/pong" })
export class GameGateway {
  @WebSocketServer()
  private server: Server;

  private logger: Logger = new Logger("GameGateway");
  private roomCounter = 0;
  private playerRoomMap = new Map<string, string>();
  private playerGameMap = new Map<string, GameData>(); // Store game data per player

  @SubscribeMessage("ready")
  handlePlayerReady(@ConnectedSocket() client: Socket): void {
    const playerId = client.id;

    // Check if the player is reconnecting
    if (this.playerGameMap.has(playerId)) {
      const gameData = this.playerGameMap.get(playerId);
      const room = gameData.room;

      // Join the player to their previous room
      client.join(room);

      // Inform the client about the game state (e.g., send opponent data)
      this.server.to(room).emit("resumeGame", gameData);

      this.logger.log(`Player reconnected ${playerId} ${room}`);
    } else {
      // New player logic (similar to your existing code)
      this.roomCounter++;
      let room: string;

      if (this.roomCounter % 2 === 1) {
        room = uuidv4();
      } else {
        room = this.getRoomOfPreviousPlayer();
      }

      this.playerRoomMap.set(playerId, room);
      client.join(room);

      // Create and store initial game data for the player
      const gameData: GameData = {
        room,
        // Other game-related data here...
      };
      this.playerGameMap.set(playerId, gameData);

      this.logger.log(`New player ready ${playerId} ${room}`);

      if (this.roomCounter % 2 === 0) {
        this.server.to(room).emit("startGame", playerId);
      }
    }
  }

  // Rest of your methods...

  private getRoomOfPreviousPlayer(): string {
    const previousPlayerId = Array.from(this.playerRoomMap.keys())[
      this.playerRoomMap.size - 1
    ];
    return this.playerRoomMap.get(previousPlayerId) || "";
  }

  // Handle disconnects and cleanup as needed...
}

interface GameData {
  room: string;
  // Add other game-related properties here...
}
```

In this code:

- We introduce a `playerGameMap` to store game data for each player, including the room they are in.
- When a player connects (or reconnects), we check if they are in `playerGameMap` and act accordingly.
- If the player is reconnecting, we send them data to resume the game.
- If it's a new player, we create and store game data for them.
- You should add your specific game-related data to the `GameData` interface as needed.

This approach should help you maintain game state and correctly reassign players to their rooms upon reconnection.
