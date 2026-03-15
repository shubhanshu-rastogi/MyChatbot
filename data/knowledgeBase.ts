export type KnowledgeEntry = {
  id: string;
  title: string;
  category: string;
  answer: string;
  keywords: string[];
  sources: string[];
};

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "kb-profile-overview",
    title: "Profile Overview",
    category: "profile_overview",
    answer:
      "Shubhanshu Rastogi is a Senior QA and AI Quality Engineering leader focused on building reliable, business-aligned quality systems. He combines deep automation experience with modern AI evaluation practices to help teams ship confidently.",
    keywords: ["about", "who", "overview", "profile", "shubhanshu"],
    sources: ["profile.summary", "professionalSummary.qa-leadership"]
  },
  {
    id: "kb-qa-leadership",
    title: "QA Leadership",
    category: "leadership",
    answer:
      "He leads quality strategy across cross-functional teams, defining operating models, governance, and delivery metrics. His leadership style emphasizes stakeholder clarity, measurable outcomes, and risk-aware release planning.",
    keywords: ["leadership", "qa leadership", "management", "team", "strategy"],
    sources: ["professionalSummary.qa-leadership", "careerHighlights.leadership"]
  },
  {
    id: "kb-test-automation",
    title: "Automation Capability",
    category: "tools",
    answer:
      "His automation expertise spans UI, API, and integration testing with frameworks such as Playwright and Selenium, supported by CI/CD quality gates to improve release speed and reliability.",
    keywords: ["automation", "playwright", "selenium", "testing", "framework"],
    sources: ["professionalSummary.test-automation", "careerHighlights.tools"]
  },
  {
    id: "kb-ai-llm-testing",
    title: "AI and LLM Testing",
    category: "rag_evaluation",
    answer:
      "Shubhanshu has focused on AI quality through prompt validation, response safety checks, and measurable evaluation criteria that help teams de-risk AI assistant behavior before production.",
    keywords: ["ai", "llm", "prompt", "model", "evaluation"],
    sources: ["professionalSummary.ai-llm-testing"]
  },
  {
    id: "kb-rag-evaluation",
    title: "RAG Evaluation",
    category: "rag_evaluation",
    answer:
      "Yes. He has worked on RAG evaluation by benchmarking retrieval precision, grounding confidence, and unsupported-answer handling to reduce hallucination risk and improve trust.",
    keywords: ["rag", "retrieval", "grounding", "hallucination", "faithfulness"],
    sources: ["professionalSummary.rag-evaluation", "featuredProjects.rag-eval-suite"]
  },
  {
    id: "kb-projects",
    title: "Featured Projects",
    category: "projects",
    answer:
      "Key projects include an AI QA co-pilot for release readiness, a RAG evaluation suite, an enterprise automation platform, an API resilience program, and CI/CD quality gates modernization.",
    keywords: ["project", "projects", "portfolio", "work", "case studies"],
    sources: ["featuredProjects"]
  },
  {
    id: "kb-tools",
    title: "Tools and Technologies",
    category: "tools",
    answer:
      "His toolkit includes Playwright, Selenium, API testing stacks, CI/CD pipelines, cloud workflows, and AI evaluation practices for prompt, retrieval, and response quality.",
    keywords: ["tools", "technologies", "stack", "playwright", "ci/cd", "cloud"],
    sources: ["careerHighlights.tools", "professionalSummary.cloud-cicd"]
  },
  {
    id: "kb-contact",
    title: "Contact",
    category: "contact",
    answer:
      "You can connect through the contact section for email, LinkedIn, GitHub, and resume details. If you share your email here, Shubhanshu can follow up directly.",
    keywords: ["contact", "reach", "email", "linkedin", "hire", "connect"],
    sources: ["profile.contact"]
  }
];
