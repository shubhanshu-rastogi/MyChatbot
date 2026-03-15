import { getKnowledgeIndex } from "@/services/knowledge/knowledgeIndexService";
import { KnowledgeEntry, KnowledgeIndex } from "@/types/knowledge";

export const getProfileKnowledgeIndex = async (): Promise<KnowledgeIndex> =>
  getKnowledgeIndex();

export const getProfileKnowledgeEntries = async (): Promise<KnowledgeEntry[]> => {
  const index = await getKnowledgeIndex();
  return index.entries;
};
