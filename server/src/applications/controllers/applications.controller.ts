import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtUser } from '../../auth/decorators/current-user.decorator';
import { ApplicationsService } from '../services/applications.service';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { ListApplicationsDto } from '../dto/list-applications.dto';

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() dto: CreateApplicationDto, @CurrentUser() user: JwtUser) {
    return this.applicationsService.create(dto, user.sub);
  }

  @Get()
  findAll(@Query() query: ListApplicationsDto, @CurrentUser() user: JwtUser) {
    return this.applicationsService.findAll(user?.sub ?? '', query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.applicationsService.findOneForViewer(id, user.sub);
  }

  @Post(':id/submit')
  submit(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.applicationsService.submit(id, user.sub);
  }

  @Get(':id/validate-submit')
  validateSubmit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.applicationsService.validateSubmission(id, user.sub);
  }

  @Post(':id/withdraw')
  withdraw(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.applicationsService.withdraw(id, user.sub);
  }
}
