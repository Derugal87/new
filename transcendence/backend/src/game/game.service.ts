import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>,
    ) {}

    async findAll(): Promise<Game[]> {
        return this.gameRepository.find();
    }

    async findById(id: number): Promise<Game> {
        return this.gameRepository.findOne({ where: { id } });
    }

    async create(gameData: Partial<Game>): Promise<Game> {
        const { power_ups_enabled, map } = gameData;
    
        const game = this.gameRepository.create(gameData);
        try {
            return await this.gameRepository.save(game);
        } catch (error) {
            // Handle specific errors (e.g., unique constraint violation) if needed
            throw new InternalServerErrorException('Failed to create game.');
        }
    }

    async remove(id: string): Promise<void> {
        await this.gameRepository.delete(id);
    }
}
