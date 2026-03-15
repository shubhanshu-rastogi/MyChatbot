import { readFile } from "fs/promises";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { orchestrateChatResponse } from "@/services/chat/chatOrchestratorService";
import { recordUnknownQuestion } from "@/services/capture/unknownQuestionService";
import { recordUserDetails } from "@/services/capture/contactCaptureService";
import { setupCaptureSandbox, teardownCaptureSandbox } from "@/tests/helpers/captureSandbox";

type UnknownRecord = {
  id: string;
  question: string;
  relatedEmail?: string;
  status: string;
};

let captureDir = "";

describe("fallback and capture flows", () => {
  beforeEach(async () => {
    captureDir = await setupCaptureSandbox();
  });

  afterEach(async () => {
    await teardownCaptureSandbox(captureDir);
  });

  it("triggers unknown-question fallback for unsupported question", async () => {
    const response = await orchestrateChatResponse(
      "What is the weather forecast for Tokyo this weekend?",
      "session-fallback"
    );

    expect(response.requiresEmailCapture).toBe(true);
    expect(response.contactCaptureReason).toBe("unknown_question_follow_up");
    expect(response.unknownQuestionId).toBeDefined();

    const unknownRaw = await readFile(
      path.join(captureDir, "unknown-questions.json"),
      "utf-8"
    );
    const unknown = JSON.parse(unknownRaw) as UnknownRecord[];

    expect(unknown.length).toBe(1);
    expect(unknown[0].question).toContain("weather");
  });

  it("associates recruiter email with unresolved question", async () => {
    const unknown = await recordUnknownQuestion(
      "Can he support SAP performance testing?",
      "session-contact"
    );

    await recordUserDetails({
      email: "recruiter@example.com",
      name: "Hiring Manager",
      notes: "Interested in a QA leadership role.",
      relatedUnknownQuestionId: unknown.id
    });

    const unknownRaw = await readFile(
      path.join(captureDir, "unknown-questions.json"),
      "utf-8"
    );
    const unknownRecords = JSON.parse(unknownRaw) as UnknownRecord[];

    expect(unknownRecords[0].relatedEmail).toBe("recruiter@example.com");
    expect(unknownRecords[0].status).toBe("follow_up_requested");
  });
});
