import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApplicationType } from '../enums/application-type.enum';

export class CreateApplicationDto {
  @IsEnum(ApplicationType)
  type: ApplicationType;

  @IsOptional()
  @IsUUID()
  parentApplicationId?: string;
}
