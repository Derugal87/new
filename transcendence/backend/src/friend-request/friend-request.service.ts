import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequest } from './friend-request.entity';
import { User } from '../user/user.entity';
import { FriendshipService } from '../friendship/friendship.service';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';
import { FriendRequestResponseDto } from './dto/friend-request-response.dto';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>,
    private readonly friendshipService: FriendshipService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

    async createFriendRequest(senderId: number, receiverId: number): Promise<FriendRequest> {
      try {
      const sender: User = await this.userService.findUserById(senderId);
      const receiver: User = await this.userService.findUserById(receiverId); 
      
      if (!sender || !receiver) {
          throw new NotFoundException('Sender or Receiver not found');
      }

      if (sender.id === receiver.id) {
          throw new ConflictException('Cannot send a friend request to yourself.');
      }

      const existingRequest = await this.friendRequestRepository.findOne({
          where: [
              { user: { id: sender.id }, friend: { id: receiver.id }, status: 'pending' },
              { user: { id: receiver.id }, friend: { id: sender.id }, status: 'pending' },
              { user: { id: sender.id }, friend: { id: receiver.id }, status: 'accepted' },
              { user: { id: receiver.id }, friend: { id: sender.id }, status: 'accepted' },
          ],
      });

      if (existingRequest) {
          throw new ConflictException('Friendship request already exists or is accepted.');
      }

      const friendRequest = new FriendRequest();
      friendRequest.user = sender;
      friendRequest.friend = receiver;
      friendRequest.status = 'pending';
      const savedFriendRequest=  await this.friendRequestRepository.save(friendRequest);

      // Create a notification for the receiver
      const notificationDto: CreateNotificationDto = {
        senderId: senderId,
        receiverId: receiverId,
        type: 'friend-request',
      };

      await this.notificationService.createNotification(notificationDto);

      return savedFriendRequest;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findFriendRequest(senderId: number, receiverId: number): Promise<FriendRequest | undefined> {
    return this.friendRequestRepository.findOne({
      where: {
        user: { id: senderId },
        friend: { id: receiverId },
      },
    });
  }

  async acceptFriendRequest(requestId: number): Promise<void> {
    const request = await this.friendRequestRepository.findOne({ where: { id: requestId } });
  
    if (!request || request.status !== 'pending') {
      throw new NotFoundException('Invalid friend request.');
    }

    request.status = 'accepted';
    await this.friendRequestRepository.save(request);
  
    await this.friendshipService.createFriendship(request.user.id, request.friend.id);

    // Mark the associated notification 'friend-request' as read
    await this.notificationService.markNotificationAsRead(request.user.id, request.friend.id, 'friend-request');
  }

    async deleteFriendRequest(requestId: number): Promise<void> {
        const request = await this.friendRequestRepository.findOne({ where: { id: requestId } });
        if (!request) {
            throw new NotFoundException('Friend request not found.');
        }
        await this.friendRequestRepository.remove(request);

    }

  // get friend request id for a given pair of users
  async getFriendRequestId(senderId: number, receiverId: number): Promise<number | null> {
    const request = await this.friendRequestRepository.findOne({
      where: {
        user: { id: senderId },
        friend: { id: receiverId },
      },
    });

    return request ? request.id : null;
  }

  async getPendingFriendRequests(userId: number): Promise<FriendRequestResponseDto[]> {
    const friendRequests = await this.friendRequestRepository.find({
      where: {
        friend: { id: userId },
        status: 'pending',
      },
      relations: ['user'],
    });

    if (!friendRequests || friendRequests.length === 0) {
      throw new NotFoundException('No pending friend requests found for this user.');
    }

    return friendRequests.map((request) => ({
      id: request.id,
      status: request.status,
      user: request.user,
    }));
  }

}
