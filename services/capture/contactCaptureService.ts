import { appendJsonEntry } from "@/lib/fileStore";
import { createId } from "@/lib/id";
import { isValidEmail } from "@/lib/validation";
import { ContactSubmission } from "@/types/capture";
import { attachEmailToUnknownQuestion } from "@/services/capture/unknownQuestionService";

const CONTACT_FILE = "contacts.json";

export type ContactCaptureInput = {
  email: string;
  name?: string;
  notes?: string;
  relatedUnknownQuestionId?: string;
};

export const recordUserDetails = async (
  input: ContactCaptureInput
): Promise<ContactSubmission> => {
  if (!isValidEmail(input.email)) {
    throw new Error("Please provide a valid email address.");
  }

  const payload: ContactSubmission = {
    id: createId(),
    email: input.email.trim().toLowerCase(),
    name: input.name?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    relatedUnknownQuestionId: input.relatedUnknownQuestionId,
    createdAt: new Date().toISOString()
  };

  await appendJsonEntry<ContactSubmission>(CONTACT_FILE, payload);

  if (input.relatedUnknownQuestionId) {
    await attachEmailToUnknownQuestion(input.relatedUnknownQuestionId, payload.email);
  }

  console.info("[recordUserDetails]", payload);

  return payload;
};
