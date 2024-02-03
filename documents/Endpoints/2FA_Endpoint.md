To test your 2FA (Two-Factor Authentication) endpoints using Postman, you can follow these comprehensive guidelines.

**Testing the `enable-2fa` Endpoint:**

1. Open Postman.

2. Create a new request for testing the `enable-2fa` endpoint:

   - Set the request method to `POST`.
   - Set the request URL to the appropriate URL of your Nest.js application, e.g., `http://localhost:4000/auth/enable-2fa`.

3. In the request body, select the `raw` option and set the body to JSON format with the necessary parameters for enabling 2FA:

   ```json
   {
     "id": 1,
     "nickname": "user1"
   }
   ```

4. Send the request.

5. You should receive a response indicating that 2FA was enabled successfully.

**Testing the `disable-2fa` Endpoint:**

1. Create a new request for testing the `disable-2fa` endpoint:

   - Set the request method to `POST`.
   - Set the request URL to the appropriate URL of your Nest.js application, e.g., `http://localhost:4000/auth/disable-2fa`.

2. In the request body, select the `raw` option and set the body to JSON format with the necessary parameters for disabling 2FA:

   ```json
   {
     "id": 1,
     "nickname": "user1"
   }
   ```

3. Send the request.

4. You should receive a response indicating that 2FA was disabled successfully.

**Testing the `verify-2fa` Endpoint:**

1. Create a new request for testing the `verify-2fa` endpoint:

   - Set the request method to `POST`.
   - Set the request URL to the appropriate URL of your Nest.js application, e.g., `http://localhost:4000/auth/verify-2fa`.

2. In the request body, select the `raw` option and set the body to JSON format with the necessary parameters for verifying 2FA. Include the OTP code you want to verify:

   ```json
   {
     "id": 1,
     "nickname": "user1",
     "two_factor_auth_enabled": true,
     "two_factor_auth_secret": "YOUR_SECRET_KEY",
     "two_factor_auth_url": "YOUR_OTP_URL"
   }
   ```

3. Send the request.

4. You should receive a response indicating whether the OTP code is valid or not. If the code is valid, the response will state that the OTP code is valid; otherwise, it will indicate that the code is invalid.

These steps should allow you to test your 2FA endpoints in Postman effectively. Make sure to replace `"YOUR_SECRET_KEY"` and `"YOUR_OTP_URL"` with actual values from your application.
