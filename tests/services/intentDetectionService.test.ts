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

  it("maps courtesy messages to greeting intent", () => {
    const normalization = normalizeInput("thanks for the help");
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

  it("maps assistant identity questions to about_me intent", () => {
    const normalization = normalizeInput("what is your name?");
    const result = detectIntent(normalization);

    expect(result.intent).toBe("about_me");
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it("maps workplace questions to experience intent", () => {
    const normalization = normalizeInput("where do you work?");
    const result = detectIntent(normalization);

    expect(result.intent).toBe("experience");
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it("detects direct contact phrasing without requiring prompt chips", () => {
    const normalization = normalizeInput("how can I contact you?");
    const result = detectIntent(normalization);

    expect(result.intent).toBe("contact");
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it("detects recruiter interest from contact + role phrasing", () => {
    const normalization = normalizeInput("Can I connect with him about a role?");
    const result = detectIntent(normalization);

    expect(result.intent).toBe("recruiter_interest");
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it("marks off-topic question as unknown", () => {
    const normalization = normalizeInput("Who won last night football match?");

    const result = detectIntent(normalization);

    expect(result.intent).toBe("unknown");
  });
});
