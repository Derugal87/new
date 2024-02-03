### Step 1: Install Socket.io Client

Make sure you have the Socket.io client library installed in your React application:

```bash
npm install socket.io-client
```

### Step 2: Create a Direct Message Component

Create a new component for the direct message feature. You can name it `DirectMessage.js`.

```javascript
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const DirectMessage = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [receiverId, setReceiverId] = useState(2); // Replace with the receiver's ID

  useEffect(() => {
    // Connect to the WebSocket server
    const newSocket = io("http://localhost:4000/direct-messages", {
      query: { userId: 1 }, // Replace with the user's ID
    });

    setSocket(newSocket);

    return () => {
      // Disconnect the socket when the component unmounts
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming direct messages
    socket.on("directmessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      // Remove the message listener when the component unmounts
      socket.off("directmessage");
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (!socket || !messageInput || !receiverId) return;

    // Create a message object
    const message = {
      content: messageInput,
      sender_id: 1, // Replace with the user's ID
      receiver_id: receiverId,
    };

    // Emit the message to the server
    socket.emit("directmessage", message);

    // Update the local message list
    setMessages((prevMessages) => [...prevMessages, message]);

    // Clear the message input
    setMessageInput("");
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg.content}</div>
        ))}
      </div>
      <input
        type="text"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default DirectMessage;
```

### Step 3: Implement User Authentication

In this example, we assumed that the user's ID is passed as a query parameter when connecting to the WebSocket server. You should implement a proper user authentication mechanism and obtain the user's ID securely.

### Step 4: Use the Component

Now you can use the `DirectMessage` component in your application where you want to display and send direct messages:

```javascript
import React from "react";
import DirectMessage from "./DirectMessage";

const App = () => {
  return (
    <div>
      {/* Other components */}
      <DirectMessage />
      {/* Other components */}
    </div>
  );
};

export default App;
```

2. In your client-side code (e.g., your React application), you can listen for this event and send the necessary data to retrieve direct messages:

```javascript
// Assuming you're using socket.io-client in your React app
import { useEffect, useState } from "react";
import socket from "socket.io-client";

const DirectMessagesComponent = ({ userId, otherUserId }) => {
  const [directMessages, setDirectMessages] = useState([]);

  useEffect(() => {
    const client = socket("http://localhost:4000/direct-messages"); // Replace with your backend URL
    client.on("connect", () => {
      client.emit("getDirectMessages", { userId, otherUserId });

      client.on("directMessages", (messages) => {
        // Handle retrieved messages here
        setDirectMessages(messages);
      });

      // Add event listeners for other socket events if needed

      return () => {
        // Clean up event listeners and disconnect socket when component unmounts
        client.off("directMessages");
        client.disconnect();
      };
    });
  }, [userId, otherUserId]);

  // Render direct messages in your component
  return (
    <div>
      {directMessages.map((message) => (
        <div key={message.id}>{message.content}</div>
      ))}
    </div>
  );
};

export default DirectMessagesComponent;
```

As for adding a guideline for the `@SubscribeMessage('getAllFriendsAndDirectMessageRecipients')` event, here's an additional step you can include:

### Step 5: Retrieve Friends and Direct Message Recipients

In your React component where you want to retrieve friends and direct message recipients, follow these steps:

1. Import the necessary dependencies at the top of your component file:

```javascript
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
```

2. Create a new function within your component to establish a WebSocket connection and retrieve data:

```javascript
const getFriendsAndRecipients = (userId) => {
  // Connect to the WebSocket server
  const socket = io("http://localhost:4000/direct-messages");

  // Emit the event to request friends and direct message recipients
  socket.emit("getAllFriendsAndDirectMessageRecipients", userId);

  // Listen for the response event
  socket.on("friendsAndRecipients", (data) => {
    // Handle the data containing friends and direct message recipients here
    console.log("Friends:", data.friends);
    console.log("Direct Message Recipients:", data.directMessageRecipients);

    // Close the socket connection when done
    socket.close();
  });
};
```

3. Call the `getFriendsAndRecipients` function with the user's ID when you want to retrieve the data. Make sure you replace `userId` with the actual user's ID.

```javascript
const userId = 1; // Replace with the actual user's ID
getFriendsAndRecipients(userId);
```
