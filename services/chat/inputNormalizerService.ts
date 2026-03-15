import { InputNormalization } from "@/types/chat";

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "am",
  "to",
  "of",
  "for",
  "and",
  "or",
  "in",
  "on",
  "with",
  "about",
  "his",
  "her",
  "he",
  "she",
  "does",
  "do",
  "did",
  "can",
  "you",
  "your",
  "yourself",
  "tell",
  "who",
  "what",
  "me",
  "i",
  "my"
]);

export const normalizeInput = (question: string): InputNormalization => {
  const normalized = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = normalized.split(" ").filter(Boolean);
  const keywordTokens = tokens.filter((token) => token.length > 2 && !STOPWORDS.has(token));

  return {
    original: question,
    normalized,
    tokens,
    keywordTokens
  };
};
