import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { ReviewerDecision } from '../enums/reviewer-decision.enum';

export class SubmitReviewerFeedbackDto {
  @IsEnum(ReviewerDecision)
  decision: ReviewerDecision;

  @IsString()
  @MinLength(10)
  @MaxLength(10_000)
  comments: string;
}
