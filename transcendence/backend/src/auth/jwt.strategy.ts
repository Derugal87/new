import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { TokenExpiredError } from 'jsonwebtoken';
import { Inject, forwardRef } from '@nestjs/common';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '3uaPAFccrYp2AAkT6vyaPMpdyvq', // Use a strong secret key
    });
  }

  async validate(payload: any) {
    try {
      // Your validation logic here
      // log payload
      // console.log(`payload: ${JSON.stringify(payload)}`);
      // check if user exists in db
      const user = await this.userService.findUserById(payload.Id);
      return { userId: payload.Id };
    } catch (error) {
      this.logger.error(`Error validating JWT token: ${error.message}`);
      throw new UnauthorizedException('Unauthorized');
    }
  }
}


import { AuthGuard } from '@nestjs/passport';

export class JWTAuthGuard extends AuthGuard('jwt') {
  private logger = new Logger('Auth');

  handleRequest(err, user, info, context) {
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        // Handle expired token error specifically
        this.logger.error('Authentication Failed: jwt expired');
        throw new UnauthorizedException('Token expired');
      } else {
        // Handle other authentication errors
        this.logger.error(`Authentication Failed: ${info?.message || err?.message}`);
        throw new UnauthorizedException('Authentication failed');
      }
    }
    return user;
  }
}