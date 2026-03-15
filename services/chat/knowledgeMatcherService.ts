import { detectIntent } from "@/services/chat/intentDetectionService";
import { normalizeInput } from "@/services/chat/inputNormalizerService";
import { retrieveKnowledge } from "@/services/chat/retrievalService";

// Backward-compatible wrapper retained from Phase 1 naming.
export const matchKnowledge = async (question: string) => {
  const normalization = normalizeInput(question);
  const intent = detectIntent(normalization);
  const retrieval = await retrieveKnowledge(normalization, intent);

  return retrieval.evidence[0] ?? null;
};
