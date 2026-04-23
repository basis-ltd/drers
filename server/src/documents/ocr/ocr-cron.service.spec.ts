import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { OcrCronService } from './ocr-cron.service';
import { OcrService } from './ocr.service';
import { Document } from '../entities/document.entity';
import { DocumentOcrStatus } from '../enums/document-ocr-status.enum';

type QueryBuilderMock<T> = {
  where: jest.Mock;
  andWhere: jest.Mock;
  innerJoin: jest.Mock;
  orderBy: jest.Mock;
  limit: jest.Mock;
  getMany: jest.Mock<Promise<T[]>, []>;
  getOne: jest.Mock<Promise<T | null>, []>;
};

function createQueryBuilderMock<T>(opts?: {
  getMany?: T[];
  getOne?: T | null;
}): QueryBuilderMock<T> {
  const qb = {} as QueryBuilderMock<T>;
  qb.where = jest.fn().mockReturnValue(qb);
  qb.andWhere = jest.fn().mockReturnValue(qb);
  qb.innerJoin = jest.fn().mockReturnValue(qb);
  qb.orderBy = jest.fn().mockReturnValue(qb);
  qb.limit = jest.fn().mockReturnValue(qb);
  qb.getMany = jest.fn().mockResolvedValue(opts?.getMany ?? []);
  qb.getOne = jest.fn().mockResolvedValue(opts?.getOne ?? null);
  return qb;
}

describe('OcrCronService', () => {
  function createService(configOverrides?: Record<string, string>) {
    const staleQb = createQueryBuilderMock<Document>();
    const pickQb = createQueryBuilderMock<Document>();
    const repo = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValueOnce(staleQb)
        .mockReturnValueOnce(pickQb),
      save: jest.fn(),
    } as unknown as Repository<Document>;
    const ocrService = {
      checkProviderReachable: jest.fn(),
      processDocument: jest.fn(),
      requeueFailedDownloadAuthErrors: jest.fn().mockResolvedValue(0),
      hasRecentProviderTimeoutSignal: jest.fn().mockReturnValue(false),
    } as unknown as OcrService;
    const configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (configOverrides && key in configOverrides) {
          return configOverrides[key];
        }
        return defaultValue;
      }),
    } as unknown as ConfigService;

    const service = new OcrCronService(repo, ocrService, configService);
    service.onModuleInit();
    return {
      service,
      repo: repo as unknown as {
        createQueryBuilder: jest.Mock;
        save: jest.Mock;
      },
      ocrService: ocrService as unknown as {
        checkProviderReachable: jest.Mock;
        processDocument: jest.Mock;
        hasRecentProviderTimeoutSignal: jest.Mock;
      },
      staleQb,
      pickQb,
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips document processing when provider preflight fails', async () => {
    const { service, ocrService, repo } = createService({
      OCR_CRON_ENABLED: 'true',
    });
    ocrService.checkProviderReachable.mockResolvedValue({
      ok: false,
      message: 'offline',
    });

    await service.tick();

    expect(ocrService.checkProviderReachable).toHaveBeenCalledTimes(1);
    expect(ocrService.processDocument).not.toHaveBeenCalled();
    expect(repo.createQueryBuilder).toHaveBeenCalledTimes(1);
  });

  it('enters provider cooldown after consecutive failures', async () => {
    const { service, ocrService } = createService({
      OCR_CRON_ENABLED: 'true',
      OCR_PROVIDER_FAILURE_THRESHOLD: '2',
      OCR_PROVIDER_TIMEOUT_COOLDOWN_MS: '60000',
      OCR_PROVIDER_CHECK_INTERVAL_MS: '1',
    });
    ocrService.checkProviderReachable.mockResolvedValue({
      ok: false,
      message: 'timed out',
    });

    await service.tick();
    (
      service as OcrCronService & { lastProviderCheckAt: number }
    ).lastProviderCheckAt = 0;
    await service.tick();

    expect(
      (service as OcrCronService & { providerCooldownUntil: number })
        .providerCooldownUntil,
    ).toBeGreaterThan(Date.now());
  });

  it('requeues stale processing documents before picking next', async () => {
    const staleDoc = {
      id: 'stale-doc-id',
      ocrStatus: DocumentOcrStatus.PROCESSING,
      ocrContext: { attempts: 1 },
      ocrErrorMessage: null,
      ocrStartedAt: new Date(Date.now() - 60 * 60 * 1000),
      ocrCompletedAt: null,
    } as unknown as Document;
    const nextDoc = {
      id: 'next-doc-id',
      documentType: 'PROTOCOL',
    } as unknown as Document;
    const { service, ocrService, repo, staleQb, pickQb } = createService({
      OCR_CRON_ENABLED: 'true',
      OCR_PROVIDER_CHECK_INTERVAL_MS: '1',
      OCR_PROCESSING_STALE_MINUTES: '5',
    });
    staleQb.getMany.mockResolvedValue([staleDoc]);
    pickQb.getOne.mockResolvedValue(nextDoc);
    ocrService.checkProviderReachable.mockResolvedValue({
      ok: true,
      message: 'ok',
    });

    await service.tick();

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(ocrService.processDocument).toHaveBeenCalledWith('next-doc-id');
  });
});
