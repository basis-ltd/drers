import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { ApplicationDetails } from './entities/application-details.entity';
import { ApplicationTeam } from './entities/application-team.entity';
import { CoInvestigator } from './entities/co-investigator.entity';
import { StudySite } from './entities/study-site.entity';
import { ApplicationProtocol } from './entities/application-protocol.entity';
import { ApplicationEthics } from './entities/application-ethics.entity';
import { ApplicationDeclaration } from './entities/application-declaration.entity';
import { UserTenantRolesModule } from '../user-tenant-roles/user-tenant-roles.module';
import { Document } from '../documents/entities/document.entity';
import { ApplicationsController } from './controllers/applications.controller';
import { ApplicationDetailsController } from './controllers/application-details.controller';
import { ApplicationTeamController } from './controllers/application-team.controller';
import { ApplicationProtocolController } from './controllers/application-protocol.controller';
import { ApplicationEthicsController } from './controllers/application-ethics.controller';
import { ApplicationDeclarationController } from './controllers/application-declaration.controller';
import { ApplicationsService } from './services/applications.service';
import { ApplicationDetailsService } from './services/application-details.service';
import { ApplicationTeamService } from './services/application-team.service';
import { ApplicationProtocolService } from './services/application-protocol.service';
import { ApplicationEthicsService } from './services/application-ethics.service';
import { ApplicationDeclarationService } from './services/application-declaration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationDetails,
      ApplicationTeam,
      CoInvestigator,
      StudySite,
      ApplicationProtocol,
      ApplicationEthics,
      ApplicationDeclaration,
      Document,
    ]),
    UserTenantRolesModule,
  ],
  controllers: [
    ApplicationsController,
    ApplicationDetailsController,
    ApplicationTeamController,
    ApplicationProtocolController,
    ApplicationEthicsController,
    ApplicationDeclarationController,
  ],
  providers: [
    ApplicationsService,
    ApplicationDetailsService,
    ApplicationTeamService,
    ApplicationProtocolService,
    ApplicationEthicsService,
    ApplicationDeclarationService,
  ],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
