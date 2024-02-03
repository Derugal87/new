import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ChannelMembership } from '../channel-membership/channel-membership.entity';
// import { ArrayMember } from 'src/utils/array-member.decorator';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	readonly id: number;

	@Column({ nullable: true })
	id_42: string;

	@Column({ nullable: true })
	oauthToken: string;

	@Column({ nullable: true })
	refreshToken: string;

	@Column({ nullable: true })
	authorizationCode: string; // Temporary storage

	@Column({ nullable: true })
	stateParameter: string; // Temporary storage

	@Column({ unique: true, nullable: true, default: null })
	nickname: string;

	@Column({ nullable: true })
	password?: string;

	@Column({ default: 'https://media.istockphoto.com/vectors/anonymity-concept-icon-in-neon-line-style-vector-id1259924572?k=20&m=1259924572&s=612x612&w=0&h=Xeii8p8hOLrH84PO4LJgse5VT7YSdkQY_LeZOjy-QD4=' })
	avatar: string;

	@Column({ default: false })
	two_factor_auth_enabled: boolean;

	@Column({ nullable: true })
	two_factor_auth_secret: string;

	@Column({ nullable: true })
	two_factor_auth_url: string;

	// @Column({ nullable: true })
	// two_factor_auth_qr: string;

	@Column({ default: 'offline' })
	status: 'online' | 'offline';

	@Column({ default: false })
	isInGame: boolean;

	@Column({ type: 'int', default: 800 })
    points: number;

	getPublicProfile(): Partial<User> {
		const { id, id_42, nickname, avatar, two_factor_auth_enabled, status, isInGame } = this;
		return { id, id_42, nickname, avatar, two_factor_auth_enabled, status, isInGame };
	}

	@OneToMany(() => ChannelMembership, (membership) => membership.user)
	memberships: ChannelMembership[];

	@Column('integer', { array: true, default: [] })
	blockedUsers: number[];

	@Column('text', { array: true, default: [] })
	achievements: string[];

	@Column({ type: 'int', default: 0 })
	wins: number;

	@Column({ type: 'int', default: 0 })
	losses: number;
}
