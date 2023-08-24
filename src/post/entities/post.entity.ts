import { CommentEntity } from 'src/comments/entities/comment.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PrivacySettings {
  Public = 'public',
  Private = 'private',
}

@Entity()
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => UserEntity, (user) => user.posts)
  author: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  publicationDate: Date;

  @Column({
    type: 'enum',
    enum: PrivacySettings,
    default: PrivacySettings.Public, // Set the default value to 'public'
  })
  privacySettings: string;
}
