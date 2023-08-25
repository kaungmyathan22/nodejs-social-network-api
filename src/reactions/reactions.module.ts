import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from 'src/comments/comments.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PostModule } from 'src/post/post.module';
import { ReactionEntity } from './entities/reaction.entity';
import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReactionEntity]),
    CommentsModule,
    PostModule,
    NotificationsModule,
  ],
  controllers: [ReactionsController],
  providers: [ReactionsService],
})
export class ReactionsModule {}
