# CLAUDE.md - SignalTrace Project Context

## Project Overview
**SignalTrace** is a full-stack cybersecurity application for SOC analysts to upload, parse, and analyze log files. Built as a portfolio piece demonstrating senior frontend engineering skills.

## Technical Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict, no `any` types)
- **Styling:** Tailwind CSS, shadcn/ui (Slate/Zinc theme), clsx
- **State:** TanStack Query
- **Data Display:** TanStack Table + TanStack Virtual (must handle 1M+ rows)
- **Visualization:** Recharts
- **AI:** OpenAI API (gpt-4o-mini)
- **Backend:** Next.js API Routes (Serverless)
- **Note:** `src/proxy.ts` is used instead of `src/middleware.ts` for this project's middleware needs

## Design Principles
- **High-Trust UI:** Dark mode default, monospace data, density-optimized
- **Human-in-the-Loop:** AI highlights anomalies; user verifies against raw data
- **Performance:** Virtualized scrolling for massive datasets
- **MVP over production-readiness:** Polished mock > broken full-stack

## Data: ZScaler Mock Logs
- 500 lines of mock ZScaler Web Proxy Logs
- Fields: Timestamp, SourceUser, SourceIP, Action (Allow/Block), AppName, ThreatCategory, DestURL, BytesSent, BytesReceived, UserAgent
- User emails are anonymized (e.g. `user.7a3f@tenex.com`) — no real names or roles
- Google Drive is the standard business storage provider — always Action: Allow, never a violation
- Dropbox high-volume uploads (15-50MB) are injected at off-hours (1-4 AM) with Action: Allow and ThreatCategory: None — these are the key exfiltration anomalies the AI should flag
- 8 guaranteed Dropbox exfil entries + remaining anomalies split between malware and shadow IT

## Data Generation
- `generate-logs.mjs` — CLI script to generate static `zscaler_logs.csv`
- `src/lib/generate-logs.ts` — Shared TypeScript module used by `/api/demo` route
- "Load Demo Data" generates fresh randomized data on each click (no static CSV dependency)

## Auth
Mock login only — User: `admin`, Pass: `tenex`. No user DB.

## Phase Status
- Phase 0 (Environment): COMPLETED
- Phase 1 (Auth + Shell): COMPLETED
- Phase 2 (Ingestion & Parsing): COMPLETED
- Phase 3 (Virtualized Table): COMPLETED
- Phase 4 (AI Anomaly Detection): COMPLETED
- Phase 5 (Visualization & Dashboard): COMPLETED
- Phase 6 (Polish & Deploy): IN PROGRESS
- Phase 6B (Checks & Refinement): NOT STARTED
- Phase 6C (Optional: Zustand persistence): NOT STARTED
- Phase 6D (Optional: Single-page console refactor): NOT STARTED
- Phase 7 (Video Walkthrough): NOT STARTED

## Key APIs
- `POST /api/upload` — CSV upload via FormData, parsed with papaparse
- `GET /api/demo` — Generates fresh mock data via `generateMockLogs()`
- `POST /api/analyze` — AI anomaly detection with NDJSON streaming; sends first 50 + off-hours logs to LLM, all records in mock mode
- `POST /api/remediate` — AI remediation suggestions (mocked when no API key)

## Dashboard Features
- **Bar chart** colored by AI Insight status: gray (not analyzed), green (clear), red (anomaly)
- **5 summary cards:** Total Events, Critical Anomalies, Threats Prevented, Risk Exposure, Not Analyzed
- **Clickable cards:** Total Events, Critical Anomalies, and Not Analyzed filter the table
- **Not Analyzed card** shows a dialog prompting to start analysis when no analysis has run
- **Cross-filtering:** Click a bar to filter by hour; composes with card filters
- **Blocked logs** are instantly marked as "Clear" across the entire dataset (not sent to AI)
- **Analyzing status** shown as pulsing indicator next to Traffic Volume title

## Code Standards
- Strict TypeScript with defined interfaces for all data structures
- Conventional commits (`feat:`, `fix:`, `refactor:`)
- No `console.log` in final commits
- Clean linting
- Never expose API keys client-side; keys only in API Routes/Server Actions

## Important Rules
- Do NOT advance to the next phase without explicit user direction
- Keep GEMINI.md, CLAUDE.md, and README.md updated when architecture changes
- Document AI usage transparently
- Never commit .env files or API keys
