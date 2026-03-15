import { FeaturedProject } from "@/types/site";
import projectsJson from "@/knowledge/projects/projects.json";

type ModernProjectRecord = {
  id: string;
  repository: string;
  title: string;
  summary: string;
  category: string;
  technologies: string[];
  whyItMatters: string;
  askPrompt: string;
  tags: string[];
  githubUrl: string;
};

type LegacyProjectRecord = {
  id: string;
  title: string;
  summary: string;
  businessValue: string;
  tags: string[];
  tools: string[];
  links: string[];
};

type RawProjectRecord = ModernProjectRecord | LegacyProjectRecord;

const projectRecords = projectsJson as RawProjectRecord[];

const normalizeCategory = (tags: string[]): string => {
  if (!tags.length) return "Quality Engineering";

  const firstTag = tags[0].replace(/_/g, " ");
  return firstTag.charAt(0).toUpperCase() + firstTag.slice(1);
};

const getRepositoryFromUrl = (url: string, fallback: string): string => {
  const value = url.trim();
  if (!value) return fallback;

  const segments = value.split("/").filter(Boolean);
  return segments.length ? segments[segments.length - 1] : fallback;
};

export const featuredProjects: FeaturedProject[] = projectRecords.map((item) => ({
  id: item.id,
  repository:
    "repository" in item
      ? item.repository
      : getRepositoryFromUrl(item.links[0] ?? "", item.id),
  title: item.title,
  summary: item.summary,
  category: "category" in item ? item.category : normalizeCategory(item.tags),
  technologies: "technologies" in item ? item.technologies : item.tools,
  whyItMatters: "whyItMatters" in item ? item.whyItMatters : item.businessValue,
  githubUrl:
    "githubUrl" in item ? item.githubUrl : (item.links[0] ?? "https://github.com/shubhanshu-rastogi"),
  askPrompt: "askPrompt" in item ? item.askPrompt : `Tell me about ${item.title}.`,
  tags: item.tags
}));
