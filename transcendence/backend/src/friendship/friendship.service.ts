import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from './friendship.entity';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    private readonly userService: UserService,
  ) { }

  async createFriendship(userId: number, friendId: number): Promise<Friendship> {
    try {
      if (userId === friendId) {
        throw new ConflictException('Cannot create a friendship with yourself.');
      }

      const existingFriendship = await this.friendshipRepository.findOne({
        where: [
          { user: { id: userId }, friend: { id: friendId } },
          { user: { id: friendId }, friend: { id: userId } },
        ],
      });

      if (existingFriendship) {
        throw new ConflictException('Friendship already exists.');
      }

      const user = await this.userService.findUserById(userId);
      const friend = await this.userService.findUserById(friendId);

      if (!user || !friend) {
        throw new NotFoundException('User or friend not found.');
      }

      const friendship = new Friendship();
      friendship.user = user;
      friendship.friend = friend;
      friendship.status = 'offline';

      return this.friendshipRepository.save(friendship);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getFriendshipById(id: number): Promise<Friendship> {
    const friendship = await this.friendshipRepository.findOne({ where: { id } });
    console.log(friendship);
    if (!friendship) {
      throw new NotFoundException('Friendship not found.');
    }
    return friendship;
  }

  async deleteFriendship(id: number): Promise<void> {
    const friendship = await this.getFriendshipById(id);
    await this.friendshipRepository.remove(friendship);
  }

  // Returns the friends id's of the user with the given userId
  async findUserFriends(userId: number): Promise<User[]> {
    const userFriendships = await this.friendshipRepository
      .createQueryBuilder('friendship')
      .leftJoinAndSelect('friendship.friend', 'user')
      .where('friendship.user = :userId', { userId })
      .getMany();

    // Find users who have the user with the given userId as their friend
    const friendFriendships = await this.friendshipRepository
      .createQueryBuilder('friendship')
      .leftJoinAndSelect('friendship.user', 'user')
      .where('friendship.friend = :userId', { userId })
      .getMany();

    // Combine and deduplicate the friends and users
    const allFriends = [...userFriendships.map(friendship => friendship.friend), ...friendFriendships.map(friendship => friendship.user)];
    const uniqueFriends = allFriends.reduce<User[]>((unique, friend) => {
      if (!unique.some(u => u.id === friend.id)) {
        unique.push(friend);
      }
      return unique;
    }, []);

    return uniqueFriends;
  }

  async areTheyFriends(userId: number, friendId: number): Promise<boolean> {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { user: { id: userId }, friend: { id: friendId } },
        { user: { id: friendId }, friend: { id: userId } },
      ],
    });

    return !!friendship; // Returns true if a friendship is found, false otherwise
  }
}

