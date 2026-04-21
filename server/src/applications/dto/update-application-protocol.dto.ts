import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { StudyDesign } from '../enums/study-design.enum';

export class UpdateApplicationProtocolDto {
  @IsOptional()
  @IsString()
  background?: string;

  @IsOptional()
  @IsString()
  primaryObjective?: string;

  @IsOptional()
  @IsString()
  secondaryObjectives?: string;

  @IsOptional()
  @IsEnum(StudyDesign)
  design?: StudyDesign;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  duration?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sampleSize?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  statPower?: string;

  @IsOptional()
  @IsString()
  population?: string;

  @IsOptional()
  @IsString()
  inclusionCriteria?: string;

  @IsOptional()
  @IsString()
  exclusionCriteria?: string;

  @IsOptional()
  @IsString()
  recruitment?: string;

  @IsOptional()
  @IsString()
  procedures?: string;
}
