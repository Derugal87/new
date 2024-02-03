import { User } from '../../user/user.entity';

export class FriendRequestResponseDto {
    id: number;
    status: string;
    user: User; // Only include the user details
  }
  