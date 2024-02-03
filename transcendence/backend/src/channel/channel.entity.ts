import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { ChannelMembership } from '../channel-membership/channel-membership.entity';


@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id', referencedColumnName: 'id' })
  owner: User;

  @Column()
  is_public: boolean; // if false, the channel is private

  @Column({ nullable: true })
  password: string;

  @OneToMany(() => ChannelMembership, (membership) => membership.channel)
  members: ChannelMembership[];

  @Column({ unique: true, nullable: true })
  joinToken: string;

  @Column({ default: 'https://media.istockphoto.com/vectors/anonymity-concept-icon-in-neon-line-style-vector-id1259924572?k=20&m=1259924572&s=612x612&w=0&h=Xeii8p8hOLrH84PO4LJgse5VT7YSdkQY_LeZOjy-QD4=' })
	avatar: string;
}
