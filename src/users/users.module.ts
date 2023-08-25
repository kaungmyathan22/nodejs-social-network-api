import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from 'src/storage/storage.module';
import { UserEntity } from './entities/user.entity';
import { FollowService } from './follow.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), StorageModule],
  controllers: [UsersController],
  providers: [UsersService, FollowService],
  exports: [UsersService],
})
export class UsersModule {}
