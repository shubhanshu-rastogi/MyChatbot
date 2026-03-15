export type CTA = {
  label: string;
  href: string;
  external?: boolean;
};

export type ProfileContact = {
  email: string;
  linkedIn: string;
  github: string;
  resumeUrl: string;
};

export type ProfileInfo = {
  name: string;
  title: string;
  valueProposition: string;
  heroTagline: string;
  summary: string;
  headshotPlaceholder: string;
  ctas: CTA[];
  contact: ProfileContact;
};

export type ProfessionalSummaryBlock = {
  id: string;
  title: string;
  description: string;
  points: string[];
};

export type FeaturedProject = {
  id: string;
  repository: string;
  title: string;
  summary: string;
  category: string;
  technologies: string[];
  whyItMatters: string;
  githubUrl: string;
  askPrompt: string;
  tags: string[];
};

export type CareerMetric = {
  label: string;
  value: string;
  detail: string;
};

export type CareerHighlight = {
  section: string;
  items: string[];
};

export type SuggestedPrompt = {
  id: string;
  prompt: string;
};

export type CredibilitySignal = {
  id: string;
  value: string;
  label: string;
  detail: string;
};
