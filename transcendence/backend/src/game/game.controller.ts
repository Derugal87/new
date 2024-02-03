import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { GameService } from './game.service';
import { Game } from './game.entity';
import { JWTAuthGuard } from '../auth/jwt.strategy';
import { UseGuards } from '@nestjs/common';

UseGuards(JWTAuthGuard)
@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get()
    async getAllGames(): Promise<Game[]> {
        return this.gameService.findAll();
    }

    @Get(':id')
    async getGameById(@Param('id') id: number): Promise<Game> {
        const game = await this.gameService.findById(id);
        if (!game)
            throw new NotFoundException(`Game ${id} not found`);
        return game;
    }

    @Post()
    async createGame(@Body() gameData: Partial<Game>): Promise<Game> {
        return this.gameService.create(gameData);
    }
}
