import { recordUnknownQuestion } from "@/services/capture/unknownQuestionService";
import { notifySiteOwner } from "@/services/notifications/notificationService";

export const FALLBACK_MESSAGE =
  "Sorry, I’m not confident enough to answer that yet. I’ve recorded your question so Shubhanshu can review it. If you’d like a follow-up, please share your email address.";

export const handleFallback = async (params: {
  question: string;
  sessionId?: string;
  reason: string;
}) => {
  const unknown = await recordUnknownQuestion(params.question, params.sessionId);

  await notifySiteOwner({
    type: "unknown_question",
    title: "Unresolved chatbot question captured",
    message: "The profile assistant triggered fallback due to low confidence or insufficient grounding.",
    metadata: {
      unknownQuestionId: unknown.id,
      question: params.question,
      reason: params.reason,
      sessionId: params.sessionId
    }
  });

  return {
    message: FALLBACK_MESSAGE,
    unknownQuestionId: unknown.id
  };
};
