# SignalTrace

SignalTrace is a high-performance **Threat Intelligence Platform** designed for SOC analysts. It parses ZScaler web proxy logs, visualizes traffic patterns, and uses AI to detect security anomalies (Shadow IT, Data Exfiltration, Malware) in real-time.

## Features

*   **High-Performance Grid:** Uses `TanStack Virtual` to render massive datasets (tested with 100k+ rows) with zero lag.
*   **AI Anomaly Detection:** 
    *   **Real-time Streaming:** Analyzes logs row-by-row using OpenAI's `gpt-4o-mini` via NDJSON streaming.
    *   **Threat Intelligence:** Flags Shadow IT (Tor, BitTorrent), suspicious scripts (`curl`, `python`), and high-volume data exfiltration.
    *   **Mitigation Awareness:** Correctly identifies "Blocked" threats as mitigated risks (Green) vs. "Allowed" threats as critical anomalies (Red).
*   **Deep Dive Analysis:** Click any row to see a side-by-side view of the Raw Log Data vs. the AI's reasoning and Risk Score.

## AI Usage Disclosure

This project utilizes Artificial Intelligence in the following ways to accelerate development and simulate real-world scenarios:

1.  **Code Generation:** The core application logic, UI components, and API routes were developed with the assistance of an LLM agent (Google Gemini).
2.  **Mock Data Generation:** The `generate-logs.mjs` script uses heuristic logic (designed with AI assistance) to create realistic ZScaler proxy logs, including synthetic anomalies like "Shadow IT" and "Malware" events.
3.  **Real-Time Log Analysis:** The application integrates with OpenAI's `gpt-4o-mini` model to perform the actual security analysis of the log entries.
    *   **Prompt Engineering:** The system prompt was iteratively refined (using Few-Shot examples and Chain-of-Thought reasoning) to ensure accurate distinction between "Blocked/Mitigated" threats and "Allowed/Critical" anomalies.

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

3.  Generate Mock Data (Optional):
    ```bash
    node generate-logs.mjs
    ```
    This creates a `zscaler_logs.csv` file with 500 realistic log entries, including hidden anomalies.

### Running the App

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

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
4.  The app will now stream analysis from OpenAI (limited to the top 50 rows to save costs).

### 2. Mock / Demo Mode
If **NO API Key** is provided, the app automatically switches to **Mock Mode**.

*   **Behavior:** Simulates a streaming AI response using a robust heuristic engine.
*   **Capacity:** Analyzes up to 200 rows.
*   **Logic:** It replicates the prompt's logic (Flagging Tor, High Bytes, etc.) deterministically for demonstration purposes.
*   **Controls:** You can stop the analysis at any time or reset the data to upload a new file; the app handles stream cancellation gracefully.
*   **No Cost:** Perfect for local dev and testing UI interactions.

## Tech Stack

*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript
*   **UI:** Tailwind CSS, shadcn/ui
*   **State:** React Query, TanStack Table + Virtual
*   **AI:** OpenAI API (Streaming/NDJSON)
