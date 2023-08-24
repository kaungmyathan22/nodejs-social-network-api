import { PostEntity } from 'src/post/entities/post.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => UserEntity, (user) => user.posts)
  author: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.comments)
  post: PostEntity;

  @OneToMany(() => ReactionEntity, (reaction) => reaction.comment)
  reactions: ReactionEntity[];

  @Column({ type: 'timestamptz', default: new Date() })
  createdAt: Date;
}
