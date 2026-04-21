import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { OcrService } from './ocr.service';

async function run(): Promise<void> {
  const rawLimit = process.argv[2];
  const limit = Number(rawLimit || '200');
  if (Number.isNaN(limit) || limit <= 0) {
    throw new Error(
      `Invalid limit "${rawLimit ?? ''}". Pass a positive integer, e.g. 200.`,
    );
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const ocrService = app.get(OcrService);
    const count = await ocrService.requeueFailedDownloadAuthErrors(limit);
    console.log(`Requeued ${count} OCR document(s)`);
  } finally {
    await app.close();
  }
}

run().catch((err) => {
  console.error(
    `Failed to requeue OCR download auth failures: ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exit(1);
});
