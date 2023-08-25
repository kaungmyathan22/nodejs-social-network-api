import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFilterPaginationQuery } from 'src/common/dto/pagination.dto';
import { StorageService } from 'src/storage/storage.service';
import {
  FindManyOptions,
  FindOneOptions,
  Like,
  Not,
  Repository,
} from 'typeorm';
import { AuthenticateDTO } from './dto/authenticate.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly storageService: StorageService,
  ) {}
  searchUser(
    user: UserEntity,
    { page, pageSize, email }: UserFilterPaginationQuery,
  ) {
    return this.findAll(page, pageSize, {
      where: {
        id: Not(user.id),
        ...(email ? { email: Like(`%${email}%`) } : {}),
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      if (error.code === '23505') {
        // Handle duplicate key violation error here
        throw new HttpException(
          'User with this email already exists.',
          HttpStatus.CONFLICT,
        );
      } else {
        throw error; // Re-throw other errors
      }
    }
  }

  async findAll(
    page: number,
    pageSize: number,
    options?: FindManyOptions<UserEntity>,
  ) {
    const skip = (page - 1) * pageSize;
    const [data, totalItems] = await this.userRepository.findAndCount({
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

  getAllUsers() {
    return this.userRepository.find();
  }

  async findByEmail(email: string): Promise<UserEntity | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException(
        `The user with given id ${id} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async findOneOrFail(options: FindOneOptions<UserEntity>, message?: string) {
    const user = await this.userRepository.findOne(options);
    if (!user) {
      throw new HttpException(
        message || `The user you are looking for is not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const result = await this.userRepository.update(
      { id },
      {
        ...updateUserDto,
      },
    );
    if (result.affected) {
      return this.findOne(id);
    }
    throw new HttpException(
      `The user with given id ${id} not found`,
      HttpStatus.NOT_FOUND,
    );
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.delete(user.id);
    return {
      success: true,
    };
  }

  async authenticate(payload: AuthenticateDTO) {
    const user = await this.findByEmail(payload.email);
    if (user && (await user.isPasswordMatch(payload.password))) {
      return user;
    }
    throw new HttpException(
      'Invalid email / password.',
      HttpStatus.UNAUTHORIZED,
    );
  }

  // async changePassword(payload: ChangePasswordDTO) {
  //   const user = await this.findByEmail(payload.email);
  //   if (await user.isPasswordMatch(payload.password)) {
  //     return user;
  //   }
  // }

  async updateMyProfile(user: UserEntity, updateUserDto: UpdateUserDto) {
    Object.assign(user, updateUserDto);
    const result = await this.userRepository.save(user, { reload: true });
    return result;
  }

  async updateAvatar(file: Express.Multer.File, user: UserEntity) {
    const fileInstance = await this.storageService.create(file);
    if (user.avatarURL) {
      await this.storageService.remove(user.avatarURL);
    }
    user.avatarURL = fileInstance.filename;
    return await this.userRepository.save(user);
  }

  saveUser(user: UserEntity) {
    return this.userRepository.save(user);
  }

  async getFriends(userId: number, page: number, pageSize: number) {
    console.log(pageSize);
    const skip = (page - 1) * pageSize;
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.friends', 'friend')
      .where('user.id = :userId', { userId })
      .skip(skip)
      .take(pageSize);
    const userWithFriends = await queryBuilder.getOne();
    const friends = userWithFriends.friends;
    return friends;
  }
}
