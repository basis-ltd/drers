import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Application } from '../applications/entities/application.entity';
import { UserTenantRole } from '../user-tenant-roles/entities/user-tenant-role.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Application, UserTenantRole]),
    ApplicationsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
