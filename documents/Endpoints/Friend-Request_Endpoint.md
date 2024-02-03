1. **Accept Friend Request:**

   - Method: POST
   - URL: `http://localhost:4000/friend-requests/{requestId}/accept`
   - Replace `{requestId}` with the ID of the friend request you want to accept.

2. **Create Friend Request:**

   - Method: POST
   - URL: `http://localhost:4000/friend-requests`
   - Body (JSON):
     ```json
     {
       "senderId": 1,
       "receiverId": 2
     }
     ```
   - Replace `"senderId"` and `"receiverId"` with the IDs of the sender and receiver of the friend request.

3. **Decline Friend Request:**

   - Method: POST
   - URL: `http://localhost:4000/friend-requests/{requestId}/decline`
   - Replace `{requestId}` with the ID of the friend request you want to decline.

4. **Get Friend Request ID:**

   - Method: GET
   - URL: `http://localhost:4000/friend-requests/{senderId}/{receiverId}`
   - Description: Get the ID of a friend request between two users.
   - Replace `{senderId}` and `{receiverId}` with the IDs of the sender and receiver of the friend request.
