import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { imageFileFilter, multerConfig } from './common/upload.middleware';


import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/user.entity';
import { Friendship } from './friendship/friendship.entity';
import { FriendRequest } from './friend-request/friend-request.entity';
import { Channel } from './channel/channel.entity';
import { ChannelMembership } from './channel-membership/channel-membership.entity';
import { Game } from './game/game.entity';
import { GamePlayer } from './game-player/game-player.entity';
import { Match } from './match/match.entity';

import { UserModule } from './user/user.module';
import { FriendshipModule } from './friendship/friendship.module';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { ChannelModule } from './channel/channel.module';
import { ChannelMembershipModule } from './channel-membership/channel-membership.module';
import { GameModule } from './game/game.module';
import { GamePlayerModule } from './game-player/game-player.module';
import { MatchModule } from './match/match.module';
import { DirectMessageModule } from './message/direct-message/direct-message.module';
import { GroupMessageModule } from './message/group-message/group-message.module';
import { GroupMessage } from './message/group-message/group-message.entity';
import { DirectMessage } from './message/direct-message/direct-message.entity';
import { AuthModule } from './auth/auth.module';
import { BlockingController } from './blocking/blocking.controller';
import { BlockingModule } from './blocking/blocking.module';
import { BlockingService } from './blocking/blocking.service';
import { NotificationModule } from './notification/notification.module';
import { Notification } from './notification/notification.entity';
import { NotificationService } from './notification/notification.service';
import { NotificationController } from './notification/notification.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.POSTGRES_TYPE as any,
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      entities: [User, Friendship, Channel, ChannelMembership, FriendRequest, Game, GamePlayer, Match, GroupMessage, DirectMessage, Notification],
      synchronize: true,  // Recommendation: disable in production
    }),
    UserModule,
    FriendshipModule,
    ChannelModule,
    ChannelMembershipModule,
    FriendRequestModule,
    NotificationModule,
    GameModule,
    GamePlayerModule,
    MatchModule,
    DirectMessageModule,
    GroupMessageModule,
    BlockingModule,
	  AuthModule,
    MulterModule.register({
      ...multerConfig,
      fileFilter: imageFileFilter,
    }),
  ],
  controllers: [AppController, BlockingController, NotificationController],
  providers: [AppService, BlockingService],
})
export class AppModule {}
