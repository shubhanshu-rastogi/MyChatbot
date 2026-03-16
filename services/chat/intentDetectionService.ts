import { IntentDetectionResult, InputNormalization } from "@/types/chat";
import { ProfileIntent } from "@/types/knowledge";

const greetingSignals = ["hi", "hello", "hey", "hiya", "good morning", "good afternoon", "good evening"];
const courtesySignals = ["thanks", "thank you", "thankyou", "thx", "appreciate it", "much appreciated"];
const selfReferenceSignals = [
  "tell me about yourself",
  "about yourself",
  "who are you",
  "introduce yourself",
  "about you"
];
const workplaceSignals = [
  "where do you work",
  "where does he work",
  "where does shubhanshu work",
  "who do you work for",
  "which company do you work for",
  "current company",
  "current employer",
  "where are you working",
  "where is he working"
];
const identitySignals = [
  "what is your name",
  "what s your name",
  "whats your name",
  "your name",
  "may i know your name",
  "tell me your name"
];
const directContactSignals = ["contact", "email", "linkedin", "reach", "mail", "github"];
const connectSignals = ["connect"];
const personReferenceSignals = ["you", "him", "his", "shubhanshu"];
const recruiterSignals = ["role", "opportunity", "hiring", "position", "resume", "job"];

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
  const hasCourtesySignal = courtesySignals.some(
    (signal) =>
      normalization.normalized === signal ||
      normalization.normalized.startsWith(`${signal} `) ||
      normalization.normalized.endsWith(` ${signal}`) ||
      normalization.normalized.includes(` ${signal} `)
  );

  if (hasCourtesySignal && normalization.keywordTokens.length <= 5) {
    return {
      intent: "greeting",
      confidence: 0.99,
      matchedSignals: ["courtesy"]
    };
  }

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

  const hasWorkplaceSignal = workplaceSignals.some((signal) =>
    normalization.normalized.includes(signal)
  );
  const asksWorkplaceDirectly =
    normalization.tokens.includes("work") &&
    (normalization.tokens.includes("where") ||
      normalization.tokens.includes("company") ||
      normalization.tokens.includes("employer")) &&
    (normalization.tokens.includes("you") ||
      normalization.tokens.includes("he") ||
      normalization.tokens.includes("his") ||
      normalization.tokens.includes("shubhanshu"));

  if (hasWorkplaceSignal || asksWorkplaceDirectly) {
    return {
      intent: "experience",
      confidence: 0.96,
      matchedSignals: ["workplace_query"]
    };
  }

  const hasIdentitySignal = identitySignals.some((signal) =>
    normalization.normalized.includes(signal)
  );
  const asksForAssistantName =
    normalization.tokens.includes("name") &&
    (normalization.tokens.includes("you") || normalization.tokens.includes("your"));

  if (hasIdentitySignal || asksForAssistantName) {
    return {
      intent: "about_me",
      confidence: 0.96,
      matchedSignals: ["assistant_identity"]
    };
  }

  const hasDirectContactSignal = directContactSignals.some((signal) =>
    normalization.normalized.includes(signal)
  );
  const hasConnectSignal = connectSignals.some((signal) =>
    normalization.normalized.includes(signal)
  );
  const hasPersonReference = personReferenceSignals.some((signal) =>
    normalization.normalized.includes(signal)
  );
  const hasRecruiterSignal = recruiterSignals.some((signal) =>
    normalization.normalized.includes(signal)
  );

  if (hasDirectContactSignal || (hasConnectSignal && hasPersonReference)) {
    return {
      intent: hasRecruiterSignal ? "recruiter_interest" : "contact",
      confidence: hasRecruiterSignal ? 0.97 : 0.95,
      matchedSignals: hasRecruiterSignal
        ? ["direct_contact", "recruiter_context"]
        : ["direct_contact"]
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
