import { DraftAnswer } from "@/types/chat";

export const formatApprovedResponse = (draft: DraftAnswer): string => {
  const base = draft.text.trim();

  if (!base) {
    return "";
  }

  const premiumMicrocopy = "Based on approved profile information.";

  return `${base}\n\n${premiumMicrocopy}`;
};
