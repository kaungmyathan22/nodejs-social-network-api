import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { FriendRequestEntity } from './entities/friend-request.entity';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([FriendRequestEntity])],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
