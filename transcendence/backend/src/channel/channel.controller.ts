import { Controller, Post, Patch, Body, Param, Delete, Get, Req, Put } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { Channel } from './channel.entity';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ParseIntPipe } from '@nestjs/common';
import { JWTAuthGuard } from '../auth/jwt.strategy';
import { UseGuards } from '@nestjs/common';

@UseGuards(JWTAuthGuard)
@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService,
              private readonly userService: UserService
    ) {}

  @Post()
  async createChannel(@Body() createChannelDto: CreateChannelDto): Promise<Channel> {
      const { owner_id } = createChannelDto;
      const channel = await this.channelService.createChannel(createChannelDto, owner_id);
      return channel;
  }

  @Put(':channelId/user/:userId')
  async updateChannel(
    @Param('channelId') channelId: number,
    @Param('userId') userId: number,
    @Body() updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    const updatedChannel = await this.channelService.updateChannel(channelId, updateChannelDto, userId);
    return updatedChannel;
  }

  @Delete(':id/:userId')
  async deleteChannel(
    @Param('id', ParseIntPipe) channelId: number,
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<void> {
    await this.channelService.deleteChannel(channelId, userId);
  }

  @Get()
  async findAllChannels(): Promise<Channel[]> {
    return this.channelService.findAllChannels();
  }

  @Get('public')
  async getAllPublicChannels(): Promise<Channel[]> {
    return this.channelService.getAllPublicChannels();
  }

  @Get('with-users')
  async getUsersAndPublicChannels(): Promise<{ users: User[], publicChannels: Channel[] }> {
    return this.channelService.getUsersAndPublicChannels();
  }

  @Post(':channelId/join/:userId')
  async joinChannel(
    @Param('channelId') channelId: number,
    @Param('userId') userId: number,
    @Body() { token, password }: { token?: string, password?: string },
  ): Promise<void> {
    await this.channelService.joinChannel(channelId, userId, token, password);
  }
  
  @Post(':channelId/leave/:userId')
  async leaveChannel(
    @Param('channelId') channelId: number, 
    @Param('userId') userId: number
    ): Promise<void> {
    await this.channelService.leaveChannel(channelId, userId);
  }  

  @Get(':id/token')
  async getChannelToken(@Param('id') channelId: number): Promise<string> {
    return this.channelService.getChannelToken(channelId);
  }

  @Get(':id')
  async getChannelById(@Param('id') channelId: number): Promise<Channel> {
    return this.channelService.findChannelById(channelId);
  }

}