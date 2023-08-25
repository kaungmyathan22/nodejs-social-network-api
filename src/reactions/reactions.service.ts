import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsService } from 'src/comments/comments.service';
import { PaginationQueryParamsDto } from 'src/common/dto/pagination.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PostService } from 'src/post/post.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { ReactCommentDto } from './dto/react-comment.dto';
import { ReactionEntity } from './entities/reaction.entity';

@Injectable()
export class ReactionsService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly commentService: CommentsService,
    private readonly postService: PostService,
    @InjectRepository(ReactionEntity)
    private readonly reactionRespository: Repository<ReactionEntity>,
  ) {}

  async findAll(
    page: number,
    pageSize: number,
    options?: FindManyOptions<ReactionEntity>,
  ) {
    const skip = (page - 1) * pageSize;

    const [data, totalItems] = await this.reactionRespository.findAndCount({
      ...options,
      take: pageSize,
      skip,
    });
    const totalPages = Math.ceil(totalItems / pageSize);
    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;
    return {
      page,
      pageSize,
      totalItems,
      totalPages,
      nextPage,
      previousPage,
      data,
    };
  }
  myReaction(user: UserEntity, { page, pageSize }: PaginationQueryParamsDto) {
    return this.findAll(page, pageSize, {
      where: { user: { id: user.id } },
      relations: { comment: true, post: true },
    });
  }

  async deleteReaction(user: UserEntity, reactionId: number): Promise<void> {
    const reaction = await this.reactionRespository.findOne({
      where: { id: reactionId, user: { id: user.id } },
    });
    if (!reaction) {
      throw new NotFoundException('Reaction not found.');
    }
    await this.reactionRespository.remove(reaction);
  }

  async getReactionsForComment(commentId: number): Promise<ReactionEntity[]> {
    const reactions = await this.reactionRespository.find({
      where: { comment: { id: commentId } },
    });
    return reactions;
  }

  async getReactionsForPost(postId: number): Promise<ReactionEntity[]> {
    const reactions = await this.reactionRespository.find({
      where: { post: { id: postId } },
    });
    return reactions;
  }

  async reactComment(
    user: UserEntity,
    { reactionType }: ReactCommentDto,
    commentId: number,
  ) {
    const comment = await this.commentService.findOneOrFail(
      { where: { id: commentId } },
      'Comment not found.',
    );
    const reactionInstance = await this.reactionRespository.findOne({
      where: { comment: { id: comment.id } },
    });
    if (!reactionInstance) {
      // create reaction
      const createdReactInstance = this.reactionRespository.create({
        reactionType,
        user,
        comment,
      });
      await this.notificationsService.create({
        user,
        action: `${user.email} reacted to your comment`,
      });
      const result = await this.reactionRespository.save(createdReactInstance);
      delete result.comment;
      delete result.user;
      return {
        ...result,
        type: 'created',
      };
    }
    if (reactionInstance.reactionType === reactionType) {
      // remove reaction
      const response = {
        id: reactionInstance.id,
        reactionType: reactionInstance.reactionType,
        type: 'removed',
      };
      await this.reactionRespository.remove(reactionInstance);
      return response;
    }
    reactionInstance.reactionType = reactionType;
    const result = await this.reactionRespository.save(reactionInstance);
    return {
      ...result,
      type: 'updated',
    };
  }

  async reactPost(
    user: UserEntity,
    { reactionType }: ReactCommentDto,
    postId: number,
  ) {
    const post = await this.postService.findOneOrFail(
      { where: { id: postId } },
      'Post not found.',
    );
    const reactionInstance = await this.reactionRespository.findOne({
      where: { post: { id: post.id } },
    });
    if (!reactionInstance) {
      // create reaction
      const createdReactInstance = this.reactionRespository.create({
        reactionType,
        user,
        post: post,
      });
      const result = await this.reactionRespository.save(createdReactInstance);
      await this.notificationsService.create({
        user,
        action: `${user.email} reacted to your post`,
      });

      delete result.post;
      delete result.user;
      return {
        ...result,
        type: 'created',
      };
    }
    if (reactionInstance.reactionType === reactionType) {
      // remove reaction
      const response = {
        id: reactionInstance.id,
        reactionType: reactionInstance.reactionType,
        type: 'removed',
      };
      await this.reactionRespository.remove(reactionInstance);
      return response;
    }
    reactionInstance.reactionType = reactionType;
    const result = await this.reactionRespository.save(reactionInstance);
    return {
      ...result,
      type: 'updated',
    };
  }
}
