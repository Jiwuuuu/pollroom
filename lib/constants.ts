// ──────────────────────────────────────────────
// PollRoom — App-Wide Constants
// ──────────────────────────────────────────────

/** Minimum number of options per poll */
export const MIN_OPTIONS = 2;

/** Maximum number of options per poll */
export const MAX_OPTIONS = 8;

/** Cookie name for voter fingerprint */
export const VOTER_COOKIE_NAME = "voter_id";

/** Cookie max-age in seconds (1 year) */
export const VOTER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Base URL — falls back to localhost in dev */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");
