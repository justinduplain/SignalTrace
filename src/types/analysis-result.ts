export interface AnalysisResult {
  id: string;
  confidence: number;
  reason: string;
  remediation?: string;
}
