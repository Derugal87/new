import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';
import { User } from '../user/user.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(Match)
        private matchRepository: Repository<Match>,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ) {}
    
    async getAllMatches(): Promise<Match[]> {
        return await this.matchRepository.find();
    }

    async getMatchesByUserId(userId: number): Promise<Match[]> {
        return this.matchRepository.find({
            where: [
                { creator: { id: userId } },
                { joiner: { id: userId } }
            ],
            relations: ['creator', 'joiner']
        });
    }
    
    async getMatchById(id: number): Promise<Match> {
        return await this.matchRepository.findOne({ where: { id } });
    }

    async createMatch(user: User, opponent: User, result: string, ladder_level: number): Promise<Match> {
        const match = new Match();
        match.creator = user;
        match.joiner = opponent;
        match.result = result;
        match.ladder_level = ladder_level;
        return await this.matchRepository.save(match);
    }
    

    async deleteMatch(id: number): Promise<void> {
        await this.matchRepository.delete(id);
    }

    async createMatchScore(player1Id: number, player2Id: number, player1Score: number, player2Score: number): Promise<void> {
        try {
            // Fetch user entities from the database using their IDs
            console.log("Player1Id (Match Service): ", player1Id);
            console.log("Player2Id (Match Service): ", player2Id);

            const user1 = await this.userService.findUserById(player1Id);
            const user2 = await this.userService.findUserById(player2Id);
 
            console.log("Player1Score: ", player1Score);
            console.log("Player2Score: ", player2Score);
    
            // Validate that scores are valid numbers
            if (isNaN(player1Score) || isNaN(player2Score)) {
                throw new Error('Invalid scores provided. Scores must be numeric.');
            }
    
            // Create a new match entity
            const match = new Match();
            match.creator = user1;
            match.joiner = user2;
            match.creator_score = player1Score;
            match.joiner_score = player2Score;
            match.result = `${player1Score} - ${player2Score}`;
            match.ladder_level = 1; // Change this accordingly
    
            // Save the match entity
            await this.matchRepository.save(match);
    
        } catch (error) {
            // Log the specific error for debugging purposes
            console.error('Error in createMatchScore:', error);
    
            // Rethrow the error to maintain the existing behavior
            // throw new InternalServerErrorException('Failed to store game results.');
        }
    }

    // async updatePoints(match: Match): Promise<void> {
    //     const creator = await this.userService.findUserById(match.creator.id);
    //     const joiner = await this.userService.findUserById(match.joiner.id);

    //     console.log("Creator: ", creator);  
    //     console.log("Joiner: ", joiner);
    
    //     // Assuming '5 - 4' format for result
    //     const [creatorScore, joinerScore] = match.result.split(' - ').map(Number);
    
    //     // Update points based on match results
    //     if (creatorScore > joinerScore) {
    //         // Creator wins
    //         creator.points += 50;
    //         joiner.points -= 50;
    //     } else if (creatorScore < joinerScore) {
    //         // Joiner wins
    //         creator.points -= 50;
    //         joiner.points += 50;
    //     }
    
    //     // Create DTO objects for updating
    //     const creatorDto = { points: creator.points };
    //     const joinerDto = { points: joiner.points };
    
    //     // Save the updated points
    //     await this.userService.updateUser(creator.id, creatorDto);
    //     await this.userService.updateUser(joiner.id, joinerDto);
    // }
    
    // Fetch the user 
    async findUserById(id: number): Promise<User> {
        return await this.userService.findUserById(id);
    }

    async updatePoints(player1Id: number, player2Id: number, player1Score: number, player2Score: number): Promise<void> {
        // Assuming 50 points per win/loss
        if (player1Score > player2Score) {
          // Player 1 wins
          // Add 50 points to Player 1 and deduct 50 points from Player 2
          await this.updateUserPoints(player1Id, 50);
          await this.updateUserPoints(player2Id, -50);
        } else if (player1Score < player2Score) {
          // Player 2 wins
          // Add 50 points to Player 2 and deduct 50 points from Player 1
          await this.updateUserPoints(player1Id, -50);
          await this.updateUserPoints(player2Id, 50);
        }
        // If it's a draw, no points are updated
      }

      private async updateUserPoints(userId: number, points: number): Promise<void> {
        const user = await this.userService.findUserById(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found.`);
        }
        user.points += points;
        await this.userService.updateUser(userId, { points: user.points });
      }


    


}
