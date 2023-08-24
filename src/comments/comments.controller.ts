import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import JwtAuthenticationGuard from 'src/authentication/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { MyPaginationQueryParamsDto } from 'src/common/dto/pagination.dto';
import { ParseIntPipe } from 'src/common/pipes/parseInt.pipe';
import { UserEntity } from 'src/users/entities/user.entity';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@UseGuards(JwtAuthenticationGuard)
@Controller('api/v1/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.commentsService.create(user, createCommentDto);
  }

  @Get('my-comments')
  myComments(
    @Query(new ValidationPipe({ transform: true }))
    query: MyPaginationQueryParamsDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.commentsService.myComments(query, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.commentsService.update(+id, updateCommentDto, user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.commentsService.remove(id, user);
  }
}
