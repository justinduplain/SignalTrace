# SignalTrace

SignalTrace is a high-performance **Threat Intelligence Platform** designed for SOC analysts. It parses ZScaler web proxy logs, visualizes traffic patterns, and uses AI to detect security anomalies (Shadow IT, Data Exfiltration, Malware) in real-time.

## Features

*   **High-Performance Grid:** Uses `TanStack Virtual` to render massive datasets (tested with 100k+ rows) with zero lag.
*   **AI Anomaly Detection:**
    *   **Real-time Streaming:** Analyzes logs row-by-row using OpenAI's `gpt-4o-mini` via NDJSON streaming.
    *   **Threat Intelligence:** Flags Shadow IT (Tor, BitTorrent), suspicious scripts (`curl`, `python`), and high-volume data exfiltration.
    *   **Off-Hours Detection:** Specifically flags large Dropbox uploads during off-hours (1-4 AM) as potential data exfiltration, even when Action is "Allow" and ThreatCategory is "None".
    *   **Mitigation Awareness:** Correctly identifies "Blocked" threats as mitigated risks (Clear) vs. "Allowed" threats as critical anomalies (Red).
*   **AI Insight Bar Chart:** Traffic volume chart colored by AI analysis status — gray (not analyzed), green (clear), red (anomaly) — updates in real-time as analysis streams in.
*   **Interactive Dashboard Cards:** Clickable summary cards (Total Events, Critical Anomalies, Not Analyzed) filter both the table and chart. "Not Analyzed" card prompts to start AI analysis if none has run.
*   **Deep Dive Analysis:** Click any row to see a side-by-side view of the Raw Log Data vs. the AI's reasoning and Risk Score.
*   **AI Remediation:** AI-suggested remediation measures for flagged anomalies, with mock fallback when no API key is configured.
*   **Dynamic Demo Data:** "Load Demo Data" generates fresh randomized mock logs on each click via server-side generation.

## AI Usage Disclosure

This project utilizes Artificial Intelligence in the following ways to accelerate development and simulate real-world scenarios:

1.  **Code Generation:** The core application logic, UI components, and API routes were developed with the assistance of LLM agents (Google Gemini, Claude Code).
2.  **Mock Data Generation:** The `generate-logs.mjs` script and `src/lib/generate-logs.ts` module use heuristic logic (designed with AI assistance) to create realistic ZScaler proxy logs, including synthetic anomalies like "Shadow IT", "Malware", and off-hours data exfiltration events.
3.  **Real-Time Log Analysis:** The application integrates with OpenAI's `gpt-4o-mini` model to perform the actual security analysis of the log entries.
    *   **Prompt Engineering:** The system prompt was iteratively refined (using Few-Shot examples and Chain-of-Thought reasoning) to ensure accurate distinction between "Blocked/Mitigated" threats and "Allowed/Critical" anomalies, with special attention to off-hours timing signals.

## Getting Started

### Prerequisites

*   Node.js 18+
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/signal-trace.git
    cd signal-trace
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Generate Mock Data (Optional — only needed for static CSV; "Load Demo Data" generates fresh data dynamically):
    ```bash
    node generate-logs.mjs
    ```
    This creates a `zscaler_logs.csv` file with 500 realistic log entries, including hidden anomalies.

### Running the App

```bash
npm run dev
```
The app opens Chrome automatically to [http://localhost:3000](http://localhost:3000).

## AI Analysis Setup

SignalTrace has two modes for analysis:

### 1. Real AI Mode (Recommended)
To use the actual GPT-4o model for analysis:

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

## Tech Stack

*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript
*   **UI:** Tailwind CSS, shadcn/ui (includes Dialog component)
*   **State:** React Query, TanStack Table + Virtual
*   **Visualization:** Recharts
*   **AI:** OpenAI API (Streaming/NDJSON)
