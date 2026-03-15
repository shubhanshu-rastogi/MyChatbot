"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const navItems = [
  { label: "Summary", href: "#summary" },
  { label: "Projects", href: "#projects" },
  { label: "Highlights", href: "#highlights" },
  { label: "AI Assistant", href: "#ai-assistant" },
  { label: "Contact", href: "#connect" }
];

export function SiteHeader() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-30 border-b border-white/10 bg-base-950/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="#home" className="text-sm font-semibold tracking-[0.18em] text-slate-200">
          SHUBHANSHU RASTOGI
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}
