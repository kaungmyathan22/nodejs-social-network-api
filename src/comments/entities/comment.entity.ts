import { PostEntity } from 'src/post/entities/post.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ type: 'timestamptz' })
  createdAt: Date;
}
