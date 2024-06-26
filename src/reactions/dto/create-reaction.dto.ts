import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReactionDto {
  @IsOptional()
  @IsNumber()
  postId?: number;

  @IsOptional()
  @IsNumber()
  commentId?: number;

  @IsString()
  @IsNotEmpty()
  type: string;
}
