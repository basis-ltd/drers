import { BadRequestException } from '@nestjs/common';
import { AuditLog } from '../../common/entities/audit-log.entity';
import { AuditLogService } from './audit-log.service';

function makeQueryBuilder() {
  return {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
  };
}

describe('AuditLogService', () => {
  const qb = makeQueryBuilder();
  const repo = {
    save: jest.fn(),
    create: jest.fn((row: unknown) => row),
    createQueryBuilder: jest.fn(() => qb),
  };

  let service: AuditLogService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuditLogService(repo as never);
  });

  it('returns offset pagination metadata', async () => {
    const row = {
      id: 'audit-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    } as AuditLog;
    qb.getManyAndCount.mockResolvedValue([[row], 3]);

    const result = await service.fetchAuditLogs({}, { page: 1, size: 2 });

    expect(result.mode).toBe('offset');
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
    expect(result.page).toBe(1);
    expect(result.items).toHaveLength(1);
  });

  it('returns cursor pagination with next cursor', async () => {
    const rowA = {
      id: 'audit-a',
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
    } as AuditLog;
    const rowB = {
      id: 'audit-b',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    } as AuditLog;
    qb.getMany.mockResolvedValue([rowA, rowB]);

    const result = await service.fetchAuditLogs({}, { limit: 1 });

    expect(result.mode).toBe('cursor');
    expect(result.items).toEqual([rowA]);
    expect(result.nextCursor).toBeTruthy();
  });

  it('rejects invalid cursor format', async () => {
    await expect(
      service.fetchAuditLogs({}, { cursor: 'bad-cursor', limit: 10 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
