import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { ApplicationStatus } from '../enums/application-status.enum';
import { ApplicationType } from '../enums/application-type.enum';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { ListApplicationsDto } from '../dto/list-applications.dto';
import { UserTenantRolesService } from '../../user-tenant-roles/user-tenant-roles.service';
import { Document } from '../../documents/entities/document.entity';
import { DocumentType } from '../../documents/enums/document-type.enum';
import { RoleName } from '../../common/enums';

const REQUIRED_DOCUMENT_TYPES: DocumentType[] = [
  DocumentType.PROTOCOL,
  DocumentType.INFORMED_CONSENT_FORM,
  DocumentType.PRINCIPAL_INVESTIGATOR_CV,
  DocumentType.ETHICS_TRAINING_CERT,
  DocumentType.NHRA_RESEARCHER_CERT,
];

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    private readonly userTenantRolesService: UserTenantRolesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateApplicationDto,
    userId: string,
  ): Promise<{ id: string; referenceNumber: string }> {
    const primaryRole = await this.userTenantRolesService.findPrimaryForUser(userId);
    if (!primaryRole) {
      throw new UnprocessableEntityException(
        'No primary tenant assignment found for this user. Please contact an administrator.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const year = new Date().getFullYear();
      const referenceNumber = await this.generateReferenceNumber(year, manager);

      const application = manager.create(Application, {
        referenceNumber,
        applicantId: userId,
        tenantId: primaryRole.tenantId,
        type: dto.type,
        status: ApplicationStatus.DRAFT,
        versionNumber: 1,
        parentApplicationId: dto.parentApplicationId ?? null,
        createdById: userId,
        lastUpdatedById: userId,
      });

      const saved = await manager.save(Application, application);
      return { id: saved.id, referenceNumber: saved.referenceNumber };
    });
  }

  async findAll(
    userId: string,
    query: ListApplicationsDto,
  ): Promise<{ data: Application[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.applicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.details', 'details')
      .where('app.applicantId = :userId', { userId })
      .orderBy('app.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      qb.andWhere('app.status = :status', { status: query.status });
    }
    if (query.type) {
      qb.andWhere('app.type = :type', { type: query.type });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOneOrFail(id: string, userId: string): Promise<Application> {
    const app = await this.applicationRepo.findOne({
      where: { id },
      relations: {
        details: true,
        team: true,
        protocol: true,
        ethics: true,
        declaration: true,
      },
    });

    if (!app) throw new NotFoundException('Application not found');
    if (app.applicantId !== userId) throw new ForbiddenException('Access denied');

    return app;
  }

  /**
   * Fetch an application for reading by its applicant or any staff role.
   * Staff = any active role other than APPLICANT.
   */
  async findOneForViewer(id: string, userId: string): Promise<Application> {
    const app = await this.applicationRepo.findOne({
      where: { id },
      relations: {
        applicant: true,
        details: true,
        team: true,
        protocol: true,
        ethics: true,
        declaration: true,
        studySites: true,
        coInvestigators: true,
      },
    });
    if (!app) throw new NotFoundException('Application not found');

    if (app.applicantId === userId) return app;

    const roles = await this.userTenantRolesService.findByUser(userId);
    const hasStaffRole = roles.some(
      (utr) => utr.role?.name && utr.role.name !== RoleName.APPLICANT,
    );
    if (!hasStaffRole) {
      throw new ForbiddenException('Access denied');
    }
    return app;
  }

  async submit(id: string, userId: string): Promise<Application> {
    const app = await this.applicationRepo.findOne({
      where: { id },
      relations: {
        details: true,
        team: true,
        protocol: true,
        ethics: true,
        declaration: true,
      },
    });

    if (!app) throw new NotFoundException('Application not found');
    if (app.applicantId !== userId) throw new ForbiddenException('Access denied');
    if (app.status !== ApplicationStatus.DRAFT) {
      throw new ForbiddenException('Only draft applications can be submitted');
    }

    await this.validateSubmissionCompleteness(app);

    app.status = ApplicationStatus.SUBMITTED;
    app.submittedAt = new Date();
    app.lastUpdatedById = userId;

    return this.applicationRepo.save(app);
  }

  /**
   * Shared status transition helper for cross-module workflow updates.
   */
  async transitionStatus(
    id: string,
    status: ApplicationStatus,
    userId: string,
    options?: { setDecisionAt?: boolean },
  ): Promise<Application> {
    const app = await this.applicationRepo.findOne({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');

    app.status = status;
    if (options?.setDecisionAt) {
      app.decisionAt = new Date();
    }
    app.lastUpdatedById = userId;
    return this.applicationRepo.save(app);
  }

  async withdraw(id: string, userId: string): Promise<Application> {
    const app = await this.applicationRepo.findOne({ where: { id } });

    if (!app) throw new NotFoundException('Application not found');
    if (app.applicantId !== userId) throw new ForbiddenException('Access denied');

    const withdrawableStatuses: ApplicationStatus[] = [
      ApplicationStatus.DRAFT,
      ApplicationStatus.SUBMITTED,
    ];
    if (!withdrawableStatuses.includes(app.status)) {
      throw new ForbiddenException(
        `Application in status "${app.status}" cannot be withdrawn`,
      );
    }

    app.status = ApplicationStatus.WITHDRAWN;
    app.lastUpdatedById = userId;

    return this.applicationRepo.save(app);
  }

  /**
   * Asserts the requesting user owns the application and it is still in DRAFT.
   * Returns the found entity so callers avoid a second DB round-trip.
   */
  async assertOwnerAndDraft(id: string, userId: string): Promise<Application> {
    const app = await this.applicationRepo.findOne({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');
    if (app.applicantId !== userId) {
      throw new ForbiddenException('Not the owner of this application');
    }
    if (app.status !== ApplicationStatus.DRAFT) {
      throw new ForbiddenException('Application is no longer editable');
    }
    return app;
  }

  /**
   * Same as assertOwnerAndDraft but allows QUERY_RAISED (used for document uploads).
   */
  async assertOwnerAndEditable(id: string, userId: string): Promise<Application> {
    const app = await this.applicationRepo.findOne({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');
    if (app.applicantId !== userId) {
      throw new ForbiddenException('Not the owner of this application');
    }
    const editableStatuses: ApplicationStatus[] = [
      ApplicationStatus.DRAFT,
      ApplicationStatus.QUERY_RAISED,
    ];
    if (!editableStatuses.includes(app.status)) {
      throw new ForbiddenException(
        'Documents can only be managed on draft or query-raised applications',
      );
    }
    return app;
  }

  private async generateReferenceNumber(
    year: number,
    manager: EntityManager,
  ): Promise<string> {
    const result = await manager
      .createQueryBuilder(Application, 'app')
      .select('app.reference_number', 'ref')
      .where('app.reference_number LIKE :pattern', { pattern: `RNEC-${year}-%` })
      .orderBy('app.reference_number', 'DESC')
      .limit(1)
      .setLock('pessimistic_write')
      .getRawOne<{ ref: string }>();

    let sequence = 1;
    if (result?.ref) {
      const parts = result.ref.split('-');
      const last = parseInt(parts[2], 10);
      if (!isNaN(last)) sequence = last + 1;
    }

    return `RNEC-${year}-${String(sequence).padStart(5, '0')}`;
  }

  private async validateSubmissionCompleteness(app: Application): Promise<void> {
    const missing: string[] = [];

    if (!app.details) missing.push('Application Details (Step 1)');
    if (!app.team) missing.push('Research Team (Step 2)');
    if (!app.protocol) missing.push('Study Protocol (Step 3)');
    if (!app.ethics) missing.push('Ethical Considerations (Step 4)');
    if (!app.declaration) missing.push('Declaration (Step 6)');
    if (app.declaration && !app.declaration.agreed) {
      missing.push('Declaration must be agreed to (Step 6)');
    }

    const documents = await this.documentRepo.find({
      where: { applicationId: app.id, isCurrentVersion: true },
      select: ['documentType'],
    });
    const presentTypes = new Set(documents.map((doc) => doc.documentType));
    const missingRequiredDocs = REQUIRED_DOCUMENT_TYPES.filter((type) => !presentTypes.has(type));
    if (missingRequiredDocs.length > 0) {
      missing.push(`Required documents missing (Step 5): ${missingRequiredDocs.join(', ')}`);
    }

    if (missing.length > 0) {
      throw new UnprocessableEntityException(
        `Application is incomplete. Missing: ${missing.join(', ')}`,
      );
    }
  }
}
