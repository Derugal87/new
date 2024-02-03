# ft_transcendence

A web application with a user-friendly interface that allows users to play the classic game of Pong with others in real-time. The website also provides a chat feature and supports multiplayer online gameplay.

## Project Architecture

![image](https://github.com/user8674/ft_transcendence/assets/62568969/6297474e-060e-4aa9-bfe4-8c42e2cf3cf4)

## Features

- **Pong Game**: Play live Pong games against other players directly on the website. The game faithfully recreates the original 1972 Pong experience and offers customization options for enhanced gameplay.
- **User Account**: Create a unique account, log in using the OAuth system of 42 intranet, and customize your profile with a unique display name and avatar. Enjoy additional features such as two-factor authentication, friend requests, user stats, and match history.
- **Chat Feature**: Communicate with other players through the built-in chat feature. Create public or private chat rooms, send direct messages, block users, and invite others to play Pong games. Access player profiles and manage game invitations seamlessly within the chat interface.
- **Security**: The website prioritizes security by hashing passwords, protecting against SQL injections, implementing server-side validation for forms and user input, and securely storing credentials, API keys, and environment variables.

## Tech Stack

- Backend: NestJS
- Frontend: React (TypeScript)
- Database: PostgreSQL
- Other technologies: Docker, OAuth (42 intranet)

## Trello Board

https://trello.com/b/Q66aKdOD/fttranscendence

# Transcendence Project Database Tables and Fields

## User Table

- **id (Primary Key)**: The unique identifier for each user.
- **username (Unique)**: The unique username for each user.
- **password (Hashed)**: The hashed password of the user for security.
- **avatar**: The URL of the user's avatar or profile picture.
- **two_factor_auth_enabled**: A boolean indicating whether two-factor authentication is enabled for the user.
- **two_factor_auth_secret**: The secret key used for two-factor authentication.

## Friendship Table

- **id (Primary Key)**: The unique identifier for each friendship.
- **user_id (Foreign Key referencing User.id)**: The foreign key referencing the user's id who initiated the friendship.
- **friend_id (Foreign Key referencing User.id)**: The foreign key referencing the user's id who is the friend.
- **status**: The status of the friendship, indicating if the friend is Online, Offline, or In A Game.

## Match Table

- **id (Primary Key)**: The unique identifier for each match.
- **user_id (Foreign Key referencing User.id)**: The foreign key referencing the user's id who participated in the match.
- **opponent_id (Foreign Key referencing User.id)**: The foreign key referencing the opponent's user id in the match.
- **result**: The result of the match, indicating if it was a Win or Loss.
- **ladder_level**: The ladder level achieved in the match.
- **created_at**: The timestamp of when the match was created.

## Channel Table

- **id (Primary Key)**: The unique identifier for each channel.
- **name**: The name of the channel.
- **owner_id (Foreign Key referencing User.id)**: The foreign key referencing the user's id who owns the channel.
- **is_public**: A boolean indicating whether the channel is public or not.
- **password (Hashed)**: The hashed password used to protect the channel.

## ChannelMembership Table

- **id (Primary Key)**: The unique identifier for each channel membership.
- **user_id (Foreign Key referencing User.id)**: The foreign key referencing the user's id who is a member of the channel.
- **channel_id (Foreign Key referencing Channel.id)**: The foreign key referencing the channel's id.
- **role**: The role of the user in the channel, such as Owner, Admin, or Member.
- **is_banned**: A boolean indicating if the user is banned from the channel.
- **is_muted**: A boolean indicating if the user is muted in the channel.

## Message Table

- **id (Primary Key)**: The unique identifier for each message.
- **content**: The content of the message.
- **created_at**: The timestamp of when the message was created.
- **user_id (Foreign Key referencing User.id)**: The foreign key referencing the user's id who sent the message.
- **channel_id (Foreign Key referencing Channel.id)**: The foreign key referencing the channel's id where the message was sent.

## Game Table

- **id (Primary Key)**: The unique identifier for each game.
- **version**: The version of the game.
- **power_ups_enabled**: A boolean indicating if power-ups are enabled in the game.
- **map**: The map used in the game.
- **created_at**: The timestamp of when the game was created.

## GamePlayer Table

- **id (Primary Key)**: The unique identifier for each game player.
- **game_id (Foreign Key referencing Game.id)**: The foreign key referencing the game's id in which the player participated.
- **player_id (Foreign Key referencing User.id)**: The foreign key referencing the player's user id.
- **score**: The score achieved by the player in the game.

## Backend Testing

To test only the backend using Docker, run the backend docker-compose file with the following command:

```
docker-compose -f docker-compose_backend.yml up --build
```

To connect to the database from the Terminal when testing only the backend, use the following command:

```
docker exec -it backend-db-1 psql -U admin -d mydatabase
```

## Full Testing (Frontend and Backend)

To test both front end and backend using Docker, run the docker-compose file with the following command:

```
docker-compose build && docker-compose up -d
```

To connect to the database from the Terminal when testing both frontend and backend, use the following command:

```
docker exec -it transcendence-db-1 psql -U admin -d mydatabase
```

To see all the tables from the PostgreSQL terminal CLI, use the command: `\dt`.

When testing only the backend, check it at `localhost:4000`.
Check the frontend at `localhost:3000`.

## Current Folder Structure

Transcendence/
├── .env
├── docker-compose.yml
├── package.json
├── node_modules/
│ └── (root node_modules)
├── Backend/
│ ├── .env
│ ├── dockerfile
│ ├── package.json
│ ├── node_modules/
│ │ └── (backend node_modules)
│ ├── src/
│ │ ├── app.controller.ts
│ │ ├── app.module.ts
│ │ ├── app.service.ts
│ │ ├── main.ts
│ │ ├── common/
│ │ │ ├── decorators/
│ │ │ ├── filters/
│ │ │ └── upload.middleware.ts
│ │ ├── user/
│ │ │ ├── user.entity.ts
│ │ │ ├── user.service.ts
│ │ │ ├── user.controller.ts
│ │ │ ├── user.module.ts
│ │ │ ├── dto/
│ │ │ │ ├── create-user.dto.ts
│ │ │ │ └── update-user.dto.ts
│ │ ├── friendship/
│ │ │ ├── friendship.entity.ts
│ │ │ ├── friendship.service.ts
│ │ │ ├── friendship.controller.ts
│ │ │ ├── friendship.module.ts
│ │ │ ├── dto/
│ │ │ │ └── create-friendship.dto.ts
│ │ ├── friend-request/
│ │ │ ├── friend-request.entity.ts
│ │ │ ├── friend-request.service.ts
│ │ │ ├── friend-request.controller.ts
│ │ │ ├── friend-request.module.ts
│ │ │ ├── dto/
│ │ │ │ └── create-friend-request.dto.ts
│ │ ├── channel/
│ │ │ ├── channel.entity.ts
│ │ │ ├── channel.service.ts
│ │ │ ├── channel.controller.ts
│ │ │ ├── channel.module.ts
│ │ │ ├── dto/
│ │ │ │ └── create-channel.dto.ts
│ │ ├── channel-membership/
│ │ │ ├── channel-membership.entity.ts
│ │ │ ├── channel-membership.service.ts
│ │ │ ├── channel-membership.controller.ts
│ │ │ ├── channel-membership.module.ts
│ │ │ ├── dto/
│ │ │ │ └── create-channel-membership.dto.ts
│ │ ├── game/
│ │ │ ├── game.entity.ts
│ │ │ ├── game.service.ts
│ │ │ ├── game.controller.ts
│ │ │ ├── game.module.ts
│ │ │ ├── dto/
│ │ │ │ └── create-game.dto.ts
│ │ ├── game-player/
│ │ │ ├── game-player.entity.ts
│ │ │ ├── game-player.service.ts
│ │ │ ├── game-player.controller.ts
│ │ │ ├── game-player.module.ts
│ │ │ ├── dto/
│ │ │ │ └── create-game-player.dto.ts
│ │ ├── match/
│ │ │ ├── match.entity.ts
│ │ │ ├── match.service.ts
│ │ │ ├── match.controller.ts
│ │ │ ├── match.module.ts
│ │ │ ├── dto/
│ │ │ │ └── create-match.dto.ts
│ │ ├── message/
│ │ │ ├── group-message/ <-- Subfolder for group/channel messages
│ │ │ │ ├── message.entity.ts
│ │ │ │ ├── create-message.dto.ts
│ │ │ │ ├── message.service.ts
│ │ │ │ ├── message.controller.ts
│ │ │ │ ├── message.module.ts
│ │ │ │ ├── ... other related files
│ │ │ ├── direct/ <-- Subfolder for direct messages
│ │ │ │ ├── direct-message.entity.ts
│ │ │ │ ├── create-direct-message.dto.ts
│ │ │ │ ├── direct-message.service.ts
│ │ │ │ ├── direct-message.controller.ts
│ │ │ │ ├── direct-message.module.ts
│ │ │ ├── dto/
│ │ │ │ └── ... other DTOs
│ └── test/
│ ├── e2e/
│ └── unit/
└── frontend/
├── .env
├── dockerfile
├── package.json
├── node_modules/
│ └── (frontend node_modules)
├── src/
│ ├── components/
│ ├── images/
│ ├── pages/
│ ├── styles/
│ ├── App.css
│ ├── App.tsx
│ ├── index.css
│ ├── index.tsx
│ ├── react-app-env.d.ts
│ ├── reportWebVitals.ts
│ └── setupTests.ts

# Tables and Relationships

┌───────────────────────┐
│ User │
├───────────────────────┤
│ id (Primary Key) │
│ username (Unique) │
│ password (Hashed) │
│ avatar │
│ two_factor_auth_enabled │
│ two_factor_auth_secret │
└───────────────────────┘
▲
│
│
┌───────────────────────┐
│ Friendship │
├───────────────────────┤
│ id (Primary Key) │
│ user_id (FK User.id) │
│ friend_id (FK User.id)│
│ status │
└───────────────────────┘
▲
│
│
┌───────────────────────┐
│ FriendRequest │
├───────────────────────┤
│ id (Primary Key) │
│ user_id (FK User.id) │
│ friend_id (FK User.id)│
│ status │
└───────────────────────┘
▲
│
│
┌───────────────────────┐
│ Channel │
├───────────────────────┤
│ id (Primary Key) │
│ name │
│ owner_id (FK User.id) │
│ is_public │
│ password (Hashed) │
└───────────────────────┘
▲
│
│
┌───────────────────────┐
│ ChannelMembership │
├───────────────────────┤
│ id (Primary Key) │
│ user_id (FK User.id) │
│ channel_id (FK Channel.id) │
│ role │
│ is_banned │
│ is_muted │
└───────────────────────┘
▲
│
│
┌───────────────────────┐
│ Message │
├───────────────────────┤
│ id (Primary Key) │
│ content │
│ created_at │
│ user_id (FK User.id) │
│ channel_id (FK Channel.id) │
└───────────────────────┘
▲
│
│
┌───────────────────────┐
│ Game │
├───────────────────────┤
│ id (Primary Key) │
│ version │
│ power_ups_enabled │
│ map │
│ created_at │
└───────────────────────┘
▲
│
│
┌───────────────────────┐
│ GamePlayer │
├───────────────────────┤
│ id (Primary Key) │
│ game_id (FK Game.id) │
│ player_id (FK User.id)│
│ score │
└───────────────────────┘
▲
│
│
┌───────────────────────┐
│ Match │
├───────────────────────┤
│ id (Primary Key) │
│ user_id (FK User.id) │
│ opponent_id (FK User.id) │
│ result │
│ ladder_level │
│ created_at │
└───────────────────────┘

## Table Order

         +---------------------+
         |    Create Entity    |
         +---------------------+
                  ▼
         +---------------------+
         |   Create DTO (if    |
         |   necessary)         |
         +---------------------+
                  ▼
         +---------------------+
         |    Create Module    |
         +---------------------+
                  ▼
         +---------------------+
         |   Create Service    |
         +---------------------+
                  ▼
         +---------------------+
         |   Create Controller |
         +---------------------+
                  ▼
         +---------------------+
         |    (Optional)       |
         |   Create Gateway    |
         +---------------------+

## User Channel Permissions

| Field         | Channel Owner | Administrator | Member (non-owner, non-admin) |
| ------------- | ------------- | ------------- | ----------------------------- |
| is_banned     | Yes           | Yes           | No                            |
| is_muted      | Yes           | Yes           | No                            |
| role          | Yes           | No            | No                            |
| password      | Yes           | No            | No                            |
| channel name  | Yes           | Yes           | No                            |
| channel topic | Yes           | Yes           | No                            |
| channel type  | Yes           | No            | No                            |
| delete        | Yes           | No            | No                            |

- private means it is not public and has no password but requires a token to join
- protected means it has password and is_public
- public means it has no password and is public
