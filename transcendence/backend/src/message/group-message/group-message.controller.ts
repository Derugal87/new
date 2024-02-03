import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GroupMessageService } from './group-message.service';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';
import { GroupMessage } from './group-message.entity';
import { JWTAuthGuard } from '../../auth/jwt.strategy';
import { UseGuards } from '@nestjs/common';

UseGuards(JWTAuthGuard)
@Controller('group-messages')
export class GroupMessageController {
  constructor(private readonly groupMessageService: GroupMessageService) {}

  @Get(':channelId/:userId')
  async getAllGroupMessages(
    @Param('channelId') channelId: number,
    @Param('userId') userId: number,
  ): Promise<GroupMessage[]> {
    return this.groupMessageService.getAllGroupMessages(channelId, userId);
  }

  @Post()
  async createGroupMessage(@Body() createGroupMessageDto: CreateGroupMessageDto): Promise<GroupMessage> {
    return this.groupMessageService.createGroupMessage(createGroupMessageDto);
  }
}

