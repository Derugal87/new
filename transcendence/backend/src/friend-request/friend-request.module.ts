import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequest } from './friend-request.entity';
import { FriendRequestController } from './friend-request.controller';
import { FriendRequestService } from './friend-request.service';
import { FriendshipModule } from '../friendship/friendship.module';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { FriendRequestGateway } from './friend-request.gateway';
import { HttpModule } from '@nestjs/axios';
import { NotificationModule } from '../notification/notification.module';
import { NotificationService } from '../notification/notification.service';
import { AuthModule } from '../auth/auth.module';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [TypeOrmModule.forFeature([FriendRequest, User]), 
  FriendshipModule, 
  HttpModule,
  NotificationModule,
  AuthModule,
  MatchModule,
],
  controllers: [FriendRequestController],
  providers: [FriendRequestService, UserService, FriendRequestGateway],
  exports: [FriendRequestGateway, FriendRequestService],
})
export class FriendRequestModule {}
