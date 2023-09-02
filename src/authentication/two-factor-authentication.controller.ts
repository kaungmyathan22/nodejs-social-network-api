import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthenticationService } from './authentication.service';
import { TurnOnTwoFactorAuthenticationDto } from './dto/turnOnTwoFactorAuthentication.dto';
import JwtAuthenticationGuard from './guards/jwt.guard';
import TwoFactorAuthenticateGuard from './guards/two-factor-authenticate.guard';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

@Controller('api/v1/authentication/2fa/')
export class TwoFactorAuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UsersService,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
  ) {}

  @Post('generate')
  @UseGuards(JwtAuthenticationGuard)
  async generateTwoFactorAuthImage(@Res() response, @Req() request: Request) {
    const { otpauthUrl } =
      await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
        request.user as UserEntity,
      );

    return this.twoFactorAuthenticationService.pipeQrCodeStream(
      response,
      otpauthUrl,
    );
  }

  @Post('enable')
  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  async enableTwoFactorAuthentication(
    @Req() request: Request,
    @Body() { twoFactorAuthenticationCode }: TurnOnTwoFactorAuthenticationDto,
  ) {
    const loggedInUser = request.user as UserEntity;
    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        loggedInUser,
      );
    if (loggedInUser.isTwoFactorEnabled) {
      throw new ForbiddenException(
        'Already enabled two factor authentication for this account.',
      );
    }
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    await this.userService.turnOnTwoFactorAuthentication(loggedInUser.id);
    return {
      message: 'Successfully enabled two factor authentication.',
    };
  }

  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(TwoFactorAuthenticateGuard)
  async authenticate(
    @Req() request: Request,
    @Body() { twoFactorAuthenticationCode }: TurnOnTwoFactorAuthenticationDto,
  ) {
    const loggedInUser = request.user as UserEntity;
    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        loggedInUser,
      );
    console.log(isCodeValid);
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    const access_token = this.authenticationService.getAccessToken(
      loggedInUser,
      true,
    );
    request.res.setHeader('Set-Cookie', [
      this.authenticationService.getCookieWithJwtToken(access_token),
    ]);
    return {
      message: 'Successfully logged In.',
      access_token,
    };
  }
}
