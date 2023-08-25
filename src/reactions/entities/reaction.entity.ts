// reaction.entity.ts

import { CommentEntity } from 'src/comments/entities/comment.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReactionType } from '../enum/react-type.enum';

@Entity()
export class ReactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ReactionType,
  })
  reactionType: ReactionType;

  @ManyToOne(() => UserEntity, (user) => user.reactions)
  user: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.reactions, { nullable: true })
  post: PostEntity;

  @ManyToOne(() => CommentEntity, (comment) => comment.reactions, {
    nullable: true,
  })
  comment: CommentEntity;
}
