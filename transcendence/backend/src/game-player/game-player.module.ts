import { Module } from '@nestjs/common';
import { GamePlayerController } from './game-player.controller';
import { GamePlayerService } from './game-player.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamePlayer } from './game-player.entity';
import { Game } from '../game/game.entity';
import { User } from '../user/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([GamePlayer, Game, User]), AuthModule],
  controllers: [GamePlayerController],
  providers: [GamePlayerService]
})
export class GamePlayerModule {}
