import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelMembership } from './channel-membership.entity';
import { ChannelMembershipService } from './channel-membership.service';
import { ChannelMembershipController } from './channel-membership.controller';
import { UserService } from '../user/user.service';
import { ChannelService } from '../channel/channel.service';
import { User } from '../user/user.entity';
import { Channel } from '../channel/channel.entity';
import { HttpModule } from '@nestjs/axios';
import { ChannelModule  } from '../channel/channel.module';
import { forwardRef } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ChannelMembershipGateway } from './channel-membership.gateway';
import { NotificationModule } from '../notification/notification.module';
import { NotificationService } from '../notification/notification.service';
import { AuthModule } from '../auth/auth.module';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelMembership, User, Channel]),
    HttpModule,
    UserModule,
    forwardRef(() =>ChannelModule),
    NotificationModule,
    AuthModule,
    MatchModule,
  ],
  providers: [ChannelMembershipService, UserService, ChannelService, ChannelMembershipGateway],
  controllers: [ChannelMembershipController],
  exports: [ChannelMembershipService],
})
export class ChannelMembershipModule {}
