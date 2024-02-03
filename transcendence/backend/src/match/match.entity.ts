import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
@Index(['creator', 'joiner'])
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  @Index()
  creator: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opponent_id', referencedColumnName: 'id' })
  @Index()
  joiner: User;

  @Column({ type: 'varchar', length: 10 })
  result: string;

  @Column({ type: 'int' })
  @Index()
  creator_score: number;

  @Column({ type: 'int' })
  @Index()
  joiner_score: number;

  @Column()
  ladder_level: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
  created_at: Date;
}
