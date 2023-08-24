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
import {
  MyPaginationQueryParamsDto,
  PaginationQueryParamsDto,
} from 'src/common/dto/pagination.dto';
import { ParseIntPipe } from 'src/common/pipes/parseInt.pipe';
import { UserEntity } from 'src/users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@Controller('api/v1/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthenticationGuard)
  @Post()
  create(@Body() payload: CreatePostDto, @CurrentUser() user: UserEntity) {
    return this.postService.create(payload, user);
  }

  @Get()
  findAll(
    @Query(new ValidationPipe({ transform: true }))
    query: PaginationQueryParamsDto,
  ) {
    return this.postService.getPublicPosts(query);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('my-posts')
  myPosts(
    @Query(new ValidationPipe({ transform: true }))
    query: MyPaginationQueryParamsDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.postService.getMyPosts(query, user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.postService.findPublicPostById(+id);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.postService.update(+id, updatePostDto, user);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.postService.remove(+id, user);
  }
}
