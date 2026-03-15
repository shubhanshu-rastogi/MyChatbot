import { motion } from "framer-motion";
import { ChatMessage } from "@/types/chat";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[82%] ${
          isUser
            ? "rounded-br-sm bg-accent-500 text-white"
            : "rounded-bl-sm border border-white/10 bg-base-900/80 text-slate-100"
        }`}
      >
        <p className="whitespace-pre-line">{message.content}</p>
      </div>
    </motion.div>
  );
}
