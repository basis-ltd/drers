import { serializeEntityForAudit } from './audit-serialize.helper';

const IGNORED_DIFF_KEYS = new Set([
  'updatedAt',
  'updated_at',
  'lastUpdatedById',
  'last_updated_by_id',
]);

function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_, v) => {
    if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      !(v instanceof Date)
    ) {
      const sorted: Record<string, unknown> = {};
      for (const k of Object.keys(v).sort()) {
        sorted[k] = (v as Record<string, unknown>)[k];
      }
      return sorted;
    }
    return v;
  });
}

export interface AuditDiffResult {
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
}

export function buildCreateDiff(entity: unknown): AuditDiffResult {
  return {
    oldValues: null,
    newValues: serializeEntityForAudit(entity),
  };
}

export function buildDeleteDiff(entity: unknown): AuditDiffResult {
  return {
    oldValues: serializeEntityForAudit(entity),
    newValues: null,
  };
}

export function buildUpdateDiff(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
): AuditDiffResult {
  const oldFull = serializeEntityForAudit(before) ?? {};
  const newFull = serializeEntityForAudit(after) ?? {};

  const oldValues: Record<string, unknown> = {};
  const newValues: Record<string, unknown> = {};
  const keys = new Set<string>([
    ...Object.keys(oldFull),
    ...Object.keys(newFull),
  ]);

  for (const key of keys) {
    if (IGNORED_DIFF_KEYS.has(key)) continue;
    const oldVal = oldFull[key];
    const newVal = newFull[key];
    if (stableStringify(oldVal) === stableStringify(newVal)) continue;
    oldValues[key] = oldVal ?? null;
    newValues[key] = newVal ?? null;
  }

  if (
    Object.keys(newValues).length === 0 &&
    Object.keys(oldValues).length === 0
  ) {
    return { oldValues: null, newValues: null };
  }

  return { oldValues, newValues };
}
