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
1. Transcribe legible text (compact; replace line breaks with spaces; do not translate).
2. Judge whether the document matches the expected slot title provided by the user.
3. Flag concrete issues (illegible regions, wrong document type, missing signatures, expired dates, missing required sections).

OUTPUT RULES — follow EXACTLY:
- Return a SINGLE JSON object and NOTHING else.
- No markdown, no code fences, no commentary before or after.
- Start the response with "{" and end with "}".
- All strings must be valid JSON: escape double quotes as \\" and newlines as \\n.
- Do not include trailing commas.
- Keep "extractedText" under 4000 characters; summarize or truncate if longer.
- Keep "summary" under 400 characters.
- "issues" must be an array of short snake_case tags (no sentences).`;

export function buildUserPrompt(
  documentType: DocumentType,
  pageIndex?: number,
  pageTotal?: number,
): string {
  const meta: DocumentTypeMeta =
    DOCUMENT_TYPE_TITLES[documentType] ??
    DOCUMENT_TYPE_TITLES[DocumentType.OTHER];

  const pageLine =
    pageIndex !== undefined && pageTotal !== undefined
      ? `\nYou are looking at page ${pageIndex + 1} of ${pageTotal} from a single document.`
      : '';

  return `Expected document slot:
- Title: "${meta.title}"
- Description: ${meta.description}${pageLine}

Return JSON with this exact shape (no extra keys):
{
  "extractedText": "<OCR text for this page; compact, newlines escaped as \\n>",
  "summary": "<1-3 sentence description of what this page/document is>",
  "titleMatch": <true|false — does the page's visible content match the expected slot title?>,
  "titleMatchConfidence": <number between 0 and 1>,
  "issues": [<short snake_case tags, e.g. "illegible_signature", "wrong_document_type", "expired_certificate">],
  "confidence": <overall OCR confidence, number between 0 and 1>
}

Be concise in "summary" and "issues". Do not invent content not visible in the image.`;
}

export function parseOcrResponse(raw: string): OcrEvaluationPayload {
  const cleaned = stripFences(raw).trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const extracted = extractJsonObject(cleaned);
    if (!extracted) {
      throw new Error(
        `Ollama response is not valid JSON (len=${raw.length}, head="${raw.slice(0, 120).replace(/\s+/g, ' ')}")`,
      );
    }
    try {
      parsed = JSON.parse(extracted);
    } catch {
      parsed = JSON.parse(repairJson(extracted));
    }
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

// Only strip markdown code fences when the WHOLE response is wrapped in them.
// Avoids mangling responses where a ``` appears inside a JSON string value.
function stripFences(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('```')) return raw;
  const m = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```\s*$/i);
  return m ? m[1] : raw;
}

// Find the first balanced {...} block, respecting strings/escapes.
function extractJsonObject(raw: string): string | null {
  const start = raw.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (ch === '\\') escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return raw.slice(start, i + 1);
    }
  }
  // Unterminated — close open structures so we at least get something parseable.
  let patched = raw.slice(start);
  if (inString) patched += '"';
  patched += '}'.repeat(Math.max(depth, 0));
  return patched;
}

// Best-effort repair for common model mistakes: unescaped control chars
// inside strings and trailing commas before closers.
function repairJson(raw: string): string {
  let out = '';
  let inString = false;
  let escape = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (escape) {
      out += ch;
      escape = false;
      continue;
    }
    if (inString) {
      if (ch === '\\') {
        out += ch;
        escape = true;
      } else if (ch === '"') {
        out += ch;
        inString = false;
      } else if (ch === '\n') {
        out += '\\n';
      } else if (ch === '\r') {
        out += '\\r';
      } else if (ch === '\t') {
        out += '\\t';
      } else if (ch.charCodeAt(0) < 0x20) {
        out += ' ';
      } else {
        out += ch;
      }
      continue;
    }
    if (ch === '"') {
      out += ch;
      inString = true;
    } else {
      out += ch;
    }
  }
  return out.replace(/,\s*([}\]])/g, '$1');
}
