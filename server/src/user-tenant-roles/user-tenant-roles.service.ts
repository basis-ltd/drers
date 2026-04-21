import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTenantRole } from './entities/user-tenant-role.entity';

@Injectable()
export class UserTenantRolesService {
  constructor(
    @InjectRepository(UserTenantRole)
    private readonly userTenantRoleRepository: Repository<UserTenantRole>,
  ) {}

  findByUser(userId: string): Promise<UserTenantRole[]> {
    return this.userTenantRoleRepository.find({
      where: { userId, isActive: true },
      relations: { tenant: true, role: true },
    });
  }

  findPrimaryForUser(userId: string): Promise<UserTenantRole | null> {
    return this.userTenantRoleRepository.findOne({
      where: { userId, isPrimary: true, isActive: true },
    });
  }

  findByTenant(tenantId: string): Promise<UserTenantRole[]> {
    return this.userTenantRoleRepository.find({
      where: { tenantId, isActive: true },
      relations: { user: true, role: true },
    });
  }

  async assign(params: {
    userId: string;
    tenantId: string;
    roleId: string;
    isPrimary?: boolean;
    createdById?: string | null;
  }): Promise<UserTenantRole> {
    const entity = this.userTenantRoleRepository.create({
      userId: params.userId,
      tenantId: params.tenantId,
      roleId: params.roleId,
      isPrimary: params.isPrimary ?? false,
      isActive: true,
      createdById: params.createdById ?? null,
      lastUpdatedById: params.createdById ?? null,
    });
    return this.userTenantRoleRepository.save(entity);
  }
}
