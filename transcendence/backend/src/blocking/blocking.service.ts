import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class BlockingService {
  constructor(private readonly userService: UserService) { }

  async blockUser(userId: number, blockedUserId: number): Promise<void> {
    try {
      const user = await this.userService.findUserById(userId);
      if (!user.blockedUsers.includes(blockedUserId)) {
        user.blockedUsers.push(blockedUserId);
        await this.userService.saveUser(user);
      }
      console.log(`User ${userId} blocked user ${blockedUserId}`);
    }
    catch (error) {
      console.log(error);
    }
  }

  async unblockUser(userId: number, unblockedUserId: number): Promise<void> {
    try {
      const user = await this.userService.findUserById(userId);
      const index = user.blockedUsers.indexOf(unblockedUserId);
      if (index !== -1) {
        user.blockedUsers.splice(index, 1);
        await this.userService.saveUser(user);
      }
    }
    catch (error) {
      console.log(error);
    }
  }
}
