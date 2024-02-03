import { Controller, Get, Post, Put, Delete, Body, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { GamePlayer } from './game-player.entity';
import { GamePlayerService } from './game-player.service';
import { JWTAuthGuard } from '../auth/jwt.strategy';
import { UseGuards } from '@nestjs/common';

@UseGuards(JWTAuthGuard)
@Controller('game-player')
export class GamePlayerController {
  constructor(private readonly gamePlayerService: GamePlayerService) {}

    @Get()
    async getAllGamePlayers(): Promise<GamePlayer[]> {
        return this.gamePlayerService.getAllGamePlayers();
    }

    @Get(':id')
    async getGamePlayerById(@Param('id') id: number): Promise<GamePlayer> {
        return this.gamePlayerService.getGamePlayerById(id);
    }

    @Post()
    async createGamePlayer(@Body() gamePlayerData: any): Promise<GamePlayer> {
        const { gameId, playerId, score } = gamePlayerData;

        if (!gameId || !playerId || !score) 
            throw new BadRequestException('Missing required fields');

        return this.gamePlayerService.createGamePlayer(gameId, playerId, score);
    }

    @Put(':id')
    async updateGamePlayer(@Param('id') id: number, @Body() gamePlayerData: { score: number }): Promise<GamePlayer> {
        const { score } = gamePlayerData;

        if (isNaN(score) || score < 0) {
            throw new BadRequestException('Invalid score value');
        }

        const updatedGamePlayer = await this.gamePlayerService.updateGamePlayer(id, score);

        if (!updatedGamePlayer) {
            throw new NotFoundException(`Game Player with ID ${id} not found`);
        }

        return updatedGamePlayer;
    }

    @Delete(':id')
    async deleteGamePlayer(@Param('id') id: string): Promise<void> {
        return this.gamePlayerService.deleteGamePlayer(id);
    }
}
