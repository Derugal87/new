import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';  // assuming you also have a UserService for your authentication
import { UserModule } from '../user/user.module';  // assuming you also have a UserModule for your authentication
import { AuthService } from './auth.service';  // <-- Important for authentication
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { HttpModule } from '@nestjs/axios';  // <-- Important for authentication
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { MatchModule } from '../match/match.module';

@Module({
	imports: [PassportModule, forwardRef(() => UserModule), TypeOrmModule.forFeature([User]), HttpModule,
		JwtModule.register({
			global: true,
			secret: '3uaPAFccrYp2AAkT6vyaPMpdyvq', // Use the same key as in JwtStrategy
			signOptions: { expiresIn: '7d' },
		}),
		forwardRef(()=> MatchModule),],
	controllers: [AuthController], // <-- Here's where you include the AuthController
	providers: [AuthService, UserService, JwtStrategy],  // and other services or providers you might need
	exports: [],
})
export class AuthModule { }

// Move all secrets to environment variables
