"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { SendHorizonal } from "lucide-react";
import { ChatApiResponse, ChatMessage } from "@/types/chat";
import { createClientMessage } from "@/lib/message";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingDots } from "@/components/chat/TypingDots";

const welcomeMessage =
  "Hi, I’m Shubhanshu’s profile assistant. I answer from approved profile knowledge about his experience, QA leadership, AI testing, projects, and recruiter contact details.";

const debugUiEnabled = process.env.NEXT_PUBLIC_CHATBOT_DEBUG === "true";
const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim().replace(/\/$/, "");
const toApiUrl = (path: string): string => (apiBaseUrl ? `${apiBaseUrl}${path}` : path);

export function ChatShell() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    createClientMessage("assistant", welcomeMessage)
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUnknownQuestionId, setPendingUnknownQuestionId] = useState<string>();
  const [contactCaptureReason, setContactCaptureReason] = useState<
    "unknown_question_follow_up" | "recruiter_interest" | undefined
  >();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [contactError, setContactError] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [debugPayload, setDebugPayload] = useState<ChatApiResponse["debug"]>();

  const chatViewportRef = useRef<HTMLDivElement | null>(null);
  const sessionId = useMemo(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }

    return `session-${Date.now()}`;
  }, []);

  useEffect(() => {
    const viewport = chatViewportRef.current;
    if (!viewport) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, isLoading, contactCaptureReason]);

  const pushAssistantMessage = (content: string) => {
    setMessages((prev) => [...prev, createClientMessage("assistant", content)]);
  };

  const submitQuestion = async (questionText: string) => {
    const question = questionText.trim();
    if (!question || isLoading) {
      return;
    }

    setContactError("");
    setInput("");
    setMessages((prev) => [...prev, createClientMessage("user", question)]);
    setIsLoading(true);

    try {
      const response = await fetch(toApiUrl("/api/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question, sessionId })
      });

      const payload = (await response.json()) as ChatApiResponse & {
        error?: string;
        retryAfterSeconds?: number;
      };

      if (!response.ok) {
        if (response.status === 429) {
          const waitSeconds = payload.retryAfterSeconds ?? 30;
          throw new Error(
            `Too many requests. Please wait around ${waitSeconds} seconds and try again.`
          );
        }

        throw new Error(payload.error ?? "Chat request failed.");
      }

      pushAssistantMessage(payload.message);
      setDebugPayload(payload.debug);

      if (payload.requiresEmailCapture) {
        setPendingUnknownQuestionId(payload.unknownQuestionId);
        setContactCaptureReason(payload.contactCaptureReason ?? "unknown_question_follow_up");
      } else {
        setPendingUnknownQuestionId(undefined);
        setContactCaptureReason(undefined);
      }
    } catch {
      pushAssistantMessage(
        "I’m having trouble right now. Please try again in a moment or use the contact section to connect directly."
      );
      setPendingUnknownQuestionId(undefined);
      setContactCaptureReason(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitQuestion(input);
  };

  const onContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contactCaptureReason || !email.trim()) {
      return;
    }

    setContactError("");
    setContactSubmitting(true);

    try {
      const response = await fetch(toApiUrl("/api/capture/contact"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          notes:
            contactCaptureReason === "recruiter_interest"
              ? "Recruiter interest captured from profile assistant conversation."
              : "Follow-up request from unresolved chatbot question.",
          relatedUnknownQuestionId: pendingUnknownQuestionId
        })
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save contact details.");
      }

      pushAssistantMessage(
        payload.message ??
          "Thanks for sharing your email. Shubhanshu has been notified and can follow up with you."
      );
      setEmail("");
      setName("");
      setPendingUnknownQuestionId(undefined);
      setContactCaptureReason(undefined);
    } catch (error) {
      setContactError(error instanceof Error ? error.message : "Unable to save contact details.");
    } finally {
      setContactSubmitting(false);
    }
  };

  const contactFormTitle =
    contactCaptureReason === "recruiter_interest"
      ? "If you’d like to discuss a role, share your email for direct follow-up."
      : "Share your email for a follow-up when Shubhanshu reviews this question.";

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-base-900/70 p-5 shadow-premium backdrop-blur-lg md:p-6">
      <div className="rounded-2xl border border-white/10 bg-base-950/70 p-4 md:p-5">
        <p className="mb-3 text-xs uppercase tracking-[0.15em] text-slate-400">
          Grounded in approved profile information
        </p>

        <div
          aria-live="polite"
          aria-label="Chat conversation"
          ref={chatViewportRef}
          className="max-h-[430px] space-y-3 overflow-y-auto pr-1"
        >
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-base-900/80 px-4 py-3 text-slate-200">
                <TypingDots />
                <p className="mt-2 text-xs text-slate-400">Reviewing profile information...</p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="mt-4">
          <label htmlFor="chat-input" className="sr-only">
            Ask a question about Shubhanshu
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-base-900/80 px-3 py-2">
            <input
              id="chat-input"
              name="chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about experience, QA leadership, AI testing, projects, tools, or contact..."
              className="h-10 w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-white transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
              aria-label="Send message"
            >
              <SendHorizonal className="h-4 w-4" />
            </button>
          </div>
        </form>

        {contactCaptureReason && (
          <form
            onSubmit={onContactSubmit}
            className="mt-4 rounded-2xl border border-accent-400/35 bg-accent-500/10 p-4"
          >
            <p className="text-sm text-slate-100">{contactFormTitle}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1 block text-xs text-slate-300">
                  Name (optional)
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-10 w-full rounded-xl border border-white/20 bg-base-900/80 px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-300"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-xs text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-10 w-full rounded-xl border border-white/20 bg-base-900/80 px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-300"
                  placeholder="you@company.com"
                />
              </div>
            </div>
            {contactError && <p className="mt-2 text-xs text-rose-300">{contactError}</p>}
            <button
              type="submit"
              disabled={contactSubmitting}
              className="mt-3 rounded-full bg-white px-4 py-2 text-sm font-semibold text-base-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
            >
              {contactSubmitting ? "Saving..." : "Submit Contact"}
            </button>
          </form>
        )}

        {debugUiEnabled && debugPayload && (
          <details className="mt-4 rounded-xl border border-white/10 bg-base-900/60 p-3 text-xs text-slate-300">
            <summary className="cursor-pointer text-slate-200">Debug trace</summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(debugPayload, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
