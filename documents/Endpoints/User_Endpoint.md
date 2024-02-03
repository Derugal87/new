1. **Get All Users:**

   - Method: GET
   - URL: `http://localhost:4000/user`

2. **Create User:**

   - Method: POST
   - URL: `http://localhost:4000/user`
   - Body (JSON):
     ```json
     {
       "nickname": "john_doe",
       "avatar": "https://example.com/avatar.jpg"
     }
     ```

3. **Delete User:**

   - Method: DELETE
   - URL: `http://localhost:4000/user/{id}`
   - Replace `{id}` with the ID of the user you want to delete.

4. **Update User:**

   - Method: PUT
   - URL: `http://localhost:4000/user/{id}`
   - Replace `{id}` with the ID of the user you want to update.
   - Body (JSON):
     ```json
     {
       "nickname": "updated_nickname"
     }
     ```

5. **Get User Info:**

   - Method: GET
   - URL: `http://localhost:4000/user/{id}`
   - Replace `{id}` with the ID of the user you want to retrieve.

6. **Get User Profile:**

   - Method: GET
   - URL: `http://localhost:4000/user/{id}/profile`
   - Replace `{id}` with the ID of the user whose profile you want to retrieve.

7. **Get User 42 Profile:**

   - Method: GET
   - URL: `http://localhost:4000/user/{id_42}/profile42`
   - Replace `{id_42}` with the 42 ID of the user whose profile you want to retrieve.

8. **Get User by Nickname:**

   - Method: GET
   - URL: `http://localhost:4000/user/nickname/{nickname}`
   - Replace `{nickname}` with the nickname of the user you want to retrieve.

9. **Enable Two-Factor Authentication:**

   - Method: PUT
   - URL: `http://localhost:4000/user/{id}/enable-2fa`
   - Replace `{id}` with the ID of the user you want to enable 2FA for.

10. **Disable Two-Factor Authentication:**

    - Method: PUT
    - URL: `http://localhost:4000/user/{id}/disable-2fa`
    - Replace `{id}` with the ID of the user you want to disable 2FA for.

11. **Set Two-Factor Authentication Secret:**

    - Method: PUT
    - URL: `http://localhost:4000/user/{id}/set-2fa-secret`
    - Replace `{id}` with the ID of the user you want to set the 2FA secret for.
    - Body (JSON):
      ```json
      {
        "secret": "your_2fa_secret_here"
      }
      ```

12. **Get User Online Status:**

    - Method: GET
    - URL: `http://localhost:4000/user/{userId}/online-status`
    - Replace `{userId}` with the ID of the user whose online status you want to retrieve.
