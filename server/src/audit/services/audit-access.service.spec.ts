import { ForbiddenException } from '@nestjs/common';
import { RoleName } from '../../common/enums';
import { AuditAccessService } from './audit-access.service';

describe('AuditAccessService', () => {
  const userTenantRoles = {
    findByUser: jest.fn(),
  };

  const service = new AuditAccessService(userTenantRoles as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('scopes non-privileged users to their own actor id and tenants', async () => {
    userTenantRoles.findByUser.mockResolvedValue([
      {
        tenantId: 'tenant-a',
        role: { name: RoleName.APPLICANT },
      },
      {
        tenantId: 'tenant-b',
        role: { name: RoleName.REVIEWER },
      },
    ]);

    const scope = await service.buildScope(
      { sub: 'user-1', email: 'u@example.com' },
      {},
    );

    expect(scope).toEqual({
      isPrivileged: false,
      createdById: 'user-1',
      tenantIds: ['tenant-a', 'tenant-b'],
    });
  });

  it('allows privileged users to query arbitrary actor and tenant', async () => {
    userTenantRoles.findByUser.mockResolvedValue([
      {
        tenantId: 'tenant-a',
        role: { name: RoleName.SYS_ADMIN },
      },
    ]);

    const scope = await service.buildScope(
      { sub: 'admin-1', email: 'a@example.com' },
      {
        createdById: 'other-user',
        tenantId: 'tenant-z',
      },
    );

    expect(scope).toEqual({
      isPrivileged: true,
      createdById: 'other-user',
      tenantId: 'tenant-z',
    });
  });

  it('rejects non-privileged cross-user access', async () => {
    userTenantRoles.findByUser.mockResolvedValue([
      {
        tenantId: 'tenant-a',
        role: { name: RoleName.APPLICANT },
      },
    ]);

    await expect(
      service.buildScope(
        { sub: 'user-1', email: 'u@example.com' },
        { createdById: 'user-2' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
