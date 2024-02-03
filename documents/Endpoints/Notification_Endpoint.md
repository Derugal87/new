Certainly, here are the guidelines for using the endpoints provided by your `NotificationController` at `http://localhost:4000`:

1. **Create a Notification**

   - **HTTP Method:** POST
   - **Endpoint:** `/notifications`
   - **Request Body:** Provide a JSON object containing the following properties:
     - `senderId` (integer): The ID of the sender.
     - `receiverId` (integer): The ID of the receiver.
     - `type` (string): The type of notification (e.g., 'friend-request', 'direct-message', etc.).

   Example Request:

   ```json
   POST http://localhost:4000/notifications
   Content-Type: application/json

   {
     "senderId": 1,
     "receiverId": 2,
     "type": "direct-message"
   }
   ```

   This endpoint creates a new notification based on the provided data.

2. **Find Unread Notifications for a User**

   - **HTTP Method:** GET
   - **Endpoint:** `/notifications/unread/:userId`
   - **Path Parameter:** `userId` (integer): The ID of the user for whom you want to retrieve unread notifications.

   Example Request:

   ```
   GET http://localhost:4000/notifications/unread/2
   ```

   This endpoint retrieves all unread notifications for the specified user.

3. **Mark a Notification as Read**

   - **HTTP Method:** PUT
   - **Endpoint:** `http://localhost:4000/notifications/:senderId/:receiverId/:type/mark-as-read`
   - **Path Parameters:**
     - `senderId` (integer): The ID of the sender.
     - `receiverId` (integer): The ID of the receiver.
     - `type` (string): The type of notification (e.g., 'friend-request', 'direct-message', etc.).

   Example Request:

   ```
   PUT http://localhost:4000/notifications/1/2/direct-message/mark-as-read
   ```

   This endpoint marks a specific notification from the sender to the receiver as read and deletes it.

4. **Remove/Delete a Notification**

   - **HTTP Method:** DELETE
   - **Endpoint:** `/notifications/:id`
   - **Path Parameter:** `id` (integer): The ID of the notification you want to delete.

   Example Request:

   ```
   DELETE http://localhost:4000/notifications/3
   ```

   This endpoint deletes the notification with the specified ID.

5. **Get the Count of Unread Direct Messages for a User**

   - **HTTP Method:** GET
   - **Endpoint:** `/notifications/unread-count/:userId`
   - **Path Parameter:** `userId` (integer): The ID of the user for whom you want to get the count of unread direct messages.

   Example Request:

   ```
   GET http://localhost:4000/notifications/unread-count/2
   ```

   This endpoint returns the count of unread direct messages for the specified user.
