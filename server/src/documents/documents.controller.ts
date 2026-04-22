import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { RegisterDocumentDto } from './dto/register-document.dto';

@UseGuards(JwtAuthGuard)
@Controller('applications/:id/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('sign')
  signUpload(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.documentsService.getUploadSignature(id, user.sub);
  }

  @Post('register')
  register(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RegisterDocumentDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.documentsService.registerUpload(id, dto, user.sub);
  }

  @Get()
  findAll(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.documentsService.findAll(id, user.sub);
  }

  @Post(':docId/ocr/retry')
  retryOcr(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.documentsService.retryOcr(id, docId, user.sub);
  }

  @Post(':docId/ocr/manual-extract')
  manualExtract(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.documentsService.retryOcr(id, docId, user.sub);
  }

  @Delete(':docId')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.documentsService.remove(id, docId, user.sub);
  }
}
