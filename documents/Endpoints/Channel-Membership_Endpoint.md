1. **Create Channel Membership:**

   - Method: POST
   - URL: `http://localhost:4000/channel-memberships`
   - Body (JSON):
     ```json
     {
       "user_id": 1,
       "channel_id": 2,
       "role": "member"
     }
     ```
   - Description: Create a new channel membership with the specified user and channel IDs. Set the `role` to "member" or another valid role as required.

2. **Update Channel Membership:**

   - Method: PUT
   - URL: `http://localhost:4000/channel-memberships/{currentUserId}/{targetUserId}/{channelId}`
   - Replace `{currentUserId}`, `{targetUserId}`, and `{channelId}` with the respective user IDs and channel ID in the URL.
   - Body (JSON):
     ```json
     {
       "role": "administrator"
     }
     ```
   - Description: Update the role of a channel membership. Provide the new `role` in the body to update the membership.

3. **Delete Channel Membership:**

   - Method: DELETE
   - URL: `http://localhost:4000/channel-memberships/{channelId}/{currentUserId}/{targetUserId}`
   - Replace `{channelId}`, `{currentUserId}`, and `{targetUserId}` with the respective channel ID, current user ID, and target user ID in the URL.
   - Description: Delete a channel membership. Ensure you provide the correct IDs for authorization.

4. **Ban User from Channel:**

   - Method: POST
   - URL: `http://localhost:4000/channel-memberships/{channelId}/ban`
   - Replace `{channelId}` with the ID of the channel from which you want to ban a user.
   - Body (JSON):
     ```json
     {
       "currentUserId": 1,
       "targetUserId": 2
     }
     ```
   - Description: Ban a user from a channel by providing the `currentUserId` (the user performing the ban) and `targetUserId` (the user being banned).

5. **Mute User in Channel:**

   - Method: POST
   - URL: `http://localhost:4000/channel-memberships/{channelId}/mute`
   - Replace `{channelId}` with the ID of the channel in which you want to mute a user.
   - Body (JSON):
     ```json
     {
       "currentUserId": 1,
       "targetUserId": 2
     }
     ```
   - Description: Mute a user within a channel. Specify the `currentUserId` (the user performing the mute) and `targetUserId` (the user being muted).

6. **Get User's Channel Memberships:**

   - Method: GET
   - URL: `http://localhost:4000/channel-memberships/{id}`
   - Replace `{id}` with the user's ID for whom you want to retrieve channel memberships.
   - Description: Retrieve a list of channel memberships associated with a specific user.

7. **Get User's Channels with Members:**

   - Method: GET
   - URL: `http://localhost:4000/channel-memberships/{userId}/user-channels`
   - Replace `{userId}` with the user's ID for whom you want to retrieve channels and their members.
   - Description: Retrieve a list of channels the user is a member of, along with information about the channel members.

8. **Get Membership by User and Channel:**

   - Method: GET
   - URL: `http://localhost:4000/channel-memberships/{userId}/{channelId}`
   - Replace `{userId}` with the user's ID and `{channelId}` with the channel ID for which you want to retrieve the membership.
   - Description: Retrieve the channel membership details for a specific user in a specific channel.

9. **Get Channel Members with Membership:**

   - Method: GET
   - URL: `http://localhost:4000/channel-memberships/{channelId}/members/count`
   - Replace `{channelId}` with the ID of the channel for which you want to retrieve the members and their membership details.
   - Description: Retrieve a list of channel members along with their membership information within a specific channel.

These guidelines should help developers understand how to use each endpoint effectively in your NestJS application for managing channel memberships and related actions.
