import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsService } from 'src/comments/comments.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { ReactCommentDto } from './dto/react-comment.dto';
import { ReactionEntity } from './entities/reaction.entity';

@Injectable()
export class ReactionsService {
  constructor(
    private readonly commentService: CommentsService,
    @InjectRepository(ReactionEntity)
    private readonly reactionRespository: Repository<ReactionEntity>,
  ) {}

  deleteReaction(user: UserEntity, reactionId: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getReactionsForComment(commentId: number): Promise<ReactionEntity[]> {
    const reactions = await this.reactionRespository.find({
      where: { comment: { id: commentId } },
    });
    return reactions;
  }
  getReactionsForPost(postId: number): Promise<ReactionEntity[]> {
    throw new Error('Method not implemented.');
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
}
