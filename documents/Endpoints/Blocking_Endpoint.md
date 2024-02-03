1. **Block User:**

   - Method: POST
   - URL: http://localhost:4000/blocking/block/{userId}
   - Replace `{userId}` with the ID of the user who is performing the blocking action.
   - Body (JSON):
     ```json
     {
       "blockedUserId": 1
     }
     ```
   - Replace `"blockedUserId"` with the ID of the user you want to block.

2. **Unblock User:**

   - Method: POST
   - URL: http://localhost:4000/blocking/unblock/{userId}
   - Replace `{userId}` with the ID of the user who is performing the unblocking action.
   - Body (JSON):
     ```json
     {
       "unblockedUserId": 2
     }
     ```
   - Replace `"unblockedUserId"` with the ID of the user you want to unblock.

Remember to replace placeholders like `{userId}`, `"blockedUserId"`, and `"unblockedUserId"` with actual values based on your use case.
