import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDirectMessageDto {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  sender_id: number;

  @IsNotEmpty()
  receiver_id: number;

  @IsOptional()
  link: boolean;
}
