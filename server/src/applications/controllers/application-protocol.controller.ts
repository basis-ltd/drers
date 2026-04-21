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
import { ApplicationProtocolService } from '../services/application-protocol.service';
import { UpdateApplicationProtocolDto } from '../dto/update-application-protocol.dto';

@UseGuards(JwtAuthGuard)
@Controller('applications/:id/protocol')
export class ApplicationProtocolController {
  constructor(private readonly protocolService: ApplicationProtocolService) {}

  @Patch()
  upsert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationProtocolDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.protocolService.upsert(id, dto, user.sub);
  }
}
