import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './channel.entity';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { UserModule } from '../user/user.module';
import { ChannelMembershipService } from '../channel-membership/channel-membership.service';
import { UserService } from '../user/user.service';
// import { ChannelGateway } from './channel.gateway';
import { ChannelMembership } from '../channel-membership/channel-membership.entity';
import { User } from '../user/user.entity';
import { ChannelMembershipModule } from '../channel-membership/channel-membership.module';
import { forwardRef } from '@nestjs/common';
// import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';  // <-- Important for authentication
import { Not } from 'typeorm';
import { NotificationModule } from '../notification/notification.module';
import { NotificationService } from '../notification/notification.service';
import { GroupMessageModule } from '../message/group-message/group-message.module';
import { GroupMessageService } from '../message/group-message/group-message.service';
import { AuthModule } from '../auth/auth.module';
import { MatchModule } from '../match/match.module';

// @Module({
//   imports: [TypeOrmModule.forFeature([Channel, ChannelMembership, User]), 
//   UserModule,
//   HttpModule,
//   NotificationModule,
// ],
//   controllers: [ChannelController],
//   providers: [ChannelService, ChannelMembershipService, UserService, ChannelGateway],
//   exports: [ChannelService, ChannelGateway],
// })
// export class ChannelModule {}


@Module({
  imports: [TypeOrmModule.forFeature([Channel, ChannelMembership, User]), 
  GroupMessageModule,
  UserModule,
  HttpModule,
  NotificationModule,
  AuthModule, //forwardRef?
  MatchModule,
],
  controllers: [ChannelController],
  providers: [ChannelService, ChannelMembershipService, UserService],
  exports: [ChannelService],
})
export class ChannelModule {}
