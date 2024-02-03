1. **Get All Group Messages:**

   - Method: GET
   - URL: `http://localhost:4000/group-messages/{channelId}/{userId}`
   - Replace `{channelId}` with the ID of the channel you want to retrieve messages from.
   - Replace `{userId}` with the ID of the user whose messages you want to retrieve.

2. **Create Group Message:**

   - Method: POST
   - URL: `http://localhost:4000/group-messages`
   - Body (JSON):
     ```json
     {
       "userId": 1,
       "channelId": 1,
       "content": "Hello, everyone!"
     }
     ```
   - Replace `"userId"` with the ID of the user sending the message.
   - Replace `"channelId"` with the ID of the channel where the message is being sent.
   - Replace `"content"` with the content of the message.
