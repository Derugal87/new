<!-- ## Real-Time Friend Requests using WebSocket Gateway in React

The `FriendRequestGateway` provides real-time communication for friend request-related actions between your React frontend and the backend server using websockets. This is particularly useful for creating and managing friend requests in real time. Here's a step-by-step guide on how to use the `FriendRequestGateway` for real-time friend requests in your React application:

### 1. Establishing a Connection

1. Import the required libraries at the top of your React component where you plan to set up the websocket connection:

   ```jsx
   import { io } from "socket.io-client";
   ```

2. Create a websocket instance and connect to the server. Replace `REACT_APP_WEBSOCKET_URL` with your WebSocket server's URL, and include user information as query parameters:

   ```jsx
   const socket = io(process.env.REACT_APP_WEBSOCKET_URL, {
     query: { userId: currentUser.id }, // Include any necessary user data
   });

   socket.on("connect", () => {
     console.log("Connected to WebSocket server");
   });
   ```

### 2. Sending and Receiving Friend Requests

1. Listen for new friend requests emitted by the WebSocket server:

   ```jsx
   socket.on("new-friend-request", (newRequest) => {
     console.log("New friend request:", newRequest);
     // Update your state or UI to display the new friend request
   });

   socket.on("friend-request-sent", (sentRequest) => {
     console.log("Friend request sent:", sentRequest);
     // Update your state or UI to reflect the sent friend request
   });
   ```

2. Send friend requests and respond to friend requests using emitted events:

   ```jsx
   // Send a friend request
   const sendFriendRequest = (senderId, receiverId) => {
     socket.emit("sendFriendRequest", { senderId, receiverId });
   };

   // Accept a friend request
   const acceptFriendRequest = (requestId) => {
     socket.emit("acceptFriendRequest", { requestId });
   };

   // Delete a friend request
   const deleteFriendRequest = (requestId) => {
     socket.emit("deleteFriendRequest", { requestId });
   };
   ```

### 3. Listening for Connection and Disconnection

1. Listen for connection and disconnection events to track user activity:

   ```jsx
   socket.on("connect", () => {
     console.log("Connected to WebSocket server");
   });

   socket.on("disconnect", () => {
     console.log("Disconnected from WebSocket server");
     // Handle any necessary cleanup or notifications
   });
   ```

### 4. Listening for Custom Events

1. Listen for custom events emitted by the WebSocket server:

   ```jsx
   socket.on("new-friend-request", (newRequest) => {
     console.log("New friend request:", newRequest);
     // Update your state or UI to display the new friend request
   });

   socket.on("friend-request-sent", (sentRequest) => {
     console.log("Friend request sent:", sentRequest);
     // Update your state or UI to reflect the sent friend request
   });
   ```

### 5. Disconnecting

1. Close the WebSocket connection when it's no longer needed, such as when the component unmounts:

   ```jsx
   socket.close();
   ```

Remember to replace placeholders like `REACT_APP_WEBSOCKET_URL`, `currentUser.id`, `senderId`, `receiverId`, and `requestId` with actual values based on your frontend logic. -->

To guide the frontend developer working with React on how to use the WebSocket Gateway in your NestJS application, you can provide the following steps and examples:

**Step 1: Connect to WebSocket**

1. Import the `socket.io-client` library in your React application.

```javascript
import { io } from "socket.io-client";
```

2. Create a WebSocket connection to your NestJS server:

```javascript
const socket = io("ws://localhost:4000/friend-request", {
  // Add any necessary configuration options here (e.g., authentication headers).
});
```

Replace `localhost:4000` with the actual URL of your NestJS WebSocket server.

**Step 2: Handle User Authentication**

```javascript
// Example authentication process (replace with your actual authentication logic).
const userId = 123; // Replace with the authenticated user's ID.
const socket = io("ws://localhost:4000/friend-request", {
  query: { userId }, // Pass the user ID as a query parameter.
});
```

**Step 3: Send WebSocket Messages**

Now that you have a WebSocket connection, you can send and receive messages:

- To send a friend request:

```javascript
// Example: Sending a friend request.
const senderId = 1; // The sender's ID.
const receiverId = 2; // The receiver's ID.
socket.emit("sendFriendRequest", { senderId, receiverId });
```

- To listen for friend requests or other events:

```javascript
// Example: Listening for friend requests.
socket.on("new-friend-request", (friendRequest) => {
  // Handle the incoming friend request.
  console.log("New friend request:", friendRequest);
});

// Example: Listening for other events.
socket.on("friendRequestAccepted", (requestId) => {
  // Handle the acceptance of a friend request.
  console.log("Friend request accepted:", requestId);
});
```

**Step 4: Disconnect**

Ensure that you disconnect the WebSocket connection when it's no longer needed, such as when the user logs out or navigates away from the relevant part of your React application.

```javascript
// Disconnect the WebSocket when needed.
socket.disconnect();
```

**Step 5: Error Handling**

Handle errors that might occur during WebSocket communication. You can listen for error events from the server:

```javascript
socket.on("error", (errorMessage) => {
  // Handle and display the error to the user.
  console.error("WebSocket error:", errorMessage);
});
```

**Additional Notes:**

- Make sure to replace the placeholder values in the code examples with actual user IDs, event names, and data specific to your application's logic.
- Ensure that your React application is properly configured to handle WebSocket connections and that you've installed the necessary dependencies, such as `socket.io-client`.
- Test your WebSocket functionality thoroughly to handle edge cases and error scenarios gracefully.
