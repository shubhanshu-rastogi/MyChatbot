const toPositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const toPositiveNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
};

export const runtimeConfig = {
  chat: {
    maxQuestionLength: toPositiveInt(process.env.CHAT_MAX_QUESTION_LENGTH, 600),
    rateLimitWindowMs: toPositiveInt(process.env.CHAT_RATE_LIMIT_WINDOW_MS, 60_000),
    rateLimitMaxRequests: toPositiveInt(process.env.CHAT_RATE_LIMIT_MAX_REQUESTS, 30),
    enforceLlmReview: toBoolean(process.env.CHAT_ENFORCE_LLM_REVIEW, true)
  },
  capture: {
    rateLimitWindowMs: toPositiveInt(process.env.CAPTURE_RATE_LIMIT_WINDOW_MS, 60_000),
    rateLimitMaxRequests: toPositiveInt(process.env.CAPTURE_RATE_LIMIT_MAX_REQUESTS, 20)
  },
  openai: {
    timeoutMs: toPositiveInt(process.env.OPENAI_TIMEOUT_MS, 20_000),
    maxRetries: toPositiveInt(process.env.OPENAI_MAX_RETRIES, 2),
    retryBaseDelayMs: toPositiveInt(process.env.OPENAI_RETRY_BASE_DELAY_MS, 350)
  },
  rag: {
    enableEmbeddings: toBoolean(process.env.RAG_ENABLE_EMBEDDINGS, true),
    embeddingModel: process.env.RAG_EMBEDDING_MODEL?.trim() || "text-embedding-3-small",
    embeddingBatchSize: toPositiveInt(process.env.RAG_EMBEDDING_BATCH_SIZE, 20),
    hybridSemanticWeight: toPositiveNumber(process.env.RAG_HYBRID_SEMANTIC_WEIGHT, 0.65),
    semanticBoostMax: toPositiveNumber(process.env.RAG_SEMANTIC_BOOST_MAX, 8),
    vectorTopK: toPositiveInt(process.env.RAG_VECTOR_TOP_K, 8)
  }
};
