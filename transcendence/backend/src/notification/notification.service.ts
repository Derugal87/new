import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from "./notification.entity";
import { CreateNotificationDto } from './dto/create-notification.dto';
// import { ChannelMembership } from 'src/channel-membership/channel-membership.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

    async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
        const notification = new Notification();
        notification.senderId = createNotificationDto.senderId;
        notification.receiverId = createNotificationDto.receiverId;
        notification.type = createNotificationDto.type;
        notification.channelId = createNotificationDto.channelId;
        return this.notificationRepository.save(notification);
      }
    

    async getUnreadNotifications(userId: number): Promise<Notification[]> {
        return this.notificationRepository.find({
          where: {
            receiverId: userId,
            isRead: false,
          },
            order: { createdAt: 'DESC' },
        });
      }

    // find all notifications for a user and mark them as read then delete them
    async markNotificationAsRead(senderId: number, receiverId: number, type: string): Promise<void> {
        const notifications = await this.notificationRepository.find({
          where: {
            senderId: senderId,
            receiverId: receiverId,
            type: type,
          },
        });

        for (const notification of notifications) {
          notification.isRead = true;
          await this.notificationRepository.save(notification);
          await this.deleteNotification(notification.id);
        }
    }

    // find all notifications for a user in a channel and mark them as read then delete them
    // take the channel id, type, and user id (receiver id)

    async markGroupNotificationAsRead(channelId: number, userId: number, type: string): Promise<void> {
        const notifications = await this.notificationRepository.find({
          where: {
            receiverId: userId,
            channelId: channelId,
            type: type,
          },
        });
        console.log(notifications);
        for (const notification of notifications) {
          notification.isRead = true;
          await this.notificationRepository.save(notification);
          await this.deleteNotification(notification.id);
        }
    }


    async deleteNotification(notificationId: number): Promise<void> {
        const notification = await this.notificationRepository.findOne({ where: { id: notificationId }  });
        if (notification) {
          await this.notificationRepository.remove(notification);
        }
    }

    async getNotificationId(senderId: number, receiverId: number, type: string): Promise<number | null> {
        const notification = await this.notificationRepository.findOne({
          where: {
            senderId: senderId,
            receiverId: receiverId,
            type: type,
          },
        });
    
        return notification ? notification.id : null;
    }

    // get count of unread direct-messages for a user
    async getUnreadDirectMessagesCount(userId: number): Promise<number> {
        const notifications = await this.notificationRepository.find({
          where: {
            senderId: userId,
            isRead: false,
            type: 'direct-message',
          },
        });
        return notifications.length;
    }

    // get count of unread group-messages for a user using user id and channel id
    async getUnreadGroupMessagesCount(channelId: number, userId: number): Promise<number> {

      const count = await this.notificationRepository.count({
          where: {
              receiverId: userId,
              channelId,
              isRead: false,
              type: 'group-message',
          },
      });
      return count;
    }  

    // get all unread direct-messages notification id for a user
    async getUnreadDirectMessages(userId: number): Promise<number[]> {
        const notifications = await this.notificationRepository.find({
          where: {
            receiverId: userId,
            isRead: false,
            type: 'direct-message',
          },
        });
        return notifications.map((notification) => notification.id);
    }

    // get all unread group-messages notification id for a user in a channel

    async getUnreadGroupMessagesIds(channelId: number, userId: number): Promise<number[]> {
      const notifications = await this.notificationRepository.find({
        where: {
          receiverId: userId,
          channelId,
          isRead: false,
          type: 'group-message',
        },
      });
      return notifications.map((notification) => notification.id);
    }

  //   async getUnreadGroupMessages(userId: number): Promise<number[]> {
  //     const notifications = await this.notificationRepository.find({
  //       where: {
  //         receiverId: userId,
  //         isRead: false,
  //         type: 'group-message',
  //       },
  //     });
  //     return notifications.map((notification) => notification.id);
  // }

}

