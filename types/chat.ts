import { ProfileIntent, RetrievedContext } from "@/types/knowledge";

export type MessageRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
};

export type InputNormalization = {
  original: string;
  normalized: string;
  tokens: string[];
  keywordTokens: string[];
};

export type IntentDetectionResult = {
  intent: ProfileIntent;
  confidence: number;
  matchedSignals: string[];
};

export type DraftAnswer = {
  text: string;
  usedEvidenceIds: string[];
  usedSources: string[];
  confidence: number;
  intent: ProfileIntent;
  isGrounded: boolean;
};

export type ReviewDecision = {
  approved: boolean;
  reason: string;
  qualityScore: number;
  shouldFallback: boolean;
  flags: string[];
  reviewedAnswer?: string;
};

export type ChatApiRequest = {
  question: string;
  sessionId?: string;
};

export type OrchestrationTrace = {
  normalization: InputNormalization;
  intent: IntentDetectionResult;
  retrievedEntryIds: string[];
  retrievedSources: string[];
  reviewDecision: ReviewDecision;
  fallbackTriggered: boolean;
  fallbackReason?: string;
};

export type ChatDebugPayload = {
  normalization: InputNormalization;
  intent: IntentDetectionResult;
  retrieval: RetrievedContext;
  reviewDecision: ReviewDecision;
  fallbackTriggered: boolean;
  fallbackReason?: string;
};

export type ChatApiResponse = {
  message: string;
  requiresEmailCapture: boolean;
  contactCaptureReason?: "unknown_question_follow_up" | "recruiter_interest";
  unknownQuestionId?: string;
  trace: OrchestrationTrace;
  debug?: ChatDebugPayload;
};
