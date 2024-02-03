// import { Controller, Get, UseGuards, Redirect, Req, Res, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User } from '../user/user.entity';
import { Body, UnauthorizedException } from '@nestjs/common';
import { TwoFactorAuthDto } from '../user/dto/two-factor-auth.dto';
import { ParseIntPipe } from '@nestjs/common';
import { Controller, Get, UseGuards, Req, Res, Post, HttpStatus, HttpException } from '@nestjs/common';
import { JWTAuthGuard } from './jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @Get('42')
  @UseGuards(AuthGuard('42'))
  authenticate42() {
    // This route is handled by the passport-42 internally
  }

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  // @UseGuards(AuthGuard('jwt')) // use this on rest api routes, (not here)
  // @UseGuards(AuthGuard('42-mock'))
  async auth42Callback(@Req() req, @Res() res) {
    // Handle post-authentication here if necessary

    // if (req.user && req.user.user.two_factor_auth_enabled) {
    // 	// Redirect to a custom 2FA verification page with necessary query parameters
    // 	const redirectUrlFor2FA = `http://localhost:3000/verify-2fa?id=${userId}&isNew=${isNew}`;
    // 	return res.redirect(redirectUrlFor2FA);
    // }

    // Prepare the base redirect URL
    const baseRedirectUrl = 'http://localhost:3000/';
    // If req.user and req.isNew are present, add them as query parameters
    if (req.user) {
      // console.log(req.user);
      const userId_42 = req.user.user.id_42 || '';  // to be removed
      const userId = req.user.user.id || '';
      const isNew = req.user.isNew;
      let redirectUrl = baseRedirectUrl;

      if (req.user.user.two_factor_auth_enabled)
        redirectUrl += `validate-2fa?id=${userId}&isNew=${isNew}`;
      else {
        // log userId
        console.log(`userId: ${userId}`);
        const jwtToken = await this.authService.login(userId); // add this also to 2fa verify function
        const refreshToken = await this.authService.generateRefreshToken(userId);
        // print jwtToken as a string
        console.log(`jwtToken: ${jwtToken}`);
        console.log(`jwtToken: ${jwtToken.toString()}`);
        console.log(`jwtToken: ${jwtToken.access_token}`);

        redirectUrl += `home?token=${jwtToken.access_token}&id_42=${userId_42}&isNew=${isNew}&id=${userId}&refreshToken=${refreshToken}`;
      }

      return res.redirect(redirectUrl);

    } else {
      // console.log('No user found in req.user');
      return res.redirect(baseRedirectUrl);
    }
  }
  // @Post('enable-2fa')
  // async enable2FA(@Body() twoFactorAuthDto: TwoFactorAuthDto) {
  //   // Call authService.enable2FA with the 2FA DTO
  //   await this.authService.enable2FA(twoFactorAuthDto);
  //   return { message: '2FA enabled successfully' };
  // }
  @Post('enable-2fa')
  @UseGuards(JWTAuthGuard)
  async enable2FA(@Body() twoFactorAuthDto: TwoFactorAuthDto) {
    // Call authService.enable2FA with the 2FA DTO and capture the returned values
    const { otpSecret, otpUrl } = await this.authService.enable2FA(twoFactorAuthDto);

    // Return the message along with two_factor_auth_secret and two_factor_auth_url
    return {
      message: '2FA enabled successfully',
      two_factor_auth_secret: otpSecret,
      two_factor_auth_url: otpUrl
    };
  }


  @Post('disable-2fa')
  @UseGuards(JWTAuthGuard)
  async disable2FA(@Body() twoFactorAuthDto: TwoFactorAuthDto) {
    // Call authService.disable2FA with the 2FA DTO
    await this.authService.disable2FA(twoFactorAuthDto);
    return { message: '2FA disabled successfully' };
  }

  @Get('get-2fa-status')
  @UseGuards(JWTAuthGuard) // This will automatically use your JwtStrategy
  async get2FAStatus(@Req() req) {
    // Call authService.get2FAStatus with the user ID
    // get user id from jwt token
    // console.log("inside get-2fa-status");
    const user = req.user;
    const userId = user.Id;
    const { two_factor_auth_enabled } = await this.authService.get2FAStatus(userId);
    return { two_factor_auth_enabled };
  }

  @Post('verify-2fa')
  async verify2FA(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('otpCode') otpCode: string
  ) {
    // Call authService.verify2FA with the 2FA DTO and OTP code
    console.log(`userId: ${userId}`);
    console.log(`otpCode: ${otpCode}`);
    const isVerified = await this.authService.verify2FA(
      userId,
      otpCode,
    );
    if (isVerified) {
      // log userId
      console.log(`userId: ${userId}`);
      const jwtToken = await this.authService.login(userId);
      const refresh_token = await this.authService.generateRefreshToken(userId);
      console.log('refreshToken: ' + refresh_token);

      return { message: 'OTP code is valid', token: jwtToken, refresh_token };
    } else {
      return { message: 'OTP code is invalid' };
    }
  }


  @Post('verify-2fa-first')
  async verify2FAFirst(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('otpCode') otpCode: string
  ) {
    // Call authService.verify2FA with the 2FA DTO and OTP code
    console.log(`userId: ${userId}`);
    console.log(`otpCode: ${otpCode}`);
    const isVerified = await this.authService.verify2FA(
      userId,
      otpCode,
    );
    if (isVerified) {
      // log userId
      console.log(`userId: ${userId}`);
      return { message: 'OTP code is valid' };
    } else {
      return { message: 'OTP code is invalid' };
    }
  }

  @Get('validate-token')
  @UseGuards(JWTAuthGuard) // This will automatically use your JwtStrategy
  async validateToken(@Req() req) {
    try {
      // If this point is reached, the token is valid
      const user = req.user; // The payload from the JWT token (e.g., userId, username) should be available here
      // check if user is in database
      const user_db = await this.authService.findUserById(user.userId);

      // You can add additional checks or logic here if needed
      return {
        statusCode: HttpStatus.OK,
        message: 'Token is valid',
        user,
      };
    } catch (error) {
      // If any error occurs (which should be caught by the AuthGuard if the token is invalid)
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('refresh')
    async refresh(@Body('refreshToken') refreshToken: string): Promise<{ accessToken: string }> {
        const access_token = this.authService.refreshToken(refreshToken);
        if (!access_token) {
            // return  error
            throw new UnauthorizedException('Invalid token');
        }
        return access_token;
    }
}

