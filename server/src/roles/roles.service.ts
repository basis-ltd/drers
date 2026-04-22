import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RoleName } from '../common/enums';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  findOneRole(id: string): Promise<Role | null> {
    return this.roleRepository.findOneBy({ id });
  }

  findRoleByName(name: RoleName): Promise<Role | null> {
    return this.roleRepository.findOneBy({ name });
  }

  findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: { module: 'ASC', code: 'ASC' },
    });
  }

  findOnePermission(id: string): Promise<Permission | null> {
    return this.permissionRepository.findOneBy({ id });
  }
}
