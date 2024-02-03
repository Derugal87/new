import { Controller, Post, Delete, Param, NotFoundException, ConflictException, Body,  Get } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { Friendship } from './friendship.entity';
import { User } from '../user/user.entity';
import { JWTAuthGuard } from '../auth/jwt.strategy';
import { UseGuards } from '@nestjs/common';

@UseGuards(JWTAuthGuard)
@Controller('friendships')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post(':userId/:friendId')
  async createFriendship(@Param('userId') userId: number, @Param('friendId') friendId: number): Promise<Friendship> {
    try {
      const friendship = await this.friendshipService.createFriendship(userId, friendId);
      return friendship;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Friendship already exists.');
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException('User or friend not found.');
      }
      throw error;
    }
  }

  @Delete(':id')
  async deleteFriendship(@Param('id') id: number): Promise<void> {
    try {
      await this.friendshipService.deleteFriendship(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Friendship not found.');
      }
      throw error;
    }
  }

  // @Get('friends/:userId')
  // async getFriendIds(@Param('userId') userId: number): Promise<number[]> {
  //   const friends = await this.friendshipService.findUserFriends(userId);
  //   if (!friends) {
  //     throw new NotFoundException('User not found or has no friends.');
  //   }
  //   return friends.map((friend) => friend?.id);
  // }

  @Get('friends/:userId')
  async getFriends(@Param('userId') userId: number): Promise<User[]> {
    const friends = await this.friendshipService.findUserFriends(userId);
    if (!friends) {
      throw new NotFoundException('User not found or has no friends.');
    }
    return friends;
  }

  @Get('are-friends/:userId/:friendId')
  async areTheyFriends(@Param('userId') userId: number, @Param('friendId') friendId: number): Promise<{ areFriends: boolean }> {
    const areFriends = await this.friendshipService.areTheyFriends(userId, friendId);
    return { areFriends };
  }

}
