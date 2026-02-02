# GEMINI.md - SignalTrace Project Context & Master Instructions

## 1. Project Overview & Persona
**Project Name:** SignalTrace
**Objective:** Build a full-stack cybersecurity application to upload, parse, and analyze log files for SOC analysts.
**Target Persona:** Senior Frontend Engineer (ex-Oracle, 10 YOE). Focus on "High-Trust" UI, performance optimization, and domain empathy.
**Core Philosophy:**
* **High-Trust UI:** Dark mode default, monospace data, density-optimized.
* **Performance:** Use `TanStack Virtual` to prove handling of massive log datasets (1M+ rows).
* **Human-in-the-Loop:** AI highlights anomalies, but the user verifies them against raw data.
* **Phase Progression:** **CRITICAL: Do NOT move on to the next project phase without explicit direction from the user.** Stop and wait for confirmation after completing the current phase's tasks.

## 2. Technical Stack (Strict Constraints)
* **Framework:** Next.js 14 (App Router).
* **Language:** TypeScript.
* **Styling:** Tailwind CSS, `shadcn/ui` (Slate/Zinc theme), `clsx`.
* **State Management:** TanStack Query.
* **Data Display:** TanStack Table + TanStack Virtual
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

### Phase 3: Frontend (Hour 2.5) - [COMPLETED]
* **Goal:** Virtualized Data Table.
* **Implementation:** `TanStack Table` + `TanStack Virtual`. Must handle scrolling without DOM lag.
* **UI Details:** "Status" badges (Green/Red). Monospace font for IPs and Timestamps.

### Phase 4: AI & Anomaly Detection (Hour 4.25) - [COMPLETED]
* **Goal:** Identify threats via API.
* **Action:** "Analyze" button triggers `/api/analyze`.
* **Strategy:** Send log chunks to OpenAI. Prompt for: `{"id": "...", "confidence": 85, "reason": "High byte volume"}`.
* **Interaction:** Highlight anomalous rows (Red). Click row to see AI reasoning vs. Raw Log.

### Phase 5: Visualization & Dashboarding (Hour 6.25) - [COMPLETED]
* **Goal:** [x] Human-consumable summary.
* **Chart:** [x] Recharts Bar Chart colored by AI Insight status (gray/green/red) instead of Allow/Block.
* **Overview:** [x] 5 summary cards: Total Events, Critical Anomalies, Threats Prevented, Risk Exposure, Not Analyzed.
* **Bonus:** [x] Cross-filtering (Clicking a bar filters the table; clicking cards filters by AI status).
* **Bonus:** [x] "Not Analyzed" card prompts to start AI analysis via Dialog.
* **Bonus:** [x] Add AI-suggested remediation measures.
* **Bonus:** [x] Real-time "Analyzing N remaining..." pulsing status next to Traffic Volume title.

#### Phase 6A: Checks and refinement  (Hour 6.5)
* App meets a cohesive, high-trust product experience?
* Uses reusable UI patterns (layout, navigation, tables, filters, forms, modals)?
* Implement robust data-fetching/server-state patterns (pagination, caching, background refresh, optimistic updates, error handling)?
* Clear API contracts with backend engineers to keep frontend implementation clean and scalable.
* Raised bar on UI correctness: loading/empty/error states, edge cases, responsive behavior, accessibility.
* (component conventions, Claude Code skills, review standards, performance budgets).
* Unified “product feel”: micro-interactions, latency masking, and interaction details that make the product feel trustworthy.

### Phase 6B: Polish & Deployment (Hour 7)
* **Goal:** Ship it.
* **Deploy:** Push to GitHub. Deploy to Vercel (Add OpenAI Key to Env Vars).
* **Docs:** Write `README.md` including "How to Run Locally" and "AI Approach".

### Phase 7: The Sell (Hour 7.5)
* **Goal:** Video Walkthrough (Critical).
* **Narrative:** Explain the choice of Virtualization (Scale) and Design Tokens (Consistency). Mention trade-offs (SQLite vs. Postgres).

### Phase Z: Future Phases: Possible next steps (out of current scope)

#### Phase ZA (Optional): State Persistence (The "Memory")
* **Time Estimate:** 30 Minutes
* **Goal:** Ensure analyst work is not lost on refresh. 
* **Tech:** `zustand` + `persist` middleware.
* **Implementation:**
    * **Store:** Create `store/useLogStore.ts`.
    * **Schema:** `logs: LogEntry[]`, `analysis: AnalysisResult | null`, `actions: { setLogs, reset }`.
    * **Persistence:** Wrap the store in `persist()` middleware to auto-sync to `localStorage`.
* **Why:** SOC analysts often switch tabs. When they return or refresh, the context (uploaded logs + analysis) must remain immediately available without re-uploading.

#### Phase ZB (Optional): Single-Page Refactor (The "Console")
* **Time Estimate:** 1.5 Hours
* **Goal:** Move from "Wizard" (Page 1 -> Page 2) to "Console" (Dashboard with Modal).
* **Risk:** **High.** Only execute if the main Visualization and Table are stable.
* **Refactor Plan:**
    * **Upload:** Move `UploadForm` into a `shadcn/ui` **Dialog** component triggered from the Header.
    * **Layout:** `page.tsx` becomes the permanent Dashboard container.
    * **Empty State:** If `logs.length === 0`, render a "Ready to Scan" placeholder in the main view instead of the table.
    * **Hydration:** `useEffect` to check the Zustand store on mount. If data exists, render the Dashboard immediately.

#### Phase ZC (Optional): Iterative UX and DevUX updates
* **Iterative Analysis:** I.e., action to "Analyze next 50 records" etc.
* **MCP Adapter:** Enable MCP capability using '@vercel/mcp-adapter' to allow AI agnets to interact with the logs and analysis results.

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

### Code Hygiene & Standards
* **Strict TypeScript:** Avoid `any` types. Define interfaces for all data structures (e.g., `LogEntry`). This demonstrates type safety to the reviewer.
* **Linting:** Ensure the repo is clean and linted. Remove all `console.log` debugging statements before the final commit.
* **Conventional Commits:** Use clear commit messages (e.g., `feat: add virtual table`, `fix: parsing logic`) to show professional workflow.

### Time Management & Scope
* **Ruthless Prioritization:** Adhere to the 6-8 hour time limit. If a backend feature (like a database) puts the deadline at risk, cut it. Focus on the "High-Trust" frontend interactions.
* **MVP First:** Prioritize a functional prototype over production-readiness. It is better to have a polished mock than a broken full-stack app.