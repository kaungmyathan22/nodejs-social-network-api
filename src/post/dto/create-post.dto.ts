import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PrivacySettings } from '../entities/post.entity';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsEnum(PrivacySettings, {
    message: 'Invalid privacy setting. It should be (public/private)',
  })
  privacySettings: PrivacySettings;
}
