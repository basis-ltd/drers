import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTenantRole } from './entities/user-tenant-role.entity';
import { UserTenantRolesService } from './user-tenant-roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserTenantRole])],
  providers: [UserTenantRolesService],
  exports: [UserTenantRolesService, TypeOrmModule],
})
export class UserTenantRolesModule {}
