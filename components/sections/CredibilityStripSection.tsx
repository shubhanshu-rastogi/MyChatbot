"use client";

import { motion } from "framer-motion";
import { credibilitySignals } from "@/data/credibility";

export function CredibilityStripSection() {
  return (
    <section id="credibility" className="mx-auto w-full max-w-7xl px-6 pb-8 lg:px-8">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {credibilitySignals.map((signal, index) => (
          <motion.article
            key={signal.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p className="text-xl font-semibold text-white">{signal.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-accent-200">
              {signal.label}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{signal.detail}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
