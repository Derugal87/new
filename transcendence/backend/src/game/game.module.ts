import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Game } from './game.entity';
import { GameGateway } from './game.gateway'; // adjust the path to your file structure
import { AuthModule } from '../auth/auth.module';
import { MatchModule } from '../match/match.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), 
  AuthModule,
  MatchModule,
  UserModule,
],
  controllers: [GameController],
  providers: [GameService, GameGateway],
})
export class GameModule { }
