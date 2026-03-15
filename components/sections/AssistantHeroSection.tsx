"use client";

import { motion } from "framer-motion";
import { Bot, MessageSquareText, Network, Sparkles } from "lucide-react";
import { ChatShell } from "@/components/chat/ChatShell";
import { profileInfo } from "@/data/profile";
import { emitAssistantPrompt } from "@/lib/assistantPrompt";

const starterCards = [
  {
    icon: Bot,
    title: "Explore My Work",
    prompt: "What are his most impactful recent projects?"
  },
  {
    icon: Network,
    title: "AI & RAG Focus",
    prompt: "Has he worked on AI testing and RAG evaluation?"
  },
  {
    icon: MessageSquareText,
    title: "Automation Depth",
    prompt: "What automation frameworks has he built?"
  }
];

const expertiseCues = [
  "Quality Engineering",
  "AI / LLM Testing",
  "RAG Evaluation",
  "Test Automation",
  "API & Microservices",
  "CI/CD Quality"
];

export function AssistantHeroSection() {
  return (
    <section id="ai-assistant" className="mx-auto w-full max-w-7xl px-6 pb-16 pt-14 lg:px-8 lg:pt-20">
      <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr] xl:items-start">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-300/30 bg-accent-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-200"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Portfolio Experience
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.04 }}
            className="text-4xl font-semibold leading-tight text-white md:text-5xl"
          >
            {profileInfo.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-4 text-lg text-slate-200 md:text-2xl"
          >
            {profileInfo.title}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-5 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base"
          >
            This is my AI-powered portfolio assistant. Ask about my projects, expertise,
            technical approach, or collaboration opportunities.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400"
          >
            {profileInfo.valueProposition}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {expertiseCues.map((cue) => (
              <span
                key={cue}
                className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
              >
                {cue}
              </span>
            ))}
          </motion.div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {starterCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.title}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.22 + index * 0.06 }}
                  onClick={() => emitAssistantPrompt(card.prompt)}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-accent-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
                >
                  <Icon className="h-4 w-4 text-accent-300" />
                  <p className="mt-3 text-sm font-semibold text-white">{card.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{card.prompt}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14 }}
          className="relative"
        >
          <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle_at_20%_10%,rgba(79,124,255,0.25),transparent_60%)] blur-2xl" />
          <div className="relative">
            <ChatShell />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
