"use client";

import { motion } from "framer-motion";
import { professionalSummaryBlocks } from "@/data/professionalSummary";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ProfessionalSummarySection() {
  return (
    <section id="expertise" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Expertise"
        title="Depth Across Quality Engineering and AI Assurance"
        description="A practical mix of leadership, architecture, and hands-on execution across automation, AI testing, and release reliability."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {professionalSummaryBlocks.map((block, index) => (
          <motion.article
            key={block.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: index * 0.05 }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
          >
            <h3 className="text-xl font-semibold text-white">{block.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{block.description}</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-400">
              {block.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-[8px] inline-block h-1.5 w-1.5 rounded-full bg-accent-300" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
