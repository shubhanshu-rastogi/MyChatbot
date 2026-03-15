const toPositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

export const runtimeConfig = {
  chat: {
    maxQuestionLength: toPositiveInt(process.env.CHAT_MAX_QUESTION_LENGTH, 600),
    rateLimitWindowMs: toPositiveInt(process.env.CHAT_RATE_LIMIT_WINDOW_MS, 60_000),
    rateLimitMaxRequests: toPositiveInt(process.env.CHAT_RATE_LIMIT_MAX_REQUESTS, 30)
  },
  capture: {
    rateLimitWindowMs: toPositiveInt(process.env.CAPTURE_RATE_LIMIT_WINDOW_MS, 60_000),
    rateLimitMaxRequests: toPositiveInt(process.env.CAPTURE_RATE_LIMIT_MAX_REQUESTS, 20)
  },
  openai: {
    timeoutMs: toPositiveInt(process.env.OPENAI_TIMEOUT_MS, 20_000),
    maxRetries: toPositiveInt(process.env.OPENAI_MAX_RETRIES, 2),
    retryBaseDelayMs: toPositiveInt(process.env.OPENAI_RETRY_BASE_DELAY_MS, 350)
  }
};
