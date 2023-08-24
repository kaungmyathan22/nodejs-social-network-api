import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { CommentEntity } from 'src/comments/entities/comment.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @Column({ default: '' })
  bio: string;

  @Column({ nullable: true })
  avatarURL: string;

  @Column()
  @Exclude()
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPasswordBeforeInsert() {
    if (this.password) {
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
