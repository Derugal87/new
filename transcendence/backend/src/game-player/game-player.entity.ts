import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Game } from '../game/game.entity';
import { User } from '../user/user.entity';

@Entity()
export class GamePlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id', referencedColumnName: 'id' })
  game: Game;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id', referencedColumnName: 'id' })
  @Index()
  player: User;

  @Column()
  score: number;
}

