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
import { ApplicationDeclarationService } from '../services/application-declaration.service';
import { UpdateApplicationDeclarationDto } from '../dto/update-application-declaration.dto';

@UseGuards(JwtAuthGuard)
@Controller('applications/:id/declaration')
export class ApplicationDeclarationController {
  constructor(private readonly declarationService: ApplicationDeclarationService) {}

  @Patch()
  upsert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationDeclarationDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.declarationService.upsert(id, dto, user.sub);
  }
}
