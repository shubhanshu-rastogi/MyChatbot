import { DraftAnswer, InputNormalization, IntentDetectionResult, ReviewDecision } from "@/types/chat";
import { RetrievedContext } from "@/types/knowledge";
import { getProfileKnowledgeIndex } from "@/services/chat/profileKnowledgeService";
import { isOpenAIEnabled, reviewDraftWithOpenAI } from "@/services/chat/openAIAgentService";
import { runtimeConfig } from "@/lib/runtimeConfig";

const MIN_EVIDENCE_COUNT = 1;
const MIN_TOP_SCORE = 7;
const MIN_DRAFT_LENGTH = 40;
const MIN_CONFIDENCE = 0.45;

const RESTRICTED_CLAIMS = [
  "guaranteed",
  "world-class",
  "best in class",
  "number one",
  "expert in everything"
];

const extractNumbers = (text: string): string[] => text.match(/\b\d+(?:\+)?\b/g) ?? [];
const unique = (values: string[]): string[] => [...new Set(values)];

export const reviewDraftAnswer = async (params: {
  normalization: InputNormalization;
  intent: IntentDetectionResult;
  retrieval: RetrievedContext;
  draft: DraftAnswer;
}): Promise<ReviewDecision> => {
  const { normalization, intent, retrieval, draft } = params;
  const flags: string[] = [];
  const llmEnabled = isOpenAIEnabled();
  const llmReviewRequired = llmEnabled && runtimeConfig.chat.enforceLlmReview;
  const isGreeting = intent.intent === "greeting";

  if (intent.intent === "unknown") {
    flags.push("intent_unknown");
    return {
      approved: false,
      reason: "The question is outside the profile-bounded assistant scope.",
      qualityScore: 0,
      shouldFallback: true,
      flags
    };
  }

  if (!isGreeting && (!draft.isGrounded || retrieval.evidence.length < MIN_EVIDENCE_COUNT)) {
    flags.push("no_grounded_evidence");
    return {
      approved: false,
      reason: "No grounded evidence available for the response.",
      qualityScore: 0,
      shouldFallback: true,
      flags
    };
  }

  const topScore = retrieval.evidence[0]?.score ?? 0;
  if (!isGreeting && topScore < MIN_TOP_SCORE) {
    flags.push("low_retrieval_score");
    return {
      approved: false,
      reason: "Evidence strength is below the grounding threshold.",
      qualityScore: Number((topScore / MIN_TOP_SCORE).toFixed(2)),
      shouldFallback: true,
      flags
    };
  }

  if (!isGreeting && draft.confidence < MIN_CONFIDENCE) {
    flags.push("low_generator_confidence");
    return {
      approved: false,
      reason: "Draft confidence is too low for a reliable response.",
      qualityScore: draft.confidence,
      shouldFallback: true,
      flags
    };
  }

  if (!isGreeting && draft.text.trim().length < MIN_DRAFT_LENGTH) {
    flags.push("draft_too_vague");
    return {
      approved: false,
      reason: "Draft response is too short and may be incomplete.",
      qualityScore: 0.3,
      shouldFallback: true,
      flags
    };
  }

  const overlapTokens = normalization.keywordTokens.filter((token) =>
    retrieval.evidence.some((item) => item.matchedKeywords.includes(token))
  );

  if (
    !isGreeting &&
    normalization.keywordTokens.length > 0 &&
    overlapTokens.length === 0
  ) {
    flags.push("low_question_relevance");
    return {
      approved: false,
      reason: "Retrieved evidence does not sufficiently match the question.",
      qualityScore: 0.25,
      shouldFallback: true,
      flags
    };
  }

  const hasRestrictedClaim = RESTRICTED_CLAIMS.some((claim) =>
    draft.text.toLowerCase().includes(claim)
  );

  if (hasRestrictedClaim) {
    flags.push("overstatement_risk");
    return {
      approved: false,
      reason: "Draft includes overstated language not aligned with profile safety rules.",
      qualityScore: 0.2,
      shouldFallback: true,
      flags
    };
  }

  const index = await getProfileKnowledgeIndex();
  const evidenceText = draft.usedEvidenceIds
    .map((id) => index.byId[id]?.content ?? "")
    .join(" ");

  const draftNumbers = extractNumbers(draft.text);
  const evidenceNumbers = extractNumbers(evidenceText);
  const hasUnsupportedNumber = draftNumbers.some((value) => !evidenceNumbers.includes(value));

  if (!isGreeting && hasUnsupportedNumber) {
    flags.push("unsupported_numeric_claim");
    return {
      approved: false,
      reason: "Draft includes numeric claims not present in grounded evidence.",
      qualityScore: 0.2,
      shouldFallback: true,
      flags
    };
  }

  const llmReview = await reviewDraftWithOpenAI({
    normalization,
    intent,
    retrieval,
    draft,
    index
  });

  if (llmReview) {
    if (!llmReview.approved) {
      return {
        ...llmReview,
        flags: unique([...flags, ...llmReview.flags])
      };
    }

    return {
      approved: true,
      reason: llmReview.reason,
      qualityScore: Number(Math.max(llmReview.qualityScore, draft.confidence).toFixed(2)),
      shouldFallback: false,
      flags: unique([...flags, ...llmReview.flags]),
      reviewedAnswer: llmReview.reviewedAnswer
    };
  }

  if (llmReviewRequired) {
    if (isGreeting) {
      return {
        approved: true,
        reason:
          "Greeting/courtesy response approved with deterministic fallback because LLM reviewer was temporarily unavailable.",
        qualityScore: 0.95,
        shouldFallback: false,
        flags: unique([...flags, "greeting", "llm_reviewer_unavailable_greeting_bypass"])
      };
    }

    return {
      approved: false,
      reason:
        "LLM reviewer was unavailable, so the response was not published. Please try again.",
      qualityScore: 0.1,
      shouldFallback: true,
      flags: unique([...flags, "llm_review_unavailable"])
    };
  }

  if (isGreeting) {
    return {
      approved: true,
      reason: "Greeting/courtesy response approved by deterministic reviewer fallback.",
      qualityScore: 0.98,
      shouldFallback: false,
      flags: unique([...flags, "greeting"])
    };
  }

  return {
    approved: true,
    reason: "Answer is grounded, relevant, and safe for profile-bounded output.",
    qualityScore: Number(((draft.confidence + Math.min(1, topScore / 10)) / 2).toFixed(2)),
    shouldFallback: false,
    flags
  };
};
