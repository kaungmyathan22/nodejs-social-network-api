import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginationQuery,
  SentFriendRequestsPaginationQuery,
} from 'src/common/dto/pagination.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { FriendRequestEntity } from './entities/friend-request.entity';
import { FriendRequestStatus } from './enums/request-status.enum';

@Injectable()
export class FriendsService {
  constructor(
    private readonly userServices: UsersService,
    @InjectRepository(FriendRequestEntity)
    private readonly friendRequestRepository: Repository<FriendRequestEntity>,
  ) {}

  friendList(user: UserEntity, { page, pageSize }: PaginationQuery) {
    return this.userServices.getFriends(user.id, page, pageSize);
  }

  async findOneOrFail(
    options: FindOneOptions<FriendRequestEntity>,
    message?: string,
  ) {
    const friendRequest = await this.friendRequestRepository.findOne(options);
    if (!friendRequest) {
      throw new NotFoundException(message || 'Friend request is not found.');
    }
    return friendRequest;
  }

  async acceptRequests(loggedInUser: UserEntity, requestId: number) {
    const request = await this.findOneOrFail({
      where: {
        id: requestId,
        receiver: { id: loggedInUser.id },
        status: FriendRequestStatus.Pending,
      },
      relations: {
        sender: true,
      },
    });

    const user = await this.userServices.findOneOrFail({
      where: { id: loggedInUser.id },
      relations: { friends: true },
    });
    const friend = await this.userServices.findOneOrFail({
      where: { id: request.sender.id },
    });
    user.friends.push(friend);
    return Promise.all([
      await this.friendRequestRepository.remove(request),
      await this.userServices.saveUser(user),
    ]).then(() => {
      return {
        success: true,
      };
    });
  }

  async cancelSentRequests(user: UserEntity, sentRequestId: number) {
    const friendRequest = await this.friendRequestRepository.findOne({
      where: {
        sender: { id: user.id },
        status: FriendRequestStatus.Pending,
        id: sentRequestId,
      },
    });
    if (!friendRequest) {
      throw new NotFoundException(
        'The request you are trying to cancel not found.',
      );
    }
    return this.friendRequestRepository.remove(friendRequest);
  }

  async findAll(
    page: number,
    pageSize: number,
    options?: FindManyOptions<FriendRequestEntity>,
  ) {
    const skip = (page - 1) * pageSize;
    const [data, totalItems] = await this.friendRequestRepository.findAndCount({
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

  sentRequests(
    user: UserEntity,
    { page, pageSize }: SentFriendRequestsPaginationQuery,
  ) {
    return this.findAll(page, pageSize, {
      where: { sender: { id: user.id }, status: FriendRequestStatus.Pending },
      relations: { receiver: true },
    });
  }

  recievedRequests(
    user: UserEntity,
    { page, pageSize }: SentFriendRequestsPaginationQuery,
  ) {
    return this.findAll(page, pageSize, {
      where: { receiver: { id: user.id }, status: FriendRequestStatus.Pending },
      relations: { sender: true },
    });
  }
  async addFriend(loggedInUser: UserEntity, friendId: number) {
    const user = await this.userServices.findOneOrFail({
      where: { id: loggedInUser.id },
      relations: {
        friends: true,
        sentFriendRequests: true,
      },
    });
    const friend = await this.userServices.findOneOrFail(
      {
        where: { id: friendId },
      },
      'User you are trying to send request is not found.',
    );
    if (friend.id === user.id) {
      throw new BadRequestException(
        'You cannot send friend request to yourself.',
      );
    }

    if (user.friends.some((u) => u.id === friend.id)) {
      throw new BadRequestException('You both are already friends');
    }
    const isFriendRequesttAlreadyExists =
      await this.friendRequestRepository.findOne({
        where: [
          {
            sender: { id: user.id },
            receiver: { id: friend.id },
            status: FriendRequestStatus.Pending,
          },
          {
            sender: { id: friend.id },
            receiver: { id: user.id },
            status: FriendRequestStatus.Pending,
          },
        ],
      });
    if (isFriendRequesttAlreadyExists) {
      throw new BadRequestException('Friend request already exists.');
    }
    const friendRequest = await this.friendRequestRepository.create({
      sender: user,
      receiver: friend,
      status: FriendRequestStatus.Pending,
    });
    await this.friendRequestRepository.save(friendRequest);
    user.sentFriendRequests.push(friendRequest);
    await this.userServices.saveUser(user);
    return {
      user,
      friend,
    };
  }
  async unFriend(loggedInUser: UserEntity, friendId: number) {
    const user = await this.userServices.findOneOrFail({
      where: { id: loggedInUser.id },
      relations: { friends: true },
    });
    const friends = user.friends;
    const friendIndex = friends.findIndex((f) => f.id === friendId);
    if (!(friendIndex > -1)) {
      throw new NotFoundException('Friend not found.');
    }
    friends.splice(friendIndex, 1);
    user.friends = friends;
    return this.userServices.saveUser(user);
  }
}
