export type ProfileIntent =
  | "greeting"
  | "about_me"
  | "career_summary"
  | "experience"
  | "leadership"
  | "ai_testing"
  | "rag_evaluation"
  | "automation"
  | "tools_and_technologies"
  | "projects"
  | "contact"
  | "recruiter_interest"
  | "unknown";

export type KnowledgeSourceType =
  | "profile_metadata"
  | "known_faq"
  | "project_metadata"
  | "resume"
  | "linkedin"
  | "summary";

export type KnowledgeEntry = {
  id: string;
  sourceType: KnowledgeSourceType;
  sourceName: string;
  topic: ProfileIntent;
  title: string;
  content: string;
  tags: string[];
  priority: number;
  confidenceHint: number;
  recruiterImportance: number;
  relatedLinks: string[];
  lastUpdated: string;
};

export type RetrievalEvidence = {
  entryId: string;
  sourceType: KnowledgeSourceType;
  sourceName: string;
  title: string;
  topic: ProfileIntent;
  score: number;
  matchedKeywords: string[];
  rationale: string[];
  recruiterImportance: number;
  priority: number;
};

export type KnowledgeIndex = {
  entries: KnowledgeEntry[];
  byId: Record<string, KnowledgeEntry>;
};

export type RetrievedContext = {
  intent: ProfileIntent;
  evidence: RetrievalEvidence[];
  totalCandidates: number;
};
