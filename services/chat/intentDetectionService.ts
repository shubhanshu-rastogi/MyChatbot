import { IntentDetectionResult, InputNormalization } from "@/types/chat";
import { ProfileIntent } from "@/types/knowledge";

const greetingSignals = ["hi", "hello", "hey", "hiya", "good morning", "good afternoon", "good evening"];
const selfReferenceSignals = [
  "tell me about yourself",
  "about yourself",
  "who are you",
  "introduce yourself",
  "about you"
];

const intentSignals: Record<Exclude<ProfileIntent, "unknown">, string[]> = {
  greeting: ["hi", "hello", "hey", "greetings"],
  about_me: ["about", "profile", "background", "shubhanshu"],
  career_summary: ["summary", "career", "overview", "snapshot"],
  experience: ["experience", "years", "industries"],
  leadership: ["leadership", "lead", "manager", "stakeholder", "strategy"],
  ai_testing: ["ai", "llm", "model", "prompt", "evaluation"],
  rag_evaluation: ["rag", "retrieval", "grounding", "hallucination", "faithfulness"],
  automation: ["automation", "automated", "framework", "regression", "testing"],
  tools_and_technologies: ["tools", "technologies", "playwright", "selenium", "cicd", "stack"],
  projects: ["project", "projects", "portfolio", "case", "work"],
  contact: ["contact", "email", "linkedin", "connect", "reach"],
  recruiter_interest: ["role", "opportunity", "hiring", "position", "resume", "open"]
};

const intentTieBreaker: Record<Exclude<ProfileIntent, "unknown">, number> = {
  greeting: 13,
  recruiter_interest: 12,
  contact: 11,
  rag_evaluation: 10,
  ai_testing: 9,
  automation: 8,
  tools_and_technologies: 7,
  leadership: 6,
  projects: 5,
  experience: 4,
  career_summary: 3,
  about_me: 2
};

const profileDomainSignals = [
  "shubhanshu",
  "qa",
  "testing",
  "automation",
  "leadership",
  "rag",
  "ai",
  "contact",
  "resume",
  "role"
];

const scoreIntent = (
  normalization: InputNormalization,
  intent: Exclude<ProfileIntent, "unknown">
) => {
  const signals = intentSignals[intent];
  const matchedSignals = signals.filter(
    (signal) =>
      normalization.normalized.includes(signal) || normalization.keywordTokens.includes(signal)
  );

  let score = matchedSignals.length;

  if (intent === "rag_evaluation" && normalization.normalized.includes("rag")) {
    score += 3;
  }

  if (intent === "ai_testing" && (normalization.normalized.includes("ai") || normalization.normalized.includes("llm"))) {
    score += 2;
  }

  if (intent === "automation" && normalization.normalized.includes("automation")) {
    score += 1;
  }

  return {
    intent,
    score,
    matchedSignals
  };
};

export const detectIntent = (
  normalization: InputNormalization
): IntentDetectionResult => {
  const hasSelfReference = selfReferenceSignals.some((signal) =>
    normalization.normalized.includes(signal)
  );

  if (hasSelfReference) {
    return {
      intent: "about_me",
      confidence: 0.98,
      matchedSignals: ["self_reference"]
    };
  }

  const hasGreetingSignal = greetingSignals.some(
    (signal) =>
      normalization.normalized === signal ||
      normalization.normalized.startsWith(`${signal} `) ||
      normalization.tokens.includes(signal)
  );

  if (hasGreetingSignal) {
    return {
      intent: "greeting",
      confidence: 0.99,
      matchedSignals: ["greeting"]
    };
  }

  const scores = (Object.keys(intentSignals) as Exclude<ProfileIntent, "unknown">[])
    .map((intent) => scoreIntent(normalization, intent))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return intentTieBreaker[b.intent] - intentTieBreaker[a.intent];
    });

  const top = scores[0];
  const second = scores[1];

  if (!top || top.score === 0) {
    return {
      intent: "unknown",
      confidence: 0,
      matchedSignals: []
    };
  }

  const hasProfileSignal = profileDomainSignals.some((signal) =>
    normalization.normalized.includes(signal)
  );

  if (!hasProfileSignal || top.score < 2) {
    return {
      intent: "unknown",
      confidence: 0.2,
      matchedSignals: []
    };
  }

  const isRecruiterContactPattern =
    (normalization.normalized.includes("contact") || normalization.normalized.includes("connect")) &&
    (normalization.normalized.includes("role") ||
      normalization.normalized.includes("opportunity") ||
      normalization.normalized.includes("resume"));

  const resolvedIntent = isRecruiterContactPattern ? "recruiter_interest" : top.intent;

  const confidenceBase = top.score / Math.max(1, normalization.keywordTokens.length);
  const separationBoost = second ? Math.min(0.2, (top.score - second.score) * 0.08) : 0.2;
  const confidence = Number(Math.min(1, confidenceBase + separationBoost).toFixed(2));

  return {
    intent: resolvedIntent,
    confidence,
    matchedSignals: top.matchedSignals
  };
};
