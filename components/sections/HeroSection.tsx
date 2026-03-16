"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { profileInfo } from "@/data/profile";

export function HeroSection() {
  const [headshotLoadFailed, setHeadshotLoadFailed] = useState(false);

  return (
    <section id="home" className="relative mx-auto w-full max-w-7xl px-6 pb-12 pt-16 lg:px-8 lg:pt-20">
      <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-accent-300"
          >
            Personal AI Profile
          </motion.p>

          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.05 }}
            className="text-4xl font-semibold leading-tight text-white md:text-6xl"
          >
            {profileInfo.name}
          </motion.h1>

          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="mt-4 max-w-2xl text-lg text-slate-200 md:text-2xl"
          >
            {profileInfo.title}
          </motion.p>

          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16 }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg"
          >
            {profileInfo.valueProposition}
          </motion.p>

          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22 }}
            className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base"
          >
            {profileInfo.heroTagline}
          </motion.p>

          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="#ai-assistant"
              className="rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-premium transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
            >
              Talk to My AI Assistant
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto w-full max-w-[24rem] sm:max-w-[26rem] lg:max-w-[28rem]"
        >
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4 shadow-premium backdrop-blur">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/10">
              {headshotLoadFailed ? (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-base-800 to-base-900 px-6 text-center text-sm font-medium uppercase tracking-[0.12em] text-slate-300">
                  {profileInfo.headshotPlaceholder}
                </div>
              ) : (
                <img
                  src="/profile-headshot.png"
                  alt={`${profileInfo.name} profile portrait`}
                  className="h-full w-full object-cover object-center"
                  onError={() => setHeadshotLoadFailed(true)}
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base-950/40 via-transparent to-transparent" />
            </div>
            <p className="mt-4 text-center text-sm text-slate-300">Shubhanshu Rastogi</p>
          </div>
        </motion.div>
      </div>

      <div className="mt-10 flex items-center gap-3 text-slate-400">
        <ArrowDown className="scroll-indicator h-4 w-4" aria-hidden="true" />
        <span className="text-xs uppercase tracking-[0.18em]">Scroll to explore</span>
      </div>
    </section>
  );
}
