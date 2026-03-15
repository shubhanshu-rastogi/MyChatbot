import { ProfessionalSummaryBlock } from "@/types/site";

export const professionalSummaryBlocks: ProfessionalSummaryBlock[] = [
  {
    id: "quality-strategy",
    title: "Quality Strategy & Leadership",
    description:
      "Designing quality operating models that align technical rigor with business risk and delivery outcomes.",
    points: [
      "Leads cross-functional quality initiatives across enterprise programs",
      "Builds governance frameworks for release confidence and defect prevention",
      "Partners with product and engineering leadership on measurable quality outcomes"
    ]
  },
  {
    id: "automation-platforms",
    title: "Automation Engineering",
    description:
      "Building scalable UI, API, integration, and performance automation for complex systems.",
    points: [
      "Playwright and Selenium frameworks with resilient architecture patterns",
      "API and microservices testing embedded into CI/CD pipelines",
      "Performance and non-functional validation for production readiness"
    ]
  },
  {
    id: "ai-quality",
    title: "AI / LLM Quality",
    description:
      "Evaluating assistant behavior, model outputs, and reliability in non-deterministic systems.",
    points: [
      "Functional and behavioral validation for LLM-assisted workflows",
      "Prompt and response quality assessment with structured checks",
      "Bias, failure mode, and consistency-focused quality evaluation"
    ]
  },
  {
    id: "rag-evaluation",
    title: "RAG Evaluation",
    description:
      "Improving trust in retrieval-augmented systems through measurable grounding and answer quality.",
    points: [
      "Retrieval relevance and context quality assessment",
      "Grounding, faithfulness, and unsupported-answer handling",
      "Quality gates that reduce hallucination risk in production assistants"
    ]
  },
  {
    id: "delivery-engineering",
    title: "Delivery & DevOps Quality",
    description:
      "Integrating quality deeply into delivery pipelines to support speed and reliability.",
    points: [
      "CI/CD-aligned test orchestration and quality gates",
      "Shift-left quality practices for faster feedback loops",
      "Release-readiness insights for engineering and stakeholder teams"
    ]
  },
  {
    id: "collaboration",
    title: "Collaboration & Advisory",
    description:
      "Supporting teams with practical guidance on QA, AI testing, and automation challenges.",
    points: [
      "Clear communication across engineering, product, and leadership audiences",
      "Mentorship and capability-building around modern quality engineering",
      "Approachable technical collaboration for roles, projects, and problem-solving"
    ]
  }
];
