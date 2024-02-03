import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMessage } from './group-message.entity';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';
import { UserService } from '../../user/user.service';
import { ChannelService } from '../../channel/channel.service';
import { UnauthorizedException } from '@nestjs/common';
import { ChannelMembershipService } from '../../channel-membership/channel-membership.service';
import { FindManyOptions } from 'typeorm';
import { CreateNotificationDto } from '../../notification/dto/create-notification.dto';
import { NotificationService } from '../../notification/notification.service';

const MESSAGES_PER_PAGE = 10;

@Injectable()
export class GroupMessageService {
    constructor(
        @InjectRepository(GroupMessage)
        private readonly messageRepository: Repository<GroupMessage>,
        private readonly userService: UserService,
        private readonly channelService: ChannelService,
        private readonly channelMembershipService: ChannelMembershipService,
        private readonly notificationService: NotificationService,
    ) { }

    async getAllGroupMessages(channelId: number, userId: number): Promise<GroupMessage[]> {
        try {
            const user = await this.userService.findUserById(userId);
            const channel = await this.channelService.findChannelById(channelId);

            if (!user || !channel) {
                throw new NotFoundException('User or Channel not found');
            }

            const membership = await this.channelMembershipService.getMembershipByUserAndChannel(user.id, channel.id);
            if (!membership) {
                throw new UnauthorizedException('User is not a member of the channel');
            }

            if (membership.is_banned) {
                throw new UnauthorizedException('User is banned and cannot send or receive messages');
            }

            const findOptions: FindManyOptions<GroupMessage> = {
                where: { channel: { id: channelId } },
                relations: ['user'],
            };

            const messages = await this.messageRepository.find(findOptions);
            return messages;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    // a user that is not a member of the channel can't send messages
    // a user that is banned cannot send or recieve messages
    // a user that is muted cannot send messages but can recieve them

    // send a notification to each user in the channel except the sender
    async createGroupMessage(dto: CreateGroupMessageDto): Promise<GroupMessage> {
        try {
            const user = await this.userService.findUserById(dto.userId);
            const channel = await this.channelService.findChannelById(dto.channelId);

            if (!user || !channel) {
                throw new NotFoundException('User or Channel not found');
            }

            const membership = await this.channelMembershipService.getMembershipByUserAndChannel(user.id, channel.id);
            if (!membership) {
                throw new UnauthorizedException('User is not a member of the channel');
            }

            if (membership.is_banned) {
                throw new UnauthorizedException('User is banned and cannot send messages');
            }

            if (membership.is_muted) {
                throw new UnauthorizedException('User is muted and cannot send messages');
            }

            const message = new GroupMessage();
            message.content = dto.content;
            message.user = user;
            message.channel = channel;
            message.link = dto.link;

            const savedMessage = await this.messageRepository.save(message);

            // Send notification to all users in the channel except the sender
            const channelMembers = await this.channelMembershipService.getAllMembersOfChannel(channel.id);
            const senderId = user.id;

            for (const member of channelMembers) {
                if (member.user.id !== senderId) {
                    const notificationDto: CreateNotificationDto = {
                        senderId: senderId,
                        receiverId: member.user.id,
                        channelId: channel.id,
                        type: 'group-message',
                    };
                    await this.notificationService.createNotification(notificationDto);
                }
            }
            return savedMessage;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getGroupMessagesWithPagination(channelId: number, userId: number, page: number = 1): Promise<GroupMessage[]> {
        try {
            const user = await this.userService.findUserById(userId);
            const channel = await this.channelService.findChannelById(channelId);

            if (!user || !channel) {
                throw new NotFoundException('User or Channel not found');
            }

            const membership = await this.channelMembershipService.getMembershipByUserAndChannel(user.id, channel.id);
            if (!membership) {
                throw new UnauthorizedException('User is not a member of the channel');
            }

            if (membership.is_banned) {
                throw new UnauthorizedException('User is banned and cannot send or receive messages');
            }

            // Calculate the offset based on the current page and the number of messages per page
            const offset = (page - 1) * MESSAGES_PER_PAGE;

            const findOptions: FindManyOptions<GroupMessage> = {
                where: { channel: { id: channelId } },
                relations: ['user'], // Include user relation if needed
                order: { created_at: 'DESC' }, // Adjust the ordering as needed
                skip: offset,
                take: MESSAGES_PER_PAGE, // Limit the number of messages per page
            };

            const messages = await this.messageRepository.find(findOptions);
            return messages;
        } catch (error) {
            console.log(error);
            return [];
        }
    }
}
