import { DraftAnswer, InputNormalization, IntentDetectionResult } from "@/types/chat";
import { RetrievedContext } from "@/types/knowledge";
import { getProfileKnowledgeIndex } from "@/services/chat/profileKnowledgeService";
import { generateDraftWithOpenAI } from "@/services/chat/openAIAgentService";

const firstSentence = (text: string): string => {
  const sentence = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)[0];

  return sentence || text;
};

const formatProjectsSummary = (snippets: string[]): string => {
  const cleaned = snippets.filter(Boolean).slice(0, 3);
  if (cleaned.length === 0) {
    return "";
  }

  return `Most relevant highlights include ${cleaned.join(" ")}`;
};

const buildLeadLine = (intent: IntentDetectionResult["intent"]): string => {
  switch (intent) {
    case "about_me":
      return "Shubhanshu is a senior QA and AI quality engineering leader.";
    case "career_summary":
      return "His career combines quality strategy, automation depth, and delivery governance.";
    case "experience":
      return "His experience is centered on enterprise quality engineering and release confidence.";
    case "leadership":
      return "He brings strong QA leadership across cross-functional teams.";
    case "ai_testing":
      return "He has practical experience in AI and LLM quality validation.";
    case "rag_evaluation":
      return "He has worked on RAG evaluation and grounding-oriented quality checks.";
    case "automation":
      return "Automation is a core part of his quality engineering approach.";
    case "tools_and_technologies":
      return "He works with a modern testing and quality engineering toolchain.";
    case "projects":
      return "His projects focus on quality intelligence, automation, and AI assurance.";
    case "contact":
      return "You can connect with him through the approved profile channels.";
    case "recruiter_interest":
      return "He is open to recruiter conversations aligned with quality leadership and AI testing roles.";
    default:
      return "";
  }
};

export const generateDraftAnswer = async (
  normalization: InputNormalization,
  intent: IntentDetectionResult,
  retrieval: RetrievedContext
): Promise<DraftAnswer> => {
  if (intent.intent === "greeting") {
    const isCourtesyReply =
      normalization.normalized.includes("thank") ||
      normalization.normalized.includes("thx") ||
      normalization.normalized.includes("appreciate");

    const text = isCourtesyReply
      ? "You’re welcome. Happy to help."
      : "Hi there. What would you like to know?";

    return {
      text,
      usedEvidenceIds: [],
      usedSources: [],
      confidence: 0.98,
      intent: "greeting",
      isGrounded: true
    };
  }

  const index = await getProfileKnowledgeIndex();

  const openAIDraft = await generateDraftWithOpenAI({
    normalization,
    intent,
    retrieval,
    index
  });

  if (openAIDraft && openAIDraft.text.trim()) {
    return openAIDraft;
  }

  if (retrieval.evidence.length === 0) {
    return {
      text: "",
      usedEvidenceIds: [],
      usedSources: [],
      confidence: 0,
      intent: intent.intent,
      isGrounded: false
    };
  }

  const topEvidence = retrieval.evidence.slice(0, 3);

  const snippets = topEvidence
    .map((evidence) => index.byId[evidence.entryId])
    .filter(Boolean)
    .map((entry) => firstSentence(entry.content));

  const leadLine = buildLeadLine(intent.intent);
  const supportLine =
    intent.intent === "projects"
      ? formatProjectsSummary(snippets)
      : snippets.slice(0, 2).join(" ");

  const recruiterLine =
    intent.intent === "contact" || intent.intent === "recruiter_interest"
      ? "If helpful, share your email here and Shubhanshu can follow up directly."
      : "";

  const text = [leadLine, supportLine, recruiterLine]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const averageScore =
    topEvidence.reduce((acc, evidence) => acc + evidence.score, 0) /
    Math.max(1, topEvidence.length);

  const confidence = Number(Math.min(0.98, averageScore / 14).toFixed(2));

  return {
    text,
    usedEvidenceIds: topEvidence.map((item) => item.entryId),
    usedSources: topEvidence.map((item) => `${item.sourceType}:${item.sourceName}`),
    confidence,
    intent: intent.intent,
    isGrounded: true
  };
};
