import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelMembershipDto } from './create-channel-membership.dto';

export class UpdateChannelMembershipDto extends PartialType(CreateChannelMembershipDto) {}
