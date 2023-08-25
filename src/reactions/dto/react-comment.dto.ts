import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ReactionType } from '../enum/react-type.enum';

export class ReactCommentDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(ReactionType)
  reactionType: ReactionType;
}
