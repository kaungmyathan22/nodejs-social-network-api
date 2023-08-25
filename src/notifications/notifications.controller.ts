import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import JwtAuthenticationGuard from 'src/authentication/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PaginationQueryParamsDto } from 'src/common/dto/pagination.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { NotificationsService } from './notifications.service';

@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthenticationGuard)
  @Get('my-noti')
  myNotifications(
    @Query(new ValidationPipe({ transform: true }))
    query: PaginationQueryParamsDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.notificationsService.myNotifications(query, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
