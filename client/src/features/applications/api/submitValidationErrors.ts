type ErrorWithData = {
  data?: unknown;
};

type PendingValidationsPayload = {
  pendingValidations?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function extractPendingValidations(error: unknown): string[] {
  if (!isRecord(error)) return [];

  const errorWithData = error as ErrorWithData;
  if (!isRecord(errorWithData.data)) return [];

  const payload = errorWithData.data as PendingValidationsPayload;
  if (!Array.isArray(payload.pendingValidations)) return [];

  return payload.pendingValidations.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  );
}
