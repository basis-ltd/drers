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
import { ApplicationEthicsService } from '../services/application-ethics.service';
import { UpdateApplicationEthicsDto } from '../dto/update-application-ethics.dto';

@UseGuards(JwtAuthGuard)
@Controller('applications/:id/ethics')
export class ApplicationEthicsController {
  constructor(private readonly ethicsService: ApplicationEthicsService) {}

  @Patch()
  upsert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationEthicsDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.ethicsService.upsert(id, dto, user.sub);
  }
}
