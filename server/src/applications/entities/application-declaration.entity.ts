import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseDomain } from '../../common/entities/base-domain.entity';
import { Auditable } from '../../audit/decorators/auditable.decorator';
import { Application } from './application.entity';

@Auditable()
@Entity('application_declarations')
export class ApplicationDeclaration extends BaseDomain {
  @Index('idx_app_decl_application_id')
  @Column({ name: 'application_id', type: 'uuid', unique: true })
  applicationId: string;

  @Column({ name: 'declaration_text', type: 'text', nullable: true })
  declarationText: string | null;

  @Column({ name: 'agreed', type: 'boolean', default: false })
  agreed: boolean;

  @Column({ name: 'signer_name', type: 'varchar', length: 255, nullable: true })
  signerName: string | null;

  @Column({
    name: 'signer_designation',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  signerDesignation: string | null;

  @Column({
    name: 'signature_cloudinary_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  signatureCloudinaryUrl: string | null;

  @Column({ name: 'signature_data', type: 'text', nullable: true })
  signatureData: string | null;

  @Column({ name: 'signed_at', type: 'timestamptz', nullable: true })
  signedAt: Date | null;

  @OneToOne(() => Application, (a) => a.declaration)
  @JoinColumn({ name: 'application_id' })
  application: Application;
}
