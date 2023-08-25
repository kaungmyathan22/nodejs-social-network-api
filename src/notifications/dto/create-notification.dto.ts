import { UserEntity } from 'src/users/entities/user.entity';

export class CreateNotificationDto {
  user: UserEntity;
  action: string;
}
