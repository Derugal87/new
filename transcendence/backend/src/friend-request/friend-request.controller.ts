import { Controller, Post, Param, Body,Get, NotFoundException } from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { FriendRequest } from './friend-request.entity';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { UserService } from '../user/user.service';
import { FriendRequestResponseDto } from './dto/friend-request-response.dto';
import { JWTAuthGuard } from '../auth/jwt.strategy';
import { UseGuards } from '@nestjs/common';

@UseGuards(JWTAuthGuard)
@Controller('friend-requests')
export class FriendRequestController {
  constructor(
    private readonly friendRequestService: FriendRequestService,
    private readonly userService: UserService
  ) {}

  @Post(':requestId/accept')
  async acceptFriendRequest(@Param('requestId') requestId: number): Promise<void> {
    try {
      await this.friendRequestService.acceptFriendRequest(requestId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Friend request not found.');
      }
      throw error;
    }
  }

  @Post()
  async createFriendRequest(@Body() createFriendRequestDto: CreateFriendRequestDto): Promise<FriendRequest> {
      const { senderId, receiverId } = createFriendRequestDto;
      return this.friendRequestService.createFriendRequest(senderId, receiverId);
  }

  @Post(':requestId/decline')
  async declineFriendRequest(@Param('requestId') requestId: number): Promise<void> {
      try {
          await this.friendRequestService.deleteFriendRequest(requestId);
      } catch (error) {
          if (error instanceof NotFoundException) {
              throw new NotFoundException('Friend request not found.');
          }
          throw error;
      }
  }

  @Get(':senderId/:receiverId')
  async getFriendRequestId(
      @Param('senderId') senderId: number,
      @Param('receiverId') receiverId: number,
    ): Promise<number | null> {
      const friendRequestId = await this.friendRequestService.getFriendRequestId(
        senderId,
        receiverId,
      );

      if (friendRequestId === null) {
        throw new NotFoundException('Friend request not found');
      }

      return friendRequestId;
  }

  @Get(':userId')
  async getFriendRequests(
    @Param('userId') userId: number,
  ): Promise<FriendRequestResponseDto[]> {
    const friendRequests = await this.friendRequestService.getPendingFriendRequests(
      userId,
    );

    if (!friendRequests || friendRequests.length === 0) {
      throw new NotFoundException('No pending friend requests found for this user.');
    }

    return friendRequests;
  }
}
