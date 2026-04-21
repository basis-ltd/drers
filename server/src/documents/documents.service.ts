import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { ApplicationsService } from '../applications/services/applications.service';
import { RegisterDocumentDto } from './dto/register-document.dto';
import { createHash } from 'crypto';
import { DocumentOcrStatus } from './enums/document-ocr-status.enum';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    private readonly applicationsService: ApplicationsService,
    private readonly configService: ConfigService,
  ) {}

  async getUploadSignature(
    applicationId: string,
    userId: string,
  ): Promise<{
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
    folder: string;
  }> {
    await this.applicationsService.assertOwnerAndEditable(applicationId, userId);

    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME', '');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY', '');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET', '');
    const baseFolder = this.configService.get<string>(
      'CLOUDINARY_DOCUMENTS_FOLDER',
      'rnec/applications/documents',
    );
    if (!cloudName || !apiKey || !apiSecret) {
      throw new UnprocessableEntityException(
        'Cloudinary configuration is incomplete. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `${baseFolder}/${applicationId}`;
    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(toSign).digest('hex');

    return {
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder,
    };
  }

  async registerUpload(
    applicationId: string,
    dto: RegisterDocumentDto,
    userId: string,
  ): Promise<Document> {
    await this.applicationsService.assertOwnerAndEditable(applicationId, userId);

    await this.documentRepo.update(
      { applicationId, documentType: dto.documentType, isCurrentVersion: true },
      { isCurrentVersion: false, lastUpdatedById: userId },
    );

    const entity = this.documentRepo.create({
      applicationId,
      documentType: dto.documentType,
      originalFilename: dto.originalFilename,
      mimeType: dto.mimeType ?? null,
      format: dto.format,
      fileSizeBytes: dto.fileSizeBytes,
      isRequired: dto.isRequired ?? false,
      isCurrentVersion: true,
      cloudinaryPublicId: dto.publicId,
      cloudinaryUrl: dto.url ?? dto.secureUrl,
      secureUrl: dto.secureUrl,
      cloudinaryResourceType: dto.resourceType ?? null,
      pageCount: null,
      detectedLanguages: null,
      hasTextLayer: null,
      scanQualityScore: null,
      checksum: dto.checksum ?? null,
      ocrStatus: DocumentOcrStatus.PENDING,
      ocrProvider: null,
      ocrModel: null,
      ocrStartedAt: null,
      ocrCompletedAt: null,
      ocrErrorMessage: null,
      ocrConfidence: null,
      ocrExtractedText: null,
      ocrExtractedData: null,
      ocrContext: null,
      aiScreeningResult: null,
      createdById: userId,
      lastUpdatedById: userId,
    });

    return this.documentRepo.save(entity);
  }

  async findAll(applicationId: string, userId: string): Promise<Document[]> {
    await this.applicationsService.findOneOrFail(applicationId, userId);

    return this.documentRepo.find({
      where: { applicationId, isCurrentVersion: true },
      order: { createdAt: 'ASC' },
    });
  }

  async remove(applicationId: string, docId: string, userId: string): Promise<void> {
    await this.applicationsService.assertOwnerAndEditable(applicationId, userId);

    const doc = await this.documentRepo.findOne({
      where: { id: docId, applicationId },
    });

    if (!doc) throw new NotFoundException('Document not found');

    await this.documentRepo.remove(doc);
  }
}
