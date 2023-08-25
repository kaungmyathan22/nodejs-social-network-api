import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import JwtAuthenticationGuard from 'src/authentication/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserFilterPaginationQuery } from 'src/common/dto/pagination.dto';
import { ParseIntPipe } from 'src/common/pipes/parseInt.pipe';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { FollowService } from './follow.service';
import { UsersService } from './users.service';

@Controller('api/v1/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly followService: FollowService,
  ) {}

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  findUsers(
    @Query(new ValidationPipe({ transform: true }))
    query: UserFilterPaginationQuery,
    @CurrentUser() user: UserEntity,
  ) {
    return this.usersService.searchUser(user, query);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Patch('my-profile')
  updateProfile(
    @CurrentUser() user: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateMyProfile(user, updateUserDto);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('update-avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          return cb(null, `${uuidv4()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  updateAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image/*' }),
          new MaxFileSizeValidator({ maxSize: 20000 }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: UserEntity,
  ) {
    return this.usersService.updateAvatar(file, user);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('follow/:followedId')
  followUser(
    @CurrentUser() user: UserEntity,
    @Param('followedId') followedId: number,
  ) {
    return this.followService.followUser(user, followedId);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('unfollow/:followedId')
  unfollowUser(
    @CurrentUser() user: UserEntity,
    @Param('followedId') followedId: number,
  ) {
    return this.followService.unfollowUser(user, followedId);
  }
  @UseGuards(JwtAuthenticationGuard)
  @Post('add-friend/:friendId')
  addFriend(
    @CurrentUser() user: UserEntity,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    // return this.followService.addFriend(user, friendId);
    return {};
  }
}
