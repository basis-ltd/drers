/** UUID string (RFC-style). Avoid Node `crypto` in browser TS — use `crypto.randomUUID()` at runtime. */
export type UUID = string;