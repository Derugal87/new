1. **Create Friendship:**

   - Method: POST
   - URL: `http://localhost:4000/friendships/{userId}/{friendId}`
   - Replace `{userId}` with the ID of the user who is initiating the friendship.
   - Replace `{friendId}` with the ID of the user whom the first user wants to be friends with.

2. **Delete Friendship:**

   - Method: DELETE
   - URL: `http://localhost:4000/friendships/{id}`
   - Replace `{id}` with the ID of the friendship relationship you want to delete.

3. **Get Friend IDs:**

   - Method: GET
   - URL: `http://localhost:4000/friendships/friends/{userId}`
   - Replace `{userId}` with the ID of the user whose friends you want to retrieve.
