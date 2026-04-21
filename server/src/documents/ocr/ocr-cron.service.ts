import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { DocumentOcrStatus } from '../enums/document-ocr-status.enum';
import { ApplicationStatus } from '../../applications/enums/application-status.enum';
import { OcrService } from './ocr.service';

@Injectable()
export class OcrCronService implements OnModuleInit {
  private readonly logger = new Logger(OcrCronService.name);
  private isRunning = false;
  private enabled = true;
  private maxAttempts = 3;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    private readonly ocrService: OcrService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    this.enabled =
      this.configService.get<string>('OCR_CRON_ENABLED', 'true') !== 'false';
    this.maxAttempts = Number(
      this.configService.get<string>('OCR_MAX_ATTEMPTS', '3'),
    );
    this.logger.log(
      `OCR cron ${this.enabled ? 'enabled' : 'disabled'} (maxAttempts=${this.maxAttempts})`,
    );
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async tick(): Promise<void> {
    if (!this.enabled) return;
    if (this.isRunning) {
      this.logger.debug('Previous tick still running — skipping');
      return;
    }
    this.isRunning = true;
    try {
      const next = await this.pickNextDocument();
      if (!next) return;
      this.logger.log(`Processing document ${next.id} (${next.documentType})`);
      await this.ocrService.processDocument(next.id);
    } catch (err) {
      this.logger.error(
        `Cron tick failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      this.isRunning = false;
    }
  }

  private async pickNextDocument(): Promise<Document | null> {
    const qb = this.documentRepo
      .createQueryBuilder('doc')
      .innerJoin('doc.application', 'app')
      .where('doc.isCurrentVersion = :current', { current: true })
      .andWhere('app.status != :draft', { draft: ApplicationStatus.DRAFT })
      .andWhere(
        new Brackets((b) => {
          b.where('doc.ocrStatus = :pending', {
            pending: DocumentOcrStatus.PENDING,
          }).orWhere(
            new Brackets((bb) => {
              bb.where('doc.ocrStatus = :failed', {
                failed: DocumentOcrStatus.FAILED,
              }).andWhere(
                "COALESCE((doc.ocr_context->>'attempts')::int, 0) < :max",
                { max: this.maxAttempts },
              );
            }),
          );
        }),
      )
      .orderBy('doc.createdAt', 'ASC')
      .limit(1);

    return qb.getOne();
  }
}
