import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDeclaration } from '../entities/application-declaration.entity';
import { ApplicationsService } from './applications.service';
import { UpdateApplicationDeclarationDto } from '../dto/update-application-declaration.dto';

@Injectable()
export class ApplicationDeclarationService {
  constructor(
    @InjectRepository(ApplicationDeclaration)
    private readonly declarationRepo: Repository<ApplicationDeclaration>,
    private readonly applicationsService: ApplicationsService,
  ) {}

  async upsert(
    applicationId: string,
    dto: UpdateApplicationDeclarationDto,
    userId: string,
  ): Promise<ApplicationDeclaration> {
    await this.applicationsService.assertOwnerAndDraft(applicationId, userId);

    let entity = await this.declarationRepo.findOne({ where: { applicationId } });

    if (!entity) {
      entity = this.declarationRepo.create({
        applicationId,
        createdById: userId,
        lastUpdatedById: userId,
      });
    }

    Object.entries(dto).forEach(([k, v]) => {
      if (v !== undefined) (entity as unknown as Record<string, unknown>)[k] = v;
    });

    if (dto.agreed) {
      entity.signedAt = new Date();
    }
    entity.lastUpdatedById = userId;

    return this.declarationRepo.save(entity);
  }
}
