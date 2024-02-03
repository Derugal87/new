import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './channel.entity';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { ChannelMembershipService } from '../channel-membership/channel-membership.service';
import { CreateChannelMembershipDto } from '../channel-membership/dto/create-channel-membership.dto';
import { UserRole } from '../user/user-role.enum';
import { Inject, forwardRef } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ChannelMembershipService))
    private readonly channelMembershipService: ChannelMembershipService,
  ) { }

  // private means it is not public and has no password but requires a token to join
  // protected means it has password and is_public
  // public means it has no password and is public
  async createChannel(createChannelDto: CreateChannelDto, ownerId: number): Promise<Channel> {
    try {
      const { name, is_public, password } = createChannelDto;
      const owner: User = await this.userService.findUserById(ownerId);

      const existingChannel = await this.channelRepository.findOne({ where: { name } });
      if (existingChannel) {
        throw new ConflictException('Channel name already in use.');
      }

      const channel = new Channel();
      channel.name = name;
      channel.owner = owner;

      channel.is_public = is_public === undefined ? !password : is_public;

      if (password !== null && password !== '' && password !== undefined) {
        // Hash the provided password before storing it
        const saltRounds = 10; // Number of salt rounds for bcrypt
        channel.password = await bcrypt.hash(password, saltRounds);
      } else {
        channel.password = null;
      }

      // Generate a join token if the channel is private
      const joinToken = await this.generateJoinToken(channel);
      if (joinToken) {
        channel.joinToken = joinToken;
      }

      const createdChannel = await this.channelRepository.save(channel);

      if (!createdChannel.avatar) {
        // Set the default avatar
        createdChannel.avatar = 'https://media.istockphoto.com/vectors/anonymity-concept-icon-in-neon-line-style-vector-id1259924572?k=20&m=1259924572&s=612x612&w=0&h=Xeii8p8hOLrH84PO4LJgse5VT7YSdkQY_LeZOjy-QD4=';
        await this.channelRepository.save(createdChannel);
      }

      // Create the membership for the owner
      const membershipDto: CreateChannelMembershipDto = {
        user_id: ownerId,
        channel_id: createdChannel.id,
        role: UserRole.ChannelOwner,
        is_banned: false,
        is_muted: false,
      };
      await this.channelMembershipService.createMembership(membershipDto);

      return createdChannel;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private async generateJoinToken(channel: Channel): Promise<string> {
    if (!channel.is_public && !channel.password) {
      const tokenBytes = randomBytes(20); // Generate 20 random bytes
      return tokenBytes.toString('base64'); // Convert to base64
    }
    return null;
  }

  // Only the channel owner and administrators can update the channel
  async updateChannel(channelId: number, updateChannelDto: UpdateChannelDto, currentUserId: number): Promise<Channel> {

    const channel = await this.channelRepository.findOne({ where: { id: channelId } });
    const currentUserMembershipDetail = await this.channelMembershipService.getMembershipByUserIdAndChannelId(currentUserId, channelId);

    if (!channel) {
      throw new NotFoundException('Channel not found.');
    }

    if (!currentUserMembershipDetail) {
      throw new NotFoundException('Channel membership not found.');
    }

    if (!this.isAuthorizedToUpdate(currentUserMembershipDetail)) {
      throw new ForbiddenException('You are not authorized to update this channel.');
    }

    // Update is_public and password based on the provided DTO
    if (updateChannelDto.is_public !== undefined || updateChannelDto.password !== undefined) {
      // If is_public is explicitly set in the DTO, update it
      if (updateChannelDto.is_public !== undefined) {
        channel.is_public = updateChannelDto.is_public;
      }

      // Update the password if provided
      if (updateChannelDto.password !== undefined && updateChannelDto.password !== null && updateChannelDto.password !== '') {
        const hashedPassword = await bcrypt.hash(updateChannelDto.password, 10); // Hash the provided password before storing it
        updateChannelDto.password = hashedPassword;
      } else {
        updateChannelDto.password = null;
      }

      // Generate a join token if the channel is private
      const joinToken = await this.generateJoinToken(channel);
      if (joinToken) {
        channel.joinToken = joinToken;
      }

    }
    // Update other properties of the channel
    Object.assign(channel, updateChannelDto);
    return await this.channelRepository.save(channel);
  }

  private isAuthorizedToUpdate(currentUserMembershipDetail): boolean {
    // Only the channel owner and administrators can update the channel

    if (currentUserMembershipDetail.role === UserRole.ChannelOwner || currentUserMembershipDetail.role === UserRole.Administrator) {
      return true;
    }
    return false;
  }


  // delete a channel and all its memberships if the current user is the channel owner
  async deleteChannel(channelId: number, userId: number): Promise<void> {
    const channel = await this.channelRepository.findOne({ where: { id: channelId } });
    const currentUserMembership = await this.channelMembershipService.getMembershipByUserIdAndChannelId(userId, channelId);

    if (!channel) {
      throw new NotFoundException('Channel not found.');
    }

    await this.channelMembershipService.deleteAllMembershipsByChannel(channelId);
    await this.channelRepository.remove(channel);
  }

  async findAllChannels(): Promise<Channel[]> {
    return this.channelRepository.find();
  }

  async findChannelById(channelId: number): Promise<Channel> {
    const channel = await this.channelRepository.findOne({ where: { id: channelId } });

    if (!channel) {
      throw new NotFoundException('Channel not found.');
    }
    return channel;
  }

  async findChannelByIdAndMemberships(channelId: number): Promise<Channel> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['memberships'], // Load the associated memberships
    });

    if (!channel) {
      throw new NotFoundException('Channel not found.');
    }

    return channel;
  }

  async findChannelsByName(name: string): Promise<Channel[]> {
    return this.channelRepository.find({ where: { name } });
  }


  async findUserById(userId: number): Promise<User> {
    return this.userService.findUserById(userId);
  }

  // private means it has no password but it is not public
  // protected means it has password and is_public
  // public means it has no password and is public

  async joinChannel(channelId: number, userId: number, token?: string, password?: string): Promise<void> {
    const channel = await this.findChannelById(channelId);

    if (!channel.is_public && token !== channel.joinToken) {
      throw new ForbiddenException('Invalid token for private channel.');
    }

    if (channel.is_public && channel.password) {
      if (!password) {
        throw new ForbiddenException('Password is required for a protected channel.');
      }

      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, channel.password);
      if (!passwordMatch) {
        throw new ForbiddenException('Incorrect password for protected channel.');
      }
    }

    const existingMembership = await this.channelMembershipService.getMembershipIdByUserIdAndChannelId(userId, channelId);
    if (!existingMembership) {
      const membershipDto: CreateChannelMembershipDto = {
        user_id: userId,
        channel_id: channelId,
        role: UserRole.Member,
        is_banned: false,
        is_muted: false,
      };
      await this.channelMembershipService.createMembership(membershipDto);
    }
  }

  async leaveChannel(channelId: number, userId: number): Promise<void> {
    // Get the user's membership by user ID and channel ID
    console.log('Leaving channel.');
    console.log('Channel ID: ' + channelId);
    console.log('User ID: ' + userId);
    const existingMembership = await this.channelMembershipService.getMembershipIdByUserIdAndChannelId(userId, channelId);

    if (existingMembership) {
      console.log('Deleting membership with user ID ' + userId);
      await this.channelMembershipService.deleteMembership(userId, userId, channelId);
    }
    else {
      console.log('Membership with user ID ' + userId + ' not found.');
    }
  }


  async getAllPublicChannels(): Promise<Channel[]> {
    return this.channelRepository.find({ where: { is_public: true } });
  }

  async getUsersAndPublicChannels(): Promise<{ users: User[], publicChannels: Channel[] }> {
    const users = await this.userService.findAll();
    const publicChannels = await this.channelRepository.find({ where: { is_public: true } });

    return { users, publicChannels };
  }

  async getChannelToken(channelId: number): Promise<string> {
    const channel = await this.channelRepository.findOne({ where: { id: channelId } });

    if (!channel) {
      throw new NotFoundException('Channel not found.');
    }

    if (!channel.is_public) {
      return channel.joinToken;
    }

    return null;
  }


  async getChannelMembers(channelId: number): Promise<User[]> {
    const channel = await this.findChannelById(channelId);

    if (channel.members) {
      return channel.members.map((membership) => membership.user);
    } else {
      console.log('Channel members are undefined.');
      return [];
    }
  }


}

