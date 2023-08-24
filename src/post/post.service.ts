import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryParamsDto } from 'src/common/dto/pagination.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { And, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
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

  async findAll({
    page,
    pageSize,
    author,
    startDate,
    endDate,
  }: PaginationQueryParamsDto) {
    const skip = (page - 1) * pageSize;
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
    if (startDate && endDate) {
      where = {
        ...where,
        publicationDate: And(
          MoreThanOrEqual(startDate),
          LessThanOrEqual(endDate),
        ),
      };
    } else {
      if (startDate) {
        where = {
          ...where,
          publicationDate: MoreThanOrEqual(startDate),
        };
      }
      if (endDate) {
        where = {
          ...where,
          publicationDate: LessThanOrEqual(endDate),
        };
      }
    }

    const [data, totalItems] = await this.postRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      relations: { author: true },
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

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
