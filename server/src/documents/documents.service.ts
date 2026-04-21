import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { ApplicationsService } from '../applications/services/applications.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    private readonly applicationsService: ApplicationsService,
  ) {}

  async upload(
    applicationId: string,
    file: Express.Multer.File,
    dto: UploadDocumentDto,
    userId: string,
  ): Promise<Document> {
    await this.applicationsService.assertOwnerAndEditable(applicationId, userId);

    const format = path.extname(file.originalname).replace('.', '').toLowerCase() || file.mimetype;

    const entity = this.documentRepo.create({
      applicationId,
      documentType: dto.documentType,
      originalFilename: file.originalname,
      format,
      fileSizeBytes: file.size,
      isRequired: dto.isRequired ?? false,
      isCurrentVersion: true,
      cloudinaryPublicId: null,
      cloudinaryUrl: null,
      secureUrl: null,
      checksum: null,
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
