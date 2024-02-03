import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamePlayer } from './game-player.entity';
import { Game } from '../game/game.entity';
import { User } from '../user/user.entity';

@Injectable()
export class GamePlayerService {
    constructor(
        @InjectRepository(GamePlayer)
        private gamePlayerRepository: Repository<GamePlayer>,
    ) {}

    async getAllGamePlayers(): Promise<GamePlayer[]> {
        return this.gamePlayerRepository.find();
    }

    async getGamePlayerById(id: number): Promise<GamePlayer> {
        return this.gamePlayerRepository.findOne({ where: { id } });
    }

    async createGamePlayer(game: Game, player: User, score: number): Promise<GamePlayer> {
        const gamePlayer = new GamePlayer();
        gamePlayer.game = game;
        gamePlayer.player = player;
        gamePlayer.score = score;
        return this.gamePlayerRepository.save(gamePlayer);
    }

    async updateGamePlayer(id: number, score: number): Promise<GamePlayer> {
        const gamePlayer = await this.gamePlayerRepository.findOne({ where: { id } });
        gamePlayer.score = score;
        return this.gamePlayerRepository.save(gamePlayer);
    }

    async deleteGamePlayer(id: string): Promise<void> {
        await this.gamePlayerRepository.delete(id);
    }
}
