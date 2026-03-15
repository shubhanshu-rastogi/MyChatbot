import { afterEach, describe, expect, it } from "vitest";
import {
  __resetRateLimiterForTests,
  checkRateLimit
} from "@/services/security/rateLimitService";

describe("rateLimitService", () => {
  afterEach(() => {
    __resetRateLimiterForTests();
  });

  it("allows requests within configured window", () => {
    const first = checkRateLimit("chat:127.0.0.1", 3, 60_000);
    const second = checkRateLimit("chat:127.0.0.1", 3, 60_000);
    const third = checkRateLimit("chat:127.0.0.1", 3, 60_000);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("blocks requests above limit and returns retryAfter", () => {
    checkRateLimit("chat:127.0.0.1", 2, 60_000);
    checkRateLimit("chat:127.0.0.1", 2, 60_000);
    const blocked = checkRateLimit("chat:127.0.0.1", 2, 60_000);

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.remaining).toBe(0);
  });
});
