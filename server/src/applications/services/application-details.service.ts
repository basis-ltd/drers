import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDetails } from '../entities/application-details.entity';
import { ApplicationsService } from './applications.service';
import { UpdateApplicationDetailsDto } from '../dto/update-application-details.dto';

@Injectable()
export class ApplicationDetailsService {
  constructor(
    @InjectRepository(ApplicationDetails)
    private readonly detailsRepo: Repository<ApplicationDetails>,
    private readonly applicationsService: ApplicationsService,
  ) {}

  async upsert(
    applicationId: string,
    dto: UpdateApplicationDetailsDto,
    userId: string,
  ): Promise<ApplicationDetails> {
    await this.applicationsService.assertOwnerAndDraft(applicationId, userId);

    let entity = await this.detailsRepo.findOne({ where: { applicationId } });

    if (!entity) {
      entity = this.detailsRepo.create({
        applicationId,
        createdById: userId,
        lastUpdatedById: userId,
      });
    }

    Object.entries(dto).forEach(([k, v]) => {
      if (v !== undefined) (entity as unknown as Record<string, unknown>)[k] = v;
    });
    entity.lastUpdatedById = userId;

    return this.detailsRepo.save(entity);
  }
}
