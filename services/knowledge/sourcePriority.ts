import { KnowledgeSourceType } from "@/types/knowledge";

export const SOURCE_PRIORITY: Record<KnowledgeSourceType, number> = {
  profile_metadata: 6,
  known_faq: 5,
  project_metadata: 4,
  resume: 3,
  linkedin: 2,
  summary: 1
};

export const getSourcePriorityWeight = (sourceType: KnowledgeSourceType): number =>
  SOURCE_PRIORITY[sourceType] ?? 0;
