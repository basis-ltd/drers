import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApplicationStatus } from '../enums/application-status.enum';
import { ApplicationType } from '../enums/application-type.enum';

export enum ListApplicationsScope {
  MY = 'MY',
  REVIEW = 'REVIEW',
}

export class ListApplicationsDto {
  @IsOptional()
  @IsEnum(ListApplicationsScope)
  scope?: ListApplicationsScope;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (Array.isArray(value)) {
      const normalized: string[] = [];
      for (const entry of value) {
        if (typeof entry !== 'string') continue;
        for (const part of entry.split(',')) {
          const trimmed = part.trim();
          if (trimmed) normalized.push(trimmed);
        }
      }
      return normalized;
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
    return value;
  })
  @IsArray()
  @IsEnum(ApplicationStatus, { each: true })
  statuses?: ApplicationStatus[];

  @IsOptional()
  @IsEnum(ApplicationType)
  type?: ApplicationType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
