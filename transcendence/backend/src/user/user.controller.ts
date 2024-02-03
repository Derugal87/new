import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Body, 
    Param, 
    Patch,
    Header, 
    UseInterceptors 
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { JWTAuthGuard } from '../auth/jwt.strategy';
import { UseGuards } from '@nestjs/common';

@UseGuards(JWTAuthGuard)
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        ) {}

    @Get()
    async getAllUsers(): Promise<User[]> {
        return this.userService.findAll();
    }

    // @Post()
    // async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    //     return this.userService.createUser(createUserDto);
    // }
    
    // temporary post request for testing
    @Post()
    async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
      try {
        // Provide the required arguments here
        const accessToken = 'your-access-token'; 
        const refreshToken = 'your-refresh-token';
  
        const user = await this.userService.createUser(createUserDto, accessToken, refreshToken);
        return user;
      } catch (error) {
        throw error;
      }
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: number): Promise<void> {
      await this.userService.deleteUser(id);
    }

    @Put(':id_42') // to be removed
    async updateUser42(@Param('id_42') id_42: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.userService.updateUser42(id_42, updateUserDto);
    }

	@Put(':id')
    async updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.userService.updateUser(id, updateUserDto);
    }

    @Get(':id')
    async getUserInfo(@Param('id') id: number): Promise<Partial<User>> {
        console.log('inside of getUserInfo');
        try {
            const user = await this.userService.findUserById(id);
            // console.log('user: ', user);
            return user;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }

    @Get(':id/profile')
    async getUserProfile(@Param('id') id: number): Promise<Partial<User>> {
        return this.userService.getUserProfileInfo(id);
    }

	@Get(':id_42/profile42')
    async getUser42Profile(@Param('id_42') id_42: string): Promise<Partial<User>> {
        return this.userService.getUser42ProfileInfo(id_42);
    }

    @Get('nickname/:nickname')
    async getUserByNickname(@Param('nickname') nickname: string): Promise<User> {
        return this.userService.findByNickname(nickname);
    }

    // @Put(':id/enable-2fa')
    // async enableTwoFactorAuth(@Param('id') id: number): Promise<void> {
    //     return this.userService.enableTwoFactorAuth(id);
    // }

    // @Put(':id/disable-2fa')
    // async disableTwoFactorAuth(@Param('id') id: number): Promise<void> {
    //     return this.userService.disableTwoFactorAuth(id);
    // }

    // @Put(':id/set-2fa-secret')
    // async setTwoFactorAuthSecret(
    // @Param('id') id: number,
    // @Body('secret') secret: string,
    // ): Promise<void> {
    //     return this.userService.setTwoFactorAuthSecret(id, secret);
    // }

    @Get('/:userId/online-status')
    async getUserOnlineStatus(@Param('userId') userId: number): Promise<'online' | 'offline'> {
        const onlineStatus = await this.userService.getUserOnlineStatus(userId);
        return onlineStatus;
    }

    // @Get(':id/blocked-friends')
    // async getBlockedFriends(@Param('id') id: number): Promise<number[]> {
    //     return this.userService.getMyBlockedFriends(id);
    // }

    @Get(':id/blocked-friends')
    async getBlockedFriends(@Param('id') id: number): Promise<User[]> {
        return this.userService.getMyBlockedFriends(id);
    }

    // get user achievements
    @Get(':id/achievements')
    async getUserAchievements(@Param('id') id: number): Promise<string[]> {
        return this.userService.getUserAchievements(id);
    }

    // get user wins and losses
    @Get(':id/wins-losses')
    async getUserWinsLosses(@Param('id') id: number): Promise<{ wins: number, losses: number }> {
        return this.userService.getUserWinsLosses(id);
    }


}
