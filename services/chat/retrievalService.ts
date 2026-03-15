import { getProfileKnowledgeEntries } from "@/services/chat/profileKnowledgeService";
import { IntentDetectionResult, InputNormalization } from "@/types/chat";
import { RetrievedContext, RetrievalEvidence } from "@/types/knowledge";
import { getSourcePriorityWeight } from "@/services/knowledge/sourcePriority";

const MIN_RELEVANCE_SCORE = 6;
const MAX_RESULTS = 5;

const unique = (values: string[]): string[] => [...new Set(values)];

const tokenizeText = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);

const calculateEvidence = (
  normalization: InputNormalization,
  intent: IntentDetectionResult,
  entryText: string,
  entryTags: string[],
  entryTopic: string,
  entrySourceType: RetrievalEvidence["sourceType"],
  recruiterImportance: number,
  priority: number
): { score: number; matchedKeywords: string[]; rationale: string[] } => {
  const rationale: string[] = [];
  let score = 0;

  const sourcePriorityWeight = getSourcePriorityWeight(entrySourceType);
  score += sourcePriorityWeight;
  rationale.push(`source-priority:${sourcePriorityWeight}`);

  const textTokens = tokenizeText(entryText);
  const matches = normalization.keywordTokens.filter(
    (token) => textTokens.includes(token) || entryTags.includes(token)
  );

  const matchedKeywords = unique(matches);

  if (intent.intent !== "unknown" && entryTopic === intent.intent) {
    score += 4;
    rationale.push("intent-match:4");
  }

  if (entryTags.includes(intent.intent)) {
    score += 2;
    rationale.push("intent-tag-match:2");
  }

  if (matchedKeywords.length > 0) {
    const keywordScore = matchedKeywords.length * 2;
    score += keywordScore;
    rationale.push(`keyword-match:${keywordScore}`);
  }

  score += recruiterImportance * 1.4;
  rationale.push(`recruiter-importance:${(recruiterImportance * 1.4).toFixed(2)}`);

  score += priority * 0.6;
  rationale.push(`entry-priority:${(priority * 0.6).toFixed(2)}`);

  if (intent.confidence > 0.65) {
    score += 0.7;
    rationale.push("intent-confidence-boost:0.7");
  }

  return {
    score: Number(score.toFixed(2)),
    matchedKeywords,
    rationale
  };
};

export const retrieveKnowledge = async (
  normalization: InputNormalization,
  intent: IntentDetectionResult
): Promise<RetrievedContext> => {
  const entries = await getProfileKnowledgeEntries();

  if (intent.intent === "greeting") {
    return {
      intent: "greeting",
      evidence: [],
      totalCandidates: entries.length
    };
  }

  const ranked: RetrievalEvidence[] = entries.map((entry) => {
    const { score, matchedKeywords, rationale } = calculateEvidence(
      normalization,
      intent,
      `${entry.title} ${entry.content}`,
      entry.tags,
      entry.topic,
      entry.sourceType,
      entry.recruiterImportance,
      entry.priority
    );

    return {
      entryId: entry.id,
      sourceType: entry.sourceType,
      sourceName: entry.sourceName,
      title: entry.title,
      topic: entry.topic,
      score,
      matchedKeywords,
      rationale,
      recruiterImportance: entry.recruiterImportance,
      priority: entry.priority
    };
  });

  const evidence = ranked
    .filter((item) => {
      if (intent.intent === "unknown") {
        return item.score >= MIN_RELEVANCE_SCORE + 3;
      }

      return item.score >= MIN_RELEVANCE_SCORE;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);

  return {
    intent: intent.intent,
    evidence,
    totalCandidates: entries.length
  };
};
