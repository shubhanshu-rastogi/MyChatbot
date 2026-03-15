import { describe, expect, it } from "vitest";
import {
  validateChatBody,
  validateContactCaptureBody,
  validateUnknownCaptureBody
} from "@/lib/apiValidation";

describe("apiValidation", () => {
  it("accepts valid chat payload", () => {
    const result = validateChatBody({ question: "Tell me about Shubhanshu", sessionId: "s1" });

    expect(result.ok).toBe(true);
    expect(result.value?.question).toBe("Tell me about Shubhanshu");
  });

  it("rejects empty chat question", () => {
    const result = validateChatBody({ question: "   " });
    expect(result.ok).toBe(false);
  });

  it("rejects missing contact email", () => {
    const result = validateContactCaptureBody({ name: "test" });
    expect(result.ok).toBe(false);
  });

  it("accepts valid unknown-question payload", () => {
    const result = validateUnknownCaptureBody({ question: "Unsupported query?" });
    expect(result.ok).toBe(true);
  });
});
