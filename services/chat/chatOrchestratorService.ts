import { ChatApiResponse } from "@/types/chat";
import { normalizeInput } from "@/services/chat/inputNormalizerService";
import { detectIntent } from "@/services/chat/intentDetectionService";
import { retrieveKnowledge } from "@/services/chat/retrievalService";
import { generateDraftAnswer } from "@/services/chat/answerGenerationService";
import { reviewDraftAnswer } from "@/services/chat/answerReviewService";
import { formatApprovedResponse } from "@/services/chat/finalResponseFormatterService";
import { handleFallback } from "@/services/chat/fallbackService";

const isDebugModeEnabled = (): boolean =>
  process.env.CHATBOT_DEBUG === "true" || process.env.NEXT_PUBLIC_CHATBOT_DEBUG === "true";

const unique = (values: string[]): string[] => [...new Set(values)];

export const orchestrateChatResponse = async (
  question: string,
  sessionId?: string
): Promise<ChatApiResponse> => {
  const normalization = normalizeInput(question);
  const intent = detectIntent(normalization);
  const retrieval = await retrieveKnowledge(normalization, intent);
  const draft = await generateDraftAnswer(normalization, intent, retrieval);
  const review = await reviewDraftAnswer({
    normalization,
    intent,
    retrieval,
    draft
  });

  if (review.approved) {
    const requiresEmailCapture = intent.intent === "recruiter_interest";
    const finalText = review.reviewedAnswer?.trim() ? review.reviewedAnswer : draft.text;

    const response: ChatApiResponse = {
      message: formatApprovedResponse({ ...draft, text: finalText }),
      requiresEmailCapture,
      contactCaptureReason: requiresEmailCapture ? "recruiter_interest" : undefined,
      trace: {
        normalization,
        intent,
        retrievedEntryIds: retrieval.evidence.map((item) => item.entryId),
        retrievedSources: unique(
          retrieval.evidence.map((item) => `${item.sourceType}:${item.sourceName}`)
        ),
        reviewDecision: review,
        fallbackTriggered: false
      }
    };

    if (isDebugModeEnabled()) {
      response.debug = {
        normalization,
        intent,
        retrieval,
        reviewDecision: review,
        fallbackTriggered: false
      };
    }

    return response;
  }

  const fallback = await handleFallback({
    question,
    sessionId,
    reason: review.reason
  });

  const fallbackResponse: ChatApiResponse = {
    message: fallback.message,
    requiresEmailCapture: true,
    contactCaptureReason: "unknown_question_follow_up",
    unknownQuestionId: fallback.unknownQuestionId,
    trace: {
      normalization,
      intent,
      retrievedEntryIds: retrieval.evidence.map((item) => item.entryId),
      retrievedSources: unique(
        retrieval.evidence.map((item) => `${item.sourceType}:${item.sourceName}`)
      ),
      reviewDecision: review,
      fallbackTriggered: true,
      fallbackReason: review.reason
    }
  };

  if (isDebugModeEnabled()) {
    fallbackResponse.debug = {
      normalization,
      intent,
      retrieval,
      reviewDecision: review,
      fallbackTriggered: true,
      fallbackReason: review.reason
    };
  }

  return fallbackResponse;
};
