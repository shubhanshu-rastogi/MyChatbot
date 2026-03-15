"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, MessageCircleMore } from "lucide-react";
import { featuredProjects } from "@/data/featuredProjects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { emitAssistantPrompt } from "@/lib/assistantPrompt";

export function FeaturedProjectsSection() {
  return (
    <section id="projects" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Featured Builds"
        title="Recent Work Across AI, QA, and Automation"
        description="Selected repositories that reflect practical engineering depth, quality leadership, and AI-focused experimentation."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {featuredProjects.map((project, index) => (
          <motion.article
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: index * 0.04 }}
            className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-accent-200">
              {project.repository}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">{project.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{project.summary}</p>

            <div className="mt-4 rounded-xl border border-accent-400/30 bg-accent-500/10 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-accent-200">Why It Matters</p>
              <p className="mt-2 text-sm text-slate-200">{project.whyItMatters}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-slate-100">
                {project.category}
              </span>
              {project.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-500">Technologies</p>
            <p className="mt-2 text-sm text-slate-300">{project.technologies.join(" • ")}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-accent-300 transition group-hover:text-accent-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
              >
                View Repository
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <button
                type="button"
                onClick={() => emitAssistantPrompt(project.askPrompt)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs text-slate-200 transition hover:border-accent-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
              >
                <MessageCircleMore className="h-3.5 w-3.5" />
                Ask Assistant
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
