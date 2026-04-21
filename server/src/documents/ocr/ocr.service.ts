import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ollama } from 'ollama';
import { Document } from '../entities/document.entity';
import { DocumentOcrStatus } from '../enums/document-ocr-status.enum';
import { DOCUMENT_TYPE_TITLES } from '../constants/document-type-titles';
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

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private readonly ollama: Ollama;
  private readonly model: string;
  private readonly maxAttempts: number;
  private readonly pdfMaxPages: number;

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
  }

  async processDocument(documentId: string): Promise<void> {
    const doc = await this.documentRepo.findOne({ where: { id: documentId } });
    if (!doc) {
      this.logger.warn(`Document ${documentId} not found`);
      return;
    }
    if (!doc.secureUrl) {
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
      const buffer = await this.downloadAsBuffer(doc.secureUrl);
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
        `OCR complete for ${doc.id} (titleMatch=${evaluation.titleMatch}, conf=${evaluation.confidence})`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const atCap = attempt >= this.maxAttempts;
      await this.markFailed(doc, message, atCap);
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

  private async downloadAsBuffer(url: string): Promise<Buffer> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `Failed to download document (${res.status} ${res.statusText})`,
      );
    }
    const arr = await res.arrayBuffer();
    return Buffer.from(arr);
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
    const document = await pdf(buffer, { scale: 2 });
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
    const base64Images = images.map((b) => b.toString('base64'));
    const response = await this.ollama.chat({
      model: this.model,
      format: 'json',
      stream: false,
      options: { temperature: 0 },
      messages: [
        { role: 'system', content: OCR_SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildUserPrompt(documentType),
          images: base64Images,
        },
      ],
    });
    return parseOcrResponse(response.message?.content ?? '');
  }
}
