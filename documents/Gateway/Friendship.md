## Using WebSocket Gateway for Friendships

The WebSocket Gateway facilitates real-time communication for friendship-related actions. It enables frontend clients to create and delete friendships. Below is a guide on how to utilize the `FriendshipGateway` in your React application:

### Establishing a WebSocket Connection

1. Import the required libraries in your React component where you want to establish the websocket connection:

   ```jsx
   import { io } from "socket.io-client";
   ```

2. Create a websocket instance and connect to the server:

   ```jsx
   const socket = io(process.env.REACT_APP_WEBSOCKET_URL + "/friendship", {
     query: { userId: currentUser.id }, // Include any necessary user data
   });

   socket.on("connect", () => {
     console.log("Connected to Friendship WebSocket server");
   });
   ```

### Listening for WebSocket Events

1. Listen for events emitted by the WebSocket server:

   ```jsx
   socket.on("newFriendship", (newFriendship) => {
     console.log("New friendship created:", newFriendship);
     // Update your state or UI with the new friendship data
   });

   socket.on("deletedFriendship", (friendshipId) => {
     console.log("Friendship deleted:", friendshipId);
     // Update your state or UI to reflect the deleted friendship
   });
   ```

### Sending WebSocket Events

1. Send websocket events to the server when users interact with your app:

   ```jsx
   // Create a new friendship
   const createFriendship = (userId, friendId) => {
     socket.emit("createFriendship", { userId, friendId });
   };

   // Delete a friendship
   const deleteFriendship = (friendshipId) => {
     socket.emit("deleteFriendship", { friendshipId });
   };
   ```

### Disconnecting

1. Close the WebSocket connection when it's no longer needed, such as when the component unmounts:

   ```jsx
   socket.close();
   ```

Remember to replace placeholders like `userId`, `friendId`, and `friendshipId` with actual values based on your frontend logic.
