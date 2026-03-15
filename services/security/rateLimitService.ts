type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const nowMs = (): number => Date.now();

const cleanupExpired = (now: number) => {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
};

export const checkRateLimit = (
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult => {
  const now = nowMs();
  cleanupExpired(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      retryAfterSeconds: 0,
      resetAt
    };
  }

  existing.count += 1;
  buckets.set(key, existing);

  if (existing.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      resetAt: existing.resetAt
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existing.count),
    retryAfterSeconds: 0,
    resetAt: existing.resetAt
  };
};

export const getRateLimitKey = (request: Request, scope: string): string => {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const firstIp = forwardedFor.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const ip = firstIp || realIp || "unknown";

  return `${scope}:${ip}`;
};

export const __resetRateLimiterForTests = (): void => {
  buckets.clear();
};
