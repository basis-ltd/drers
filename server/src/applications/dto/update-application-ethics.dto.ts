import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ConsentWaiver } from '../enums/consent-waiver.enum';
import { ConflictOfInterest } from '../enums/conflict-of-interest.enum';

export class UpdateApplicationEthicsDto {
  @IsOptional()
  @IsString()
  risks?: string;

  @IsOptional()
  @IsString()
  riskMitigation?: string;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vulnerablePopulations?: string[];

  @IsOptional()
  @IsString()
  consentProcess?: string;

  @IsOptional()
  @IsEnum(ConsentWaiver)
  consentWaiver?: ConsentWaiver;

  @IsOptional()
  @IsString()
  consentWaiverJustification?: string;

  @IsOptional()
  @IsString()
  dataStorage?: string;

  @IsOptional()
  @IsString()
  confidentiality?: string;

  @IsOptional()
  @IsEnum(ConflictOfInterest)
  conflictOfInterest?: ConflictOfInterest;

  @IsOptional()
  @IsString()
  conflictOfInterestDescription?: string;
}
