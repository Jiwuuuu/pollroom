// ──────────────────────────────────────────────
// PollRoom — In-Memory Sliding Window Rate Limiter
// ──────────────────────────────────────────────

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

/** Cleanup stale entries every 60 seconds */
const CLEANUP_INTERVAL_MS = 60_000;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 120_000);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number | null;
}

/**
 * Check whether the given key (e.g. IP address) is within the rate limit.
 * Uses a sliding-window counter stored in process memory.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1_000;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterSeconds = Math.ceil(
      (oldestInWindow + windowMs - now) / 1_000
    );

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    retryAfterSeconds: null,
  };
}

// ── Pre-defined rate limit configs ─────────────

/** Poll creation: 20 requests per 60 seconds per IP */
export const RATE_LIMIT_CREATE_POLL: RateLimitConfig = {
  maxRequests: 20,
  windowSeconds: 60,
};

/** Voting: 30 requests per 60 seconds per IP */
export const RATE_LIMIT_VOTE: RateLimitConfig = {
  maxRequests: 30,
  windowSeconds: 60,
};

/** Reading polls: 100 requests per 60 seconds per IP */
export const RATE_LIMIT_READ: RateLimitConfig = {
  maxRequests: 100,
  windowSeconds: 60,
};
