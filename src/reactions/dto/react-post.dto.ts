import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ReactPostDto {
  @IsOptional()
  @IsNumber()
  postId: number;

  @IsString()
  @IsNotEmpty()
  type: string;
}
