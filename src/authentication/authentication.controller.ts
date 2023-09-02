import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthenticationService } from './authentication.service';
import { RegisterDTO } from './dto/register.dto';
import JwtRefreshAuthenticationGuard from './guards/jwt-refresh.guard';
import JwtAuthenticationGuard from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local.guard';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

@Controller('api/v1/authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UsersService,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() payload: RegisterDTO) {
    return this.authenticationService.register(payload);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request) {
    const result = await this.authenticationService.login(
      req.user as UserEntity,
    );
    req.res.setHeader('Set-Cookie', [
      this.authenticationService.getCookieWithJwtToken(result.access_token),
      this.authenticationService.getCookieWithJwtRefreshToken(
        result.refresh_token,
      ),
    ]);
    return result;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logOut(@Req() req: Request) {
    req.res.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookieForLogOut(),
    );
    this.authenticationService.logout(req.user as UserEntity);
    return { success: true };
  }

  @UseGuards(JwtRefreshAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  @Get('refresh')
  async refresh(@Req() req: Request) {
    const access_token = this.authenticationService.getAccessToken(
      req.user as UserEntity,
    );
    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtToken(access_token);

    req.res.setHeader('Set-Cookie', accessTokenCookie);
    return { access_token };
  }
}
