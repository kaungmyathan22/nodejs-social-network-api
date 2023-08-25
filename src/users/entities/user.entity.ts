import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { CommentEntity } from 'src/comments/entities/comment.entity';
import { NotificationEntity } from 'src/notifications/entities/notification.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FriendRequestEntity } from './friend-request.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => PostEntity, (post) => post.author)
  posts: PostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: CommentEntity[];

  @OneToMany(() => ReactionEntity, (reaction) => reaction.user)
  reactions: ReactionEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user)
  notifications: NotificationEntity[];

  @ManyToMany(() => UserEntity, (user) => user.following)
  @JoinTable({
    name: 'followers',
    joinColumn: { name: 'follower_id' },
    inverseJoinColumn: { name: 'following_id' },
  })
  followers: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.followers)
  following: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.friends)
  @JoinTable({
    name: 'friends',
    joinColumn: { name: 'userId' },
    inverseJoinColumn: { name: 'friendId' },
  })
  friends: UserEntity[];

  @OneToMany(() => FriendRequestEntity, (request) => request.sender)
  sentFriendRequests: FriendRequestEntity[];

  @OneToMany(() => FriendRequestEntity, (request) => request.receiver)
  receivedFriendRequests: FriendRequestEntity[];

  @Column({ default: '' })
  bio: string;

  @Column({ nullable: true })
  avatarURL: string;

  @Column()
  @Exclude()
  password: string;

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    if (this.password && !this.id) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async isPasswordMatch(plainText: string) {
    try {
      return bcrypt.compare(plainText, this.password);
    } catch (error) {
      return false;
    }
  }
}
