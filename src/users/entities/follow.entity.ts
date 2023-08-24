import { UserEntity } from 'src/users/entities/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('followers')
export class FollowEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  follower: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  followed: UserEntity;
}
