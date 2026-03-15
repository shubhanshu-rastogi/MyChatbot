export type UnknownQuestionSubmission = {
  id: string;
  question: string;
  createdAt: string;
  sessionId?: string;
  relatedEmail?: string;
  status: "new" | "follow_up_requested";
};

export type ContactSubmission = {
  id: string;
  email: string;
  name?: string;
  notes?: string;
  createdAt: string;
  relatedUnknownQuestionId?: string;
};

export type NotificationPayload = {
  type: "unknown_question" | "recruiter_interest";
  title: string;
  message: string;
  metadata: Record<string, string | undefined>;
};
