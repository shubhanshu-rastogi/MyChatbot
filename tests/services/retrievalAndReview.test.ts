import { describe, expect, it } from "vitest";
import { normalizeInput } from "@/services/chat/inputNormalizerService";
import { detectIntent } from "@/services/chat/intentDetectionService";
import { retrieveKnowledge } from "@/services/chat/retrievalService";
import { generateDraftAnswer } from "@/services/chat/answerGenerationService";
import { reviewDraftAnswer } from "@/services/chat/answerReviewService";

describe("retrieval and review pipeline", () => {
  it("retrieves recruiter-relevant content for tools question", async () => {
    const normalization = normalizeInput(
      "What automation tools does he specialize in?"
    );
    const intent = detectIntent(normalization);

    const retrieval = await retrieveKnowledge(normalization, intent);

    expect(retrieval.evidence.length).toBeGreaterThan(0);
    expect(
      retrieval.evidence.some((entry) =>
        ["tools_and_technologies", "automation"].includes(entry.topic)
      )
    ).toBe(true);
  });

  it("prefers profile metadata over lower-priority sources", async () => {
    const normalization = normalizeInput(
      "How many years of experience and which industries has he worked in?"
    );
    const intent = detectIntent(normalization);

    const retrieval = await retrieveKnowledge(normalization, intent);

    expect(retrieval.evidence.length).toBeGreaterThan(0);
    expect(retrieval.evidence[0].sourceType).toBe("profile_metadata");
  });

  it("approves grounded answers with strong evidence", async () => {
    const normalization = normalizeInput("Tell me about Shubhanshu");
    const intent = detectIntent(normalization);
    const retrieval = await retrieveKnowledge(normalization, intent);
    const draft = await generateDraftAnswer(normalization, intent, retrieval);

    const review = await reviewDraftAnswer({
      normalization,
      intent,
      retrieval,
      draft
    });

    expect(review.approved).toBe(true);
    expect(review.shouldFallback).toBe(false);
  });

  it("handles greeting without triggering fallback", async () => {
    const normalization = normalizeInput("hi");
    const intent = detectIntent(normalization);
    const retrieval = await retrieveKnowledge(normalization, intent);
    const draft = await generateDraftAnswer(normalization, intent, retrieval);

    const review = await reviewDraftAnswer({
      normalization,
      intent,
      retrieval,
      draft
    });

    expect(intent.intent).toBe("greeting");
    expect(draft.text.toLowerCase()).toContain("hi");
    expect(review.approved).toBe(true);
    expect(review.shouldFallback).toBe(false);
  });

  it("handles courtesy messages without triggering fallback", async () => {
    const normalization = normalizeInput("thanks");
    const intent = detectIntent(normalization);
    const retrieval = await retrieveKnowledge(normalization, intent);
    const draft = await generateDraftAnswer(normalization, intent, retrieval);

    const review = await reviewDraftAnswer({
      normalization,
      intent,
      retrieval,
      draft
    });

    expect(intent.intent).toBe("greeting");
    expect(draft.text.toLowerCase()).toContain("welcome");
    expect(review.approved).toBe(true);
    expect(review.shouldFallback).toBe(false);
  });

  it("answers self-intro query from profile context", async () => {
    const normalization = normalizeInput("tell me about yourself");
    const intent = detectIntent(normalization);
    const retrieval = await retrieveKnowledge(normalization, intent);
    const draft = await generateDraftAnswer(normalization, intent, retrieval);

    const review = await reviewDraftAnswer({
      normalization,
      intent,
      retrieval,
      draft
    });

    expect(intent.intent).toBe("about_me");
    expect(retrieval.evidence.length).toBeGreaterThan(0);
    expect(review.approved).toBe(true);
    expect(review.shouldFallback).toBe(false);
  });

  it("answers workplace query from grounded profile sources", async () => {
    const normalization = normalizeInput("where do you work?");
    const intent = detectIntent(normalization);
    const retrieval = await retrieveKnowledge(normalization, intent);
    const draft = await generateDraftAnswer(normalization, intent, retrieval);

    const review = await reviewDraftAnswer({
      normalization,
      intent,
      retrieval,
      draft
    });

    expect(intent.intent).toBe("experience");
    expect(retrieval.evidence.length).toBeGreaterThan(0);
    expect(review.approved).toBe(true);
    expect(review.shouldFallback).toBe(false);
  });
});
