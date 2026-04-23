import { ConfigService } from '@nestjs/config';
import { OcrService } from './ocr.service';
import { OcrPagePayload } from './prompts';

describe('OcrService', () => {
  function createService(overrides?: Record<string, string>) {
    const repo = {
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    const config = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (overrides && key in overrides) return overrides[key];
        return defaultValue;
      }),
    } as unknown as ConfigService;

    return new OcrService(repo as never, config);
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not impose the old 20-page PDF cap by default', () => {
    const service = createService();

    expect((service as OcrService & { pdfMaxPages: number }).pdfMaxPages).toBe(
      0,
    );
  });

  it('keeps all later-page digests in document review chunking', () => {
    const service = createService();
    const pages = Array.from({ length: 25 }, (_, index) => ({
      extractedText: `Text for page ${index + 1}`,
      summary: `Summary for page ${index + 1}`,
      detectedTitle: '',
      titleMatch: index === 0,
      titleMatchConfidence: index === 0 ? 0.8 : 0,
      issues: [],
      detectedSignals: [],
      reviewNotes: '',
      confidence: 0.9,
    })) satisfies OcrPagePayload[];

    const chunks = (
      service as OcrService & {
        buildReviewChunks: (pages: OcrPagePayload[]) => string[];
      }
    ).buildReviewChunks(pages);

    expect(chunks.join('\n')).toContain('Page 1');
    expect(chunks.join('\n')).toContain('Page 25');
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('prefers OLLAMA_BASE_URL when configured', () => {
    const service = createService({
      OLLAMA_BASE_URL: 'https://ollama.internal:11434',
      OLLAMA_HOST: 'legacy-host:11434',
    });

    expect((service as OcrService & { ollamaHost: string }).ollamaHost).toBe(
      'https://ollama.internal:11434',
    );
  });

  it('falls back to OLLAMA_HOST when OLLAMA_BASE_URL is empty', () => {
    const service = createService({
      OLLAMA_BASE_URL: '',
      OLLAMA_HOST: 'legacy-host:11434',
    });

    expect((service as OcrService & { ollamaHost: string }).ollamaHost).toBe(
      'http://legacy-host:11434',
    );
  });

  it('includes nested transport cause details in failure message', () => {
    const service = createService();
    const rootCause = Object.assign(new Error('connect ECONNREFUSED'), {
      code: 'ECONNREFUSED',
      syscall: 'connect',
    });
    const err = new Error('fetch failed');
    (err as Error & { cause?: unknown }).cause = rootCause;

    const message = (
      service as OcrService & { getFailureMessage: (err: unknown) => string }
    ).getFailureMessage(err);

    expect(message).toContain('fetch failed');
    expect(message).toContain('code=ECONNREFUSED');
    expect(message).toContain('syscall=connect');
  });

  it('reports provider health check failures with details', async () => {
    const service = createService();
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('connect timeout'));

    const result = await service.checkProviderReachable();

    expect(fetchMock).toHaveBeenCalled();
    expect(result.ok).toBe(false);
    expect(result.message).toContain('health check failed');
    expect(result.message).toContain('connect timeout');
  });
});
