import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryParamsDto } from 'src/common/dto/pagination.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationEntity } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async create({ user, action }: CreateNotificationDto) {
    const notification = await this.notificationRepository.create({
      user,
      action,
    });
    return this.notificationRepository.save(notification);
  }

  async findAll(
    page: number,
    pageSize: number,
    options?: FindManyOptions<NotificationEntity>,
  ) {
    const skip = (page - 1) * pageSize;

    const [data, totalItems] = await this.notificationRepository.findAndCount({
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

  myNotifications(
    { page, pageSize }: PaginationQueryParamsDto,
    user: UserEntity,
  ) {
    return this.findAll(page, pageSize, { where: { user: { id: user.id } } });
  }

  async remove(user: UserEntity, id: number) {
    const notification = await this.notificationRepository.findOne({
      where: { user: { id: user.id }, id },
    });
    if (!notification) {
      throw new NotFoundException(
        'The notification you are tryig to delete is not found.',
      );
    }
    return this.notificationRepository.remove(notification);
  }
}
