import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { Application } from '../../applications/entities/application.entity';
import { DocumentType } from '../enums/document-type.enum';
import { DocumentOcrStatus } from '../enums/document-ocr-status.enum';

@Entity('documents')
export class Document extends BaseDomain {
  @Index('idx_documents_application_id')
  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @Column({ name: 'document_type', type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ name: 'original_filename', type: 'varchar', length: 500 })
  originalFilename: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType: string | null;

  @Column({ name: 'cloudinary_public_id', type: 'varchar', length: 500, nullable: true })
  cloudinaryPublicId: string | null;

  @Column({ name: 'cloudinary_url', type: 'varchar', length: 1000, nullable: true })
  cloudinaryUrl: string | null;

  @Column({ name: 'secure_url', type: 'varchar', length: 1000, nullable: true })
  secureUrl: string | null;

  @Column({ name: 'cloudinary_resource_type', type: 'varchar', length: 50, nullable: true })
  cloudinaryResourceType: string | null;

  @Column({ name: 'format', type: 'varchar', length: 50 })
  format: string;

  @Column({ name: 'page_count', type: 'integer', nullable: true })
  pageCount: number | null;

  @Column({ name: 'detected_languages', type: 'text', array: true, nullable: true })
  detectedLanguages: string[] | null;

  @Column({ name: 'has_text_layer', type: 'boolean', nullable: true })
  hasTextLayer: boolean | null;

  @Column({ name: 'scan_quality_score', type: 'numeric', precision: 5, scale: 2, nullable: true })
  scanQualityScore: number | null;

  @Column({ name: 'file_size_bytes', type: 'integer' })
  fileSizeBytes: number;

  @Column({ name: 'checksum', type: 'varchar', length: 128, nullable: true })
  checksum: string | null;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ name: 'is_current_version', type: 'boolean', default: true })
  isCurrentVersion: boolean;

  @Column({
    name: 'ocr_status',
    type: 'enum',
    enum: DocumentOcrStatus,
    default: DocumentOcrStatus.PENDING,
  })
  ocrStatus: DocumentOcrStatus;

  @Column({ name: 'ocr_provider', type: 'varchar', length: 100, nullable: true })
  ocrProvider: string | null;

  @Column({ name: 'ocr_model', type: 'varchar', length: 150, nullable: true })
  ocrModel: string | null;

  @Column({ name: 'ocr_started_at', type: 'timestamptz', nullable: true })
  ocrStartedAt: Date | null;

  @Column({ name: 'ocr_completed_at', type: 'timestamptz', nullable: true })
  ocrCompletedAt: Date | null;

  @Column({ name: 'ocr_error_message', type: 'text', nullable: true })
  ocrErrorMessage: string | null;

  @Column({ name: 'ocr_confidence', type: 'numeric', precision: 5, scale: 2, nullable: true })
  ocrConfidence: number | null;

  @Column({ name: 'ocr_extracted_text', type: 'text', nullable: true })
  ocrExtractedText: string | null;

  @Column({ name: 'ocr_extracted_data', type: 'jsonb', nullable: true })
  ocrExtractedData: Record<string, unknown> | null;

  @Column({ name: 'ocr_context', type: 'jsonb', nullable: true })
  ocrContext: Record<string, unknown> | null;

  @Column({ name: 'ai_screening_result', type: 'jsonb', nullable: true })
  aiScreeningResult: Record<string, unknown> | null;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;
}
