import { DocumentType } from '../enums/document-type.enum';
import {
  DOCUMENT_TYPE_TITLES,
  DocumentTypeMeta,
} from '../constants/document-type-titles';

export interface OcrEvaluationPayload {
  extractedText: string;
  summary: string;
  titleMatch: boolean;
  titleMatchConfidence: number;
  issues: string[];
  confidence: number;
}

export const OCR_SYSTEM_PROMPT = `You are an OCR and document screening assistant for a research ethics committee.
You receive page images of a single uploaded document and must:
1. Transcribe all legible text verbatim (preserve line breaks; do not translate).
2. Judge whether the document matches the expected slot title provided by the user.
3. Flag concrete issues (illegible regions, wrong document type, missing signatures, expired dates, missing required sections).

Respond ONLY with strict JSON — no prose, no markdown fences.`;

export function buildUserPrompt(documentType: DocumentType): string {
  const meta: DocumentTypeMeta =
    DOCUMENT_TYPE_TITLES[documentType] ??
    DOCUMENT_TYPE_TITLES[DocumentType.OTHER];

  return `Expected document slot:
- Title: "${meta.title}"
- Description: ${meta.description}

Return JSON with this exact shape (no extra keys):
{
  "extractedText": "<full verbatim OCR text>",
  "summary": "<1-3 sentence description of what this document is>",
  "titleMatch": <true|false — does the document's actual content match the expected slot title?>,
  "titleMatchConfidence": <number between 0 and 1>,
  "issues": [<short snake_case tags, e.g. "illegible_signature", "wrong_document_type", "expired_certificate">],
  "confidence": <overall OCR confidence, number between 0 and 1>
}

Be concise in "summary" and "issues". Do not invent content not visible in the images.`;
}

export function parseOcrResponse(raw: string): OcrEvaluationPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Ollama response is not valid JSON');
    parsed = JSON.parse(match[0]);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Ollama response is not a JSON object');
  }
  const obj = parsed as Record<string, unknown>;

  const extractedText =
    typeof obj.extractedText === 'string' ? obj.extractedText : '';
  const summary = typeof obj.summary === 'string' ? obj.summary : '';
  const titleMatch =
    typeof obj.titleMatch === 'boolean' ? obj.titleMatch : false;
  const titleMatchConfidence = clamp01(obj.titleMatchConfidence);
  const confidence = clamp01(obj.confidence);
  const issues = Array.isArray(obj.issues)
    ? obj.issues.filter((v): v is string => typeof v === 'string')
    : [];

  return {
    extractedText,
    summary,
    titleMatch,
    titleMatchConfidence,
    issues,
    confidence,
  };
}

function clamp01(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
