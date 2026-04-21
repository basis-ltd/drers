import { Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtUser } from '../../auth/decorators/current-user.decorator';
import { ApplicationTeamService } from '../services/application-team.service';
import { UpdateApplicationTeamDto } from '../dto/update-application-team.dto';

@Controller('applications/:id/team')
export class ApplicationTeamController {
  constructor(private readonly teamService: ApplicationTeamService) {}

  @Patch()
  upsert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationTeamDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.teamService.upsert(id, dto, user.sub);
  }
}
