import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as redisStore from 'cache-manager-redis-store';
import * as joi from 'joi';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { CommentsModule } from './comments/comments.module';
import { CookieMiddleware } from './common/middlewares/cookie.middleware';
import { DatabaseModule } from './database/database.module';
import { FriendsModule } from './friends/friends.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PostModule } from './post/post.module';
import { ReactionsModule } from './reactions/reactions.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: joi.object({
        POSTGRES_USER: joi.string().required(),
        POSTGRES_PASSWORD: joi.string().required(),
        POSTGRES_DB: joi.string().required(),
        PORT: joi.string().required(),
        POSTGRES_HOST: joi.string().required(),
        POSTGRES_PORT: joi.string().required(),
        SYNCHONRIZE: joi.boolean().required(),
        JWT_SECRET: joi.string().required(),
        JWT_EXPIRES_IN: joi.number().required(),
        JWT_REFRESH_SECRET: joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: joi.number().required(),
        REDIS_HOST: joi.string().required(),
        USER_TOKEN_CACHE_KEY: joi.string().required(),
        COOKIE_JWT_KEY: joi.string().required(),
        COOKIE_REFRESH_JWT_KEY: joi.string().required(),
        REDIS_PORT: joi.number().required(),
        UPLOAD_PATHS: joi.string().required(),
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    UsersModule,
    AuthenticationModule,
    DatabaseModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
      }),
    }),
    PostModule,
    StorageModule,
    CommentsModule,
    ReactionsModule,
    NotificationsModule,
    FriendsModule,
    MetricsModule,
  ],
  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookieMiddleware).forRoutes('*');
  }
}
