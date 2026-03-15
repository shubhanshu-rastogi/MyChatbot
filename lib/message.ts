import { ChatMessage, MessageRole } from "@/types/chat";

export const createClientMessage = (
  role: MessageRole,
  content: string
): ChatMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  content,
  createdAt: new Date().toISOString()
});
