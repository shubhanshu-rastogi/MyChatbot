"use client";

import { motion } from "framer-motion";
import { careerHighlights, careerMetrics } from "@/data/careerHighlights";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function CareerHighlightsSection() {
  return (
    <section id="highlights" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Selected Highlights"
        title="Technical Leadership with Real Delivery Impact"
        description="A concise view of my experience, focus areas, and collaboration style across modern quality engineering programs."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {careerMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{metric.detail}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {careerHighlights.map((group, index) => (
          <motion.article
            key={group.section}
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: index * 0.04 }}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
          >
            <h3 className="text-lg font-semibold text-white">{group.section}</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {group.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[8px] inline-block h-1.5 w-1.5 rounded-full bg-accent-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
