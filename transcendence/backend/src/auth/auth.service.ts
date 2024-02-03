import { Injectable, Inject, forwardRef, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
// import MockStrategy from 'passport-mock-strategy';
import * as OTPAuth from "otpauth";
import { encode } from "hi-base32";
import * as crypto from 'crypto';
import { decode } from "hi-base32";
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { TwoFactorAuthDto } from '../user/dto/two-factor-auth.dto';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class AuthService extends PassportStrategy(Strategy, '42') {
	constructor(
		@Inject(forwardRef(() => UserService))
		private userService: UserService,
		private jwtService: JwtService) {
		super({
			clientID: "u-s4t2ud-3e87daa88c2442223fb3b7ff161b496919a4b11713d57479f26734ef630d453d", // from your environment or config
			clientSecret: "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", // from your environment or config
			callbackURL: 'http://localhost:4000/auth/42/callback', // To be replaced with actual callback URL
			// Also specify any needed profile fields, refer to passport-42 documentation for more information
			profileFields: {
				'id': (obj) => String(obj.id),
				// ... other fields
			},
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
		// const user = await this.userService.createUser(profile, accessToken, refreshToken);
		// return user;
			console.log('inside of auth validate');
			const { user, isNew } = await this.userService.findOrCreateUser(profile, accessToken, refreshToken);
			return { user, isNew };
	}

	  // enable 2FA
	  async enable2FA(twoFactorAuthDto: TwoFactorAuthDto): Promise<{otpSecret: string, otpUrl: string}> {
		const otpSecret = this.generateRandomSecretKey();
		const otpUrl = this.generateOtpUrl(twoFactorAuthDto.nickname, otpSecret);
		
		// Create a new user object with the 2FA data
		const updatedDto: TwoFactorAuthDto = {
		  ...twoFactorAuthDto,
		  two_factor_auth_secret: encode(otpSecret),
		  two_factor_auth_enabled: true,
		  two_factor_auth_url: otpUrl,
		};
	
		// Update the user with the 2FA data
		await this.userService.updateUser(updatedDto.id, updatedDto);
		return { otpSecret, otpUrl };
	  }
	
	  private generateRandomSecretKey(): string {
		const buffer = crypto.randomBytes(15);
		const base32 = encode(buffer).replace(/=/g, '').substring(0, 24);
		return base32;
	  }
	
	  private generateOtpUrl(nickname: string, secret: string): string {
		const otpauth = new OTPAuth.TOTP({
		  issuer: 'Transcendence',
		  label: nickname,
		  algorithm: 'SHA1',
		  digits: 6,
		  secret,
		});
	
		return otpauth.toString();
	  }

	  async verify2FA(
		userId: number,
		token: string,
	): Promise<boolean> {
		try {

		const user = await this.userService.findUserById(userId);

		console.log(`user.two_factor_auth_secret: ${user.two_factor_auth_secret}`)
		console.log(`token: ${token}`)

		if (!user.two_factor_auth_enabled || !user.two_factor_auth_secret) {
			return false;
		}

		let totp = new OTPAuth.TOTP({
			issuer: 'Transcendence',
			label: user.nickname,
			algorithm: 'SHA1',
			digits: 6,
			secret: decode(user.two_factor_auth_secret!),
		});

		let delta = totp.validate({ token, window: 1 });
		console.log(`delta: ${delta}`)

		return delta === 0;

		} catch (error) {
		console.error('Error during OTP verification:', error);
		return false;
		}
	}

		async disable2FA(twoFactorAuthDto: TwoFactorAuthDto): Promise<void> {
			// Create a new user object with 2FA disabled and clear 2FA-related fields
			const updatedDto: TwoFactorAuthDto = {
			...twoFactorAuthDto,
			two_factor_auth_enabled: false,
			two_factor_auth_secret: null,
			two_factor_auth_url: null,
			};

			// Update the user with the updated 2FA data
			await this.userService.updateUser(updatedDto.id, updatedDto);
		}

		async get2FAStatus(userId: number): Promise<{ two_factor_auth_enabled: boolean }> {
			try {
				const user = await this.userService.findUserById(userId);
				return { two_factor_auth_enabled: user.two_factor_auth_enabled };
			}
			catch (error) {
				return { two_factor_auth_enabled: false };
			}
		}

		async login(userId: number) {
			const payload = { Id: userId };
			return {
				// also specify key and expiration time in sign method
				access_token: this.jwtService.sign(payload, { expiresIn: "15m" }) // temporarily 1d
			};
		}

		async generateRefreshToken(userId: number): Promise<string> {
			const payload = { Id: userId };
			return this.jwtService.sign(payload, { expiresIn: '7d' });
		}

		async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
			try {
				const payload = this.jwtService.verify(refreshToken);  // Validate refresh token
				const newAccessToken = this.jwtService.sign({ Id: payload.Id }, { expiresIn: '15m'});  // Generate new access token
				return { accessToken: newAccessToken };
			}
			catch	{
				return { accessToken: null };
			}
		}

		async findUserById(userId: number): Promise<User> {
			try {
				return await this.userService.findUserById(userId);
			}
			catch {
				throw new UnauthorizedException();
			}
		}
		

}


// This is the mock strategy for testing purposes
// It may mess up the database, so use it with caution
// @Injectable()
// export class AuthService extends PassportStrategy(process.env.NODE_ENV === 'test' ? MockStrategy : Strategy, process.env.NODE_ENV === 'test' ? '42-mock' : '42') {
// 	constructor(private userService: UserService) {
// 		super({
// 			passReqToCallback: true,
// 			...(process.env.NODE_ENV === 'test'
// 				? {
// 					name: '42-mock',
// 					user: null, // We'll set this dynamically
// 				}
// 				: {
// 					clientID: "u-s4t2ud-1ed2676b8b22dabc9a00b9311e97f26cb8a69ddf8749f87de39944568280b31d", // Your original clientID
// 					clientSecret: "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", // Your original clientSecret
// 					callbackURL: 'http://localhost:4000/auth/42/callback',
// 					profileFields: {
// 						'id': (obj) => String(obj.id),
// 						// ... other fields
// 					},
// 				})
// 		});
// 	}

// 	getRandomInt(min, max) {
// 		min = Math.ceil(min);
// 		max = Math.floor(max);
// 		return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
// 	}

// 	async validate(req, accessToken: string, refreshToken: string, profile: any): Promise<any> {
// 		if (process.env.NODE_ENV === 'test') {
// 			console.log("Test mode");
// 			let testProfile = {
// 				user: {
// 					id: this.getRandomInt(1, 1000000),
// 					name: 'User 1',
// 					accessToken: 'token1',
// 					refreshToken: 'refresh1'
// 				}
// 			};
// 			console.log(testProfile);
// 			const { user, isNew } = await this.userService.findOrCreateUser(testProfile.user, testProfile.user.accessToken, testProfile.user.refreshToken);
// 			return { user, isNew };
// 		}
// 		else {
// 			const { user, isNew } = await this.userService.findOrCreateUser(profile, accessToken, refreshToken);
// 			return { user, isNew };

// 		}
// 	}
// }
