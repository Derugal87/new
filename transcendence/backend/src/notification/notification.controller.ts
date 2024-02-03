import { Controller, Get, Post, Param, Body, Delete, Put } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ParseIntPipe } from '@nestjs/common';
import { JWTAuthGuard } from '../auth/jwt.strategy';
import { UseGuards } from '@nestjs/common';

@UseGuards(JWTAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Get('unread/:userId')
  findUnreadByUser(@Param('userId') userId: number) {
    return this.notificationService.getUnreadNotifications(userId);
  }

  @Put(':senderId/:receiverId/:type/mark-as-read')
  async markNotificationAsRead(
    @Param('senderId') senderId: number,
    @Param('receiverId') receiverId: number,
    @Param('type') type: string,
  ): Promise<void> {
    await this.notificationService.markNotificationAsRead(
      senderId,
      receiverId,
      type,
    );
  }


  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.notificationService.deleteNotification(id);
  }

  @Get('unread-count/:userId')
  async getUnreadDirectMessagesCount(@Param('userId') userId: number): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadDirectMessagesCount(userId);
    return { count };
  }

  @Put('mark-as-read/:channelId/:userId/:type')
  async markGroupNotificationAsRead(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('type') type: string,
  ): Promise<void> {
    await this.notificationService.markGroupNotificationAsRead(
      channelId,
      userId,
      type,
    );
  }

  // Handle getting the unread count of group messages using user id and channel id
  @Get('unread-group-messages-count/:userId/:channelId')
  async getUnreadGroupMessagesCount(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('channelId', ParseIntPipe) channelId: number,
    ): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadGroupMessagesCount(
      channelId,
      userId,
    );
    return { count };
  }

  

}

