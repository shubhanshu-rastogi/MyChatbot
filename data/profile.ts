import { ProfileInfo } from "@/types/site";

const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "shubhanshu.rastogi@gmail.com";
const linkedInUrl =
  process.env.NEXT_PUBLIC_LINKEDIN_URL ??
  "https://www.linkedin.com/in/shubhanshu-rastogi";
const githubUrl =
  process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/shubhanshu-rastogi";
const resumeUrl = process.env.NEXT_PUBLIC_RESUME_URL ?? "#";

export const profileInfo: ProfileInfo = {
  name: "Shubhanshu Rastogi",
  title: "AI-Driven Quality Engineering Leader",
  valueProposition:
    "I build robust quality systems across automation, AI evaluation, and release engineering for high-stakes products.",
  heroTagline:
    "Explore my work through a portfolio-first AI assistant designed for technical conversations, opportunities, and collaboration.",
  summary:
    "My focus is practical, measurable quality engineering: scalable automation, AI/LLM testing, RAG evaluation, and delivery confidence across complex systems.",
  headshotPlaceholder: "Shubhanshu Rastogi",
  ctas: [
    {
      label: "Start with My Assistant",
      href: "#ai-assistant"
    },
    {
      label: "Explore Projects",
      href: "#projects"
    }
  ],
  contact: {
    email: contactEmail,
    linkedIn: linkedInUrl,
    github: githubUrl,
    resumeUrl
  }
};
