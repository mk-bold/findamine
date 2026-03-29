import { NextRequest } from "next/server";
import { ApiError } from "./api-auth";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Simple in-memory rate limiter using a sliding window.
 * For production at scale, replace with Upstash Redis (@upstash/ratelimit).
 *
 * Usage:
 *   const limiter = createRateLimiter({ max: 10, windowMs: 15 * 60 * 1000 });
 *   // In route handler:
 *   limiter.check(request); // throws ApiError(429) if exceeded
 */
export function createRateLimiter(opts: {
  max: number;
  windowMs: number;
  keyFn?: (request: NextRequest) => string;
}) {
  const store = new Map<string, RateLimitEntry>();
  const { max, windowMs } = opts;

  // Periodic cleanup to prevent memory leaks (every 60s)
  let lastCleanup = Date.now();
  function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < 60_000) return;
    lastCleanup = now;
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }

  function getKey(request: NextRequest): string {
    if (opts.keyFn) return opts.keyFn(request);
    // Default: use IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    return ip;
  }

  return {
    /**
     * Check rate limit. Throws ApiError(429) if exceeded.
     */
    check(request: NextRequest): void {
      cleanup();
      const key = getKey(request);
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || entry.resetAt <= now) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return;
      }

      entry.count++;
      if (entry.count > max) {
        const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
        throw new ApiError(
          429,
          `Too many requests. Try again in ${retryAfterSec} seconds.`
        );
      }
    },
  };
}

// Pre-configured limiters for common use cases
export const authLimiter = createRateLimiter({
  max: 10,
  windowMs: 15 * 60 * 1000, // 10 requests per 15 minutes per IP
});

export const aiLimiter = createRateLimiter({
  max: 20,
  windowMs: 60 * 1000, // 20 requests per minute per IP
});

export const generalLimiter = createRateLimiter({
  max: 100,
  windowMs: 60 * 1000, // 100 requests per minute per IP
});
