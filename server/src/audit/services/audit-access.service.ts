import { ForbiddenException, Injectable } from '@nestjs/common';
import { RoleName } from '../../common/enums';
import { UserTenantRolesService } from '../../user-tenant-roles/user-tenant-roles.service';
import type { JwtUser } from '../../auth/decorators/current-user.decorator';

const PRIVILEGED_AUDIT_ROLES = new Set<RoleName>([
  RoleName.SYS_ADMIN,
  RoleName.RNEC_ADMIN,
  RoleName.IRB_ADMIN,
]);

export interface AuditAccessRequest {
  createdById?: string;
  tenantId?: string;
}

export interface AuditAccessScope {
  isPrivileged: boolean;
  createdById?: string;
  tenantIds?: string[];
  tenantId?: string;
}

@Injectable()
export class AuditAccessService {
  constructor(private readonly userTenantRoles: UserTenantRolesService) {}

  async buildScope(
    user: JwtUser,
    requested: AuditAccessRequest,
  ): Promise<AuditAccessScope> {
    const assignments = await this.userTenantRoles.findByUser(user.sub);
    const roleNames = assignments.map((assignment) => assignment.role?.name);
    const tenantIds = assignments
      .map((assignment) => assignment.tenantId)
      .filter((tenantId): tenantId is string => Boolean(tenantId));
    const isPrivileged = roleNames.some((roleName) =>
      PRIVILEGED_AUDIT_ROLES.has(roleName),
    );

    if (isPrivileged) {
      return {
        isPrivileged,
        createdById: requested.createdById,
        tenantId: requested.tenantId,
      };
    }

    if (requested.createdById && requested.createdById !== user.sub) {
      throw new ForbiddenException(
        'You can only access your own audit activity.',
      );
    }

    if (requested.tenantId && !tenantIds.includes(requested.tenantId)) {
      throw new ForbiddenException(
        'You can only access audit data for assigned tenants.',
      );
    }

    return {
      isPrivileged,
      createdById: user.sub,
      tenantIds: requested.tenantId ? [requested.tenantId] : tenantIds,
    };
  }

  async ensurePrivileged(user: JwtUser): Promise<void> {
    const scope = await this.buildScope(user, {});
    if (!scope.isPrivileged) {
      throw new ForbiddenException(
        'Only admin roles can access aggregate audit reporting.',
      );
    }
  }
}
