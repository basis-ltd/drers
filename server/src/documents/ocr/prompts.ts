import { DocumentType } from '../enums/document-type.enum';
import {
  DOCUMENT_TYPE_TITLES,
  DocumentTypeMeta,
} from '../constants/document-type-titles';

export interface OcrPagePayload {
  extractedText: string;
  summary: string;
  detectedTitle: string;
  titleMatch: boolean;
  titleMatchConfidence: number;
  issues: string[];
  detectedSignals: string[];
  reviewNotes: string;
  confidence: number;
}

export interface OcrChunkReviewPayload {
  summary: string;
  detectedTitle: string;
  titleMatch: boolean;
  titleMatchConfidence: number;
  issues: string[];
  requiredSectionsFound: string[];
  optionalSectionsFound: string[];
  detectedSignals: string[];
  reviewNotes: string;
  confidence: number;
}

export interface OcrEvaluationPayload {
  extractedText: string;
  summary: string;
  detectedTitle: string;
  documentTypeMatch: boolean;
  titleMatch: boolean;
  titleMatchConfidence: number;
  issues: string[];
  requiredSectionsFound: string[];
  missingSections: string[];
  optionalSectionsFound: string[];
  detectedSignals: string[];
  reviewNotes: string;
  confidence: number;
}

export const OCR_SYSTEM_PROMPT = `You are an OCR and page-screening assistant for a research ethics committee.
You receive one page image from a single uploaded document.

Your job on each page is to:
1. Transcribe the legible text accurately and compactly.
2. Describe what this page contributes to the document (headings, identifiers, dates, signatures, or key content).
3. Capture only concrete visible issues.

OUTPUT RULES — follow EXACTLY:
- Return a SINGLE JSON object and NOTHING else.
- No markdown, no code fences, no commentary before or after.
- Start the response with "{" and end with "}".
- All strings must be valid JSON: escape double quotes as \\" and newlines as \\n.
- Do not include trailing commas.
- "issues" must be an array of short snake_case tags.
- "detectedSignals" must use only the exact labels provided by the user.
- Do not invent content not visible on the page.`;

export const DOCUMENT_REVIEW_SYSTEM_PROMPT = `You are a document screening assistant for a research ethics committee.
You receive OCR-derived page digests or chunk findings for one uploaded document.

Your job is to:
1. Decide whether the document matches the expected document slot.
2. Identify which required and optional sections are actually evidenced.
3. Summarize the document comprehensively, including identifiers, dates, signatures, missing sections, and anomalies when present.

OUTPUT RULES — follow EXACTLY:
- Return a SINGLE JSON object and NOTHING else.
- No markdown, no code fences, no commentary before or after.
- Start the response with "{" and end with "}".
- All strings must be valid JSON.
- Do not include trailing commas.
- Use only the exact labels supplied for requiredSectionsFound, optionalSectionsFound, missingSections, and detectedSignals.
- "issues" must be an array of short snake_case tags.
- Never infer a section as present unless the evidence strongly supports it.`;

export function buildUserPrompt(
  documentType: DocumentType,
  pageIndex?: number,
  pageTotal?: number,
  judgeTitle = true,
): string {
  const meta = getDocumentMeta(documentType);
  const pageLine =
    pageIndex !== undefined && pageTotal !== undefined
      ? `\nYou are looking at page ${pageIndex + 1} of ${pageTotal} from a single document.`
      : '';

  return `Expected document slot:
- Title: "${meta.title}"
- Description: ${meta.description}
- OCR purpose: ${meta.ocrPurpose}${pageLine}

Page-level guidance:
- Focus on faithful OCR transcription and visible evidence on this page only.
- Mention headings, titles, dates, signatures, tables, or identifiers in the summary when visible.
- ${judgeTitle ? 'Assess whether this page supports the expected document type.' : 'This page may be a later continuation page; only mark a title/type match if the page itself clearly supports it.'}

Allowed signal labels:
${renderBulletList(meta.requiredSignals)}

Document-specific instructions:
${meta.documentSpecificInstructions}

Return JSON with this exact shape (no extra keys):
{
  "extractedText": "<OCR text for this page; compact, with escaped newlines>",
  "summary": "<1-3 sentences about what this page contains and why it matters>",
  "detectedTitle": "<best visible page or document title on this page, or empty string>",
  "titleMatch": <true|false>,
  "titleMatchConfidence": <number between 0 and 1>,
  "issues": [<short snake_case tags>],
  "detectedSignals": [<exact labels from the allowed signal labels list>],
  "reviewNotes": "<1-3 short sentences about dates, signatures, missing evidence, or anomalies visible on this page>",
  "confidence": <overall OCR confidence, number between 0 and 1>
}

Keep the OCR text reasonably complete for the page, and keep the summary and reviewNotes concise.`;
}

export function buildDocumentReviewChunkPrompt(
  documentType: DocumentType,
  serializedPages: string,
  chunkIndex: number,
  chunkTotal: number,
): string {
  const meta = getDocumentMeta(documentType);

  return `Expected document slot:
- Title: "${meta.title}"
- Description: ${meta.description}
- OCR purpose: ${meta.ocrPurpose}

This is chunk ${chunkIndex + 1} of ${chunkTotal} from one document-level screening run.
Only report sections and signals clearly evidenced in this chunk. Do not guess about unseen pages.

Required sections:
${renderBulletList(meta.requiredSections)}

Optional sections:
${renderBulletList(meta.optionalSections)}

Allowed detected signal labels:
${renderBulletList(meta.requiredSignals)}

Document-specific instructions:
${meta.documentSpecificInstructions}

Chunk evidence:
${serializedPages}

Return JSON with this exact shape (no extra keys):
{
  "summary": "<concise summary of what this chunk shows about the document>",
  "detectedTitle": "<best supported document title seen in this chunk, or empty string>",
  "titleMatch": <true|false>,
  "titleMatchConfidence": <number between 0 and 1>,
  "issues": [<short snake_case tags>],
  "requiredSectionsFound": [<exact labels from the required sections list>],
  "optionalSectionsFound": [<exact labels from the optional sections list>],
  "detectedSignals": [<exact labels from the allowed detected signal labels list>],
  "reviewNotes": "<short notes about identifiers, dates, signatures, missing evidence, or anomalies in this chunk>",
  "confidence": <number between 0 and 1>
}`;
}

export function buildDocumentReviewSynthesisPrompt(
  documentType: DocumentType,
  chunkReviews: string,
): string {
  const meta = getDocumentMeta(documentType);

  return `Expected document slot:
- Title: "${meta.title}"
- Description: ${meta.description}
- OCR purpose: ${meta.ocrPurpose}

You are synthesizing chunk-level findings into the final document screening result.

Required sections:
${renderBulletList(meta.requiredSections)}

Optional sections:
${renderBulletList(meta.optionalSections)}

Allowed detected signal labels:
${renderBulletList(meta.requiredSignals)}

Document-specific instructions:
${meta.documentSpecificInstructions}

Chunk review findings:
${chunkReviews}

Return JSON with this exact shape (no extra keys):
{
  "summary": "<comprehensive summary of the whole document, including purpose, identifiers, dates, signatures, missing sections, and anomalies when present>",
  "detectedTitle": "<best supported overall document title, or empty string>",
  "documentTypeMatch": <true|false>,
  "titleMatch": <true|false>,
  "titleMatchConfidence": <number between 0 and 1>,
  "issues": [<short snake_case tags>],
  "requiredSectionsFound": [<exact labels from the required sections list>],
  "missingSections": [<exact labels from the required sections list that are not evidenced>],
  "optionalSectionsFound": [<exact labels from the optional sections list>],
  "detectedSignals": [<exact labels from the allowed detected signal labels list>],
  "reviewNotes": "<short final review notes>",
  "confidence": <number between 0 and 1>
}`;
}

export function parseOcrResponse(
  raw: string,
  documentType?: DocumentType,
): OcrPagePayload {
  const obj = parseJsonObject(raw);
  const meta = documentType ? getDocumentMeta(documentType) : null;

  return {
    extractedText:
      typeof obj.extractedText === 'string' ? obj.extractedText : '',
    summary: typeof obj.summary === 'string' ? obj.summary : '',
    detectedTitle:
      typeof obj.detectedTitle === 'string' ? obj.detectedTitle : '',
    titleMatch: typeof obj.titleMatch === 'boolean' ? obj.titleMatch : false,
    titleMatchConfidence: clamp01(obj.titleMatchConfidence),
    issues: parseSnakeCaseArray(obj.issues),
    detectedSignals: meta
      ? normalizeAllowedArray(obj.detectedSignals, meta.requiredSignals)
      : parseStringArray(obj.detectedSignals),
    reviewNotes: typeof obj.reviewNotes === 'string' ? obj.reviewNotes : '',
    confidence: clamp01(obj.confidence),
  };
}

export function parseChunkReviewResponse(
  raw: string,
  documentType: DocumentType,
): OcrChunkReviewPayload {
  const obj = parseJsonObject(raw);
  const meta = getDocumentMeta(documentType);

  return {
    summary: typeof obj.summary === 'string' ? obj.summary : '',
    detectedTitle:
      typeof obj.detectedTitle === 'string' ? obj.detectedTitle : '',
    titleMatch: typeof obj.titleMatch === 'boolean' ? obj.titleMatch : false,
    titleMatchConfidence: clamp01(obj.titleMatchConfidence),
    issues: parseSnakeCaseArray(obj.issues),
    requiredSectionsFound: normalizeAllowedArray(
      obj.requiredSectionsFound,
      meta.requiredSections,
    ),
    optionalSectionsFound: normalizeAllowedArray(
      obj.optionalSectionsFound,
      meta.optionalSections,
    ),
    detectedSignals: normalizeAllowedArray(
      obj.detectedSignals,
      meta.requiredSignals,
    ),
    reviewNotes: typeof obj.reviewNotes === 'string' ? obj.reviewNotes : '',
    confidence: clamp01(obj.confidence),
  };
}

export function parseDocumentReviewResponse(
  raw: string,
  documentType: DocumentType,
): OcrEvaluationPayload {
  const obj = parseJsonObject(raw);
  const meta = getDocumentMeta(documentType);
  const requiredSectionsFound = normalizeAllowedArray(
    obj.requiredSectionsFound,
    meta.requiredSections,
  );
  const modelMissingSections = normalizeAllowedArray(
    obj.missingSections,
    meta.requiredSections,
  );
  const missingSections = computeMissingSections(
    meta.requiredSections,
    requiredSectionsFound,
    modelMissingSections,
  );
  const documentTypeMatch =
    typeof obj.documentTypeMatch === 'boolean'
      ? obj.documentTypeMatch
      : typeof obj.titleMatch === 'boolean'
        ? obj.titleMatch
        : false;

  return {
    extractedText:
      typeof obj.extractedText === 'string' ? obj.extractedText : '',
    summary: typeof obj.summary === 'string' ? obj.summary : '',
    detectedTitle:
      typeof obj.detectedTitle === 'string' ? obj.detectedTitle : '',
    documentTypeMatch,
    titleMatch:
      typeof obj.titleMatch === 'boolean' ? obj.titleMatch : documentTypeMatch,
    titleMatchConfidence: clamp01(obj.titleMatchConfidence),
    issues: parseSnakeCaseArray(obj.issues),
    requiredSectionsFound,
    missingSections,
    optionalSectionsFound: normalizeAllowedArray(
      obj.optionalSectionsFound,
      meta.optionalSections,
    ),
    detectedSignals: normalizeAllowedArray(
      obj.detectedSignals,
      meta.requiredSignals,
    ),
    reviewNotes: typeof obj.reviewNotes === 'string' ? obj.reviewNotes : '',
    confidence: clamp01(obj.confidence),
  };
}

export function getDocumentMeta(documentType: DocumentType): DocumentTypeMeta {
  return (
    DOCUMENT_TYPE_TITLES[documentType] ??
    DOCUMENT_TYPE_TITLES[DocumentType.OTHER]
  );
}

export function computeMissingSections(
  requiredSections: string[],
  requiredSectionsFound: string[],
  requestedMissingSections: string[] = [],
): string[] {
  const found = new Set(
    requiredSectionsFound.map((item) => item.toLowerCase()),
  );
  const requested = new Set(
    requestedMissingSections.map((item) => item.toLowerCase()),
  );

  return requiredSections.filter((section) => {
    const key = section.toLowerCase();
    return !found.has(key) || requested.has(key);
  });
}

function renderBulletList(items: string[]): string {
  if (items.length === 0) return '- None';
  return items.map((item) => `- ${item}`).join('\n');
}

function parseJsonObject(raw: string): Record<string, unknown> {
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

  return parsed as Record<string, unknown>;
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function parseSnakeCaseArray(value: unknown): string[] {
  return parseStringArray(value).map((item) =>
    item
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, ''),
  );
}

function normalizeAllowedArray(value: unknown, allowed: string[]): string[] {
  const lookup = new Map(
    allowed.map((item) => [item.trim().toLowerCase(), item]),
  );

  return Array.from(
    new Set(
      parseStringArray(value)
        .map((item) => lookup.get(item.trim().toLowerCase()) ?? null)
        .filter((item): item is string => Boolean(item)),
    ),
  );
}

function clamp01(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function stripFences(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('```')) return raw;
  const m = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```\s*$/i);
  return m ? m[1] : raw;
}

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
  let patched = raw.slice(start);
  if (inString) patched += '"';
  patched += '}'.repeat(Math.max(depth, 0));
  return patched;
}

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
