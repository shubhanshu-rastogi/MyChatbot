import { appendJsonEntry, readJsonArray, writeJsonArray } from "@/lib/fileStore";
import { createId } from "@/lib/id";
import { UnknownQuestionSubmission } from "@/types/capture";

const UNKNOWN_FILE = "unknown-questions.json";

export const recordUnknownQuestion = async (
  question: string,
  sessionId?: string
): Promise<UnknownQuestionSubmission> => {
  const payload: UnknownQuestionSubmission = {
    id: createId(),
    question,
    createdAt: new Date().toISOString(),
    sessionId,
    status: "new"
  };

  await appendJsonEntry<UnknownQuestionSubmission>(UNKNOWN_FILE, payload);

  console.info("[recordUnknownQuestion]", payload);

  return payload;
};

export const attachEmailToUnknownQuestion = async (
  unknownQuestionId: string,
  email: string
): Promise<void> => {
  const list = await readJsonArray<UnknownQuestionSubmission>(UNKNOWN_FILE);
  const next = list.map((item) => {
    if (item.id !== unknownQuestionId) {
      return item;
    }

    return {
      ...item,
      relatedEmail: email,
      status: "follow_up_requested" as const
    };
  });

  await writeJsonArray<UnknownQuestionSubmission>(UNKNOWN_FILE, next);

  console.info("[attachEmailToUnknownQuestion]", { unknownQuestionId, email });
};
