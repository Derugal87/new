import { IsNotEmpty, IsBoolean, IsOptional, Validate } from 'class-validator';
import { UserRole } from '../../user/user-role.enum';
import { IsEnum } from 'class-validator';
import { IsString } from 'class-validator';

export class CreateChannelMembershipDto {
  @IsNotEmpty()
  user_id: number;

  @IsNotEmpty()
  channel_id: number;

  @IsBoolean()
  @IsOptional()
  is_banned: boolean = false;

  @IsBoolean()
  @IsOptional()
  is_muted: boolean = false;

  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole;

  @IsString()
  @IsOptional()
  avatar?: string;
}
