import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationEthics } from '../entities/application-ethics.entity';
import { ApplicationsService } from './applications.service';
import { UpdateApplicationEthicsDto } from '../dto/update-application-ethics.dto';

@Injectable()
export class ApplicationEthicsService {
  constructor(
    @InjectRepository(ApplicationEthics)
    private readonly ethicsRepo: Repository<ApplicationEthics>,
    private readonly applicationsService: ApplicationsService,
  ) {}

  async upsert(
    applicationId: string,
    dto: UpdateApplicationEthicsDto,
    userId: string,
  ): Promise<ApplicationEthics> {
    await this.applicationsService.assertOwnerAndDraft(applicationId, userId);

    let entity = await this.ethicsRepo.findOne({ where: { applicationId } });

    if (!entity) {
      entity = this.ethicsRepo.create({
        applicationId,
        createdById: userId,
        lastUpdatedById: userId,
      });
    }

    Object.entries(dto).forEach(([k, v]) => {
      if (v !== undefined) (entity as unknown as Record<string, unknown>)[k] = v;
    });
    entity.lastUpdatedById = userId;

    return this.ethicsRepo.save(entity);
  }
}
