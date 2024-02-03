Project Requirements:

Mandatory Part:

1. Backend: The website's backend must be written in NestJS.
2. Frontend: The frontend must be written with a TypeScript framework of the developer's choice.
3. Libraries and Frameworks: You are free to use any library, but ensure they are the latest stable versions.
4. Database: Use PostgreSQL as the database, no other database is allowed.
5. Single-Page Application: The website must be a single-page application allowing users to use the Back and Forward buttons of the browser.
6. Browser Compatibility: The website must be compatible with the latest stable version of Google Chrome and one additional web browser of the developer's choice.
7. Error Handling: Users should encounter no unhandled errors or warnings while browsing the website.
8. Docker: The application must be launched by a single call to `docker-compose up --build`. If running on Linux, use Docker in rootless mode, with the runtime files located in `/goinfre` or `/sgoinfre`. Avoid using "bind-mount volumes" between host and container if non-root UIDs are used in the container.

Security Concerns: 9. Password Storage: Any password stored in the database must be hashed. 10. Protection against SQL Injections: The website must be protected against SQL injections. 11. Server-Side Validation: Implement server-side validation for forms and user input. 12. Credential Storage: Credentials, API keys, environment variables, etc., must be saved locally in a `.env` file and ignored by git. Publicly stored credentials will lead to project failure.

User Account: 13. OAuth Login: Users must log in using the OAuth system of 42 intranet. 14. Unique Name: Users should be able to choose a unique name that will be displayed on the website. 15. Avatar Upload: Users can upload an avatar, and if they don't, a default one must be set. 16. Two-Factor Authentication: Users can enable two-factor authentication using methods like Google Authenticator or text messages. 17. Friends System: Users can add other users as friends and see their current status (online, offline, in a game, etc.). 18. User Stats: Display stats such as wins and losses, ladder level, achievements, etc., on the user's profile. 19. Match History: Each user should have a Match History, including 1v1 games, ladder, and other relevant information.

Chat: 20. Channels: Users can create public, private, or password-protected chat rooms (channels). 21. Direct Messages: Users can send direct messages to other users. 22. Blocking Users: Users can block other users, preventing them from seeing their messages. 23. Channel Ownership: The user who creates a new channel is automatically set as the channel owner until they leave it. 24. Channel Administrators: Channel owners can set passwords for the channel, change them, and remove them. They can also set other users as administrators. 25. Moderator Actions: Channel administrators can kick, ban, or mute other users (for a limited time), except for the channel owners. 26. Game Invites: Users can invite other users to play a Pong game through the chat interface. 27. Player Profiles: Users can access other players' profiles through the chat interface.

Game: 28. Pong Gameplay: Users can play a live Pong game versus another player directly on the website. 29. Matchmaking: Implement a matchmaking system where users can join a queue until they get automatically matched with someone else. 30. Customization Options: Offer customization options such as power-ups or different maps in the game. However, users should be able to select a default version of the game without any extra features. 31. Responsiveness: Ensure the game is responsive to handle network issues like unexpected disconnection or lag, providing the best user experience possible.
