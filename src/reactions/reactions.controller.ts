import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import JwtAuthenticationGuard from 'src/authentication/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ParseIntPipe } from 'src/common/pipes/parseInt.pipe';
import { UserEntity } from 'src/users/entities/user.entity';
import { ReactCommentDto } from './dto/react-comment.dto';
import { ReactionEntity } from './entities/reaction.entity';
import { ReactionsService } from './reactions.service';

@Controller('api/v1/reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @UseGuards(JwtAuthenticationGuard)
  @Post('/comment/:commentId')
  reactComment(
    @Body() payload: ReactCommentDto,
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.reactionsService.reactComment(user, payload, commentId);
  }

  @Get('posts/:postId')
  async getReactionsForPost(
    @Param('postId') postId: number,
  ): Promise<ReactionEntity[]> {
    return this.reactionsService.getReactionsForPost(postId);
  }

  @Get('comments/:commentId')
  async getReactionsForComment(
    @Param('commentId') commentId: number,
  ): Promise<ReactionEntity[]> {
    return this.reactionsService.getReactionsForComment(commentId);
  }

  @Delete(':id')
  async deleteReaction(
    @Param('id') reactionId: number,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    return this.reactionsService.deleteReaction(user, reactionId);
  }
}
