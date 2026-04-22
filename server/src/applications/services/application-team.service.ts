import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ApplicationTeam } from '../entities/application-team.entity';
import { CoInvestigator } from '../entities/co-investigator.entity';
import { StudySite } from '../entities/study-site.entity';
import { ApplicationsService } from './applications.service';
import { UpdateApplicationTeamDto } from '../dto/update-application-team.dto';

@Injectable()
export class ApplicationTeamService {
  constructor(
    @InjectRepository(ApplicationTeam)
    private readonly teamRepo: Repository<ApplicationTeam>,
    @InjectRepository(CoInvestigator)
    private readonly coInvRepo: Repository<CoInvestigator>,
    @InjectRepository(StudySite)
    private readonly siteRepo: Repository<StudySite>,
    private readonly applicationsService: ApplicationsService,
    private readonly dataSource: DataSource,
  ) {}

  async upsert(
    applicationId: string,
    dto: UpdateApplicationTeamDto,
    userId: string,
  ): Promise<ApplicationTeam> {
    await this.applicationsService.assertOwnerAndDraft(applicationId, userId);

    return this.dataSource.transaction(async (manager) => {
      // Upsert PI fields
      let team = await manager.findOne(ApplicationTeam, {
        where: { applicationId },
      });

      if (!team) {
        team = manager.create(ApplicationTeam, {
          applicationId,
          createdById: userId,
          lastUpdatedById: userId,
        });
      }

      const { coInvestigators, studySites, ...piFields } = dto;

      Object.entries(piFields).forEach(([k, v]) => {
        if (v !== undefined)
          (team as unknown as Record<string, unknown>)[k] = v;
      });
      team.lastUpdatedById = userId;
      await manager.save(ApplicationTeam, team);

      // Full replace of co-investigators
      if (coInvestigators !== undefined) {
        await manager.delete(CoInvestigator, { applicationId });
        if (coInvestigators.length > 0) {
          const entities = coInvestigators.map((item, index) =>
            manager.create(CoInvestigator, {
              applicationId,
              title: item.title ?? null,
              name: item.name,
              institution: item.institution ?? null,
              role: item.role ?? null,
              sortOrder: index,
              createdById: userId,
              lastUpdatedById: userId,
            }),
          );
          await manager.save(CoInvestigator, entities);
        }
      }

      // Full replace of study sites
      if (studySites !== undefined) {
        await manager.delete(StudySite, { applicationId });
        if (studySites.length > 0) {
          const entities = studySites.map((item, index) =>
            manager.create(StudySite, {
              applicationId,
              name: item.name,
              location: item.location ?? null,
              sortOrder: index,
              createdById: userId,
              lastUpdatedById: userId,
            }),
          );
          await manager.save(StudySite, entities);
        }
      }

      return team;
    });
  }
}
