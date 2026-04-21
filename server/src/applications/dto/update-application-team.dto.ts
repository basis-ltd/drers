import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ProfessionalTitle } from '../../common/enums/professional-title.enum';

export class CoInvestigatorItemDto {
  @IsOptional()
  @IsEnum(ProfessionalTitle)
  title?: ProfessionalTitle;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  institution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  role?: string;
}

export class StudySiteItemDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;
}

export class UpdateApplicationTeamDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  piDepartment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  piInstitution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  piPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  piNhra?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoInvestigatorItemDto)
  coInvestigators?: CoInvestigatorItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudySiteItemDto)
  studySites?: StudySiteItemDto[];
}
