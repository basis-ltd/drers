import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { ApplicationsModule } from '../applications/applications.module';
import { OcrService } from './ocr/ocr.service';
import { OcrCronService } from './ocr/ocr-cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), ApplicationsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, OcrService, OcrCronService],
})
export class DocumentsModule {}
