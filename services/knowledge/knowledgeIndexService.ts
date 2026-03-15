import { ingestKnowledgeSources } from "@/services/knowledge/knowledgeIngestionService";
import { KnowledgeEntry, KnowledgeIndex } from "@/types/knowledge";

const CACHE_TTL_MS = 30_000;

let cache: { index: KnowledgeIndex; createdAt: number } | null = null;

const buildIndex = (entries: KnowledgeEntry[]): KnowledgeIndex => ({
  entries,
  byId: entries.reduce<Record<string, KnowledgeEntry>>((acc, entry) => {
    acc[entry.id] = entry;
    return acc;
  }, {})
});

export const getKnowledgeIndex = async (
  forceRefresh = false
): Promise<KnowledgeIndex> => {
  const now = Date.now();

  if (!forceRefresh && cache && now - cache.createdAt < CACHE_TTL_MS) {
    return cache.index;
  }

  const entries = await ingestKnowledgeSources();
  const index = buildIndex(entries);

  cache = {
    index,
    createdAt: now
  };

  return index;
};

export const clearKnowledgeIndexCache = () => {
  cache = null;
};
