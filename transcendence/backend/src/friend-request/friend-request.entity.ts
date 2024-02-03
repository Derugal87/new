import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class FriendRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'friend_id' })
    friend: User;

    @Column()
    status: string; // e.g., "pending", "accepted", "declined"
}

