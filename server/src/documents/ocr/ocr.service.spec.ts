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
});
