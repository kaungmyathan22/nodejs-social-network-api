import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { FriendRequestStatus } from '../enums/request-status.enum';

@Entity('friend_requests')
export class FriendRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: FriendRequestStatus.Pending,
    type: 'enum',
    enum: FriendRequestStatus,
  })
  status: FriendRequestStatus;

  @ManyToOne(() => UserEntity, (user) => user.sentFriendRequests)
  sender: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.receivedFriendRequests)
  receiver: UserEntity;
}
