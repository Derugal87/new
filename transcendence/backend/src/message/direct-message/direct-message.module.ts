import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessage } from './direct-message.entity';
import { DirectMessageController } from './direct-message.controller';
import { DirectMessageService } from './direct-message.service';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.entity';
import { DirectMessageGateway } from './direct-message.gateway';
import { HttpModule } from '@nestjs/axios';
import { BlockingModule } from '../../blocking/blocking.module';
import { FriendshipModule } from '../../friendship/friendship.module';
import { NotificationModule } from '../../notification/notification.module';
import { AuthModule } from '../../auth/auth.module';
import { MatchModule } from '../../match/match.module';

@Module({
  imports: [TypeOrmModule.forFeature([DirectMessage, User]), 
  HttpModule,
  BlockingModule,
  FriendshipModule,
  NotificationModule,
  AuthModule,
  MatchModule,
],
  controllers: [DirectMessageController],
  providers: [DirectMessageService, UserService, DirectMessageGateway],
  exports: [DirectMessageService, DirectMessageGateway],
})
export class DirectMessageModule {}
