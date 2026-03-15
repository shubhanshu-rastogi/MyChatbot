# Shubhanshu Rastogi - Personal AI Chatbot (Phase 2)

Premium recruiter-facing personal AI chatbot built with Next.js App Router, TypeScript, Tailwind CSS, and Framer Motion.

## What Phase 2 Adds

- Real grounded profile-answering layer over approved local knowledge files
- Structured ingestion for markdown and JSON profile sources
- Source-prioritized retrieval (metadata > FAQ > projects > resume > LinkedIn > summary)
- Mandatory agentic pipeline: normalize -> intent -> retrieve -> generate -> review -> format
- Optional OpenAI-backed generator and reviewer agents (multi-agent flow) when API key is configured
- API hardening: request validation, max-question-length guardrails, and per-IP rate limiting
- OpenAI resilience: timeout + retry with exponential backoff on transient failures
- Response headers for request tracing and safer browser defaults
- Strict fallback when confidence/grounding is insufficient
- Recruiter contact capture flow for unresolved questions and recruiter-interest intent
- Local debug mode for structured orchestration traces
- Automated tests for intent, retrieval, review, fallback, source-priority, and contact association

## Architecture Overview

### Frontend
- `app/page.tsx` composes premium sections
- `components/chat/ChatShell.tsx` runs the recruiter-focused chat UX
- Chat UI supports loading state, prompt chips, inline email capture, and optional debug trace panel

### API
- `POST /api/chat`: main orchestration route
- `POST /api/capture/unknown`: manual unknown-question capture route
- `POST /api/capture/contact`: contact capture route

### Core Services

#### Knowledge Layer
- `services/knowledge/knowledgeIngestionService.ts`
- `services/knowledge/knowledgeIndexService.ts`
- `services/knowledge/sourcePriority.ts`

#### Chat Orchestration Layer
- `services/chat/inputNormalizerService.ts`
- `services/chat/intentDetectionService.ts`
- `services/chat/retrievalService.ts`
- `services/chat/answerGenerationService.ts`
- `services/chat/answerReviewService.ts`
- `services/chat/openAIAgentService.ts`
- `services/chat/finalResponseFormatterService.ts`
- `services/chat/fallbackService.ts`
- `services/chat/chatOrchestratorService.ts`

#### Capture / Notifications
- `services/capture/unknownQuestionService.ts`
- `services/capture/contactCaptureService.ts`
- `services/notifications/notificationService.ts`

#### Security / Runtime Controls
- `services/security/rateLimitService.ts`
- `lib/apiValidation.ts`
- `lib/runtimeConfig.ts`

## Knowledge Sources (Local-First)

Place/edit profile data in:

- `knowledge/profile/summary.md`
- `knowledge/profile/linkedin.md`
- `knowledge/profile/resume.md`
- `knowledge/projects/projects.json`
- `knowledge/faq/known-questions.json`
- `knowledge/metadata/profile.json`

These are ingested into a normalized internal schema (`KnowledgeEntry`) with fields like:
- `id`
- `sourceType`
- `sourceName`
- `topic`
- `title`
- `content`
- `tags`
- `priority`
- `confidenceHint`
- `recruiterImportance`
- `relatedLinks`
- `lastUpdated`

## Ingestion and Retrieval Design

1. Ingestion reads markdown and JSON sources and normalizes them into `KnowledgeEntry[]`.
2. Index service caches entries and provides by-id lookup.
3. Intent detection assigns one of:
   - `about_me`
   - `career_summary`
   - `experience`
   - `leadership`
   - `ai_testing`
   - `rag_evaluation`
   - `automation`
   - `tools_and_technologies`
   - `projects`
   - `contact`
   - `recruiter_interest`
   - `unknown`
4. Retrieval scores entries using:
   - intent match
   - keyword/tag overlap
   - recruiter importance
   - source priority
5. Generator drafts answer only from retrieved evidence.
6. Reviewer approves/rejects based on grounding, relevance, sufficiency, safety, and overstatement checks.
7. Formatter returns final recruiter-friendly response.

## Fallback Behavior

When review fails or intent is unsupported:

- assistant states low confidence
- unknown question is recorded
- site owner notification is triggered
- assistant asks for visitor email for follow-up
- submitted email is linked to unresolved question when available

## Debug Mode

Enable local debug:

```bash
CHATBOT_DEBUG=true
NEXT_PUBLIC_CHATBOT_DEBUG=true
```

When enabled:
- API response includes structured debug payload
- UI can render a debug details panel for current conversation response

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` (server-side), then set:
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4o-mini
   OPENAI_TIMEOUT_MS=20000
   OPENAI_MAX_RETRIES=2
   OPENAI_RETRY_BASE_DELAY_MS=350
   CHAT_MAX_QUESTION_LENGTH=600
   CHAT_RATE_LIMIT_WINDOW_MS=60000
   CHAT_RATE_LIMIT_MAX_REQUESTS=30
   CAPTURE_RATE_LIMIT_WINDOW_MS=60000
   CAPTURE_RATE_LIMIT_MAX_REQUESTS=20
   CHATBOT_DEBUG=true
   NEXT_PUBLIC_CHATBOT_DEBUG=true
   ```
   Note: use `.env.local`, not `.evv.local`.
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Run tests:
   ```bash
   npm test
   ```
5. Run lint:
   ```bash
   npm run lint
   ```
6. Build production bundle:
   ```bash
   npm run build
   ```

## How to Replace Placeholder Data

1. Replace markdown text in:
   - `knowledge/profile/summary.md`
   - `knowledge/profile/linkedin.md`
   - `knowledge/profile/resume.md`
2. Update structured JSON in:
   - `knowledge/metadata/profile.json`
   - `knowledge/projects/projects.json`
   - `knowledge/faq/known-questions.json`
3. Keep claims factual and source-backed.
4. Re-run:
   ```bash
   npm test && npm run build
   ```

## Phase 3 Integration Points

- Replace rule-based intent detection with model-based intent classification
- Replace retrieval scorer with vector retrieval / hybrid search
- Replace generator with LLM-backed grounded answer generation
- Replace reviewer with richer safety/grounding evaluator model
- Replace JSON capture storage with DB/CRM/Airtable/Sheets
- Replace mock notifications with email/webhook/push integrations

## Deploy Split Stack (Vercel + Render)

This project supports:
- Frontend on Vercel
- API/backend routes on Render

### 1. Deploy backend on Render (free)

1. Push this repo to GitHub.
2. In Render: New -> Blueprint.
3. Select this repo. Render will detect `render.yaml`.
4. In Render service env vars, set:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL=gpt-4o-mini`
   - `CORS_ALLOWED_ORIGINS=https://<your-vercel-domain>,https://shubhanshurastogi.it.com`
5. Deploy and copy backend URL, e.g. `https://mychatbot-backend.onrender.com`.
6. Verify backend health:
   - `GET /api/health`

### 2. Deploy frontend on Vercel (free)

1. In Vercel: Add New Project -> import the same repo.
2. Set frontend env var:
   - `NEXT_PUBLIC_API_BASE_URL=https://<your-render-backend-url>`
3. Deploy.

### 3. Connect custom domain from Namecheap

For Vercel frontend:
1. In Vercel Project -> Domains, add `shubhanshurastogi.it.com`.
2. In Namecheap DNS, add records exactly as Vercel shows.
3. Wait for propagation and SSL issuance.

Optional backend subdomain:
1. Add `api.shubhanshurastogi.it.com` to Render custom domains.
2. Add corresponding CNAME in Namecheap to Render target.
3. Update:
   - `NEXT_PUBLIC_API_BASE_URL=https://api.shubhanshurastogi.it.com`
   - `CORS_ALLOWED_ORIGINS` to include production frontend origin.

## Notes

- Assistant remains profile-bounded and non-generic by design.
- No external LLM APIs or vector DB are required in Phase 2.
- Persistence for captures is local JSON (configurable via `CAPTURE_DATA_DIR`).
