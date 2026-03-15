import { describe, expect, it } from "vitest";
import { normalizeInput } from "@/services/chat/inputNormalizerService";
import { detectIntent } from "@/services/chat/intentDetectionService";

describe("intentDetectionService", () => {
  it("detects leadership intent", () => {
    const normalization = normalizeInput(
      "What kind of QA leadership experience does he have?"
    );

    const result = detectIntent(normalization);

    expect(result.intent).toBe("leadership");
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.matchedSignals.length).toBeGreaterThan(0);
  });

  it("detects AI or RAG testing intent", () => {
    const normalization = normalizeInput("Has he worked on AI or RAG testing?");

    const result = detectIntent(normalization);

    expect(["ai_testing", "rag_evaluation"]).toContain(result.intent);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("detects greeting intent", () => {
    const normalization = normalizeInput("hello");
    const result = detectIntent(normalization);

    expect(result.intent).toBe("greeting");
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it("maps self-reference questions to about_me intent", () => {
    const normalization = normalizeInput("tell me about yourself");
    const result = detectIntent(normalization);

    expect(result.intent).toBe("about_me");
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it("marks off-topic question as unknown", () => {
    const normalization = normalizeInput("Who won last night football match?");

    const result = detectIntent(normalization);

    expect(result.intent).toBe("unknown");
  });
});
