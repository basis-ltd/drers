import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { AssignReviewerDto } from './dto/assign-reviewer.dto';
import { SubmitReviewerFeedbackDto } from './dto/submit-reviewer-feedback.dto';
import { ChairDecisionDto } from './dto/chair-decision.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('applications/:applicationId/review')
  getReview(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.reviewsService.findForViewer(applicationId, user.sub);
  }

  @Post('applications/:applicationId/review/assign')
  assign(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() dto: AssignReviewerDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.reviewsService.assignReviewer(applicationId, dto, user.sub);
  }

  @Post('applications/:applicationId/review/reviewer-feedback')
  submitReviewerFeedback(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() dto: SubmitReviewerFeedbackDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.reviewsService.submitReviewerFeedback(applicationId, dto, user.sub);
  }

  @Post('applications/:applicationId/review/chair-decision')
  chairDecision(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() dto: ChairDecisionDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.reviewsService.recordChairDecision(applicationId, dto, user.sub);
  }

  @Get('reviews/reviewers')
  listReviewers(@CurrentUser() user: JwtUser) {
    return this.reviewsService.listReviewers(user.sub);
  }
}
