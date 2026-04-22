export const AUDIT_JSON_MAX_CHARS = 32_000;

const SENSITIVE_KEYS = new Set(
  [
    'password',
    'passwordhash',
    'password_hash',
    'token',
    'refreshtoken',
    'refresh_token',
    'accesstoken',
    'access_token',
    'authorization',
    'secret',
    'apikey',
    'api_key',
    'creditcard',
    'credit_card',
    'resettoken',
    'reset_token',
    'otpsecret',
    'otp_secret',
    'emailverificationtokenhash',
    'email_verification_token_hash',
  ].map((k) => k.toLowerCase()),
);

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  if (SENSITIVE_KEYS.has(lower)) return true;
  return (
    lower.includes('password') ||
    lower.includes('token') ||
    lower.includes('secret')
  );
}

export function redactForAudit(value: unknown, depth = 0): unknown {
  if (depth > 12) return '[MaxDepth]';
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value))
    return value.map((v) => redactForAudit(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = isSensitiveKey(k) ? '[REDACTED]' : redactForAudit(v, depth + 1);
  }
  return out;
}

export function serializeEntityForAudit(
  entity: unknown,
): Record<string, unknown> | null {
  if (entity === null || entity === undefined) return null;
  if (typeof entity !== 'object') return null;

  const plain = JSON.parse(
    JSON.stringify(entity, (_key, val) => {
      if (typeof val === 'function' || typeof val === 'symbol')
        return undefined;
      return val;
    }),
  );
  const redacted = redactForAudit(plain) as Record<string, unknown>;
  const serialized = JSON.stringify(redacted);
  if (serialized.length > AUDIT_JSON_MAX_CHARS) {
    return {
      _truncated: true,
      _originalLength: serialized.length,
      preview: serialized.slice(0, AUDIT_JSON_MAX_CHARS),
    };
  }
  return redacted;
}
