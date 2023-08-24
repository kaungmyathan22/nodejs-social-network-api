// src/common/dto/query-params.dto.ts

import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PrivacySettings } from 'src/post/entities/post.entity';
import { IsFormattedDate } from '../decorators/date-format-validation.deocrator';

export class PaginationQueryParamsDto {
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsInt()
  page = 1;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsInt()
  pageSize = 10;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsInt()
  author: number;

  @Transform(({ value }) => value)
  @IsOptional()
  @IsFormattedDate()
  startDate: string;

  @Transform(({ value }) => value)
  @IsOptional()
  @IsFormattedDate()
  endDate: string;

  @Transform(({ value }) => value.toLowerCase())
  @IsOptional()
  @IsString()
  @IsEnum(PrivacySettings, { message: 'Invalid privacy setting' })
  privacy: PrivacySettings = PrivacySettings.Public;
}
