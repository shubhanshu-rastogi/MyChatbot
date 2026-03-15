import { readFile } from "fs/promises";
import path from "path";
import { KnowledgeEntry, ProfileIntent } from "@/types/knowledge";
import { getSourcePriorityWeight } from "@/services/knowledge/sourcePriority";

const KNOWLEDGE_ROOT = path.join(process.cwd(), "knowledge");

type MarkdownSourceConfig = {
  sourcePath: string;
  sourceType: KnowledgeEntry["sourceType"];
  sourceName: string;
  defaultTopic: ProfileIntent;
  defaultTags: string[];
};

type ProfileMetadataInput = {
  name: string;
  headline: string;
  location: string;
  yearsOfExperience: string;
  careerSummary: string;
  leadershipAreas: string[];
  industries: string[];
  keyTools: string[];
  aiTestingStrengths: string[];
  projectHighlights: string[];
  workingStyle: string;
  contact: {
    email: string;
    linkedIn: string;
    github: string;
    resumeUrl: string;
  };
  contactPreferences: string[];
  lastUpdated: string;
};

type KnownQuestionInput = {
  id: string;
  question: string;
  intent: ProfileIntent;
  answer: string;
  tags: string[];
  relatedLinks: string[];
};

type LegacyProjectMetadataInput = {
  id: string;
  title: string;
  summary: string;
  businessValue: string;
  tags: string[];
  tools: string[];
  links: string[];
};

type ModernProjectMetadataInput = {
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

type ProjectMetadataInput = LegacyProjectMetadataInput | ModernProjectMetadataInput;

type MarkdownSection = {
  title: string;
  content: string;
};

const resolveKnowledgePath = (...parts: string[]) => path.join(KNOWLEDGE_ROOT, ...parts);

const safeReadText = async (filePath: string): Promise<string> => {
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return "";
  }
};

const safeReadJson = async <T>(filePath: string): Promise<T | null> => {
  const content = await safeReadText(filePath);
  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
};

const toId = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const parseMarkdownSections = (markdown: string): MarkdownSection[] => {
  const lines = markdown.split(/\r?\n/);
  const sections: MarkdownSection[] = [];
  let currentTitle = "Overview";
  let currentBody: string[] = [];

  const flush = () => {
    const content = currentBody.join("\n").trim();
    if (content) {
      sections.push({
        title: currentTitle,
        content
      });
    }
  };

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      flush();
      currentTitle = headingMatch[1].trim();
      currentBody = [];
      continue;
    }

    currentBody.push(line);
  }

  flush();
  return sections;
};

const inferTopic = (seed: string, fallback: ProfileIntent): ProfileIntent => {
  const text = seed.toLowerCase();

  if (text.includes("about") || text.includes("profile")) {
    return "about_me";
  }

  if (text.includes("career") || text.includes("summary")) {
    return "career_summary";
  }

  if (text.includes("experience")) {
    return "experience";
  }

  if (text.includes("leadership") || text.includes("stakeholder")) {
    return "leadership";
  }

  if (text.includes("ai") || text.includes("llm")) {
    return "ai_testing";
  }

  if (text.includes("rag") || text.includes("retrieval")) {
    return "rag_evaluation";
  }

  if (text.includes("automation") || text.includes("testing")) {
    return "automation";
  }

  if (text.includes("tool") || text.includes("technology")) {
    return "tools_and_technologies";
  }

  if (text.includes("project")) {
    return "projects";
  }

  if (text.includes("contact") || text.includes("connect")) {
    return "contact";
  }

  return fallback;
};

const createEntry = (input: Omit<KnowledgeEntry, "priority"> & { priority?: number }): KnowledgeEntry => ({
  ...input,
  priority: input.priority ?? getSourcePriorityWeight(input.sourceType)
});

const ingestMarkdownSource = async (
  config: MarkdownSourceConfig
): Promise<KnowledgeEntry[]> => {
  const content = await safeReadText(resolveKnowledgePath(config.sourcePath));
  if (!content) {
    return [];
  }

  const sections = parseMarkdownSections(content);

  return sections.map((section, index) => {
    const topic = inferTopic(`${section.title} ${section.content}`, config.defaultTopic);
    return createEntry({
      id: `${config.sourceName}-${toId(section.title)}-${index + 1}`,
      sourceType: config.sourceType,
      sourceName: config.sourceName,
      topic,
      title: section.title,
      content: section.content,
      tags: [...config.defaultTags, topic],
      confidenceHint: 0.7,
      recruiterImportance: 0.6,
      relatedLinks: [],
      lastUpdated: new Date().toISOString()
    });
  });
};

const ingestProfileMetadata = async (): Promise<KnowledgeEntry[]> => {
  const metadata = await safeReadJson<ProfileMetadataInput>(
    resolveKnowledgePath("metadata", "profile.json")
  );

  if (!metadata) {
    return [];
  }

  const links = [metadata.contact.linkedIn, metadata.contact.github, metadata.contact.resumeUrl].filter(Boolean);

  return [
    createEntry({
      id: "metadata-about",
      sourceType: "profile_metadata",
      sourceName: "profile-metadata",
      topic: "about_me",
      title: "About Shubhanshu",
      content: `${metadata.name} is a ${metadata.headline}. ${metadata.careerSummary}`,
      tags: ["about_me", "career_summary", "profile"],
      confidenceHint: 0.95,
      recruiterImportance: 1,
      relatedLinks: links,
      lastUpdated: metadata.lastUpdated
    }),
    createEntry({
      id: "metadata-experience",
      sourceType: "profile_metadata",
      sourceName: "profile-metadata",
      topic: "experience",
      title: "Experience Snapshot",
      content: `${metadata.yearsOfExperience} of experience across ${metadata.industries.join(", "
      )}.`,
      tags: ["experience", "career_summary", "industries"],
      confidenceHint: 0.92,
      recruiterImportance: 0.95,
      relatedLinks: links,
      lastUpdated: metadata.lastUpdated
    }),
    createEntry({
      id: "metadata-leadership",
      sourceType: "profile_metadata",
      sourceName: "profile-metadata",
      topic: "leadership",
      title: "Leadership Areas",
      content: metadata.leadershipAreas.join(". "),
      tags: ["leadership", "qa_leadership", "stakeholder_management"],
      confidenceHint: 0.92,
      recruiterImportance: 0.95,
      relatedLinks: links,
      lastUpdated: metadata.lastUpdated
    }),
    createEntry({
      id: "metadata-ai-testing",
      sourceType: "profile_metadata",
      sourceName: "profile-metadata",
      topic: "ai_testing",
      title: "AI Testing Strengths",
      content: metadata.aiTestingStrengths.join(". "),
      tags: ["ai_testing", "rag_evaluation", "llm_testing"],
      confidenceHint: 0.9,
      recruiterImportance: 0.95,
      relatedLinks: links,
      lastUpdated: metadata.lastUpdated
    }),
    createEntry({
      id: "metadata-tools",
      sourceType: "profile_metadata",
      sourceName: "profile-metadata",
      topic: "tools_and_technologies",
      title: "Tools and Technologies",
      content: metadata.keyTools.join(", "),
      tags: ["tools_and_technologies", "automation", "ci_cd"],
      confidenceHint: 0.9,
      recruiterImportance: 0.9,
      relatedLinks: links,
      lastUpdated: metadata.lastUpdated
    }),
    createEntry({
      id: "metadata-project-highlights",
      sourceType: "profile_metadata",
      sourceName: "profile-metadata",
      topic: "projects",
      title: "Project Highlights",
      content: metadata.projectHighlights.join(". "),
      tags: ["projects", "highlights"],
      confidenceHint: 0.88,
      recruiterImportance: 0.9,
      relatedLinks: links,
      lastUpdated: metadata.lastUpdated
    }),
    createEntry({
      id: "metadata-contact",
      sourceType: "profile_metadata",
      sourceName: "profile-metadata",
      topic: "contact",
      title: "Contact Preferences",
      content: `Email: ${metadata.contact.email}. LinkedIn: ${metadata.contact.linkedIn}. ${metadata.contactPreferences.join(
        ". "
      )}`,
      tags: ["contact", "recruiter_interest", "opportunities"],
      confidenceHint: 0.94,
      recruiterImportance: 1,
      relatedLinks: links,
      lastUpdated: metadata.lastUpdated
    })
  ];
};

const ingestKnownFaq = async (): Promise<KnowledgeEntry[]> => {
  const faqItems = await safeReadJson<KnownQuestionInput[]>(
    resolveKnowledgePath("faq", "known-questions.json")
  );

  if (!faqItems?.length) {
    return [];
  }

  return faqItems.map((item) =>
    createEntry({
      id: item.id,
      sourceType: "known_faq",
      sourceName: "known-questions",
      topic: item.intent,
      title: item.question,
      content: item.answer,
      tags: item.tags,
      confidenceHint: 0.9,
      recruiterImportance: 0.9,
      relatedLinks: item.relatedLinks,
      lastUpdated: new Date().toISOString()
    })
  );
};

const ingestProjects = async (): Promise<KnowledgeEntry[]> => {
  const projects = await safeReadJson<ProjectMetadataInput[]>(
    resolveKnowledgePath("projects", "projects.json")
  );

  if (!projects?.length) {
    return [];
  }

  return projects.map((project) =>
    createEntry({
      id: project.id,
      sourceType: "project_metadata",
      sourceName: "projects-json",
      topic: "projects",
      title: project.title,
      content:
        "businessValue" in project
          ? `${project.summary} ${project.businessValue} Tools: ${project.tools.join(", ")}`
          : `${project.summary} ${project.whyItMatters} Tools: ${project.technologies.join(", ")}`,
      tags: [...project.tags, "projects"],
      confidenceHint: 0.84,
      recruiterImportance: 0.85,
      relatedLinks: "links" in project ? project.links : [project.githubUrl],
      lastUpdated: new Date().toISOString()
    })
  );
};

export const ingestKnowledgeSources = async (): Promise<KnowledgeEntry[]> => {
  const [metadataEntries, faqEntries, projectEntries, markdownSets] = await Promise.all([
    ingestProfileMetadata(),
    ingestKnownFaq(),
    ingestProjects(),
    Promise.all([
      ingestMarkdownSource({
        sourcePath: "profile/summary.md",
        sourceType: "summary",
        sourceName: "profile-summary-md",
        defaultTopic: "career_summary",
        defaultTags: ["career_summary", "about_me"]
      }),
      ingestMarkdownSource({
        sourcePath: "profile/linkedin.md",
        sourceType: "linkedin",
        sourceName: "linkedin-md",
        defaultTopic: "experience",
        defaultTags: ["experience", "leadership"]
      }),
      ingestMarkdownSource({
        sourcePath: "profile/resume.md",
        sourceType: "resume",
        sourceName: "resume-md",
        defaultTopic: "experience",
        defaultTags: ["experience", "automation", "quality_strategy"]
      })
    ])
  ]);

  const markdownEntries = markdownSets.flat();

  return [
    ...metadataEntries,
    ...faqEntries,
    ...projectEntries,
    ...markdownEntries
  ];
};
