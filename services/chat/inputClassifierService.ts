import { detectIntent } from "@/services/chat/intentDetectionService";
import { normalizeInput } from "@/services/chat/inputNormalizerService";

export type ClassifierResult = ReturnType<typeof detectIntent> & {
  normalizedQuestion: string;
  keywordTokens: string[];
};

// Backward-compatible wrapper retained from Phase 1 naming.
export const classifyInput = (question: string): ClassifierResult => {
  const normalization = normalizeInput(question);
  const intentResult = detectIntent(normalization);

  return {
    ...intentResult,
    normalizedQuestion: normalization.normalized,
    keywordTokens: normalization.keywordTokens
  };
};
