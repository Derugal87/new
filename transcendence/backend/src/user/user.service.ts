import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./user.entity";
import { HttpService } from '@nestjs/axios'; // Import this for making HTTP requests
import { Logger } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { MatchService } from '../match/match.service';
import { forwardRef, Inject } from '@nestjs/common';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private httpService: HttpService,
		@Inject(forwardRef(() => MatchService))
        private matchService: MatchService
	) { }

	async createUser(profile: any, accessToken: string, refreshToken: string): Promise<User> {
		const logger = new Logger('UserService');
		const { id: id_42, nickname } = profile;
		try {
			logger.log(`id_42: ${id_42}`);

			const userDto: CreateUserDto = {
				id_42,
				nickname,
				oauthToken: accessToken,
				refreshToken,
				status: 'online'
			};
			// logger.log(`userDto: ${userDto}`);
			// console.log(userDto);
			const user = this.userRepository.create(userDto);
			if (!user.avatar) {
				user.avatar = 'https://media.istockphoto.com/vectors/anonymity-concept-icon-in-neon-line-style-vector-id1259924572?k=20&m=1259924572&s=612x612&w=0&h=Xeii8p8hOLrH84PO4LJgse5VT7YSdkQY_LeZOjy-QD4='; // default avatar URL
			}
			return await this.userRepository.save(user);

		} catch (error) {
			logger.error(`Error in createUser: ${error.message}`);
			throw error;  // Re-throwing the error to be handled by NestJS's exception filter
		}
	}

	// async createUser(createUserDto: CreateUserDto): Promise<User> {
	// 	try {
	// 	  const user = this.userRepository.create(createUserDto);

	// 	  if (!user.avatar) {
	// 		user.avatar = 'https://media.istockphoto.com/vectors/anonymity-concept-icon-in-neon-line-style-vector-id1259924572?k=20&m=1259924572&s=612x612&w=0&h=Xeii8p8hOLrH84PO4LJgse5VT7YSdkQY_LeZOjy-QD4=';
	// 	  }

	// 	  return await this.userRepository.save(user);
	// 	} catch (error) {
	// 	  throw error;
	// 	}
	// }	  

	// to be removed
	async updateUser42(id_42: string, updateUserDto: UpdateUserDto): Promise<User> {
		const user = await this.findUserById42(id_42);

		if (!user) {
			console.log('42 User not found.');
			return null;
		}

		if (updateUserDto.avatar == '') {
			updateUserDto.avatar = 'https://media.istockphoto.com/vectors/anonymity-concept-icon-in-neon-line-style-vector-id1259924572?k=20&m=1259924572&s=612x612&w=0&h=Xeii8p8hOLrH84PO4LJgse5VT7YSdkQY_LeZOjy-QD4=';
		}

		if (updateUserDto.nickname && updateUserDto.nickname !== user.nickname) {
			const existingUserWithNickname = await this.userRepository.findOne({
				where: { nickname: updateUserDto.nickname },
			});

			if (existingUserWithNickname) {
				throw new ConflictException('Nickname is already in use by another user.');
			}
		}

		this.userRepository.merge(user, updateUserDto);
		// console.log(user);
		return this.userRepository.save(user);
	}

	async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
		try {
		const user = await this.findUserById(id);

		if (updateUserDto.avatar == '') {
			updateUserDto.avatar = 'https://media.istockphoto.com/vectors/anonymity-concept-icon-in-neon-line-style-vector-id1259924572?k=20&m=1259924572&s=612x612&w=0&h=Xeii8p8hOLrH84PO4LJgse5VT7YSdkQY_LeZOjy-QD4=';
		}

		if (updateUserDto.nickname && updateUserDto.nickname !== user.nickname) {
			const existingUserWithNickname = await this.userRepository.findOne({
				where: { nickname: updateUserDto.nickname },
			});

			if (existingUserWithNickname) {
				throw new ConflictException('Nickname is already in use by another user.');
			}
		}

		this.userRepository.merge(user, updateUserDto);
		// console.log(user);
		return this.userRepository.save(user);
	} catch (error) {
		console.log(error);
		return null;
	}
	}

	async deleteUser(id: number): Promise<void> {
		try {
			const user = await this.findUserById(id);
			await this.userRepository.remove(user);
		}
		catch (error) {
			console.log(error);
		}
	}

	async findUserById(id: number): Promise<User> {
		const user = await this.userRepository.findOne({ where: { id } });
		if (!user) {
			throw new NotFoundException(`User with ID '${id}' not found.`);
		}
		return user;
	}

	async findUsersByIds(userIds: number[]): Promise<User[]> {
		const users = await this.userRepository
			.createQueryBuilder('user')
			.whereInIds(userIds)
			.getMany();

		return users;
	}

	async findUserById42(id_42: string): Promise<User> {
		const user = await this.userRepository.findOne({ where: { id_42: id_42 } });
		return user;
	}

	async findAll(): Promise<User[]> {
		return await this.userRepository.find();
	}

	async findByNickname(nickname: string): Promise<User> {
		const user = await this.userRepository.findOne({ where: { nickname } });
		if (!user) {
			throw new NotFoundException(`User with nickname '${nickname}' not found.`);
		}
		return user;
	}

	async getUserProfileInfo(id: number): Promise<Partial<User>> {
		try {
			const user = await this.findUserById(id);
			return user.getPublicProfile();
		}
		catch (error) {
			console.log(error);
			return null;
		}
	}

	async getUser42ProfileInfo(id_42: string): Promise<Partial<User>> {
		const user = await this.findUserById42(id_42);
		if (!user) {
			console.log(`User with 42 ID '${id_42}' not found.`);
			return null;
		}
		return user.getPublicProfile();
	}

	async findOrCreateUser(profile: any, accessToken: string, refreshToken: string): Promise<any> {
		const { id: id_42 } = profile;
		const existingUser = await this.userRepository.findOne({ where: { id_42 } });
		if (existingUser) {
			return { user: existingUser, isNew: false };
		}
		return await { user: await this.createUser(profile, accessToken, refreshToken), isNew: true };
	}

	// async enableTwoFactorAuth(id: number): Promise<void> {
	// 	await this.userRepository.update(id, {
	// 		two_factor_auth_enabled: true
	// 	});
	// }

	// async disableTwoFactorAuth(id: number): Promise<void> {
	// 	await this.userRepository.update(id, {
	// 		two_factor_auth_enabled: false,
	// 		two_factor_auth_secret: null,
	// 	});
	// }

	// async setTwoFactorAuthSecret(id: number, secret: string): Promise<void> {
	// 	await this.userRepository.update(id, { two_factor_auth_secret: secret });
	// }

	// 1. Update OAuth Information
	async updateOAuthInformation(id: number, oauthToken: string, refreshToken: string, id_42: string): Promise<void> {
		await this.userRepository.update(id, {
			oauthToken,
			refreshToken,
			id_42
		});
	}

	// 2. Clear OAuth Information
	async clearOAuthInformation(id: number): Promise<void> {
		await this.userRepository.update(id, {
			oauthToken: null,
			refreshToken: null
		});
	}

	// async refreshOAuthToken(id: number): Promise<void> {
	// 	const user = await this.findUserById(id);
	// 	const newToken = await this.authService.refreshOAuthToken(user.refreshToken);
	// 	await this.userRepository.update(id, { oauthToken: newToken });
	// }

	async getUserOnlineStatus(userId: number): Promise<'online' | 'offline'> {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		return user.status;
	}

	async saveUser(user: User): Promise<User> {
		return await this.userRepository.save(user);
	}

	async getUserBlockedMap(userId: number, userIDs: number[]): Promise<{ [key: number]: boolean }> {
		try {
			// const user = await this.findUserById(userId);
			// // Execute the query builder and get the result
			// const blockedUsers = await this.createBlockedUsersQuery(user, userIDs).getRawMany();

			// const blockedUserMap = blockedUsers.reduce((map, user) => {
			// 	map[user.id] = user.blocked;
			// 	return map;
			// }, {});

			// return blockedUserMap;
			return {};
		} catch (error) {
			console.log(error);
			return {};
		}
	}

	private createBlockedUsersQuery(user: User, userIDs: number[]): SelectQueryBuilder<User> {
		const queryBuilder = this.userRepository.createQueryBuilder('user')
			.select('user.id', 'id')
			.addSelect(`CASE WHEN user.id = ANY(:blockedUsers) THEN true ELSE false END`, 'blocked')
			.setParameter('blockedUsers', user.blockedUsers || []) // Use an empty array if user.blockedUsers is falsy
			.where('user.id IN (:...userIDs)', { userIDs });

		return queryBuilder;
	}

	// get all my blocked friends (for user with id = userId)
	// async getMyBlockedFriends(userId: number): Promise<number[]> {
	// 	// Find the user by their ID
	// 	const user = await this.findUserById(userId);

	// 	// Get the IDs of blocked users from the user's blockedUsers array
	// 	const blockedUserIds = user.blockedUsers || [];

	// 	return blockedUserIds;
	// }	

	// async getMyBlockedFriends(userId: number): Promise<User[]> {
	//     // Find the user by their ID
	//     const user = await this.findUserById(userId);

	//     // Get the blocked user IDs from the user's blockedUsers array
	//     const blockedUserIds = user.blockedUsers || [];

	//     // Use the findUsersByIds method to fetch the complete user data for blocked users
	//     const blockedUsers = await this.findUsersByIds(blockedUserIds);

	//     return blockedUsers;
	// }

	async getMyBlockedFriends(userId: number): Promise<User[]> {
		// Find the user by their ID
		try {
			const user = await this.findUserById(userId);
			// Get the blocked user IDs from the user's blockedUsers array
			const blockedUserIds = user.blockedUsers || [];

			// Check if the array is not empty before querying the database
			if (blockedUserIds.length > 0) {
				// Use the findUsersByIds method to fetch the complete user data for blocked users
				const blockedUsers = await this.findUsersByIds(blockedUserIds);
				return blockedUsers;
			} else {
				// Return an empty array or handle this case as needed
				return [];
			}
		} catch (error) {
			console.log(error);
			return [];
		}
	}

	async updateUserIsInGame(userId: number, isInGame: boolean): Promise<void> {
		await this.userRepository.update({ id: userId }, { isInGame });
	}

	async markUserInGame(userId: number): Promise<void> {
		await this.updateUserIsInGame(userId, true);
	}

	async markUserNotInGame(userId: number): Promise<void> {
		await this.updateUserIsInGame(userId, false);
	}

	async isUserInGame(userId: number): Promise<boolean> {
		try {
			const user = await this.findUserById(userId);
			return user.isInGame;
		}
		catch (error) {
			console.log(error);
			return false;
		}
	}

	async updateWinsAndLosses(userId: number, isWinner: boolean): Promise<void> {
		try {
			const user = await this.findUserById(userId);

			if (isWinner) {
				user.wins++;
			} else {
				user.losses++;
			}

			await this.userRepository.save(user);
		} catch (error) {
			console.log(error);
		}
	}

	// implement this.userService.updateAchievements(player1);
	async updateAchievements(userId: number): Promise<void> {
		try {
			const user = await this.findUserById(userId);
			const achievements: string[] = user.achievements || [];

			const matches = await this.matchService.getMatchesByUserId(userId);
			// log matches with user id
			console.log('user id: ', userId);
			console.log('number of matches: ', matches.length);

			if (matches.length === 1 && !achievements.includes('First match')) {
				achievements.push('First match');
			}
			else if (matches.length === 10 && !achievements.includes('10 matches played')) {
				achievements.push('10 matches played');
			}
			else if (matches.length === 100 && !achievements.includes('100 matches played')) {
				achievements.push('100 matches played');
			}

			for (const match of matches) {
				if (match.creator.id === user.id) {
					// make sure that achievements are not duplicated
					console.log('match.joiner_score: ', match.joiner_score);
					if (match.joiner_score === 0 && !achievements.includes('Perfect victory')) {
						achievements.push('Perfect victory');
					}
					else if (match.creator_score === 0 && !achievements.includes('Perfect defeat')) {
						achievements.push('Perfect defeat');
					}
				}
				else if (match.joiner.id === user.id) {
					if (match.creator_score === 0 && !achievements.includes('Perfect victory')) {
						achievements.push('Perfect victory');
					}
					else if (match.joiner_score === 0 && !achievements.includes('Perfect defeat')) {
						achievements.push('Perfect defeat');
					}
				}

				if (user.wins === 1 && !achievements.includes('First win')) {
					achievements.push('First win');
				}
				else if (user.wins === 10 && !achievements.includes('10 wins')) {
					achievements.push('10 wins');
				}

				if (user.wins - user.losses == -18 && !achievements.includes('Hit rock bottom')) {
					achievements.push('Hit rock bottom');
				}
				else if (user.wins - user.losses == 18 && !achievements.includes('Outperformer')) {
					achievements.push('Outperformer');
				}
			}
	
			await this.userRepository.update({ id: userId }, { achievements });
			console.log('achievements: ', await this.getUserAchievements(userId));
		} catch (error) {
			console.log(error);
		}
	}

	async getUserAchievements(userId: number): Promise<string[]> {
		try {
			const user = await this.findUserById(userId);
			return user.achievements;
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	async getUserWinsLosses(userId: number): Promise<{ wins: number, losses: number }> {
		try {
			const user = await this.findUserById(userId);
			return { wins: user.wins, losses: user.losses };
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	// get user points
	async getUserPoints(userId: number): Promise<number> {
		try {
			const user = await this.findUserById(userId);
			return user.points;
		} catch (error) {
			console.log(error);
			return null;
		}
	}

}
