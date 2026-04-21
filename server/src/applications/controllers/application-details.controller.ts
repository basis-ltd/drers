import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApplicationDetailsService } from '../services/application-details.service';
import { UpdateApplicationDetailsDto } from '../dto/update-application-details.dto';

@UseGuards(JwtAuthGuard)
@Controller('applications/:id/details')
export class ApplicationDetailsController {
  constructor(private readonly detailsService: ApplicationDetailsService) {}

  @Patch()
  upsert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationDetailsDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.detailsService.upsert(id, dto, user.sub);
  }
}
