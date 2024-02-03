import { Controller, Post, Body, Param, Put, Delete, Get, ParseIntPipe } from '@nestjs/common';
import { ChannelMembershipService } from './channel-membership.service';
import { ChannelMembership } from './channel-membership.entity';
import { CreateChannelMembershipDto } from './dto/create-channel-membership.dto';
import { UpdateChannelMembershipDto } from './dto/update-channel-membership.dto';
import { User } from '../user/user.entity';
import { Channel } from '../channel/channel.entity';
import { JWTAuthGuard } from '../auth/jwt.strategy';
import { UseGuards } from '@nestjs/common';

UseGuards(JWTAuthGuard)
@Controller('channel-memberships')
export class ChannelMembershipController {
  constructor(private readonly channelMembershipService: ChannelMembershipService) {}

  @Post()
  async createChannelMembership(
    @Body() createChannelMembershipDto: CreateChannelMembershipDto,
  ): Promise<ChannelMembership> {
    return this.channelMembershipService.createMembership(createChannelMembershipDto);
  }

  @Put(':currentUserId/:targetUserId/:channelId')
  async updateChannelMembership(
    @Param('currentUserId', ParseIntPipe) currentUserId: number,
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
    @Param('channelId', ParseIntPipe) channelId: number,
    @Body() updateChannelMembershipDto: UpdateChannelMembershipDto,
  ): Promise<ChannelMembership> {
    return this.channelMembershipService.updateMembership(currentUserId, targetUserId, channelId, updateChannelMembershipDto);
  }

  @Delete(':channelId/:currentUserId/:targetUserId')
  async deleteChannelMembership(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Param('currentUserId', ParseIntPipe) currentUserId: number,
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
  ): Promise<void> {
    return this.channelMembershipService.deleteMembership(currentUserId, targetUserId, channelId);
  }

  @Post(':channelId/ban')
  async banUser(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Body('currentUserId', ParseIntPipe) currentUserId: number,
    @Body('targetUserId', ParseIntPipe) targetUserId: number,
  ): Promise<void> {
    await this.channelMembershipService.banMember(currentUserId, targetUserId, channelId);
  }
  
  @Post(':channelId/mute')
  async muteUser(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Body('currentUserId', ParseIntPipe) currentUserId: number,
    @Body('targetUserId', ParseIntPipe) targetUserId: number,
  ): Promise<void> {
    await this.channelMembershipService.muteMember(currentUserId, targetUserId, channelId);
  }

  @Get(':id')
  async getUserChannelMemberships(@Param('id', ParseIntPipe) userId: number) {
    const membershipsWithUnreadCount = await this.channelMembershipService.getUserChannelMemberships(userId);

    return membershipsWithUnreadCount.map((item) => ({
      membership: item.membership,
      unreadMessagesCount: item.unreadMessagesCount,
    }));
  }

  @Get(':userId/user-channels')
  async getUserAndPublicChannels(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ channel: Channel, members: Array<{ user: User, membership: ChannelMembership }> }[]> {
    return this.channelMembershipService.getUserAndPublicChannels(userId);
  }
  
  @Get(':userId/:channelId')
  async getMembershipByUserAndChannel(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('channelId', ParseIntPipe) channelId: number,
  ): Promise<ChannelMembership | undefined> {
    return this.channelMembershipService.getMembershipByUserAndChannel(userId, channelId);
  }
  
  //getChannelMembers
  @Get(':channelId/members/count')
  async getChannelMembersWithMembership(
    @Param('channelId', ParseIntPipe) channelId: number,
  ): Promise<{ channel: Channel, members: Array<{ user: User, membership: ChannelMembership }> }> {
    return this.channelMembershipService.getChannelMembersWithMembership(channelId);
  }

}
