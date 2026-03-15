import { ChatShell } from "@/components/chat/ChatShell";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ChatbotSection() {
  return (
    <section id="ai-assistant" className="mx-auto w-full max-w-7xl px-6 pb-20 pt-4 lg:px-8 lg:pt-6">
      <SectionHeading
        eyebrow="AI Assistant"
        title="Ask Questions About Shubhanshu"
        description="This assistant uses grounded profile knowledge with retrieval and generator-reviewer orchestration. Unsupported questions are captured for follow-up."
      />
      <ChatShell />
    </section>
  );
}
