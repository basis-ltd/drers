import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ResearchArea } from '../enums/research-area.enum';
import { StudyType } from '../enums/study-type.enum';
import { ReviewPathway } from '../enums/review-pathway.enum';

export class UpdateApplicationDetailsDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsEnum(ResearchArea)
  area?: ResearchArea;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  funding?: string;

  @IsOptional()
  @IsEnum(StudyType)
  studyType?: StudyType;

  @IsOptional()
  @IsEnum(ReviewPathway)
  pathway?: ReviewPathway;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  multiCentre?: boolean;
}
