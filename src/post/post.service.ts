import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MyPaginationQueryParamsDto,
  PaginationQueryParamsDto,
} from 'src/common/dto/pagination.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  And,
  FindManyOptions,
  FindOneOptions,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity, PrivacySettings } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
  ) {}
  async create(payload: CreatePostDto, user: UserEntity) {
    const postInstance = this.postRepository.create({
      ...payload,
      author: user,
    });
    return this.postRepository.save(postInstance);
  }

  async findAll(
    page: number,
    pageSize: number,
    startDate?: string,
    endDate?: string,
    options?: FindManyOptions<PostEntity>,
  ) {
    const skip = (page - 1) * pageSize;
    let where = { ...options.where };
    if (startDate && endDate) {
      where = {
        ...where,
        publicationDate: And(
          MoreThanOrEqual(new Date(startDate)),
          LessThanOrEqual(new Date(endDate)),
        ),
      };
    } else {
      if (startDate) {
        where = {
          ...where,
          publicationDate: MoreThanOrEqual(new Date(startDate)),
        };
      }
      if (endDate) {
        where = {
          ...where,
          publicationDate: LessThanOrEqual(new Date(endDate)),
        };
      }
    }

    const [data, totalItems] = await this.postRepository.findAndCount({
      ...options,
      where,
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

  async getPublicPosts({
    page,
    pageSize,
    author,
    startDate,
    endDate,
  }: PaginationQueryParamsDto) {
    let where: any = {
      privacySettings: PrivacySettings.Public,
    };
    if (author) {
      where = {
        ...where,
        author: {
          id: author,
        },
      };
    }

    return await this.findAll(page, pageSize, startDate, endDate, {
      where,
      relations: { author: true },
    });
  }

  async findPublicPostById(id: number) {
    const post = await this.postRepository.findOne({
      where: {
        privacySettings: PrivacySettings.Public,
        id,
      },
      relations: { author: true },
    });
    if (!post) {
      throw new HttpException(
        'The post you are looking for is not found in the database.',
        HttpStatus.NOT_FOUND,
      );
    }
    return post;
  }

  async findOneOrFail(options: FindOneOptions<PostEntity>, message?: string) {
    const post = await this.postRepository.findOne(options);
    if (!post) {
      throw new NotFoundException(
        message || 'The post you are looking for is not found.',
      );
    }
    return post;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  async remove(id: number, user: UserEntity) {
    const post = await this.findOneOrFail(
      {
        where: { id, author: { id: user.id } },
      },
      'The post you are trying to delete is not found.',
    );
    await this.postRepository.remove(post);
    return { success: true };
  }

  async getMyPosts(
    { page, pageSize, startDate, endDate, privacy }: MyPaginationQueryParamsDto,
    user: UserEntity,
  ) {
    return this.findAll(page, pageSize, startDate, endDate, {
      where: {
        author: { id: user.id },
        ...(privacy ? { privacySettings: privacy } : {}),
      },
    });
  }
}
