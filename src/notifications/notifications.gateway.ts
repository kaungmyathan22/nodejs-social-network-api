import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
@WebSocketGateway()
export class NotificationsGateway {
  @WebSocketServer() server: Server;
  constructor(
    private readonly configService: ConfigService,
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UsersService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {} // private readonly userService: UsersService
  async handleConnection(client: Socket) {
    const { token } = client.handshake.auth;
    if (!token) {
      client.disconnect();
      return;
    }
    const cacheKey = this.configService.get(
      EnvironmentConstants.USER_TOKEN_CACHE_KEY,
    );
    const payload = await this.authenticationService.verifyToken(token);
    if (!payload) {
      client.disconnect();
      return;
    }
    const token_from_cache = await this.cacheService.get(
      `${cacheKey}:${payload.id}`,
    );
    if (token_from_cache && token_from_cache === token) {
      const user = await this.userService.findOne(payload.id);
      if (!user) {
        return client.disconnect();
      }
      client.data.user = user;
      return;
    }
    return client.disconnect();
  }

  @SubscribeMessage('subscribe-notifications')
  handleMessage(client: Socket) {
    const user = client.data.user;
    const roomName = `new_notiications:${user.id}`;
    client.join(roomName);
  }
  sendNewNotificationToUser(user: UserEntity, message: string) {
    const roomName = `new_notiications:${user.id}`;
    this.server.to(roomName).emit('new_notiications', message);
  }
}
