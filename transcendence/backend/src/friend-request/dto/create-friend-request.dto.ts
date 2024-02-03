import { IsNumber } from 'class-validator';

export class CreateFriendRequestDto {
  @IsNumber()
  senderId: number;

  @IsNumber()
  receiverId: number;
}