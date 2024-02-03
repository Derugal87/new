1. **Create Channel:**

   - Method: POST
   - URL: `http://localhost:4000/channels`
   - Body (JSON):
     ```json
     {
       "name": "General Chat",
       "is_public": true,
       "password": "your_password_here",
       "owner_id": 1
     }
     ```
   - Description: Create a new channel with the specified details. Ensure you provide a unique `name` for the channel and specify if it's a `public` or `private` channel using the `is_public` field. You can also set an optional `password` for private channels.

2. **Update Channel:**

   - Method: PUT
   - URL: `http://localhost:4000/channels/{channelId}/user/{userId}`
   - Replace `{channelId}` with the ID of the channel you want to update, and replace `{userId}` with the ID of the user making the update.
   - Body (JSON):
     ```json
     {
       "name": "New Channel Name",
       "is_public": false,
       "password": "new_password"
     }
     ```
   - Description: Update the properties of an existing channel, such as its `name`, `is_public` status, or `password`. You must provide the `channelId` and `userId` in the URL for authentication and specify the new properties in the body.

3. **Delete Channel:**

   - Method: DELETE
   - URL: `http://localhost:4000/channels/{id}/{userId}`
   - Replace `{id}` with the ID of the channel you want to delete, and replace `{userId}` with the ID of the user authorized to delete the channel.
   - Description: Delete an existing channel. You must provide both the `channelId` and `userId` in the URL for authentication and authorization.

4. **Find All Channels:**

   - Method: GET
   - URL: `http://localhost:4000/channels`
   - Description: Retrieve a list of all channels available.

5. **Get All Public Channels:**

   - Method: GET
   - URL: `http://localhost:4000/channels/public`
   - Description: Retrieve a list of all public channels.

6. **Get Users and Public Channels:**

   - Method: GET
   - URL: `http://localhost:4000/channels/with-users`
   - Description: Retrieve an object containing an array of users and an array of public channels. This endpoint provides a combination of user data and public channel information.

7. **Join Channel:**

   - Method: POST
   - URL: `http://localhost:4000/channels/{channelId}/join/{userId}`
   - Replace `{channelId}` with the ID of the channel you want to join, and replace `{userId}` with the user's ID.
   - Body (JSON):
     ```json
     {
       "token": "your_channel_token",
       "password": "your_channel_password"
     }
     ```
   - Description: Allows a user to join a channel by providing a valid `token` (if required) and the `password` (if it's a private channel). Ensure you include the correct `channelId` and `userId` in the URL.

8. **Leave Channel:**

   - Method: POST
   - URL: `http://localhost:4000/channels/{channelId}/leave/{userId}`
   - Replace `{channelId}` with the ID of the channel you want to leave, and replace `{userId}` with the user's ID.
   - Description: Allows a user to leave a channel. Make sure you specify the correct `channelId` and `userId` in the URL.

9. **Get Channel Token:**

   - Method: GET
   - URL: `http://localhost:4000/channels/{id}/token`
   - Replace `{id}` with the ID of the channel you want to get the token for.
   - Description: Retrieve the token associated with the specified channel.

10. **Get Channel by ID:**

    - Method: GET
    - URL: `http://localhost:4000/channels/{id}`
    - Replace `{id}` with the ID of the channel you want to retrieve.
    - Description: Retrieve detailed information about a specific channel by providing its ID.
