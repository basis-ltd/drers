import { IsISO8601, IsOptional, IsUUID } from 'class-validator';

export class AssignReviewerDto {
  @IsUUID()
  reviewerId: string;

  @IsOptional()
  @IsISO8601()
  dueAt?: string;
}
