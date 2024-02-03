import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsInt()
  senderId: number;

  @IsInt()
  receiverId: number;

  @IsInt()
  @IsOptional()
  channelId?: number;

  @IsString()
  type: string;
}
