import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectMessage } from './direct-message.entity';
import { CreateDirectMessageDto } from './dto/create-direct-message.dto';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.entity';
import { FriendshipService } from '../../friendship/friendship.service';
import { NotificationService } from '../../notification/notification.service';
import { CreateNotificationDto } from '../../notification/dto/create-notification.dto';

@Injectable()
export class DirectMessageService {
    constructor(
        @InjectRepository(DirectMessage)
        private readonly directMessageRepository: Repository<DirectMessage>,
        private readonly userService: UserService,
        private readonly friendshipService: FriendshipService,
        private readonly notificationService: NotificationService,
    ) {}

    async createDirectMessage(dto: CreateDirectMessageDto): Promise<DirectMessage> {
      let sender, receiver;

      try {
          [sender, receiver] = await Promise.all([
              this.userService.findUserById(dto.sender_id),
              this.userService.findUserById(dto.receiver_id),
          ]);
      } catch (error) {
          // Handle the error, perhaps logging it or throwing a different exception
          throw new NotFoundException('Sender or Receiver not found');
      }
    
      if (!sender || !receiver) {
        throw new NotFoundException('Sender or Receiver not found');
      }
    
      if (
        sender.blockedUsers.includes(receiver.id) ||
        receiver.blockedUsers.includes(sender.id)
      ) {
        throw new Error('Sender or receiver has blocked each other');
      }
    
      const message = new DirectMessage();
      message.content = dto.content;
      message.link = dto.link;
      message.sender = sender;
      message.receiver = receiver;
      message.link = dto.link;
    
      // Save the direct message
      const savedMessage = await this.directMessageRepository.save(message);
    
      // Create a notification for the direct message
      const notificationDto: CreateNotificationDto = {
        senderId: sender.id,
        receiverId: receiver.id,
        type: 'direct-message',
      };
      // Save the notification
      await this.notificationService.createNotification(notificationDto);
    
      return savedMessage;
    }
    

    async getUserMessages(senderId: number, receiverId: number): Promise<DirectMessage[]> {
      const messages = await this.directMessageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.sender', 'sender') // Join the 'sender' relation
        .where('(message.sender_id = :senderId AND message.receiver_id = :receiverId) OR (message.sender_id = :receiverId AND message.receiver_id = :senderId)')
        .setParameters({ senderId, receiverId })
        .orderBy('message.created_at', 'ASC')
        .getMany();
    
      if (!messages || messages.length === 0) {
        throw new NotFoundException('No messages found between these users');
      }
    
      return messages;
    }

    async setUserOnlineStatus(userId: number, online: boolean): Promise<void> {
      try {
        const user = await this.userService.findUserById(userId);
        user.status = online ? 'online' : 'offline';
        await this.userService.saveUser(user);
      }
      catch (error) {
        console.log(error);
      }
    }

    async getAllFriendsAndDirectMessageRecipients(userId: number): Promise<{
      friends: { user: User; blocked: boolean; unreadMessagesCount: number }[];
      directMessageRecipients: { user: User; blocked: boolean; unreadMessagesCount: number }[];
    }> {
      // 1. Fetch the user IDs of the user's friends
      const friendIds = (await this.friendshipService.findUserFriends(userId)).map((friend) => friend.id);
    
      // 2. Fetch the user IDs of direct message recipients
      const directMessageRecipientIds = await this.getDirectMessageRecipientIds(userId);
    
      // 3. Combine the user IDs from both sets and remove duplicates
      const allUserIds = Array.from(new Set([...friendIds, ...directMessageRecipientIds]));
    
      // 4. Fetch user details for the combined user IDs using findUsersByIds
      const allUsers = await this.userService.findUsersByIds(allUserIds);
    
      // 5. Fetch blocked status for each user
      const blockedUserMap = await this.userService.getUserBlockedMap(userId, allUserIds);
    
      // 6. Separate friends and direct message recipients, including blocked status
      const friends: { user: User; blocked: boolean; unreadMessagesCount: number }[] = [];
      const directMessageRecipients: { user: User; blocked: boolean; unreadMessagesCount: number }[] = [];
    
      // Create a set to keep track of user IDs already added
      const addedUserIds = new Set<number>();
    
      for (const user of allUsers) {
        const unreadMessagesCount = await this.notificationService.getUnreadDirectMessagesCount(user.id);
    
        if (friendIds.includes(user.id) && !addedUserIds.has(user.id)) {
          friends.push({
            user,
            blocked: blockedUserMap[user.id] || false,
            unreadMessagesCount, // Add unreadMessagesCount
          });
          addedUserIds.add(user.id);
        }
    
        if (directMessageRecipientIds.includes(user.id) && !addedUserIds.has(user.id)) {
          directMessageRecipients.push({
            user,
            blocked: blockedUserMap[user.id] || false,
            unreadMessagesCount, // Add unreadMessagesCount
          });
          addedUserIds.add(user.id);
        }
      }

      return {
        friends,
        directMessageRecipients,
      };
    }
    

    async getDirectMessageRecipientIds(userId: number): Promise<number[]> {
      // Get all direct messages where the user is either the sender or receiver
      const messages = await this.directMessageRepository
        .createQueryBuilder('message')
        .select(['message.sender_id', 'message.receiver_id'])
        .where('message.sender_id = :userId OR message.receiver_id = :userId', {
          userId,
        })
        .distinct(true)
        .getRawMany();

      // Extract user IDs from the messages
      const userIds = messages.map((message) =>
        message.sender_id.toString() === userId.toString()
          ? message.receiver_id
          : message.sender_id
      );

      return userIds;
    }

}

