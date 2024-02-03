import { Module } from '@nestjs/common';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from './friendship.entity';
import { FriendshipGateway } from './friendship.gateway';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [TypeOrmModule.forFeature([Friendship, User]), 
  HttpModule,
  AuthModule,
  MatchModule,
],
  controllers: [FriendshipController],
  providers: [FriendshipService, FriendshipGateway, UserService],
  exports: [FriendshipGateway, FriendshipService],
})
export class FriendshipModule {}
