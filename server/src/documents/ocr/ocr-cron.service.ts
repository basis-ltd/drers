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
  private requeueAuthFailuresOnBoot = false;
  private staleProcessingMinutes = 30;
  private providerCheckIntervalMs = 60000;
  private lastProviderCheckAt = 0;
  private lastProviderCheckOk = true;
  private lastProviderCheckMessage = '';
  private providerFailureThreshold = 2;
  private providerCooldownMs = 180000;
  private providerCooldownUntil = 0;
  private consecutiveProviderFailures = 0;
  private logPgTraceDeprecationHint = false;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    private readonly ocrService: OcrService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    this.enabled =
      this.configService.get<string>('OCR_CRON_ENABLED', 'false') === 'true';
    this.maxAttempts = this.readPositiveIntConfig('OCR_MAX_ATTEMPTS', 3);
    this.requeueAuthFailuresOnBoot =
      this.configService.get<string>(
        'OCR_REQUEUE_FAILED_DOWNLOAD_AUTH_ERRORS_ON_BOOT',
        'false',
      ) === 'true';
    this.staleProcessingMinutes = this.readPositiveIntConfig(
      'OCR_PROCESSING_STALE_MINUTES',
      30,
    );
    this.providerCheckIntervalMs = this.readPositiveIntConfig(
      'OCR_PROVIDER_CHECK_INTERVAL_MS',
      60000,
    );
    this.providerFailureThreshold = this.readPositiveIntConfig(
      'OCR_PROVIDER_FAILURE_THRESHOLD',
      2,
    );
    this.providerCooldownMs = this.readPositiveIntConfig(
      'OCR_PROVIDER_TIMEOUT_COOLDOWN_MS',
      180000,
    );
    this.logPgTraceDeprecationHint =
      this.configService.get<string>(
        'OCR_LOG_PG_TRACE_DEPRECATION_HINT',
        'false',
      ) === 'true';
    this.logger.log(
      `OCR cron ${this.enabled ? 'enabled' : 'disabled'} (maxAttempts=${this.maxAttempts}, staleProcessingMinutes=${this.staleProcessingMinutes}, providerCheckIntervalMs=${this.providerCheckIntervalMs}, providerFailureThreshold=${this.providerFailureThreshold}, providerCooldownMs=${this.providerCooldownMs})`,
    );
    if (this.logPgTraceDeprecationHint) {
      this.logger.warn(
        'PG query concurrency warning trace hint: run with NODE_OPTIONS="--trace-deprecation" to identify the exact call site if warnings persist.',
      );
    }
    if (this.requeueAuthFailuresOnBoot) {
      void this.ocrService
        .requeueFailedDownloadAuthErrors()
        .then((count) => {
          this.logger.log(
            `Requeued ${count} OCR document(s) after download auth failures`,
          );
        })
        .catch((err) => {
          this.logger.error(
            `Failed to requeue OCR auth failures: ${err instanceof Error ? err.message : String(err)}`,
          );
        });
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async tick(): Promise<void> {
    if (!this.enabled) return;
    if (Date.now() < this.providerCooldownUntil) {
      this.logger.warn(
        `Provider cooldown active; skipping OCR tick for another ${this.providerCooldownUntil - Date.now()}ms`,
      );
      return;
    }
    if (this.isRunning) {
      this.logger.debug('Previous tick still running — skipping');
      return;
    }
    this.isRunning = true;
    try {
      await this.requeueStaleProcessingDocuments();
      const providerReady = await this.isProviderReachable();
      if (!providerReady) return;
      const next = await this.pickNextDocument();
      if (!next) return;
      this.logger.log(
        `Processing document ${next.id} (${next.documentType}) for OCR screening`,
      );
      await this.ocrService.processDocument(next.id);
    } catch (err) {
      this.logger.error(
        `Cron tick failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      this.isRunning = false;
    }
  }

  private async isProviderReachable(): Promise<boolean> {
    const now = Date.now();
    if (this.ocrService.hasRecentProviderTimeoutSignal()) {
      if (
        this.lastProviderCheckAt > 0 &&
        now - this.lastProviderCheckAt < this.providerCheckIntervalMs
      ) {
        return false;
      }
      this.lastProviderCheckAt = now;
      this.lastProviderCheckOk = false;
      this.lastProviderCheckMessage =
        'recent provider timeout signal from OCR pipeline';
      this.registerProviderFailure(
        'recent provider timeout signal from OCR pipeline',
      );
      return false;
    }
    if (
      this.lastProviderCheckAt > 0 &&
      now - this.lastProviderCheckAt < this.providerCheckIntervalMs
    ) {
      return this.lastProviderCheckOk;
    }
    this.lastProviderCheckAt = now;
    const wasOk = this.lastProviderCheckOk;
    const result = await this.ocrService.checkProviderReachable();
    this.lastProviderCheckOk = result.ok;
    this.lastProviderCheckMessage = result.message;
    if (!result.ok) {
      this.registerProviderFailure(result.message);
      this.logger.warn(`Skipping OCR tick: ${result.message}`);
    } else if (!wasOk && this.lastProviderCheckMessage) {
      this.consecutiveProviderFailures = 0;
      this.providerCooldownUntil = 0;
      this.logger.log(`OCR provider recovered: ${result.message}`);
    } else {
      this.consecutiveProviderFailures = 0;
    }
    return result.ok;
  }

  private registerProviderFailure(reason: string): void {
    this.consecutiveProviderFailures += 1;
    if (this.consecutiveProviderFailures < this.providerFailureThreshold) {
      return;
    }
    this.providerCooldownUntil = Date.now() + this.providerCooldownMs;
    this.logger.warn(
      `Entering provider cooldown after ${this.consecutiveProviderFailures} consecutive failures: ${reason}`,
    );
  }

  private async requeueStaleProcessingDocuments(): Promise<void> {
    if (this.staleProcessingMinutes <= 0) return;
    const staleBefore = new Date(
      Date.now() - this.staleProcessingMinutes * 60 * 1000,
    );
    const docs = await this.documentRepo
      .createQueryBuilder('doc')
      .where('doc.isCurrentVersion = :current', { current: true })
      .andWhere('doc.ocrStatus = :processing', {
        processing: DocumentOcrStatus.PROCESSING,
      })
      .andWhere('doc.ocrStartedAt IS NOT NULL')
      .andWhere('doc.ocrStartedAt < :staleBefore', { staleBefore })
      .limit(100)
      .getMany();
    if (docs.length === 0) return;

    const now = new Date().toISOString();
    for (const doc of docs) {
      const ctx = (doc.ocrContext as Record<string, unknown> | null) ?? {};
      doc.ocrStatus = DocumentOcrStatus.PENDING;
      doc.ocrErrorMessage = null;
      doc.ocrStartedAt = null;
      doc.ocrCompletedAt = null;
      doc.ocrContext = {
        ...ctx,
        lastRequeuedAt: now,
        lastRequeueReason: 'stale_processing_timeout',
      };
    }
    await this.documentRepo.save(docs);
    this.logger.warn(
      `Requeued ${docs.length} stale OCR document(s) stuck in PROCESSING`,
    );
  }

  private readPositiveIntConfig(key: string, fallback: number): number {
    const raw = this.configService.get<string>(key, String(fallback));
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }
    return Math.floor(parsed);
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
