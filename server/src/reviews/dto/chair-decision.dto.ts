import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { ChairDecision } from '../enums/chair-decision.enum';

export class ChairDecisionDto {
  @IsEnum(ChairDecision)
  decision: ChairDecision;

  @IsString()
  @MinLength(10)
  @MaxLength(10_000)
  comments: string;
}
