import { runtimeConfig } from "@/lib/runtimeConfig";

export type ChatRequestBody = {
  question: string;
  sessionId?: string;
};

export type ContactCaptureBody = {
  email: string;
  name?: string;
  notes?: string;
  relatedUnknownQuestionId?: string;
};

export type UnknownCaptureBody = {
  question: string;
  sessionId?: string;
};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" ? value.trim() : undefined;

export const parseJsonBody = async (request: Request): Promise<Record<string, unknown> | null> => {
  try {
    const body = (await request.json()) as unknown;
    if (body && typeof body === "object") {
      return body as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
};

export const validateChatBody = (raw: Record<string, unknown> | null): {
  ok: boolean;
  error?: string;
  value?: ChatRequestBody;
} => {
  if (!raw) return { ok: false, error: "Invalid JSON payload." };

  const question = asString(raw.question);
  const sessionId = asString(raw.sessionId);

  if (!question) {
    return { ok: false, error: "Question is required." };
  }

  if (question.length > runtimeConfig.chat.maxQuestionLength) {
    return {
      ok: false,
      error: `Question is too long. Maximum allowed length is ${runtimeConfig.chat.maxQuestionLength} characters.`
    };
  }

  if (sessionId && sessionId.length > 100) {
    return { ok: false, error: "Session ID is too long." };
  }

  return {
    ok: true,
    value: {
      question,
      sessionId
    }
  };
};

export const validateContactCaptureBody = (raw: Record<string, unknown> | null): {
  ok: boolean;
  error?: string;
  value?: ContactCaptureBody;
} => {
  if (!raw) return { ok: false, error: "Invalid JSON payload." };

  const email = asString(raw.email);
  const name = asString(raw.name);
  const notes = asString(raw.notes);
  const relatedUnknownQuestionId = asString(raw.relatedUnknownQuestionId);

  if (!email) {
    return { ok: false, error: "email is required" };
  }

  if (email.length > 200) {
    return { ok: false, error: "email is too long" };
  }

  if (name && name.length > 120) {
    return { ok: false, error: "name is too long" };
  }

  if (notes && notes.length > 1000) {
    return { ok: false, error: "notes is too long" };
  }

  return {
    ok: true,
    value: {
      email,
      name,
      notes,
      relatedUnknownQuestionId
    }
  };
};

export const validateUnknownCaptureBody = (raw: Record<string, unknown> | null): {
  ok: boolean;
  error?: string;
  value?: UnknownCaptureBody;
} => {
  if (!raw) return { ok: false, error: "Invalid JSON payload." };

  const question = asString(raw.question);
  const sessionId = asString(raw.sessionId);

  if (!question) {
    return { ok: false, error: "question is required" };
  }

  if (question.length > runtimeConfig.chat.maxQuestionLength) {
    return {
      ok: false,
      error: `question is too long; max ${runtimeConfig.chat.maxQuestionLength} characters`
    };
  }

  if (sessionId && sessionId.length > 100) {
    return { ok: false, error: "sessionId is too long" };
  }

  return {
    ok: true,
    value: {
      question,
      sessionId
    }
  };
};
