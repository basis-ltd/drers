import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { Application } from '../../applications/entities/application.entity';
import { DocumentType } from '../enums/document-type.enum';

@Entity('documents')
export class Document extends BaseDomain {
  @Index('idx_documents_application_id')
  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @Column({ name: 'document_type', type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ name: 'original_filename', type: 'varchar', length: 500 })
  originalFilename: string;

  @Column({ name: 'cloudinary_public_id', type: 'varchar', length: 500, nullable: true })
  cloudinaryPublicId: string | null;

  @Column({ name: 'cloudinary_url', type: 'varchar', length: 1000, nullable: true })
  cloudinaryUrl: string | null;

  @Column({ name: 'secure_url', type: 'varchar', length: 1000, nullable: true })
  secureUrl: string | null;

  @Column({ name: 'format', type: 'varchar', length: 50 })
  format: string;

  @Column({ name: 'file_size_bytes', type: 'integer' })
  fileSizeBytes: number;

  @Column({ name: 'checksum', type: 'varchar', length: 128, nullable: true })
  checksum: string | null;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ name: 'is_current_version', type: 'boolean', default: true })
  isCurrentVersion: boolean;

  @Column({ name: 'ai_screening_result', type: 'jsonb', nullable: true })
  aiScreeningResult: Record<string, unknown> | null;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;
}
