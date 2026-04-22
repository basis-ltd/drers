import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationProtocol } from '../entities/application-protocol.entity';
import { ApplicationsService } from './applications.service';
import { UpdateApplicationProtocolDto } from '../dto/update-application-protocol.dto';

@Injectable()
export class ApplicationProtocolService {
  constructor(
    @InjectRepository(ApplicationProtocol)
    private readonly protocolRepo: Repository<ApplicationProtocol>,
    private readonly applicationsService: ApplicationsService,
  ) {}

  async upsert(
    applicationId: string,
    dto: UpdateApplicationProtocolDto,
    userId: string,
  ): Promise<ApplicationProtocol> {
    await this.applicationsService.assertOwnerAndDraft(applicationId, userId);

    let entity = await this.protocolRepo.findOne({ where: { applicationId } });

    if (!entity) {
      entity = this.protocolRepo.create({
        applicationId,
        createdById: userId,
        lastUpdatedById: userId,
      });
    }

    Object.entries(dto).forEach(([k, v]) => {
      if (v !== undefined)
        (entity as unknown as Record<string, unknown>)[k] = v;
    });
    entity.lastUpdatedById = userId;

    return this.protocolRepo.save(entity);
  }
}
