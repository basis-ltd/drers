import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ChatRequest, ChatResponse, Ollama } from 'ollama';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { Document } from '../entities/document.entity';
import { DocumentOcrStatus } from '../enums/document-ocr-status.enum';
import { DOCUMENT_TYPE_TITLES } from '../constants/document-type-titles';
import {
  DOCUMENT_REVIEW_SYSTEM_PROMPT,
  OCR_SYSTEM_PROMPT,
  buildDocumentReviewChunkPrompt,
  buildDocumentReviewSynthesisPrompt,
  buildUserPrompt,
  parseChunkReviewResponse,
  parseDocumentReviewResponse,
  parseOcrResponse,
} from './prompts';
import type {
  OcrChunkReviewPayload,
  OcrEvaluationPayload,
  OcrPagePayload,
} from './prompts';

interface OcrContext {
  attempts?: number;
  lastAttemptAt?: string;
  pageCount?: number;
  reviewChunkCount?: number;
  pageLimitApplied?: number | null;
  [k: string]: unknown;
}

interface DownloadCandidate {
  url: string;
  source: string;
}

type StructuredScreeningPayload = {
  expectedTitle: string;
  detectedTitle: string;
  documentTypeMatch: boolean;
  titleMatch: boolean;
  titleMatchConfidence: number;
  summary: string;
  issues: string[];
  requiredSectionsFound: string[];
  missingSections: string[];
  optionalSectionsFound: string[];
  detectedSignals: string[];
  reviewNotes: string;
};

class OcrDownloadHttpError extends Error {
  constructor(
    readonly source: string,
    readonly status: number,
    readonly statusText: string,
  ) {
    super(
      `Failed to download document via ${source} (${status} ${statusText || 'Unknown'})`,
    );
  }
}

class OcrDownloadFailedError extends Error {
  constructor(
    readonly reasons: string[],
    readonly hasAuthError: boolean,
  ) {
    super(`Failed to download document. ${reasons.join(' | ')}`);
  }
}

class OcrProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class OcrOversizedDocumentError extends Error {
  constructor(
    readonly pageCount: number,
    readonly threshold: number,
  ) {
    super(
      `Document has ${pageCount} pages which exceeds OCR oversize threshold ${threshold}`,
    );
  }
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private readonly ollama: Ollama;
  private readonly ollamaHost: string;
  private readonly model: string;
  private readonly maxAttempts: number;
  private readonly pdfMaxPages: number;
  private readonly titleMatchPages: number;
  private readonly imageMaxEdgePx: number;
  private readonly signedDeliveryEnabled: boolean;
  private readonly signedUrlTtlSeconds: number;
  private readonly signedDeliveryType: string;
  private readonly cloudinaryConfigured: boolean;
  private readonly reviewChunkMaxChars = 12000;
  private readonly reviewExcerptMaxChars = 500;
  private readonly extractedTextMaxChars = 120000;
  private readonly downloadTimeoutMs: number;
  private readonly ollamaRequestTimeoutMs: number;
  private readonly providerHealthcheckTimeoutMs: number;
  private readonly ollamaFirstPageTimeoutMs: number;
  private readonly ollamaPageTimeoutMs: number;
  private readonly ollamaReviewTimeoutMs: number;
  private readonly ollamaSynthesisTimeoutMs: number;
  private readonly runtimePageCap: number;
  private readonly oversizedPdfThresholdPages: number;
  private readonly oversizedPdfStrategy: 'cap' | 'defer';
  private readonly providerTimeoutSignalTtlMs: number;
  private lastProviderTimeoutAt = 0;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    private readonly configService: ConfigService,
  ) {
    this.ollamaHost = this.resolveOllamaHost();
    this.ollama = new Ollama({ host: this.ollamaHost });
    this.model = this.configService.get<string>('OLLAMA_MODEL', 'qwen2.5vl:7b');
    this.maxAttempts = Number(
      this.configService.get<string>('OCR_MAX_ATTEMPTS', '3'),
    );
    this.pdfMaxPages = Number(
      this.configService.get<string>('OCR_PDF_MAX_PAGES', '0'),
    );
    this.titleMatchPages = Number(
      this.configService.get<string>('OCR_TITLE_MATCH_PAGES', '3'),
    );
    this.imageMaxEdgePx = Number(
      this.configService.get<string>('OCR_IMAGE_MAX_EDGE_PX', '1280'),
    );
    this.downloadTimeoutMs = this.readPositiveIntConfig(
      'OCR_DOWNLOAD_TIMEOUT_MS',
      45000,
    );
    this.ollamaRequestTimeoutMs = this.readPositiveIntConfig(
      'OCR_OLLAMA_REQUEST_TIMEOUT_MS',
      120000,
    );
    this.providerHealthcheckTimeoutMs = this.readPositiveIntConfig(
      'OCR_PROVIDER_HEALTHCHECK_TIMEOUT_MS',
      5000,
    );
    this.ollamaFirstPageTimeoutMs = this.readPositiveIntConfig(
      'OCR_OLLAMA_FIRST_PAGE_TIMEOUT_MS',
      this.ollamaRequestTimeoutMs,
    );
    this.ollamaPageTimeoutMs = this.readPositiveIntConfig(
      'OCR_OLLAMA_PAGE_TIMEOUT_MS',
      this.ollamaRequestTimeoutMs,
    );
    this.ollamaReviewTimeoutMs = this.readPositiveIntConfig(
      'OCR_OLLAMA_REVIEW_TIMEOUT_MS',
      this.ollamaRequestTimeoutMs,
    );
    this.ollamaSynthesisTimeoutMs = this.readPositiveIntConfig(
      'OCR_OLLAMA_SYNTHESIS_TIMEOUT_MS',
      this.ollamaRequestTimeoutMs,
    );
    this.runtimePageCap = this.readPositiveIntConfig(
      'OCR_RUNTIME_PAGE_CAP',
      30,
    );
    this.oversizedPdfThresholdPages = this.readPositiveIntConfig(
      'OCR_OVERSIZED_PDF_THRESHOLD_PAGES',
      120,
    );
    const oversizedStrategy = this.configService
      .get<string>('OCR_OVERSIZED_PDF_STRATEGY', 'cap')
      .toLowerCase()
      .trim();
    this.oversizedPdfStrategy = oversizedStrategy === 'defer' ? 'defer' : 'cap';
    this.providerTimeoutSignalTtlMs = this.readPositiveIntConfig(
      'OCR_PROVIDER_TIMEOUT_SIGNAL_TTL_MS',
      180000,
    );
    this.signedDeliveryEnabled =
      this.configService.get<string>('OCR_SIGNED_DELIVERY_ENABLED', 'true') !==
      'false';
    this.signedUrlTtlSeconds = Number(
      this.configService.get<string>('OCR_SIGNED_URL_TTL_SECONDS', '300'),
    );
    this.signedDeliveryType = this.configService.get<string>(
      'OCR_SIGNED_DELIVERY_TYPE',
      'authenticated',
    );

    const cloudName = this.configService.get<string>(
      'CLOUDINARY_CLOUD_NAME',
      '',
    );
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY', '');
    const apiSecret = this.configService.get<string>(
      'CLOUDINARY_API_SECRET',
      '',
    );
    this.cloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);
    if (this.cloudinaryConfigured) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
    } else if (this.signedDeliveryEnabled) {
      this.logger.warn(
        'Signed OCR delivery is enabled but Cloudinary config is incomplete. Falling back to stored URLs.',
      );
    }
    this.logger.log(
      `OCR configured (host=${this.describeHostForLog(this.ollamaHost)}, model=${this.model}, downloadTimeoutMs=${this.downloadTimeoutMs}, ollamaRequestTimeoutMs=${this.ollamaRequestTimeoutMs}, runtimePageCap=${this.runtimePageCap}, oversizedThreshold=${this.oversizedPdfThresholdPages}, oversizedStrategy=${this.oversizedPdfStrategy})`,
    );
  }

  async processDocument(documentId: string): Promise<void> {
    const runStartedAt = Date.now();
    let downloadMs: number | null = null;
    let rasterizeMs: number | null = null;
    let ollamaMs: number | null = null;
    const doc = await this.documentRepo.findOne({ where: { id: documentId } });
    if (!doc) {
      this.logger.warn(`Document ${documentId} not found`);
      return;
    }
    if (!doc.secureUrl && !doc.cloudinaryPublicId && !doc.cloudinaryUrl) {
      await this.markFailed(doc, 'Document has no downloadable URL', true);
      return;
    }

    const ctx: OcrContext = (doc.ocrContext as OcrContext) ?? {};
    const attempt = (ctx.attempts ?? 0) + 1;

    doc.ocrStatus = DocumentOcrStatus.PROCESSING;
    doc.ocrProvider = 'ollama';
    doc.ocrModel = this.model;
    doc.ocrStartedAt = new Date();
    doc.ocrErrorMessage = null;
    doc.ocrContext = {
      ...ctx,
      attempts: attempt,
      lastAttemptAt: new Date().toISOString(),
    };
    await this.documentRepo.save(doc);

    try {
      const downloadStartedAt = Date.now();
      const { buffer, source } = await this.downloadDocumentBuffer(doc);
      downloadMs = Date.now() - downloadStartedAt;
      const rasterizeStartedAt = Date.now();
      const { images, pageCount } = await this.toImages(
        buffer,
        doc.mimeType,
        doc.format,
      );
      rasterizeMs = Date.now() - rasterizeStartedAt;
      const pagePolicy = this.applyRuntimePagePolicy(
        images,
        pageCount,
        doc.documentType,
      );
      if (pagePolicy.oversizedDeferred) {
        throw new OcrOversizedDocumentError(
          pagePolicy.pageCount ?? 0,
          this.oversizedPdfThresholdPages,
        );
      }

      const ollamaStartedAt = Date.now();
      const evaluation: OcrEvaluationPayload = await this.runOllama(
        pagePolicy.images,
        doc.documentType,
      );
      ollamaMs = Date.now() - ollamaStartedAt;
      const expectedTitle =
        DOCUMENT_TYPE_TITLES[doc.documentType]?.title ?? doc.documentType;
      const structuredScreening: StructuredScreeningPayload = {
        expectedTitle,
        detectedTitle: evaluation.detectedTitle,
        documentTypeMatch: evaluation.documentTypeMatch,
        titleMatch: evaluation.titleMatch,
        titleMatchConfidence: evaluation.titleMatchConfidence,
        summary: evaluation.summary,
        issues: evaluation.issues,
        requiredSectionsFound: evaluation.requiredSectionsFound,
        missingSections: evaluation.missingSections,
        optionalSectionsFound: evaluation.optionalSectionsFound,
        detectedSignals: evaluation.detectedSignals,
        reviewNotes: evaluation.reviewNotes,
      };

      doc.ocrStatus = DocumentOcrStatus.EXTRACTED;
      doc.ocrCompletedAt = new Date();
      doc.ocrErrorMessage = null;
      doc.ocrConfidence = evaluation.confidence;
      doc.ocrExtractedText = evaluation.extractedText;
      doc.ocrExtractedData = structuredScreening;
      doc.aiScreeningResult = structuredScreening;
      doc.pageCount = pageCount ?? doc.pageCount;
      doc.ocrContext = {
        ...(doc.ocrContext as OcrContext),
        pageCount: pageCount ?? null,
        modelVersion: this.model,
        pageLimitApplied:
          pagePolicy.appliedPageCap ??
          (this.pdfMaxPages > 0 ? this.pdfMaxPages : null),
        oversizedPolicy: pagePolicy.policy,
        oversizedDeferred: pagePolicy.oversizedDeferred,
        processedPageCount: pagePolicy.images.length,
      };
      await this.documentRepo.save(doc);
      this.logger.log(
        `OCR complete for ${doc.id} (source=${source}, match=${evaluation.documentTypeMatch}, missing=${evaluation.missingSections.length}, conf=${evaluation.confidence})`,
      );
    } catch (err) {
      const providerUnavailable = this.isProviderUnavailableError(err);
      const baseMessage = this.getFailureMessage(err);
      const message = providerUnavailable
        ? `Provider unavailable: ${baseMessage}`
        : baseMessage;
      const oversizedDeferred = err instanceof OcrOversizedDocumentError;
      const atCap =
        oversizedDeferred ||
        (providerUnavailable ? false : attempt >= this.maxAttempts);
      const rawResponse = (err as { rawResponse?: string }).rawResponse;
      const updatedContext: OcrContext = {
        ...((doc.ocrContext as OcrContext) ?? {}),
      };
      const timeoutTag = this.extractTimeoutReasonTag(err);
      if (providerUnavailable) {
        updatedContext.attempts = ctx.attempts ?? 0;
        updatedContext.lastProviderUnavailableAt = new Date().toISOString();
      }
      if (timeoutTag) {
        updatedContext.lastTimeoutTag = timeoutTag;
        updatedContext.lastTimeoutAt = new Date().toISOString();
        updatedContext.lastFailureReason = timeoutTag;
        this.lastProviderTimeoutAt = Date.now();
      }
      if (oversizedDeferred && err instanceof OcrOversizedDocumentError) {
        updatedContext.lastFailureReason = 'oversized_document_deferred';
        updatedContext.oversizedPageCount = err.pageCount;
        updatedContext.oversizedThreshold = err.threshold;
      }
      if (rawResponse) {
        updatedContext.lastRawResponse = rawResponse.slice(0, 4000);
      }
      doc.ocrContext = updatedContext;
      await this.markFailed(doc, message, atCap);
      if (providerUnavailable) {
        this.logger.warn(`OCR provider unavailable for ${doc.id}: ${message}`);
      }
      if (oversizedDeferred) {
        this.logger.warn(
          `OCR deferred for oversized document ${doc.id}: ${message}`,
        );
      }
      if (err instanceof OcrDownloadFailedError && err.hasAuthError) {
        this.logger.warn(
          `Download authorization issue while OCRing ${doc.id}: ${message}`,
        );
      }
      this.logger.error(
        `OCR failed for ${doc.id} (attempt ${attempt}/${this.maxAttempts}): ${message}`,
      );
    } finally {
      this.logger.debug(
        `OCR timings for ${documentId}: download=${downloadMs ?? -1}ms rasterize=${rasterizeMs ?? -1}ms ollama=${ollamaMs ?? -1}ms total=${Date.now() - runStartedAt}ms`,
      );
    }
  }

  async resetOcr(documentId: string): Promise<Document> {
    const doc = await this.documentRepo.findOneOrFail({
      where: { id: documentId },
    });
    doc.ocrStatus = DocumentOcrStatus.PENDING;
    doc.ocrErrorMessage = null;
    doc.ocrStartedAt = null;
    doc.ocrCompletedAt = null;
    const ctx: OcrContext = (doc.ocrContext as OcrContext) ?? {};
    doc.ocrContext = { ...ctx, attempts: 0 };
    return this.documentRepo.save(doc);
  }

  async requeueFailedDownloadAuthErrors(limit = 200): Promise<number> {
    const docs = await this.documentRepo
      .createQueryBuilder('doc')
      .where('doc.isCurrentVersion = :current', { current: true })
      .andWhere('doc.ocrStatus = :failed', { failed: DocumentOcrStatus.FAILED })
      .andWhere(
        new Brackets((qb) => {
          qb.where('doc.ocrErrorMessage ILIKE :s401', { s401: '%401%' })
            .orWhere('doc.ocrErrorMessage ILIKE :unauthorized', {
              unauthorized: '%unauthorized%',
            })
            .orWhere('doc.ocrErrorMessage ILIKE :s403', { s403: '%403%' })
            .orWhere('doc.ocrErrorMessage ILIKE :forbidden', {
              forbidden: '%forbidden%',
            });
        }),
      )
      .orderBy('doc.updatedAt', 'ASC')
      .limit(limit)
      .getMany();

    if (docs.length === 0) return 0;

    const now = new Date().toISOString();
    for (const doc of docs) {
      const ctx: OcrContext = (doc.ocrContext as OcrContext) ?? {};
      doc.ocrStatus = DocumentOcrStatus.PENDING;
      doc.ocrErrorMessage = null;
      doc.ocrStartedAt = null;
      doc.ocrCompletedAt = null;
      doc.ocrContext = {
        ...ctx,
        attempts: 0,
        lastRequeuedAt: now,
        lastRequeueReason: 'download_auth_error',
      };
    }

    await this.documentRepo.save(docs);
    this.logger.log(
      `Requeued ${docs.length} OCR document(s) after auth failures`,
    );
    return docs.length;
  }

  async checkProviderReachable(): Promise<{ ok: boolean; message: string }> {
    const healthUrl = `${this.ollamaHost}/api/tags`;
    try {
      const response = await this.fetchWithTimeout(
        healthUrl,
        this.providerHealthcheckTimeoutMs,
      );
      if (!response.ok) {
        return {
          ok: false,
          message: `Ollama health check failed (${response.status} ${response.statusText || 'Unknown'}) at ${this.describeHostForLog(this.ollamaHost)}`,
        };
      }
      return {
        ok: true,
        message: `Ollama reachable at ${this.describeHostForLog(this.ollamaHost)}`,
      };
    } catch (err) {
      return {
        ok: false,
        message: `Ollama health check failed at ${this.describeHostForLog(this.ollamaHost)}: ${this.formatErrorDetails(err)}`,
      };
    }
  }

  hasRecentProviderTimeoutSignal(): boolean {
    if (this.lastProviderTimeoutAt <= 0) return false;
    return (
      Date.now() - this.lastProviderTimeoutAt < this.providerTimeoutSignalTtlMs
    );
  }

  private async markFailed(
    doc: Document,
    message: string,
    atCap: boolean,
  ): Promise<void> {
    doc.ocrStatus = atCap
      ? DocumentOcrStatus.FAILED
      : DocumentOcrStatus.PENDING;
    doc.ocrErrorMessage = message.slice(0, 2000);
    doc.ocrCompletedAt = atCap ? new Date() : null;
    await this.documentRepo.save(doc);
  }

  private resolveDownloadCandidates(doc: Document): DownloadCandidate[] {
    const candidates: DownloadCandidate[] = [];
    if (
      this.signedDeliveryEnabled &&
      this.cloudinaryConfigured &&
      doc.cloudinaryPublicId
    ) {
      const resourceType = this.normalizeResourceType(
        doc.cloudinaryResourceType,
      );
      const expiresAt =
        Math.floor(Date.now() / 1000) + Math.max(this.signedUrlTtlSeconds, 60);
      const format = (doc.format ?? '').toLowerCase() || undefined;

      candidates.push({
        source: 'private_download:upload',
        url: cloudinary.utils.private_download_url(
          doc.cloudinaryPublicId,
          format ?? 'pdf',
          {
            resource_type: resourceType === 'auto' ? 'image' : resourceType,
            type: 'upload',
            expires_at: expiresAt,
          },
        ),
      });
      if (this.signedDeliveryType && this.signedDeliveryType !== 'upload') {
        candidates.push({
          source: `private_download:${this.signedDeliveryType}`,
          url: cloudinary.utils.private_download_url(
            doc.cloudinaryPublicId,
            format ?? 'pdf',
            {
              resource_type: resourceType === 'auto' ? 'image' : resourceType,
              type: this.signedDeliveryType,
              expires_at: expiresAt,
            },
          ),
        });
      }

      candidates.push({
        source: `signed:${this.signedDeliveryType}`,
        url: cloudinary.url(doc.cloudinaryPublicId, {
          secure: true,
          sign_url: true,
          type: this.signedDeliveryType,
          resource_type: resourceType === 'auto' ? 'image' : resourceType,
          expires_at: expiresAt,
        }),
      });
      if (this.signedDeliveryType !== 'upload') {
        candidates.push({
          source: 'signed:upload',
          url: cloudinary.url(doc.cloudinaryPublicId, {
            secure: true,
            sign_url: true,
            type: 'upload',
            resource_type: resourceType === 'auto' ? 'image' : resourceType,
            expires_at: expiresAt,
          }),
        });
      }
    }

    if (doc.secureUrl) {
      candidates.push({ source: 'secureUrl', url: doc.secureUrl });
    }
    if (doc.cloudinaryUrl) {
      candidates.push({ source: 'cloudinaryUrl', url: doc.cloudinaryUrl });
    }

    const seen = new Set<string>();
    return candidates.filter((candidate) => {
      if (seen.has(candidate.url)) return false;
      seen.add(candidate.url);
      return true;
    });
  }

  private async downloadDocumentBuffer(
    doc: Document,
  ): Promise<{ buffer: Buffer; source: string }> {
    const candidates = this.resolveDownloadCandidates(doc);
    if (candidates.length === 0) {
      throw new Error('Document has no download candidates');
    }

    const reasons: string[] = [];
    let hasAuthError = false;
    for (const candidate of candidates) {
      try {
        const buffer = await this.downloadAsBuffer(
          candidate.url,
          candidate.source,
        );
        return { buffer, source: candidate.source };
      } catch (err) {
        reasons.push(this.describeDownloadError(candidate.source, err));
        if (
          err instanceof OcrDownloadHttpError &&
          [401, 403].includes(err.status)
        ) {
          hasAuthError = true;
        }
      }
    }

    throw new OcrDownloadFailedError(reasons, hasAuthError);
  }

  private async downloadAsBuffer(url: string, source: string): Promise<Buffer> {
    let res: Response;
    try {
      res = await this.fetchWithTimeout(url, this.downloadTimeoutMs);
    } catch (err) {
      throw new Error(
        `Network failure via ${source}: ${this.formatErrorDetails(err)}`,
      );
    }
    if (!res.ok) {
      throw new OcrDownloadHttpError(source, res.status, res.statusText);
    }
    const arr = await res.arrayBuffer();
    return Buffer.from(arr);
  }

  private describeDownloadError(source: string, err: unknown): string {
    if (err instanceof OcrDownloadHttpError) {
      if ([401, 403].includes(err.status)) {
        return `${source}: auth denied (${err.status} ${err.statusText || 'Unknown'})`;
      }
      if (err.status === 404) {
        return `${source}: not found (404)`;
      }
      return `${source}: http ${err.status} ${err.statusText || 'Unknown'}`;
    }
    return `${source}: ${this.formatErrorDetails(err)}`;
  }

  private getFailureMessage(err: unknown): string {
    if (err instanceof OcrDownloadFailedError) {
      return err.message;
    }
    return this.formatErrorDetails(err);
  }

  private normalizeResourceType(
    resourceType: string | null,
  ): 'image' | 'video' | 'raw' | 'auto' {
    const value = (resourceType ?? '').toLowerCase();
    if (value === 'image' || value === 'video' || value === 'raw') {
      return value;
    }
    return 'auto';
  }

  private async toImages(
    buffer: Buffer,
    mimeType: string | null,
    format: string | null,
  ): Promise<{ images: Buffer[]; pageCount: number | null }> {
    const fmt = (format ?? '').toLowerCase();
    const mt = (mimeType ?? '').toLowerCase();
    const isPdf = mt === 'application/pdf' || fmt === 'pdf';
    const isImage =
      mt.startsWith('image/') ||
      ['png', 'jpg', 'jpeg', 'webp', 'gif', 'tiff', 'bmp'].includes(fmt);

    if (isImage) return { images: [buffer], pageCount: 1 };
    if (!isPdf) {
      throw new Error(
        `Unsupported document format for OCR: mimeType=${mimeType} format=${format}`,
      );
    }

    const { pdf } = (await import('pdf-to-img')) as {
      pdf: (
        input: Buffer | Uint8Array,
        opts?: { scale?: number },
      ) => Promise<AsyncIterable<Buffer> & { length: number }>;
    };
    const document = await pdf(buffer, { scale: 1.5 });
    const images: Buffer[] = [];
    let i = 0;
    for await (const page of document) {
      images.push(page);
      i += 1;
      if (this.pdfMaxPages > 0 && i >= this.pdfMaxPages) break;
    }
    if (images.length === 0) {
      throw new Error('PDF rasterization produced no pages');
    }
    return { images, pageCount: document.length };
  }

  private applyRuntimePagePolicy(
    images: Buffer[],
    pageCount: number | null,
    documentType: Document['documentType'],
  ): {
    images: Buffer[];
    pageCount: number | null;
    appliedPageCap: number | null;
    oversizedDeferred: boolean;
    policy: string;
  } {
    const total = pageCount ?? images.length;
    if (
      total > this.oversizedPdfThresholdPages &&
      this.oversizedPdfStrategy === 'defer'
    ) {
      this.logger.warn(
        `Deferring oversized OCR document (${documentType}): pages=${total}, threshold=${this.oversizedPdfThresholdPages}`,
      );
      return {
        images: [],
        pageCount,
        appliedPageCap: null,
        oversizedDeferred: true,
        policy: 'oversized_defer',
      };
    }

    let limitedImages = images;
    let appliedPageCap: number | null = null;
    if (this.runtimePageCap > 0 && images.length > this.runtimePageCap) {
      limitedImages = images.slice(0, this.runtimePageCap);
      appliedPageCap = this.runtimePageCap;
      this.logger.warn(
        `Applying runtime OCR page cap for ${documentType}: processing=${limitedImages.length}/${images.length}`,
      );
    }

    return {
      images: limitedImages,
      pageCount,
      appliedPageCap,
      oversizedDeferred: false,
      policy: appliedPageCap ? 'runtime_page_cap' : 'full_pass',
    };
  }

  private async runOllama(
    images: Buffer[],
    documentType: Document['documentType'],
  ): Promise<OcrEvaluationPayload> {
    const pages: OcrPagePayload[] = [];
    for (let i = 0; i < images.length; i++) {
      const normalized = await this.normalizeImage(images[i]);
      const judgeTitle = i < this.titleMatchPages;
      const page = await this.ocrSinglePage(
        normalized,
        documentType,
        i,
        images.length,
        judgeTitle,
      );
      pages.push(page);
    }

    const reviewChunks = this.buildReviewChunks(pages);
    const chunkReviews: OcrChunkReviewPayload[] = [];

    for (let i = 0; i < reviewChunks.length; i++) {
      chunkReviews.push(
        await this.reviewDocumentChunk(
          documentType,
          reviewChunks[i],
          i,
          reviewChunks.length,
        ),
      );
    }

    const evaluation = await this.synthesizeDocumentReview(
      documentType,
      chunkReviews,
    );
    evaluation.extractedText = this.aggregateExtractedText(pages);

    return evaluation;
  }

  private async ocrSinglePage(
    imageBase64: string,
    documentType: Document['documentType'],
    pageIndex: number,
    pageTotal: number,
    judgeTitle: boolean,
  ): Promise<OcrPagePayload> {
    const response = await this.chatWithOllama(
      {
        model: this.model,
        format: 'json',
        stream: false,
        options: {
          temperature: 0,
          num_ctx: 8192,
          num_predict: 2048,
        },
        messages: [
          { role: 'system', content: OCR_SYSTEM_PROMPT },
          {
            role: 'user',
            content: buildUserPrompt(
              documentType,
              pageIndex,
              pageTotal,
              judgeTitle,
            ),
            images: [imageBase64],
          },
        ],
      },
      `page OCR ${pageIndex + 1}/${pageTotal}`,
      pageIndex === 0
        ? this.ollamaFirstPageTimeoutMs
        : this.ollamaPageTimeoutMs,
    );
    const content = response.message?.content ?? '';
    try {
      const parsed = parseOcrResponse(content, documentType);
      if (!judgeTitle) {
        parsed.titleMatch = false;
        parsed.titleMatchConfidence = 0;
      }
      return parsed;
    } catch (err) {
      this.logger.error(
        `Page ${pageIndex + 1}/${pageTotal} raw Ollama output (head): ${content.slice(0, 500).replace(/\s+/g, ' ')}`,
      );
      const wrapped = new Error(
        `${err instanceof Error ? err.message : String(err)} [page=${pageIndex + 1}/${pageTotal}]`,
      );
      (wrapped as Error & { rawResponse?: string }).rawResponse = content;
      throw wrapped;
    }
  }

  private async reviewDocumentChunk(
    documentType: Document['documentType'],
    serializedPages: string,
    chunkIndex: number,
    chunkTotal: number,
  ): Promise<OcrChunkReviewPayload> {
    const response = await this.chatWithOllama(
      {
        model: this.model,
        format: 'json',
        stream: false,
        options: {
          temperature: 0,
          num_ctx: 8192,
          num_predict: 2048,
        },
        messages: [
          { role: 'system', content: DOCUMENT_REVIEW_SYSTEM_PROMPT },
          {
            role: 'user',
            content: buildDocumentReviewChunkPrompt(
              documentType,
              serializedPages,
              chunkIndex,
              chunkTotal,
            ),
          },
        ],
      },
      `document review chunk ${chunkIndex + 1}/${chunkTotal}`,
      this.ollamaReviewTimeoutMs,
    );
    const content = response.message?.content ?? '';
    try {
      return parseChunkReviewResponse(content, documentType);
    } catch (err) {
      this.logger.error(
        `Document review chunk ${chunkIndex + 1}/${chunkTotal} raw Ollama output (head): ${content.slice(0, 500).replace(/\s+/g, ' ')}`,
      );
      const wrapped = new Error(
        `${err instanceof Error ? err.message : String(err)} [review_chunk=${chunkIndex + 1}/${chunkTotal}]`,
      );
      (wrapped as Error & { rawResponse?: string }).rawResponse = content;
      throw wrapped;
    }
  }

  private async synthesizeDocumentReview(
    documentType: Document['documentType'],
    chunkReviews: OcrChunkReviewPayload[],
  ): Promise<OcrEvaluationPayload> {
    const response = await this.chatWithOllama(
      {
        model: this.model,
        format: 'json',
        stream: false,
        options: {
          temperature: 0,
          num_ctx: 8192,
          num_predict: 2048,
        },
        messages: [
          { role: 'system', content: DOCUMENT_REVIEW_SYSTEM_PROMPT },
          {
            role: 'user',
            content: buildDocumentReviewSynthesisPrompt(
              documentType,
              this.serializeChunkReviews(chunkReviews),
            ),
          },
        ],
      },
      'document review synthesis',
      this.ollamaSynthesisTimeoutMs,
    );
    const content = response.message?.content ?? '';
    try {
      return parseDocumentReviewResponse(content, documentType);
    } catch (err) {
      this.logger.error(
        `Document review synthesis raw Ollama output (head): ${content.slice(0, 500).replace(/\s+/g, ' ')}`,
      );
      const wrapped = new Error(
        `${err instanceof Error ? err.message : String(err)} [review_synthesis]`,
      );
      (wrapped as Error & { rawResponse?: string }).rawResponse = content;
      throw wrapped;
    }
  }

  private async chatWithOllama(
    payload: ChatRequest & { stream: false },
    stage: string,
    timeoutMs: number,
  ): Promise<ChatResponse> {
    try {
      return await this.withTimeout(
        () => this.ollama.chat(payload),
        timeoutMs,
        `Ollama ${stage}`,
      );
    } catch (err) {
      throw new OcrProviderUnavailableError(
        `Ollama request failed during ${stage} at ${this.describeHostForLog(this.ollamaHost)}: ${this.formatErrorDetails(err)}`,
      );
    }
  }

  private async fetchWithTimeout(
    url: string,
    timeoutMs: number,
  ): Promise<Response> {
    const signal =
      timeoutMs > 0 &&
      typeof AbortSignal !== 'undefined' &&
      typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(timeoutMs)
        : undefined;
    return fetch(url, signal ? { signal } : undefined);
  }

  private async withTimeout<T>(
    factory: () => Promise<T>,
    timeoutMs: number,
    label: string,
  ): Promise<T> {
    if (timeoutMs <= 0) {
      return factory();
    }
    let timeoutHandle: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error(`${label} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    try {
      return await Promise.race([factory(), timeoutPromise]);
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }
  }

  private resolveOllamaHost(): string {
    const preferred = this.configService
      .get<string>('OLLAMA_BASE_URL', '')
      .trim();
    const legacy = this.configService.get<string>('OLLAMA_HOST', '').trim();
    const candidates = [
      { key: 'OLLAMA_BASE_URL', value: preferred },
      { key: 'OLLAMA_HOST', value: legacy },
      { key: 'default', value: 'http://localhost:11434' },
    ];
    for (const candidate of candidates) {
      if (!candidate.value) continue;
      try {
        return this.normalizeHost(candidate.value);
      } catch (err) {
        this.logger.warn(
          `Invalid ${candidate.key} value (${candidate.value}). ${this.formatErrorDetails(err)}`,
        );
      }
    }
    return 'http://localhost:11434';
  }

  private normalizeHost(input: string): string {
    const prefixed = input.includes('://') ? input : `http://${input}`;
    const parsed = new URL(prefixed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`Unsupported protocol "${parsed.protocol}"`);
    }
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString().replace(/\/$/, '');
  }

  private readPositiveIntConfig(key: string, fallback: number): number {
    const raw = this.configService.get<string>(key, String(fallback));
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }
    return Math.floor(parsed);
  }

  private describeHostForLog(value: string): string {
    try {
      const parsed = new URL(value);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      return value;
    }
  }

  private formatErrorDetails(err: unknown): string {
    if (!(err instanceof Error)) {
      return String(err);
    }
    const details: string[] = [];
    const seen = new Set<unknown>();
    const queue: unknown[] = [err];

    while (queue.length > 0 && details.length < 5) {
      const current = queue.shift();
      if (!current || seen.has(current)) continue;
      seen.add(current);

      if (current instanceof AggregateError) {
        details.push(current.message || current.name);
        queue.push(...Array.from(current.errors as Iterable<unknown>));
        continue;
      }

      if (current instanceof Error) {
        const currentWithCode = current as Error & {
          code?: string;
          errno?: number;
          syscall?: string;
          cause?: unknown;
        };
        const segments = [current.message || current.name];
        if (currentWithCode.code) segments.push(`code=${currentWithCode.code}`);
        if (typeof currentWithCode.errno === 'number') {
          segments.push(`errno=${currentWithCode.errno}`);
        }
        if (currentWithCode.syscall) {
          segments.push(`syscall=${currentWithCode.syscall}`);
        }
        details.push(segments.join(' '));
        if (currentWithCode.cause) queue.push(currentWithCode.cause);
        continue;
      }

      if (typeof current === 'object') {
        try {
          details.push(JSON.stringify(current));
        } catch {
          details.push('[object]');
        }
      } else {
        details.push(String(current));
      }
    }

    return details.join(' | ');
  }

  private isProviderUnavailableError(err: unknown): boolean {
    if (err instanceof OcrProviderUnavailableError) {
      return true;
    }
    const normalized = this.formatErrorDetails(err).toLowerCase();
    if (!normalized.includes('ollama')) {
      return false;
    }
    return (
      normalized.includes('fetch failed') ||
      normalized.includes('network') ||
      normalized.includes('timed out') ||
      normalized.includes('econnrefused') ||
      normalized.includes('enotfound') ||
      normalized.includes('etimedout') ||
      normalized.includes('econnreset')
    );
  }

  private extractTimeoutReasonTag(err: unknown): string | null {
    const message = this.formatErrorDetails(err).toLowerCase();
    if (!message.includes('timed out')) return null;
    if (message.includes('page ocr')) return 'ollama_page_timeout';
    if (message.includes('document review chunk'))
      return 'ollama_review_timeout';
    if (message.includes('document review synthesis')) {
      return 'ollama_synthesis_timeout';
    }
    if (message.includes('network failure via')) return 'download_timeout';
    return 'generic_timeout';
  }

  private buildReviewChunks(pages: OcrPagePayload[]): string[] {
    const chunks: string[] = [];
    let current = '';

    for (let i = 0; i < pages.length; i++) {
      const serialized = this.serializePageForReview(pages[i], i);
      if (
        current &&
        current.length + serialized.length + 2 > this.reviewChunkMaxChars
      ) {
        chunks.push(current);
        current = serialized;
      } else {
        current = current ? `${current}\n\n${serialized}` : serialized;
      }
    }

    if (current) chunks.push(current);
    return chunks.length > 0 ? chunks : [''];
  }

  private serializePageForReview(page: OcrPagePayload, index: number): string {
    const lines = [`Page ${index + 1}`];
    if (page.detectedTitle) lines.push(`Detected title: ${page.detectedTitle}`);
    if (page.summary) lines.push(`Summary: ${page.summary}`);
    if (page.detectedSignals.length > 0) {
      lines.push(`Detected signals: ${page.detectedSignals.join(', ')}`);
    }
    if (page.reviewNotes) lines.push(`Review notes: ${page.reviewNotes}`);
    if (page.issues.length > 0) lines.push(`Issues: ${page.issues.join(', ')}`);

    const excerpt = this.compactText(
      page.extractedText,
      this.reviewExcerptMaxChars,
    );
    if (excerpt) lines.push(`OCR excerpt: ${excerpt}`);

    return lines.join('\n');
  }

  private serializeChunkReviews(chunkReviews: OcrChunkReviewPayload[]): string {
    return chunkReviews
      .map((review, index) =>
        JSON.stringify(
          {
            chunk: index + 1,
            summary: review.summary,
            detectedTitle: review.detectedTitle,
            titleMatch: review.titleMatch,
            titleMatchConfidence: review.titleMatchConfidence,
            issues: review.issues,
            requiredSectionsFound: review.requiredSectionsFound,
            optionalSectionsFound: review.optionalSectionsFound,
            detectedSignals: review.detectedSignals,
            reviewNotes: review.reviewNotes,
            confidence: review.confidence,
          },
          null,
          2,
        ),
      )
      .join('\n\n');
  }

  private aggregateExtractedText(pages: OcrPagePayload[]): string {
    return pages
      .map((page, index) => `--- Page ${index + 1} ---\n${page.extractedText}`)
      .join('\n\n')
      .slice(0, this.extractedTextMaxChars);
  }

  private compactText(value: string, maxChars: number): string {
    return value.replace(/\s+/g, ' ').trim().slice(0, maxChars);
  }

  private async normalizeImage(buffer: Buffer): Promise<string> {
    const resized = await sharp(buffer)
      .rotate()
      .resize({
        width: this.imageMaxEdgePx,
        height: this.imageMaxEdgePx,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png({ compressionLevel: 6 })
      .toBuffer();
    return resized.toString('base64');
  }
}
