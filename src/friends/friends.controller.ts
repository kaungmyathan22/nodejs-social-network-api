import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import JwtAuthenticationGuard from 'src/authentication/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  PaginationQuery,
  SentFriendRequestsPaginationQuery,
} from 'src/common/dto/pagination.dto';
import { ParseIntPipe } from 'src/common/pipes/parseInt.pipe';
import { UserEntity } from 'src/users/entities/user.entity';
import { FriendsService } from './friends.service';

@UseGuards(JwtAuthenticationGuard)
@Controller('api/v1/friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('')
  friendList(
    @Query(new ValidationPipe({ transform: true }))
    query: PaginationQuery,
    @CurrentUser() user: UserEntity,
  ) {
    return this.friendsService.friendList(user, query);
  }

  @Post('add/:friendId')
  addFriend(
    @Param('friendId', ParseIntPipe) friendId: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.friendsService.addFriend(user, friendId);
  }

  @Post('unfriend/:friendId')
  unFriend(
    @Param('friendId', ParseIntPipe) friendId: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.friendsService.unFriend(user, friendId);
  }

  @Get('sent-requests')
  sentRequests(
    @Query(new ValidationPipe({ transform: true }))
    query: SentFriendRequestsPaginationQuery,
    @CurrentUser() user: UserEntity,
  ) {
    return this.friendsService.sentRequests(user, query);
  }

  @Get('recieved-requests')
  recievedRequests(
    @Query(new ValidationPipe({ transform: true }))
    query: SentFriendRequestsPaginationQuery,
    @CurrentUser() user: UserEntity,
  ) {
    return this.friendsService.recievedRequests(user, query);
  }

  @Post('accept/:requestId')
  acceptRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.friendsService.acceptRequests(user, requestId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('canel-sent-request/:sentRequestId')
  cancelSentRequests(
    @Param('sentRequestId', ParseIntPipe) sentRequestId: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.friendsService.cancelSentRequests(user, sentRequestId);
  }
}
