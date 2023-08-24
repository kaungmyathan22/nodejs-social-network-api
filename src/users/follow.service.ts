// follow.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowEntity } from './entities/follow.entity';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@Injectable()
export class FollowService {
  constructor(
    private userService: UsersService,
    @InjectRepository(FollowEntity)
    private followRepository: Repository<FollowEntity>,
  ) {}

  async followUser(user: UserEntity, followedId: number) {
    const followed = await this.userService.findOne(followedId);

    if (!followed) {
      throw new NotFoundException('User not found');
    }

    const existingFollow = await this.followRepository.findOne({
      where: { follower: { id: user.id }, followed: { id: followed.id } },
    });

    if (existingFollow) {
      throw new ConflictException('You are already following this user');
    }

    const follow = new FollowEntity();
    follow.follower = user;
    follow.followed = followed;

    return this.followRepository.save(follow);
  }

  async unfollowUser(user: UserEntity, followedId: number) {
    const followed = await this.userService.findOne(followedId);

    if (!followed) {
      throw new NotFoundException('User not found');
    }

    const follow = await this.followRepository.findOne({
      where: { follower: { id: user.id }, followed: { id: followed.id } },
    });

    if (!follow) {
      throw new NotFoundException('You are not following this user');
    }

    await this.followRepository.remove(follow);

    return 'Unfollowed successfully';
  }
}
