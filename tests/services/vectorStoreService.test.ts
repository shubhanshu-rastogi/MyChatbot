import { describe, expect, it } from "vitest";
import { cosineSimilarity, embedQueryText, getEntryEmbeddingMap } from "@/services/knowledge/vectorStoreService";

describe("vectorStoreService", () => {
  it("computes cosine similarity deterministically", () => {
    const sameDirection = cosineSimilarity([1, 2, 3], [2, 4, 6]);
    const oppositeDirection = cosineSimilarity([1, 0], [-1, 0]);
    const orthogonal = cosineSimilarity([1, 0], [0, 1]);

    expect(sameDirection).toBeCloseTo(1, 6);
    expect(oppositeDirection).toBeCloseTo(-1, 6);
    expect(orthogonal).toBeCloseTo(0, 6);
  });

  it("returns null embedding map when embeddings are unavailable", async () => {
    const result = await getEntryEmbeddingMap([]);
    expect(result).toBeNull();
  });

  it("returns null query embedding when embeddings are unavailable", async () => {
    const originalApiKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = "";

    try {
      const result = await embedQueryText("where do you work");
      expect(result).toBeNull();
    } finally {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  });
});
