import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

export function extractErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!error) return fallback;
  if ('status' in error) {
    if (error.status === 'FETCH_ERROR') return 'Cannot reach the server.';
    const data = error.data as unknown;
    if (data && typeof data === 'object' && 'message' in data) {
      const m = (data as { message: unknown }).message;
      if (Array.isArray(m)) return m.join(', ');
      if (typeof m === 'string') return m;
    }
  }
  if ('message' in error && typeof error.message === 'string') return error.message;
  return fallback;
}
