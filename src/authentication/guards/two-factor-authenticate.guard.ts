import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export default class TwoFactorAuthenticateGuard extends AuthGuard(
  'jwt-two-factor-authenticate',
) {}
