import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { DirectMessageService } from './direct-message.service';
import { CreateDirectMessageDto } from './dto/create-direct-message.dto';
import { DirectMessage } from './direct-message.entity';
import { User } from '../../user/user.entity';
import { ParseIntPipe } from '@nestjs/common';
import { JWTAuthGuard } from '../../auth/jwt.strategy';
import { UseGuards } from '@nestjs/common';

@UseGuards(JWTAuthGuard)
@Controller('direct-messages')
export class DirectMessageController {
  constructor(private readonly directMessageService: DirectMessageService) {}

  @Post()
  async sendDirectMessage(@Body() createDirectMessageDto: CreateDirectMessageDto): Promise<DirectMessage> {
    return this.directMessageService.createDirectMessage(createDirectMessageDto);
  }

  @Get('user/:senderId/messages/:receiverId')
    async getUserMessages(
        @Param('senderId', ParseIntPipe) senderId: number,
        @Param('receiverId', ParseIntPipe) receiverId: number,
    ): Promise<DirectMessage[]> {
        try {
            return await this.directMessageService.getUserMessages(senderId, receiverId);
        } catch (error) {
            throw error;
        }
  }

  // @Get(':userId/friends-and-recipients')
  // async getAllFriendsAndDirectMessageRecipients(@Param('userId', ParseIntPipe) userId: number): Promise<{ friends: User[], directMessageRecipients: { user: User, blocked: boolean }[] }> {
  //   return this.directMessageService.getAllFriendsAndDirectMessageRecipients(userId);
  // }

  @Get(':id/friends-and-recipients')
  async getAllFriendsAndDirectMessageRecipients(@Param('id') userId: number) {
    try {
      const result = await this.directMessageService.getAllFriendsAndDirectMessageRecipients(userId);
      return { data: result };
    } catch (error) {
      throw error;
    }
  }
  
}
