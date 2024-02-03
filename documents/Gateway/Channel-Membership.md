### 1. Import and Initialize Socket.io:

First, you need to import and initialize the `socket.io-client` library in your React component.

```javascript
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000/channel-memberships"); // Replace with your server URL
```

In this example, we're connecting to the WebSocket server at `http://localhost:4000/channel-memberships`. Adjust the URL to match your server's configuration.

### 2. Establish WebSocket Connection:

Set up the WebSocket connection in a React component. In this example, we'll create a chat application with the ability to send and receive messages.

```javascript
function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Event listener for receiving new messages
    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up event listener on unmount
    return () => {
      socket.off("newMessage");
    };
  }, []);

  const handleSendMessage = () => {
    // Emit an event to send a new message to the server
    socket.emit("sendMessage", { text: newMessage });
    setNewMessage("");
  };

  return (
    <div>
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message.text}</div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}
```

In this example:

- We're listening for a `newMessage` event and updating the state with new messages when they arrive.
- When the user sends a message, we emit an event `sendMessage` with the message data to the server.
- We clean up the event listener when the component unmounts.

### 3. Handle Different Events:

You can set up different event listeners and emitters for various actions in your application. Here's how you might handle user banning and muting as you mentioned in your previous code:

```javascript
// Event listener for banning a user
socket.on("banUserSuccess", ({ channelId, currentUserId, targetUserId }) => {
  console.log(
    `User ${currentUserId} banned user ${targetUserId} in channel ${channelId}.`
  );
  // Update your component state or UI to reflect the ban
});

socket.on("banUserError", ({ error }) => {
  console.error("Error banning user:", error);
  // Handle the error in your component
});

// Event listener for muting a user
socket.on("muteUserSuccess", ({ channelId, currentUserId, targetUserId }) => {
  console.log(
    `User ${currentUserId} muted user ${targetUserId} in channel ${channelId}.`
  );
  // Update your component state or UI to reflect the mute
});

socket.on("muteUserError", ({ error }) => {
  console.error("Error muting user:", error);
  // Handle the error in your component
});
```

These event listeners listen for success and error events when banning or muting a user. Similar event listeners can be set up for other actions as well.

### 4. Emit Events:

You can emit events to the server when users take actions. For example, when a user wants to ban another user:

```javascript
const handleBanUser = (channelId, currentUserId, targetUserId) => {
  socket.emit("banUser", { channelId, currentUserId, targetUserId });
};
```

This function emits a `banUser` event with the necessary data to the server.

### 5. Disconnect on Unmount:

To prevent memory leaks, remove event listeners when the component unmounts by returning a cleanup function, as shown in the chat example.

### 6. Customize for Your Application:

Customize the event names, data structures, and component state management according to your application's requirements. Socket.io enables real-time communication and can be used for a wide range of features in your application.

Remember to ensure that your backend WebSocket server (NestJS WebSocket Gateway) is running and listening on the specified URL.
