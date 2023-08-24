import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('friend_requests')
export class FriendRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'pending' }) // Status: pending, accepted, rejected, etc.
  status: string;

  @ManyToOne(() => UserEntity, (user) => user.sentFriendRequests)
  sender: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.receivedFriendRequests)
  receiver: UserEntity;
}
