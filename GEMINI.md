# GEMINI.md - SignalTrace Project Context & Master Instructions

## 1. Project Overview & Persona
**Project Name:** SignalTrace
**Objective:** Build a full-stack cybersecurity application to upload, parse, and analyze log files for SOC analysts.
**Target Persona:** Senior Frontend Engineer (ex-Oracle, 10 YOE). Focus on "High-Trust" UI, performance optimization, and domain empathy.
**Core Philosophy:**
* **High-Trust UI:** Dark mode default, monospace data, density-optimized.
* **Performance:** Use `TanStack Virtual` to prove handling of massive log datasets (1M+ rows).
* **Human-in-the-Loop:** AI highlights anomalies, but the user verifies them against raw data.

## 2. Technical Stack (Strict Constraints)
* **Framework:** Next.js 14 (App Router).
* **Language:** TypeScript.
* **Styling:** Tailwind CSS, `shadcn/ui` (Slate/Zinc theme), `clsx`.
* **State Management:** TanStack Query.
* **Data Display:** TanStack Table + TanStack Virtual (Critical for Senior role).
* **Visualization:** Recharts.
* **AI Integration:** OpenAI API (`gpt-4o-mini`).
* **Backend:** Next.js API Routes (Serverless).
* **Persistence:** SQLite (via Prisma) or In-Memory (Trade-off dependent).

## 3. Data Strategy: ZScaler Mock Data
**Source:** Generate 500 lines of mock ZScaler Web Proxy Logs.
**Schema:**
* `Timestamp`
* `SourceUser`
* `SourceIP`
* `Action` (Allow/Block)
* `AppName`
* `ThreatCategory`
* `DestURL`
* `BytesSent`
* `BytesReceived`
* `UserAgent`
**Anomalies:** Inject 10-50 entries with "High BytesSent" or "Suspicious IP" at odd hours (e.g., 3:00 AM).

## 4. Execution Plan (7-Hour Timebox)

### Phase 0: Pre-Work (Environment) - [COMPLETED]
* **Repo:** `create-next-app` with TypeScript/Tailwind/ESLint.
* **Data:** Use ChatGPT to generate the `zscaler_logs.csv` before starting the clock.
* **Middleware:** Use `src/proxy.ts` instead of `src/middleware.ts` as newer Next.js versions expect this naming convention for this specific project setup.

### Phase 1: The Backbone (Hour 1) - [COMPLETED]
* **Goal:** Deployable "Hello World" with auth and shell.
* **Auth:** Simple Mock Auth (User: `admin`, Pass: `tenex`) using Cookies/LocalStorage. Do not build a DB for users.
* **Design:** Force Dark Mode. Install basic `shadcn` components (Button, Table, Input, Card).

### Phase 2: Ingestion & Parsing (Hour 2) - [COMPLETED]
* **Goal:** Upload CSV and return JSON.
* **API:** `POST /api/upload` handling FormData.
* **Parsing:** Use `papaparse` to convert CSV to JSON array.
* **Validation:** Implement a TypeScript Type Guard `LogEntry` to validate data shape.
* **Refinement:** Added "Load Demo Data" button to instantly load server-side mock data for testing.

### Phase 3: Frontend (Hour 3) - [COMPLETED]
* **Goal:** Virtualized Data Table.
* **Implementation:** `TanStack Table` + `TanStack Virtual`. Must handle scrolling without DOM lag.
* **UI Details:** "Status" badges (Green/Red). Monospace font for IPs and Timestamps.

### Phase 4: AI & Anomaly Detection (Hour 4)
* **Goal:** Identify threats via API.
* **Action:** "Analyze" button triggers `/api/analyze`.
* **Strategy:** Send log chunks to OpenAI. Prompt for: `{"id": "...", "confidence": 85, "reason": "High byte volume"}`.
* **Interaction:** Highlight anomalous rows (Red). Click row to see AI reasoning vs. Raw Log.

### Phase 5: Visualization & Dashboarding (Hour 5)
* **Goal:** Human-consumable summary.
* **Chart:** Recharts Bar Chart showing "Events per Hour" or "Blocked vs. Allowed".
* **Manager Touch:** Summary cards at the top ("3 Critical Anomalies Detected").
* **Bonus:** Cross-filtering (Clicking a bar filters the table).

### Phase 6: Polish & Deployment (Hour 6)
* **Goal:** Ship it.
* **Deploy:** Push to GitHub. Deploy to Vercel (Add OpenAI Key to Env Vars).
* **Docs:** Write `README.md` including "How to Run Locally" and "AI Approach".

#### Phase 6B: Checks and refinement
* App meets a cohesive, high-trust product experience?
* Uses reusable UI patterns (layout, navigation, tables, filters, forms, modals)?
* Implement robust data-fetching/server-state patterns (pagination, caching, background refresh, optimistic updates, error handling)?
* Clear API contracts with backend engineers to keep frontend implementation clean and scalable.
* Raised bar on UI correctness: loading/empty/error states, edge cases, responsive behavior, accessibility.
* (component conventions, Claude Code skills, review standards, performance budgets).
* Unified “product feel”: micro-interactions, latency masking, and interaction details that make the product feel trustworthy.

### Phase 7: The Sell (Hour 7)
* **Goal:** Video Walkthrough (Critical).
* **Narrative:** Explain the choice of Virtualization (Scale) and Design Tokens (Consistency). Mention trade-offs (SQLite vs. Postgres).

## 5. Requirements Compliance Matrix
| Requirement | Implementation Strategy |
| :--- | :--- |
| **Basic Authentication** | Mock Login (Admin/Tenex) |
| **File Upload** | `papaparse` + Next.js API Routes |
| **Log Parsing** | ZScaler CSV Schema |
| **Anomaly Detection** | OpenAI API + Confidence Scores |
| **Visualization** | Recharts Timeline |
| **Video Walkthrough** | 3-5 min Loom explaining architectural choices |
| **Deployment** | Vercel (Live Link) |

## 6. General Instructions & Best Practices

### Documentation & Maintenance
* **Living Documents:** Always keep `README.md` and `GEMINI.md` updated as the project evolves. If the architecture changes (e.g., swapping SQLite for In-Memory), update these files immediately to reflect the "Why" for the reviewer.
* **AI Transparency:** Explicitly document how and where AI is used (e.g., "Used ChatGPT to generate mock data", "Used Copilot for regex parsing"). This is a strict project requirement, include a summary of AI use in the `README.md` file.

### Security & sensitive Data
* **Zero-Leak Policy:** Never upload `.env` files or API keys (specifically OpenAI keys) to GitHub. Add `.env*.local` to `.gitignore` immediately upon initialization.
* **Client-Side Safety:** Ensure server-side API keys are only accessed in API Routes or Server Actions, never exposed to the client bundle.

### Code Hygiene (The "Senior" Standard)
* **Strict TypeScript:** Avoid `any` types. Define interfaces for all data structures (e.g., `LogEntry`). This demonstrates type safety to the reviewer.
* **Linting:** Ensure the repo is clean and linted. Remove all `console.log` debugging statements before the final commit.
* **Conventional Commits:** Use clear commit messages (e.g., `feat: add virtual table`, `fix: parsing logic`) to show professional workflow.

### Time Management & Scope
* **Ruthless Prioritization:** Adhere to the 6-8 hour time limit. If a backend feature (like a database) puts the deadline at risk, cut it. Focus on the "High-Trust" frontend interactions.
* **MVP First:** Prioritize a functional prototype over production-readiness. It is better to have a polished mock than a broken full-stack app.