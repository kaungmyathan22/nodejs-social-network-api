import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MyPaginationQueryParamsDto } from 'src/common/dto/pagination.dto';
import { PostService } from 'src/post/post.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentEntity } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    private readonly postService: PostService,
  ) {}

  async findAll(
    page: number,
    pageSize: number,
    options?: FindManyOptions<CommentEntity>,
  ) {
    const skip = (page - 1) * pageSize;
    const [data, totalItems] = await this.commentRepository.findAndCount({
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

  async create(user: UserEntity, { content, postId }: CreateCommentDto) {
    const post = await this.postService.findOneOrFail({
      where: { id: postId },
    });
    for (let index = 0; index < 100; index++) {
      const commentInstance = this.commentRepository.create({
        author: user,
        post,
        content: `${content} ${index}`,
      });
      await this.commentRepository.save(commentInstance);
    }
    return { success: true };
  }

  async findOneOrFail(
    options: FindOneOptions<CommentEntity>,
    message?: string,
  ) {
    const comment = await this.commentRepository.findOne(options);
    if (!comment) {
      throw new NotFoundException(
        message || 'The comment you are looking for is not found.',
      );
    }
    return comment;
  }

  async update(id: number, { content }: UpdateCommentDto, user: UserEntity) {
    const comment = await this.findOneOrFail({
      where: { id, author: { id: user.id } },
    });
    comment.content = content;
    return this.commentRepository.save(comment);
  }

  async remove(commentId: number, user: UserEntity) {
    const comment = await this.findOneOrFail({
      where: { id: commentId, author: { id: user.id } },
    });
    return this.commentRepository.remove(comment);
  }

  async myComments(
    { page, pageSize }: MyPaginationQueryParamsDto,
    user: UserEntity,
  ) {
    return this.findAll(page, pageSize, { where: { author: { id: user.id } } });
  }
}
