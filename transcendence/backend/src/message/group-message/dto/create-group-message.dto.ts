import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateGroupMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsOptional()
  link: boolean;
}