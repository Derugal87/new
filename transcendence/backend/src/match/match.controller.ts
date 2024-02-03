import { Controller, Get, Post, Body, Param, Delete, BadRequestException, NotFoundException } from '@nestjs/common';
import { MatchService } from './match.service';
import { Match } from './match.entity';
import { JWTAuthGuard } from '../auth/jwt.strategy';
import { UseGuards } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';

UseGuards(JWTAuthGuard)
@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) {}

    @Get()
    getAllMatches(): Promise<Match[]> {
        return this.matchService.getAllMatches();
    }

    @Get(':id')
    getMatchById(@Param('id') id: number): Promise<Match> {
        return this.matchService.getMatchById(id);
    }

    @Get('user/:id')
    getMatchesByUserId(@Param('id') id: number): Promise<Match[]> {
        return this.matchService.getMatchesByUserId(id);
    }

    // @Post()
    // async createMatch(@Body() matchData: any): Promise<Match> {
    //   const { userId, opponentId, result, ladderLevel } = matchData;

    //   if (!userId || !opponentId || !result || !ladderLevel) {
    //     throw new BadRequestException('Missing required fields');
    //   }

    //   const match = await this.matchService.createMatch(userId, opponentId, result, ladderLevel);
      
    //   await this.matchService.updatePoints(match);

    //   return match;
    // }

    @Post()
    async createMatch(@Body() matchData: any): Promise<Match> {
      const { userId, opponentId, result, ladderLevel } = matchData;

      if (!userId || !opponentId || !result || !ladderLevel) {
        throw new BadRequestException('Missing required fields');
      }

      // Fetch the user before creating the match
      const user = await this.matchService.findUserById(userId);

      // Proceed with creating the match
      const match = await this.matchService.createMatch(userId, opponentId, result, ladderLevel);
      return match;
    }


    @Delete(':id')
    async deleteMatch(@Param('id') id: number): Promise<void> {
      const match = await this.matchService.getMatchById(id);

      if (!match) {
          throw new NotFoundException(`Match with ID ${id} not found`);
      }
  
      await this.matchService.deleteMatch(id);
    }
}
