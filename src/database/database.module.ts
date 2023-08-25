import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from 'src/authentication/entities/token.entity';
import { CommentEntity } from 'src/comments/entities/comment.entity';
import { FriendRequestEntity } from 'src/friends/entities/friend-request.entity';
import { NotificationEntity } from 'src/notifications/entities/notification.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';
import { StorageEntity } from 'src/storage/entities/storage.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        database: configService.get('POSTGRES_DB'),
        entities: [
          UserEntity,
          RefreshTokenEntity,
          PostEntity,
          StorageEntity,
          CommentEntity,
          FriendRequestEntity,
          ReactionEntity,
          NotificationEntity,
        ],
        synchronize: configService.get('SYNCHONRIZE'),
      }),
    }),
  ],
})
export class DatabaseModule {}
