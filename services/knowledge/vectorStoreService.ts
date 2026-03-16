import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { runtimeConfig } from "@/lib/runtimeConfig";
import { KnowledgeEntry } from "@/types/knowledge";

const OPENAI_EMBEDDINGS_ENDPOINT = "https://api.openai.com/v1/embeddings";

type StoredVectorEntry = {
  checksum: string;
  embedding: number[];
  updatedAt: string;
};

type PersistedVectorStore = {
  version: 1;
  model: string;
  entries: Record<string, StoredVectorEntry>;
};

let memoryStore: PersistedVectorStore | null = null;
let vectorBuildPromise: Promise<Record<string, number[]> | null> | null = null;
const queryEmbeddingCache = new Map<string, number[]>();

const getApiKey = (): string | null => process.env.OPENAI_API_KEY?.trim() ?? null;

const getStorePath = (): string =>
  process.env.RAG_VECTOR_STORE_PATH?.trim() ||
  path.join(process.cwd(), "data", "rag", "vector-store.json");

const ensureStoreDir = async () => {
  await mkdir(path.dirname(getStorePath()), { recursive: true });
};

const sleep = async (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const chunk = <T>(items: T[], size: number): T[][] => {
  if (size <= 0) return [items];
  const output: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }
  return output;
};

const normalizeEmbedding = (value: unknown): number[] =>
  Array.isArray(value)
    ? value.filter((item): item is number => typeof item === "number" && Number.isFinite(item))
    : [];

const loadStore = async (): Promise<PersistedVectorStore> => {
  if (memoryStore) return memoryStore;

  try {
    const raw = await readFile(getStorePath(), "utf-8");
    const parsed = JSON.parse(raw) as Partial<PersistedVectorStore>;
    if (
      parsed &&
      parsed.version === 1 &&
      typeof parsed.model === "string" &&
      parsed.entries &&
      typeof parsed.entries === "object"
    ) {
      const sanitizedEntries = Object.entries(parsed.entries).reduce<
        Record<string, StoredVectorEntry>
      >((acc, [entryId, value]) => {
        if (!value || typeof value !== "object") return acc;

        const entry = value as Partial<StoredVectorEntry>;
        const checksum = typeof entry.checksum === "string" ? entry.checksum : "";
        const embedding = normalizeEmbedding(entry.embedding);
        if (!checksum || embedding.length === 0) return acc;

        acc[entryId] = {
          checksum,
          embedding,
          updatedAt:
            typeof entry.updatedAt === "string"
              ? entry.updatedAt
              : new Date().toISOString()
        };
        return acc;
      }, {});

      memoryStore = {
        version: 1,
        model: parsed.model,
        entries: sanitizedEntries
      };

      return memoryStore;
    }
  } catch {
    // No cache file available yet.
  }

  memoryStore = {
    version: 1,
    model: runtimeConfig.rag.embeddingModel,
    entries: {}
  };

  return memoryStore;
};

const saveStore = async (store: PersistedVectorStore) => {
  await ensureStoreDir();
  await writeFile(getStorePath(), JSON.stringify(store, null, 2), "utf-8");
  memoryStore = store;
};

const toEmbeddingText = (entry: KnowledgeEntry): string =>
  `${entry.title}\n${entry.content}`.replace(/\s+/g, " ").trim().slice(0, 3500);

const checksumEntry = (entry: KnowledgeEntry): string =>
  createHash("sha256")
    .update(
      [
        entry.id,
        entry.sourceType,
        entry.sourceName,
        entry.topic,
        entry.title,
        entry.content,
        entry.lastUpdated
      ].join("|")
    )
    .digest("hex");

const parseEmbeddings = (payload: unknown): number[][] => {
  if (!payload || typeof payload !== "object") return [];
  const data = (payload as { data?: Array<{ embedding?: unknown; index?: number }> }).data;
  if (!Array.isArray(data)) return [];

  return [...data]
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((item) => normalizeEmbedding(item.embedding));
};

const fetchEmbeddings = async (input: string[]): Promise<number[][]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  let lastError: Error | null = null;
  const maxAttempts = Math.max(1, runtimeConfig.openai.maxRetries + 1);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), runtimeConfig.openai.timeoutMs);

    try {
      const response = await fetch(OPENAI_EMBEDDINGS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: runtimeConfig.rag.embeddingModel,
          input
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `Embedding request failed (${response.status}): ${errorText}`
        );
        const shouldRetry = response.status === 429 || response.status >= 500;
        if (!shouldRetry || attempt >= maxAttempts) {
          throw error;
        }
        lastError = error;
      } else {
        const payload = (await response.json()) as unknown;
        const embeddings = parseEmbeddings(payload);
        if (embeddings.length !== input.length || embeddings.some((vector) => vector.length === 0)) {
          throw new Error("Embedding response shape was invalid.");
        }
        return embeddings;
      }
    } catch (error) {
      const isAbortError = error instanceof Error && error.name === "AbortError";
      lastError =
        error instanceof Error
          ? error
          : new Error(isAbortError ? "Embedding request timed out." : "Embedding request failed.");

      const retryable =
        isAbortError ||
        (lastError.message.includes("fetch failed") && attempt < maxAttempts);

      if (!retryable || attempt >= maxAttempts) {
        throw lastError;
      }
    } finally {
      clearTimeout(timeout);
    }

    const backoffMs =
      runtimeConfig.openai.retryBaseDelayMs * 2 ** (attempt - 1) +
      Math.floor(Math.random() * 100);
    await sleep(backoffMs);
  }

  throw lastError ?? new Error("Embedding request failed.");
};

const buildVectorMap = (
  entries: KnowledgeEntry[],
  store: PersistedVectorStore
): Record<string, number[]> =>
  entries.reduce<Record<string, number[]>>((acc, entry) => {
    const cached = store.entries[entry.id];
    if (cached?.embedding?.length) {
      acc[entry.id] = cached.embedding;
    }
    return acc;
  }, {});

export const getEntryEmbeddingMap = async (
  entries: KnowledgeEntry[]
): Promise<Record<string, number[]> | null> => {
  if (!runtimeConfig.rag.enableEmbeddings || !getApiKey() || entries.length === 0) {
    return null;
  }

  if (vectorBuildPromise) {
    return vectorBuildPromise;
  }

  vectorBuildPromise = (async () => {
    try {
      const currentModel = runtimeConfig.rag.embeddingModel;
      const store = await loadStore();
      const nextStore: PersistedVectorStore =
        store.model === currentModel
          ? {
              version: 1,
              model: currentModel,
              entries: { ...store.entries }
            }
          : {
              version: 1,
              model: currentModel,
              entries: {}
            };

      const checksums = entries.reduce<Record<string, string>>((acc, entry) => {
        acc[entry.id] = checksumEntry(entry);
        return acc;
      }, {});

      const staleIds = Object.keys(nextStore.entries).filter(
        (entryId) => !checksums[entryId]
      );
      for (const staleId of staleIds) {
        delete nextStore.entries[staleId];
      }

      const needsEmbedding = entries.filter((entry) => {
        const cached = nextStore.entries[entry.id];
        const checksum = checksums[entry.id];
        return !cached || cached.checksum !== checksum || cached.embedding.length === 0;
      });

      if (needsEmbedding.length > 0) {
        const batches = chunk(needsEmbedding, runtimeConfig.rag.embeddingBatchSize);
        for (const batch of batches) {
          const inputs = batch.map(toEmbeddingText);
          const vectors = await fetchEmbeddings(inputs);
          batch.forEach((entry, index) => {
            nextStore.entries[entry.id] = {
              checksum: checksums[entry.id],
              embedding: vectors[index],
              updatedAt: new Date().toISOString()
            };
          });
        }
      }

      await saveStore(nextStore);
      return buildVectorMap(entries, nextStore);
    } catch (error) {
      console.error("[rag-vector-store] unable to build embedding index", error);
      try {
        const fallbackStore = await loadStore();
        return buildVectorMap(entries, fallbackStore);
      } catch {
        return null;
      }
    } finally {
      vectorBuildPromise = null;
    }
  })();

  return vectorBuildPromise;
};

export const embedQueryText = async (query: string): Promise<number[] | null> => {
  const normalized = query.replace(/\s+/g, " ").trim().toLowerCase();
  if (!normalized || !runtimeConfig.rag.enableEmbeddings || !getApiKey()) {
    return null;
  }

  const cached = queryEmbeddingCache.get(normalized);
  if (cached) return cached;

  try {
    const vectors = await fetchEmbeddings([normalized.slice(0, 1200)]);
    const vector = vectors[0];
    if (!vector || vector.length === 0) return null;
    queryEmbeddingCache.set(normalized, vector);
    return vector;
  } catch (error) {
    console.error("[rag-vector-store] unable to embed query", error);
    return null;
  }
};

export const cosineSimilarity = (left: number[], right: number[]): number => {
  if (left.length === 0 || right.length === 0 || left.length !== right.length) return 0;

  let dot = 0;
  let normLeft = 0;
  let normRight = 0;

  for (let index = 0; index < left.length; index += 1) {
    const a = left[index];
    const b = right[index];
    dot += a * b;
    normLeft += a * a;
    normRight += b * b;
  }

  if (normLeft === 0 || normRight === 0) return 0;
  return dot / (Math.sqrt(normLeft) * Math.sqrt(normRight));
};

