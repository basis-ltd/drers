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

  findByTenant(tenantId: string): Promise<UserTenantRole[]> {
    return this.userTenantRoleRepository.find({
      where: { tenantId, isActive: true },
      relations: { user: true, role: true },
    });
  }
}
