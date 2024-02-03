import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChannelMembershipDto } from './dto/create-channel-membership.dto';
import { UpdateChannelMembershipDto } from './dto/update-channel-membership.dto';
import { ChannelMembership } from './channel-membership.entity';
import { UserService } from '../user/user.service';
import { ChannelService } from '../channel/channel.service';
import { UserRole } from '../user/user-role.enum';
import { User } from '../user/user.entity';
import { Channel } from '../channel/channel.entity';
import { Inject, forwardRef } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { UpdateNotificationDto } from '../notification/dto/update-notification.dto';

@Injectable()
export class ChannelMembershipService {
	constructor(
		@InjectRepository(ChannelMembership)
		private readonly channelMembershipRepository: Repository<ChannelMembership>,
		private readonly notificationService: NotificationService,
		private readonly userService: UserService,
		@Inject(forwardRef(() => ChannelService))
		private readonly channelService: ChannelService,
		// @Inject(forwardRef(() => NotificationService))
	) { }

	async createMembership(createMembershipDto: CreateChannelMembershipDto): Promise<ChannelMembership> {
		try {
		const { user_id, channel_id, role, is_banned, is_muted } = createMembershipDto;

		// Ensure the provided role is valid or default to 'member'
		const validRole = role && Object.values(UserRole).includes(role) ? role : 'member';

		const user = await this.userService.findUserById(user_id);
		const channel = await this.channelService.findChannelById(channel_id);

		// Create the membership
		const membership = new ChannelMembership();
		membership.user = user;
		// membership.channel_id = channel_id;
		membership.channel = channel;
		membership.role = validRole as UserRole;
		membership.is_banned = is_banned || false;
		membership.is_muted = is_muted || false;

		return this.channelMembershipRepository.save(membership);
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	async updateMembership(
		currentUserId: number,
		targetUserId: number,
		channelId: number,
		updateMembershipDto: UpdateChannelMembershipDto,
	  ): Promise<ChannelMembership> {
		const currentUserMembershipId = await this.getMembershipIdByUserIdAndChannelId(currentUserId, channelId);
		const targetUserMembershipId = await this.getMembershipIdByUserIdAndChannelId(targetUserId, channelId);
	  
		const currentUserMembershipDetail = await this.channelMembershipRepository.findOne({ where: { id: currentUserMembershipId } });
		const targetUserMembershipDetail = await this.channelMembershipRepository.findOne({ where: { id: targetUserMembershipId } });
	  
		if (!currentUserMembershipDetail) {
		  throw new NotFoundException('Channel membership not found.');
		}
	  
		if (!this.isAuthorizedToUpdate(currentUserMembershipDetail, targetUserMembershipDetail)) {
		  throw new ForbiddenException('You are not authorized to update this membership.');
		}
	  
		// Update the membership
		Object.assign(targetUserMembershipDetail, updateMembershipDto);
		return this.channelMembershipRepository.save(targetUserMembershipDetail);
	}

	async deleteMembership(
		currentUserId: number,
		targetUserId: number,
		channelId: number,
	): Promise<void> {
		// Get the membership ID using the provided user IDs and channel ID
		const currentUserMembershipId = await this.getMembershipIdByUserIdAndChannelId(currentUserId, channelId);
		const targetUserMembershipId = await this.getMembershipIdByUserIdAndChannelId(targetUserId, channelId);

		const currentUserMembershipDetail = await this.channelMembershipRepository.findOne({ where: { id: currentUserMembershipId } });
		const targetUserMembershipDetail = await this.channelMembershipRepository.findOne({ where: { id: targetUserMembershipId } });

		if (!currentUserMembershipDetail) {
			throw new NotFoundException('Channel membership not found.');
		}

		if (!this.isAuthorizedToDelete(currentUserMembershipDetail, targetUserMembershipDetail)) {
			throw new ForbiddenException('You are not authorized to update this membership.');
		}
	
		// Check if the user was the only member of the channel
		if ( await this.getChannelMembersCount(channelId) === 1) {
			await this.channelService.deleteChannel(channelId, currentUserId);
		}
		else {
			await this.channelMembershipRepository.remove(targetUserMembershipDetail);
		}
	}

	private isAuthorizedToDelete(currentUserMembership: ChannelMembership, targetUserMembershipDetail): boolean {
		// A user can delete their own membership
		if (currentUserMembership.id === targetUserMembershipDetail.id) {
		  return true;
		}
	  
		if (currentUserMembership.role === UserRole.ChannelOwner) {
		  return true;
		}
	  
		if (currentUserMembership.role === UserRole.Administrator && targetUserMembershipDetail.role !== UserRole.ChannelOwner) {
		  return true;
		}
	  
		return false;
	}

	// Get the number of members in a channel
	async getChannelMembersCount(channelId: number): Promise<number> {
		const count = await this.channelMembershipRepository
		  .createQueryBuilder('membership')
		  .where('membership.channel.id = :channelId', { channelId })
		  .getCount();

		console.log(`count: ${count}`);
		return count;
	  }
	  
	// Get the membership ID using the provided user IDs and channel ID
	async getMembershipIdByUserIdAndChannelId(userId: number, channelId: number): Promise<number | null> {
		const membership = await this.channelMembershipRepository
		  .createQueryBuilder('membership')
		  .select('membership.id')
		  .where('membership.user.id = :userId', { userId })
		  .andWhere('membership.channel.id = :channelId', { channelId })
		  .getOne();
	
		return membership ? membership.id : null;
	}

	// Get the membership using the provided user IDs and channel ID
	async getMembershipByUserIdAndChannelId(userId: number, channelId: number): Promise<ChannelMembership | null> {
		const membership = await this.channelMembershipRepository
		  .createQueryBuilder('membership')
		  .where('membership.user.id = :userId', { userId })
		  .andWhere('membership.channel.id = :channelId', { channelId })
		  .getOne();
	  
		return membership || null;
	  }

	async deleteAllMembershipsByChannel(channelId: number): Promise<void> {
		await this.channelMembershipRepository.delete({ channel: { id: channelId } });
	}

	// TODO: Ban for a certain amount of time
	async banMember(
		currentUserId: number,
		targetUserId: number,
		channelId: number,
	  ): Promise<ChannelMembership> {
		const currentUserMembershipId = await this.getMembershipIdByUserIdAndChannelId(currentUserId, channelId);
		const targetUserMembershipId = await this.getMembershipIdByUserIdAndChannelId(targetUserId, channelId);
	  
		const currentUserMembershipDetail = await this.channelMembershipRepository.findOne({ where: { id: currentUserMembershipId } });
		const targetUserMembershipDetail = await this.channelMembershipRepository.findOne({ where: { id: targetUserMembershipId } });
	  
		if (!currentUserMembershipId || !targetUserMembershipId) {
		  throw new NotFoundException('Channel membership not found.');
		}
	  
		// Check if the current user is authorized to ban the member
		if (!this.isAuthorizedToUpdate(currentUserMembershipDetail, targetUserMembershipDetail)) {
		  throw new ForbiddenException('You are not authorized to ban this member.');
		}
	  
		// Calculate the ban expiration timestamp
		const banDurationMinutes = 5;
		const banDurationMilliseconds = banDurationMinutes * 60 * 1000;
		const banExpiration = new Date(Date.now() + banDurationMilliseconds);
	  
		// Update the target user's membership to indicate the ban
		targetUserMembershipDetail.is_banned = true;
		targetUserMembershipDetail.ban_expiration = banExpiration;
	  
		// Save the updated membership
		const updatedMembership = await this.channelMembershipRepository.save(targetUserMembershipDetail);
	  
		// Schedule an automatic unban
		setTimeout(async () => {
		  // Check if the ban has already been lifted manually
		  const membership = await this.channelMembershipRepository.findOne({ where: { id: updatedMembership.id } });
		  if (membership && membership.is_banned && membership.ban_expiration <= new Date()) {
			// If the ban is still in effect, unban the user
			membership.is_banned = false;
			membership.ban_expiration = null; // Clear the ban expiration
			await this.channelMembershipRepository.save(membership);
		  }
		}, banDurationMilliseconds);
	
		return updatedMembership;
	}

	// Only channel owners and administrators can update memberships
	private isAuthorizedToUpdate(membership: ChannelMembership, targetUserMembershipDetail): boolean {

		if (membership.role === UserRole.ChannelOwner) {
			return true;
		}

		// Administrators can modify roles other than 'channel_owner'
		if (membership.role === UserRole.Administrator && targetUserMembershipDetail.role !== UserRole.ChannelOwner) {
			return true;
		}
		return false;
	}

	async muteMember(
		currentUserId: number,
		targetUserId: number,
		channelId: number,
	  ): Promise<ChannelMembership> {
		const currentUserMembershipId = await this.getMembershipIdByUserIdAndChannelId(currentUserId, channelId);
		const targetUserMembershipId = await this.getMembershipIdByUserIdAndChannelId(targetUserId, channelId);
	  
		const currentUserMembershipDetail = await this.channelMembershipRepository.findOne({ where: { id: currentUserMembershipId } });
		const targetUserMembershipDetail = await this.channelMembershipRepository.findOne({ where: { id: targetUserMembershipId } });
	  
		if (!currentUserMembershipId || !targetUserMembershipId) {
		  throw new NotFoundException('Channel membership not found.');
		}
	  
		// Check if the current user is authorized to ban the member
		if (!this.isAuthorizedToUpdate(currentUserMembershipDetail, targetUserMembershipDetail)) {
		  throw new ForbiddenException('You are not authorized to ban this member.');
		}
	  
		// Calculate the ban expiration timestamp
		const muteDurationMinutes = 5;
		const muteDurationMilliseconds = muteDurationMinutes * 60 * 1000;
		const muteExpiration = new Date(Date.now() + muteDurationMilliseconds);
	  
		// Update the target user's membership to indicate the ban
		targetUserMembershipDetail.is_muted = true;
		targetUserMembershipDetail.mute_expiration = muteExpiration;
	  
		// Save the updated membership
		const updatedMembership = await this.channelMembershipRepository.save(targetUserMembershipDetail);
	  
		// Schedule an automatic unmute
		setTimeout(async () => {
		  // Check if the mute has already been lifted manually
		  const membership = await this.channelMembershipRepository.findOne({ where: { id: updatedMembership.id } });
		  if (membership && membership.is_muted && membership.mute_expiration <= new Date()) {
			// If the ban is still in effect, unmute the user
			membership.is_muted = false;
			membership.mute_expiration = null; // Clear the ban expiration
			await this.channelMembershipRepository.save(membership);
		  }
		}, muteDurationMilliseconds);
	
		return updatedMembership;
	}


	private isAuthorizedToMute(membership: ChannelMembership, currentUser: User): boolean {
		// Only the channel owner and administrators can mute members
		if (
			(currentUser.id === membership.channel.owner.id || membership.role === UserRole.Administrator) &&
			membership.user.id !== membership.channel.owner.id // An administrator cannot mute the owner
		) {
			return true;
		}

		return false;
	}

	async getMembershipByUserAndChannel(userId: number, channelId: number): Promise<ChannelMembership | undefined> {
		const membership = await this.channelMembershipRepository.findOne({
			where: { user: { id: userId }, channel: { id: channelId } },
		});

		return membership;
	}


	// Get all memberships for a user and the associated channel
	async getUserChannelMemberships(userId: number): Promise<{ membership: ChannelMembership, unreadMessagesCount: number }[]> {
		const memberships = await this.channelMembershipRepository.find({
			where: { user: { id: userId } },
			relations: ['channel'], // Load the associated channel
		});

		const membershipsWithUnreadCount = await Promise.all(
			memberships.map(async (membership) => {
				const unreadMessagesCount = await this.notificationService.getUnreadGroupMessagesCount(membership.channel.id, userId);
				return { membership, unreadMessagesCount };
			})
		);

		return membershipsWithUnreadCount.map((item) => ({
			membership: item.membership,
			unreadMessagesCount: item.unreadMessagesCount,
		}));
	}


	async getUserChannels(userId: number): Promise<Channel[]> {
		// Get channels where the user is a member
		const memberships = await this.channelMembershipRepository.find({
			where: { user: { id: userId } },
			relations: ['channel'], // Load the associated channel
		});

		// Extract the channels from the memberships
		const userChannels = memberships.map((membership) => membership.channel);

		return userChannels;
	}

	async getUserAndPublicChannels(userId: number): Promise<{ channel: Channel, members: Array<{ user: User, membership: ChannelMembership }> }[]> {
		const userChannels = await this.getUserChannels(userId);
		const publicChannels = await this.channelService.getAllPublicChannels();

		// Filter out the public channels that the user is already a member of
		const uniquePublicChannels = publicChannels.filter(
			publicChannel => !userChannels.some(userChannel => userChannel.id === publicChannel.id)
		);

		// Fetch detailed user information for each channel
		const membersWithMembershipPromises = userChannels.map(async userChannel => {
			const membersWithMembership = await this.channelMembershipRepository.find({
				where: { channel: { id: userChannel.id } },
				relations: ['user'],
			});

			return {
				channelId: userChannel.id,
				membersWithMembership: membersWithMembership.map(member => ({ user: member.user, membership: member })),
			};
		});

		const membersWithMembershipData = await Promise.all(membersWithMembershipPromises);

		const userChannelInfo = await Promise.all(membersWithMembershipData.map(async data => {
			const channel = await this.channelService.findChannelById(data.channelId);
			return {
				channel: channel,
				members: data.membersWithMembership,
			};
		}));

		// Combine user channels and unique public channels information
		const allChannelInfo = [...userChannelInfo, ...uniquePublicChannels.map(channel => ({ channel, members: [] }))];

		return allChannelInfo;
	}

	async getChannelMembersWithMembership(channelId: number): Promise<{ channel: Channel, members: Array<{ user: User, membership: ChannelMembership }> }> {
		const memberships = await this.channelMembershipRepository.find({
			where: { channel: { id: channelId } },
			relations: ['user', 'channel'], // Load the associated user and channel
		});

		const channel = await this.channelService.findChannelById(channelId);

		const membersWithMembershipInfo = memberships.map((membership) => {
			return { user: membership.user, membership: membership };
		});

		// Return an object containing channel info and members array
		return { channel: channel, members: membersWithMembershipInfo };
	}

	async getAllMembersOfChannel(channelId: number): Promise<ChannelMembership[]> {
		return this.channelMembershipRepository.find({
			where: { channel: { id: channelId } },
			relations: ['user'],
		});
	}
}
