1. **Create Direct Message:**

   - Method: POST
   - URL: `http://localhost:4000/direct-messages`
   - Body (JSON):
     ```json
     {
       "sender_id": 1,
       "receiver_id": 2,
       "content": "Hello there!"
     }
     ```
   - Replace `"sender_id"` with the ID of the user sending the message.
   - Replace `"receiver_id"` with the ID of the user receiving the message.
   - Replace `"content"` with the content of the message.

2. **Get Message History:**

   - Method: GET
   - URL: `http://localhost:4000/direct-messages/{userId}/message-history/{otherUserId}`
   - Replace `{userId}` with the ID of the user whose messages you want to retrieve.
   - Replace `{otherUserId}` with the ID of the other user whose messages are in the conversation.

3. **Get Direct Message History Users:**

   - Method: GET
   - URL: `http://localhost:4000/direct-message-history/{userId}/users`
   - Replace `{userId}` with the ID of the user whose direct message history users you want to retrieve.
   - This will return an array of users who have sent or received direct messages from the user.
