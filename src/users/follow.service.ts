// follow.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@Injectable()
export class FollowService {
  async getFollowings(loggedInUser: UserEntity) {
    const user = await this.userService.findOneOrFail({
      where: { id: loggedInUser.id },
      relations: {
        following: true,
      },
    });
    return user.following;
  }
  async getFollowers(loggedInUser: UserEntity) {
    const user = await this.userService.findOneOrFail({
      where: { id: loggedInUser.id },
      relations: {
        followers: true,
      },
    });
    return user.followers;
  }
  constructor(private userService: UsersService) {}

  async followUser(user: UserEntity, followedId: number) {
    const followed = await this.userService.findOneOrFail({
      where: { id: followedId },
      relations: { followers: true },
    });
    if (!followed) {
      throw new NotFoundException('User not found');
    }
    const existingFollow = followed.followers.some((usr) => usr.id === user.id);
    if (existingFollow) {
      throw new ConflictException('You are already following this user');
    }
    followed.followers.push(user);
    return this.userService.saveUser(followed);
  }

  async unfollowUser(user: UserEntity, followedId: number) {
    const followed = await this.userService.findOneOrFail({
      where: { id: followedId },
      relations: { followers: true },
    });

    if (!followed) {
      throw new NotFoundException('User not found');
    }
    const usrIndex = followed.followers.findIndex((usr) => usr.id === user.id);
    const existingFollow = followed.followers.length > 0 && usrIndex > -1;
    if (!existingFollow) {
      throw new ConflictException('You are not following this user');
    }
    followed.followers.splice(usrIndex, 1);
    await this.userService.saveUser(followed);
    return {
      success: true,
      message: 'Unfollowed successfully',
    };
  }
}
