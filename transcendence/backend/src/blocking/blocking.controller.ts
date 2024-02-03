import { Controller, Get, UseGuards, Post, Param, Body } from '@nestjs/common';
import { BlockingService } from './blocking.service';
import { JWTAuthGuard } from '../auth/jwt.strategy';

@Controller('blocking')
@UseGuards(JWTAuthGuard)
export class BlockingController {
  constructor(private readonly blockingService: BlockingService) {}

  @Post('block/:userId')
  async blockUser(@Param('userId') userId: number, @Body() body: { blockedUserId: number }): Promise<void> {
    const { blockedUserId } = body;
    await this.blockingService.blockUser(userId, blockedUserId);
  }

  @Post('unblock/:userId')
  async unblockUser(@Param('userId') userId: number, @Body() body: { unblockedUserId: number }): Promise<void> {
    const { unblockedUserId } = body;
    await this.blockingService.unblockUser(userId, unblockedUserId);
  }
}
