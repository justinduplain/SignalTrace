# SignalTrace

**Live Demo:** [https://signaltrace.vercel.app](https://signaltrace.vercel.app)
**Login:** Username `admin`, Password `tenex`

SignalTrace is a high-performance **Threat Intelligence Platform** designed for SOC analysts. It parses ZScaler web proxy logs, visualizes traffic patterns, and uses AI to detect security anomalies (Shadow IT, Data Exfiltration, Malware) in real-time.

## Tech Stack
*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript (strict mode)
*   **UI:** Tailwind CSS, shadcn/ui
*   **Data Display:** TanStack Table + TanStack Virtual
*   **Visualization:** Recharts
*   **AI:** OpenAI API (`gpt-4o-mini`, streaming/NDJSON)
*   **Backend:** Next.js API Routes (Node.js serverless)
*   **Deployment:** Vercel (connected to GitHub for auto-deploy on push)

## Features
*   **Authentication:** Basic login (mock credentials) with cookie-based session management.
*   **Log Upload & Parsing:** Upload `.csv` log files or instantly generate fresh demo data. Server-side parsing via `papaparse` with TypeScript type guards for data validation.
*   **High-Performance Grid:** Uses `TanStack Virtual` to render large datasets without lag.
*   **AI Anomaly Detection:**
    *   **Real-time Streaming:** Analyzes logs row-by-row using OpenAI's `gpt-4o-mini` via NDJSON streaming.
    *   **Threat Intelligence:** Flags Shadow IT (Tor, BitTorrent), suspicious scripts (`curl`, `python`), and high-volume data exfiltration.
    *   **Mitigation Awareness:** Auto-identifies "Blocked" threats as mitigated risks (Clear) vs. "Allowed" threats as critical anomalies (Red) (tradeoff).
    *   **Confidence Scores:** Each anomaly is assigned a 0-100 confidence score displayed as a visual progress bar in the detail mode.
    *   **Explanations:** Every flagged entry includes a human-readable reason (e.g., "Large outbound data transfer (>10MB) during off-hours. Possible data exfiltration.").
*   **AI Insight Bar Chart:** Traffic volume chart colored by AI analysis status — gray (not analyzed), green (clear), red (anomaly) — updates in real-time as analysis streams in.
*   **Interactive Dashboard:** 5 clickable summary cards (Total Events, Critical Anomalies, Threats Prevented, Risk Exposure, Not Analyzed) that filter the table and chart. "Not Analyzed" card prompts to start AI analysis if none has run.
*   **Deep Dive Analysis:** Click any row to see AI's reasoning and Risk Score along with Raw Log Data.
*   **AI Remediation:** AI-suggested remediation measures for flagged anomalies, with mock fallback when no API key is configured.
*   **Error Handling:** User-facing error messages for failed uploads, analysis errors, and network issues. Loading spinners for all async operations. Empty state messages when filters return no results.

## Getting Started
### Prerequisites
*   Node.js 18+ (project uses Node 24 via `.nvmrc`)
*   npm

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/justinduplain/SignalTrace.git
    cd SignalTrace
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  (Optional) Re/Generate Mock Data - (only needed to create a static CSV; "Load Demo Data" generates fresh data dynamically):
    ```bash
    node generate-logs.mjs
    ```
    This creates a `zscaler_logs.csv` file with 500 realistic log entries, includig forcing hidden anomalies.

### Running the App

```bash
npm run dev
```
The app opens Chrome automatically to [http://localhost:3000](http://localhost:3000).

**Login:** Username `admin`, Password `tenex`

### Testing with Example Data

The repo includes a pre-generated `zscaler_logs.csv` for testing. You can also click **"Load Demo Data"** on the upload screen to generate a fresh randomized dataset without any file.

## AI Analysis Setup

SignalTrace has two modes for analysis:

### 1. Real AI Mode (Recommended)
To use the actual GPT-4o-mini model for analysis:

1.  Create a `.env.local` file in the root directory.
2.  Add your OpenAI API Key:
    ```bash
    OPENAI_API_KEY=sk-your-openai-key-here
    ```
3.  Restart the dev server.
4.  The app sends the first 50 rows plus any off-hours records (midnight-6 AM) to OpenAI for analysis. All blocked logs are instantly marked as "Clear".

### 2. Mock / Demo Mode
If **NO API Key** is provided, the app automatically switches to **Mock Mode**.

*   **Behavior:** Simulates a streaming AI response using a robust heuristic engine.
*   **Capacity:** Analyzes all records in the dataset.
*   **Logic:** Replicates the prompt's logic (flagging Tor, high bytes, off-hours exfiltration, etc.) deterministically. All blocked logs are instantly marked as "Clear".
*   **Remediation:** Mock remediation responses are returned based on anomaly type.
*   **Controls:** You can stop the analysis at any time or reset the data to upload a new file; the app handles stream cancellation gracefully.
*   **No Cost:** Perfect for local dev and testing UI interactions.

## Architecture & Trade-offs

### In-Memory State over Database Persistence
CSV files are parsed server-side and returned as JSON. Analysis results are held in React state for the session. A page refresh clears everything. This was a deliberate trade-off to stay within the 6-8 hour timebox and focus on the frontend experience. A production version would persist logs and analysis results to PostgreSQL for multi-session access. The planned next step is `zustand` + `localStorage` persistence to survive refreshes without requiring a full database.

### Virtualization over Pagination
The table uses `TanStack Virtual` instead of traditional server-side pagination. This keeps the full dataset in-memory for instant filtering and cross-referencing — critical for SOC analysts who need to correlate events across time ranges. The trade-off is higher client memory usage, but this works well up to ~100k rows with virtualization.

### NDJSON Streaming over Batch Response
The `/api/analyze` endpoint streams results line-by-line via NDJSON instead of waiting for all results before responding. This gives the analyst real-time feedback as each log is evaluated (the bar chart and table update live), but adds complexity in handling partial failures and stream cancellation.

### Mock Mode as First-Class Feature
Rather than treating the no-API-key path as a degraded experience, the mock engine replicates the full prompt logic deterministically. The UI can be fully demonstrated and evaluated without any external API dependency or cost. This is important for reviewers who may not have an OpenAI key.

### Client-Side Filtering over Server Queries
Card filters and hour-based cross-filtering all happen in the browser against the in-memory dataset. This enables instant interactions without round-trips to the server, but wouldn't scale to datasets beyond what the browser can hold.

### Blocked Logs as Instant "Clear"
Instead of sending blocked logs to the AI for analysis, they're resolved client-side immediately with confidence 0 ("Threat mitigated by perimeter controls"). This reduces API costs and latency, and reflects SOC reality — a blocked threat is already mitigated. The analyst's attention should go to allowed anomalies that slipped through.

### API Routes
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/upload` | POST | Parse uploaded CSV, validate schema, return JSON |
| `/api/demo` | GET | Generate fresh randomized mock logs |
| `/api/analyze` | POST | AI anomaly detection via NDJSON streaming |
| `/api/remediate` | POST | AI-suggested remediation for flagged entries |

## AI Usage Disclosure
The majority of the code in this project was generated with AI assistance via CLI tools (Gemini Pro 3, Claude Opus 4.5), with manual review and approval by the developer at each step. Specifically:
1.  **Code Generation & Architecture:** The application logic, UI components, API routes, and overall architecture were developed using LLM-based CLI agents (Google Gemini, Claude Code). All generated code was reviewed, tested, and approved before being committed.
2.  **Mock Data Generation:** The `generate-logs.mjs` script and `src/lib/generate-logs.ts` module use heuristic logic (designed with AI assistance) to create realistic ZScaler proxy logs, including synthetic anomalies like "Shadow IT", "Malware", and off-hours data exfiltration events.
3.  **Real-Time Log Analysis:** The application integrates with OpenAI's `gpt-4o-mini` model to perform security analysis of log entries at runtime.
    *   **Prompt Engineering:** The system prompt was iteratively refined (using Few-Shot examples and Chain-of-Thought reasoning) to ensure accurate distinction between "Blocked/Mitigated" threats and "Allowed/Critical" anomalies, with special attention to off-hours timing signals.
4.  **Mock Analysis Engine:** When no OpenAI API key is configured, a deterministic heuristic engine replicates the AI prompt logic for full offline demonstration.
