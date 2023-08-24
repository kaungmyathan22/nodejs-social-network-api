import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsFormattedDate } from 'src/common/decorators/date-format-validation.deocrator';
import { PrivacySettings } from '../entities/post.entity';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsEnum(PrivacySettings, {
    message: 'Invalid privacy setting. It should be (public/private)',
  })
  privacySettings: PrivacySettings;

  @IsOptional()
  @IsNotEmpty()
  @IsFormattedDate()
  publicationDate?: Date;
}
