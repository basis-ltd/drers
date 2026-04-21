import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUpRightFromSquare,
  faCheck,
  faChevronDown,
  faChevronRight,
  faFileLines,
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import type {
  ApplicationDocument,
  DocumentOcrStatus,
} from '@/features/applications/api/types';
import { DOCUMENT_TYPE_LABELS } from '@/features/documents/constants/documentTypeTitles';

interface Props {
  document: ApplicationDocument;
  /** Compact mode renders a smaller summary without extracted-text panel. */
  compact?: boolean;
}

const OCR_STATUS: Record<
  DocumentOcrStatus,
  { label: string; className: string }
> = {
  PENDING: { label: 'Pending', className: 'bg-primary/5 text-primary/55' },
  PROCESSING: { label: 'Processing', className: 'bg-sky-50 text-sky-700' },
  EXTRACTED: { label: 'Extracted', className: 'bg-emerald-50 text-emerald-700' },
  FAILED: { label: 'Failed', className: 'bg-red-50 text-red-700' },
};

interface AiScreening {
  summary?: string;
  expectedTitle?: string;
  detectedTitle?: string;
  titleMatch?: boolean;
  titleMatchConfidence?: number;
  issues?: string[];
}

function parseObject(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return typeof parsed === 'object' && parsed !== null
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object') return raw as Record<string, unknown>;
  return {};
}

function pickString(data: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function pickBoolean(data: Record<string, unknown>, keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'boolean') return value;
  }
  return undefined;
}

function pickNumber(data: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
}

function pickStringArray(
  data: Record<string, unknown>,
  keys: string[],
): string[] | undefined {
  for (const key of keys) {
    const value = data[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }
  }
  return undefined;
}

function buildScreening(
  primary: Record<string, unknown>,
  secondary: Record<string, unknown>,
): AiScreening {
  return {
    summary:
      pickString(primary, ['summary']) ??
      pickString(secondary, ['summary']),
    expectedTitle:
      pickString(primary, ['expectedTitle', 'expected_title']) ??
      pickString(secondary, ['expectedTitle', 'expected_title']),
    detectedTitle:
      pickString(primary, ['detectedTitle', 'detected_title']) ??
      pickString(secondary, ['detectedTitle', 'detected_title']),
    titleMatch:
      pickBoolean(primary, ['titleMatch', 'title_match']) ??
      pickBoolean(secondary, ['titleMatch', 'title_match']),
    titleMatchConfidence:
      pickNumber(primary, ['titleMatchConfidence', 'title_match_confidence']) ??
      pickNumber(secondary, ['titleMatchConfidence', 'title_match_confidence']),
    issues:
      pickStringArray(primary, ['issues']) ??
      pickStringArray(secondary, ['issues']),
  };
}

function issueLabel(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function DocumentExtractionCard({ document, compact }: Props) {
  const [showText, setShowText] = useState(false);
  const status = OCR_STATUS[document.ocrStatus];
  const screening = buildScreening(
    parseObject(document.aiScreeningResult),
    parseObject(document.ocrExtractedData),
  );
  const confidence =
    typeof document.ocrConfidence === 'number'
      ? Math.round(
          (document.ocrConfidence > 1
            ? document.ocrConfidence
            : document.ocrConfidence * 100),
        )
      : null;
  const expectedTitle =
    screening.expectedTitle ?? DOCUMENT_TYPE_LABELS[document.documentType];

  return (
    <article className="rounded-md border border-primary/10 bg-white">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-primary/8 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-wider text-primary/45 uppercase">
            {DOCUMENT_TYPE_LABELS[document.documentType]}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <FontAwesomeIcon
              icon={faFileLines}
              className="size-3 text-primary/35"
            />
            <p className="truncate text-[12.5px] text-primary">
              {document.originalFilename}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[10px] font-medium ${status.className} border-transparent`}
          >
            {status.label}
          </Badge>
          {document.secureUrl && (
            <a
              href={document.secureUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-sm border border-primary/15 px-2 py-0.5 text-[10px] text-primary/65 hover:bg-primary/5"
            >
              Open
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                className="size-2.5"
              />
            </a>
          )}
        </div>
      </header>

      {document.ocrStatus === 'EXTRACTED' ? (
        <div className="space-y-3 px-4 py-4">
          <div className="flex flex-wrap items-center gap-3 text-[11.5px]">
            <TitleMatch
              match={screening.titleMatch}
              expected={expectedTitle ?? null}
              detected={screening.detectedTitle ?? null}
              confidence={screening.titleMatchConfidence}
            />
            {confidence !== null && (
              <ConfidenceMeter value={confidence} label="OCR" />
            )}
          </div>

          {screening.issues && screening.issues.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {screening.issues.map((i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800"
                >
                  <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    className="size-2.5"
                  />
                  {issueLabel(i)}
                </span>
              ))}
            </div>
          )}

          {screening.summary && (
            <blockquote className="border-l-2 border-primary/15 pl-3 text-[12px] leading-relaxed text-primary/75 italic">
              {screening.summary}
            </blockquote>
          )}

          {!compact && document.ocrExtractedText && (
            <div className="border-t border-primary/8 pt-3">
              <button
                type="button"
                onClick={() => setShowText((v) => !v)}
                className="flex items-center gap-1.5 text-[10.5px] font-medium tracking-wider text-primary/55 uppercase hover:text-primary"
              >
                <FontAwesomeIcon
                  icon={showText ? faChevronDown : faChevronRight}
                  className="size-2.5"
                />
                {showText ? 'Hide extracted text' : 'View extracted text'}
                <span className="text-primary/35 normal-case">
                  ({document.pageCount ?? '?'} pages)
                </span>
              </button>
              {showText && (
                <pre className="mt-2 max-h-80 overflow-auto rounded-sm border border-primary/8 bg-primary/3 p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-primary/80">
                  {document.ocrExtractedText}
                </pre>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 py-4 text-[12px] text-primary/55">
          {document.ocrStatus === 'FAILED' && document.ocrErrorMessage
            ? document.ocrErrorMessage
            : document.ocrStatus === 'PROCESSING'
              ? 'Extraction in progress…'
              : 'Extraction not yet run.'}
        </div>
      )}
    </article>
  );
}

function TitleMatch({
  match,
  expected,
  detected,
  confidence,
}: {
  match: boolean | undefined;
  expected: string | null;
  detected: string | null;
  confidence: number | undefined;
}) {
  if (match === undefined || !expected) return null;
  const pct =
    typeof confidence === 'number'
      ? Math.round((confidence > 1 ? confidence : confidence * 100))
      : null;
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-flex size-5 items-center justify-center rounded-full text-[10px] ${
          match
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-red-50 text-red-700'
        }`}
        aria-label={match ? 'Title matches' : 'Title does not match'}
      >
        <FontAwesomeIcon icon={match ? faCheck : faXmark} className="size-2.5" />
      </span>
      <span className="text-primary/60">
        Expected{' '}
        <span className="text-primary">&ldquo;{expected}&rdquo;</span>
        {detected && (
          <>
            {' '}
            vs detected{' '}
            <span className="text-primary">&ldquo;{detected}&rdquo;</span>
          </>
        )}
        {pct !== null && (
          <span className="ml-1 text-primary/40">({pct}%)</span>
        )}
      </span>
    </div>
  );
}

function ConfidenceMeter({ value, label }: { value: number; label: string }) {
  const tone =
    value >= 80
      ? 'bg-emerald-500'
      : value >= 55
        ? 'bg-amber-500'
        : 'bg-red-500';
  return (
    <div className="flex min-w-[160px] flex-1 items-center gap-2">
      <span className="text-[10px] font-medium tracking-wider text-primary/45 uppercase">
        {label}
      </span>
      <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-primary/8">
        <div
          className={`absolute inset-y-0 left-0 ${tone}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right text-[10.5px] tabular-nums text-primary/60">
        {value}%
      </span>
    </div>
  );
}
