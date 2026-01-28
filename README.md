# SignalTrace

SignalTrace is a full-stack cybersecurity application designed for SOC analysts to upload, parse, and analyze log files. It focuses on a "High-Trust" UI, performance optimization for large datasets, and AI-driven anomaly detection.

## 🚀 Getting Started

### Prerequisites
* Node.js 18+
* npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd SignalTrace
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the application:**
    Navigate to [http://localhost:3000](http://localhost:3000).

## 🔑 Authentication

The application uses a mock authentication system for demonstration purposes.
*   **Username:** `admin`
*   **Password:** `tenex`

## 🧪 Testing Data

You can test the application using the included mock data:
1.  **Manual Upload:** Upload the `zscaler_logs.csv` file located in the root directory.
2.  **Quick Load:** Click the **"Load Demo Data"** button on the dashboard to instantly load the server-side mock logs.

## 🛠️ Tech Stack

*   **Framework:** [Next.js 14 (App Router)](https://nextjs.org/)
*   **Language:** TypeScript
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **UI Library:** [shadcn/ui](https://ui.shadcn.com/) (Slate Theme)
*   **Data Parsing:** [Papaparse](https://www.papaparse.com/)
*   **Data Display:** [TanStack Table](https://tanstack.com/table/v8) & [TanStack Virtual](https://tanstack.com/virtual/v3)
*   **State Management:** React Hooks
*   **Authentication:** Middleware-based Cookie protection

## 📂 Project Structure

*   `src/app/api/`: Server-side API routes for file upload and demo data.
*   `src/components/ui/`: Reusable UI components (Button, Card, Input, etc.).
*   `src/components/data-table.tsx`: Virtualized table component for high-performance log rendering.
*   `src/components/log-uploader.tsx`: Client-side component for handling CSV uploads.
*   `src/types/log-entry.ts`: TypeScript definitions and validation guards for log data.
*   `src/proxy.ts`: Route protection logic.

## 🤖 AI Usage

*   **Mock Data:** `zscaler_logs.csv` was generated using a Python script (authored by AI) to simulate realistic ZScaler proxy logs with injected anomalies.
*   **Components:** `shadcn/ui` components were generated using the CLI.

## 📝 Status

*   [x] **Phase 0:** Environment Setup & Data Generation
*   [x] **Phase 1:** Basic Auth & UI Skeleton
*   [x] **Phase 2:** CSV Ingestion & Parsing
*   [x] **Phase 3:** Virtualized Data Table
*   [ ] **Phase 4:** AI Anomaly Detection
*   [ ] **Phase 5:** Visualization Dashboard
*   [ ] **Phase 6:** Deployment