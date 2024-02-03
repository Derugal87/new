import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Channel } from '../channel/channel.entity';
import { UserRole } from '../user/user-role.enum';

@Entity()
export class ChannelMembership {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Channel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id', referencedColumnName: 'id' })
  channel: Channel;

  @Column({ type: 'enum', enum: UserRole })
  role:  UserRole; // 'channel_owner' | 'administrator' | 'member'

  @Column({ default: false })
  is_banned: boolean;

  @Column({ default: false })
  is_muted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  ban_expiration: Date;

  @Column({ type: 'timestamp', nullable: true })
  mute_expiration: Date;
}


