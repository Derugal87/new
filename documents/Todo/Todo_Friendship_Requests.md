Implementing friendship requests using WebSockets involves setting up a WebSocket server and handling WebSocket events on the client-side. Below is a high-level overview of how you can achieve this:

1. Set up a WebSocket Server:

   - Choose a WebSocket library or framework that suits your backend technology (e.g., Socket.IO, WebSocket API in Node.js, etc.).
   - Implement a WebSocket server on your backend to listen for incoming connections and WebSocket events.

2. WebSocket Event Handling:

   - Define a WebSocket event for sending friendship requests from one user to another. For example, you can call it "friendship:request".
   - When a user sends a friendship request, trigger the WebSocket event with relevant data, such as the sender's user ID and the receiver's user ID.

3. WebSocket Client-Side Handling:

   - On the client-side (frontend), establish a WebSocket connection with the server.
   - Listen for the "friendship:request" event on the client-side WebSocket connection.
   - When a user receives a friendship request event, show a notification or prompt to accept or decline the request.
   - If the user accepts the request, send another WebSocket event back to the server with the response, indicating acceptance.
   - If the user declines the request, simply handle it on the client side without sending any response to the server.

4. Update Friendship Status on the Server:

   - On the server, listen for the WebSocket event indicating the receiver's response (acceptance or refusal).
   - Update the friendship table in the database accordingly based on the receiver's response.
   - If the receiver accepts the request, add an entry to the friendship table.
   - If the receiver declines the request, remove any pending friendship request data from the temporary storage (if you have one).

5. Real-Time Notification (Optional):
   - If you want to provide real-time notification to the sender when the receiver accepts or declines the request, set up another WebSocket event for this purpose. For example, you can call it "friendship:response".
   - When the server receives the receiver's response, trigger the "friendship:response" WebSocket event to notify the sender.
   - On the client-side, listen for the "friendship:response" event and show appropriate notifications to the sender.

By following these steps, you can achieve real-time communication for handling friendship requests in your Transcendence game project. This way, users will be notified instantly when they receive a request and when their request is accepted or declined, providing a more interactive and responsive user experience similar to real-life chat apps.
