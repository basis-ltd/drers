import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Ollama } from 'ollama';
import { v2 as cloudinary } from 'cloudinary';
import { Document } from '../entities/document.entity';
import { DocumentOcrStatus } from '../enums/document-ocr-status.enum';
import { DOCUMENT_TYPE_TITLES } from '../constants/document-type-titles';
import sharp from 'sharp';
import {
  OCR_SYSTEM_PROMPT,
  buildUserPrompt,
  parseOcrResponse,
  OcrEvaluationPayload,
} from './prompts';

interface OcrContext {
  attempts?: number;
  lastAttemptAt?: string;
  pageCount?: number;
  [k: string]: unknown;
}

interface DownloadCandidate {
  url: string;
  source: string;
}

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

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private readonly ollama: Ollama;
  private readonly model: string;
  private readonly maxAttempts: number;
  private readonly pdfMaxPages: number;
  private readonly titleMatchPages: number;
  private readonly imageMaxEdgePx: number;
  private readonly signedDeliveryEnabled: boolean;
  private readonly signedUrlTtlSeconds: number;
  private readonly signedDeliveryType: string;
  private readonly cloudinaryConfigured: boolean;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get<string>(
      'OLLAMA_BASE_URL',
      'http://localhost:11434',
    );
    this.ollama = new Ollama({ host });
    this.model = this.configService.get<string>('OLLAMA_MODEL', 'qwen2.5vl:7b');
    this.maxAttempts = Number(
      this.configService.get<string>('OCR_MAX_ATTEMPTS', '3'),
    );
    this.pdfMaxPages = Number(
      this.configService.get<string>('OCR_PDF_MAX_PAGES', '20'),
    );
    this.titleMatchPages = Number(
      this.configService.get<string>('OCR_TITLE_MATCH_PAGES', '3'),
    );
    this.imageMaxEdgePx = Number(
      this.configService.get<string>('OCR_IMAGE_MAX_EDGE_PX', '1280'),
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
  }

  async processDocument(documentId: string): Promise<void> {
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
      const { buffer, source } = await this.downloadDocumentBuffer(doc);
      const { images, pageCount } = await this.toImages(
        buffer,
        doc.mimeType,
        doc.format,
      );

      const evaluation = await this.runOllama(images, doc.documentType);

      const expectedTitle =
        DOCUMENT_TYPE_TITLES[doc.documentType]?.title ?? doc.documentType;

      doc.ocrStatus = DocumentOcrStatus.EXTRACTED;
      doc.ocrCompletedAt = new Date();
      doc.ocrErrorMessage = null;
      doc.ocrConfidence = evaluation.confidence;
      doc.ocrExtractedText = evaluation.extractedText;
      doc.ocrExtractedData = {
        summary: evaluation.summary,
        titleMatch: evaluation.titleMatch,
        titleMatchConfidence: evaluation.titleMatchConfidence,
        issues: evaluation.issues,
      };
      doc.aiScreeningResult = {
        expectedTitle,
        titleMatch: evaluation.titleMatch,
        titleMatchConfidence: evaluation.titleMatchConfidence,
        issues: evaluation.issues,
        summary: evaluation.summary,
      };
      doc.pageCount = pageCount ?? doc.pageCount;
      doc.ocrContext = {
        ...(doc.ocrContext as OcrContext),
        pageCount: pageCount ?? null,
        modelVersion: this.model,
      };
      await this.documentRepo.save(doc);
      this.logger.log(
        `OCR complete for ${doc.id} (source=${source}, titleMatch=${evaluation.titleMatch}, conf=${evaluation.confidence})`,
      );
    } catch (err) {
      const message = this.getFailureMessage(err);
      const atCap = attempt >= this.maxAttempts;
      const rawResponse = (err as { rawResponse?: string }).rawResponse;
      if (rawResponse) {
        doc.ocrContext = {
          ...(doc.ocrContext as OcrContext),
          lastRawResponse: rawResponse.slice(0, 4000),
        };
      }
      await this.markFailed(doc, message, atCap);
      if (err instanceof OcrDownloadFailedError && err.hasAuthError) {
        this.logger.warn(
          `Download authorization issue while OCRing ${doc.id}: ${message}`,
        );
      }
      this.logger.error(
        `OCR failed for ${doc.id} (attempt ${attempt}/${this.maxAttempts}): ${message}`,
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

      // Admin download endpoint — bypasses CDN restrictions (e.g. the
      // "Allow delivery of PDF and ZIP files" account setting) by hitting
      // the API-auth /download endpoint directly. Preferred for PDFs.
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

      // Signed CDN URLs as a secondary option (works when the PDF/ZIP
      // delivery restriction is off on the Cloudinary account).
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
      res = await fetch(url);
    } catch (err) {
      throw new Error(
        `Network failure via ${source}: ${err instanceof Error ? err.message : String(err)}`,
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
    return `${source}: ${err instanceof Error ? err.message : String(err)}`;
  }

  private getFailureMessage(err: unknown): string {
    if (err instanceof OcrDownloadFailedError) {
      return err.message;
    }
    return err instanceof Error ? err.message : String(err);
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
      if (i >= this.pdfMaxPages) break;
    }
    if (images.length === 0) {
      throw new Error('PDF rasterization produced no pages');
    }
    return { images, pageCount: document.length };
  }

  private async runOllama(
    images: Buffer[],
    documentType: Document['documentType'],
  ): Promise<OcrEvaluationPayload> {
    const pages: OcrEvaluationPayload[] = [];
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
    return this.aggregate(pages);
  }

  private async ocrSinglePage(
    imageBase64: string,
    documentType: Document['documentType'],
    pageIndex: number,
    pageTotal: number,
    judgeTitle: boolean,
  ): Promise<OcrEvaluationPayload> {
    const response = await this.ollama.chat({
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
          content: buildUserPrompt(documentType, pageIndex, pageTotal),
          images: [imageBase64],
        },
      ],
    });
    const content = response.message?.content ?? '';
    try {
      const parsed = parseOcrResponse(content);
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

  private aggregate(pages: OcrEvaluationPayload[]): OcrEvaluationPayload {
    if (pages.length === 0) {
      throw new Error('No pages were processed');
    }
    if (pages.length === 1) return pages[0];

    const extractedText = pages
      .map((p, i) => `--- Page ${i + 1} ---\n${p.extractedText}`)
      .join('\n\n')
      .slice(0, 20000);
    const summary =
      pages[0].summary || pages.find((p) => p.summary)?.summary || '';
    const titleMatch = pages.some((p) => p.titleMatch);
    const titleMatchConfidence = Math.max(
      ...pages.map((p) => p.titleMatchConfidence),
    );
    const issues = Array.from(new Set(pages.flatMap((p) => p.issues)));
    const confidence =
      pages.reduce((acc, p) => acc + p.confidence, 0) / pages.length;
    return {
      extractedText,
      summary,
      titleMatch,
      titleMatchConfidence,
      issues,
      confidence,
    };
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
