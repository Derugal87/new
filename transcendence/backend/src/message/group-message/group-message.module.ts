import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMessage } from './group-message.entity';
import { GroupMessageController } from './group-message.controller';
import { GroupMessageService } from './group-message.service';
import { UserService } from '../../user/user.service';
import { ChannelService } from '../../channel/channel.service';
import { User } from '../../user/user.entity';
import { Channel } from '../../channel/channel.entity';
import { GroupMessageGateway } from './group-message.gateway';
import { HttpModule } from '@nestjs/axios';
import { ChannelMembershipModule } from '../../channel-membership/channel-membership.module';
import { ChannelMembership } from '../../channel-membership/channel-membership.entity';
import { ChannelMembershipService } from '../../channel-membership/channel-membership.service';
import { NotificationModule } from '../../notification/notification.module';
import { MatchModule } from '../../match/match.module';

// @Module({
//   imports: [TypeOrmModule.forFeature([GroupMessage, User, Channel, ChannelMembership]), 
//   HttpModule,
//   ChannelMembershipModule,
//   NotificationModule
// ],
//   controllers: [GroupMessageController],
//   providers: [
//     GroupMessageService, 
//     UserService,
//     ChannelService,
//     ChannelMembershipService,
//     GroupMessageGateway,
//   ],
// })
// export class GroupMessageModule {}

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupMessage, User, Channel, ChannelMembership]), 
    HttpModule,
    ChannelMembershipModule,
    NotificationModule,
    MatchModule,
  ],
  controllers: [GroupMessageController],
  providers: [
    GroupMessageService, 
    UserService,
    ChannelService,
    ChannelMembershipService,
    GroupMessageGateway,
    // ChannelGateway (No longer needed as it's merged into GroupMessageGateway)
  ],
})
export class GroupMessageModule {}
