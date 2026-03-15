import Link from "next/link";
import { profileInfo } from "@/data/profile";
import { SectionHeading } from "@/components/ui/SectionHeading";

const links = [
  { label: "Email", href: `mailto:${profileInfo.contact.email}` },
  { label: "LinkedIn", href: profileInfo.contact.linkedIn },
  { label: "GitHub", href: profileInfo.contact.github },
  { label: "Resume / CV", href: profileInfo.contact.resumeUrl }
].filter((item) => item.href && item.href !== "#");

export function ContactSection() {
  return (
    <section id="connect" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 md:p-10">
        <SectionHeading
          eyebrow="Connect"
          title="Open to Conversations and Collaboration"
          description="Reach out for opportunities, technical collaboration, AI/QA discussions, or help with complex quality engineering challenges."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {links.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              className="rounded-2xl border border-white/10 bg-base-900/60 px-5 py-4 text-sm font-medium text-slate-200 transition hover:border-white/25 hover:bg-base-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <p className="mt-6 text-sm text-slate-400">
          You can also start in the assistant and share your email for direct follow-up.
        </p>
      </div>
    </section>
  );
}
