import { LogEntry } from "@/types/log-entry"
import { AnalysisResult } from "@/types/analysis-result"

/**
 * Pre-processes blocked logs to provide instant analysis results
 * without sending them to the AI.
 */
export function processBlockedLogs(logs: LogEntry[]): Record<string, AnalysisResult> {
  const results: Record<string, AnalysisResult> = {}
  
  logs.filter(l => l.Action === 'Block').forEach(log => {
    results[log.id] = {
      id: log.id,
      confidence: 0,
      reason: `Threat mitigated by perimeter controls (${log.ThreatCategory !== 'None' ? log.ThreatCategory : 'Policy'}). Action was blocked.`
    }
  })
  
  return results
}

/**
 * Handles the NDJSON stream from the analysis API.
 */
export async function streamAnalysis(
  logs: LogEntry[],
  options: {
    onResult: (result: AnalysisResult) => void
    onMeta?: (meta: { count: number }) => void
    signal?: AbortSignal
  }
) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ logs }),
    signal: options.signal
  })

  if (!response.ok || !response.body) throw new Error('Analysis failed')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    
    // Keep the last partial line in the buffer
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine || trimmedLine.startsWith('```') || trimmedLine === 'ndjson') continue
      
      try {
        const data = JSON.parse(trimmedLine)
        
        if (data.type === 'meta') {
          options.onMeta?.(data)
        } else {
          options.onResult(data as AnalysisResult)
        }
      } catch (e) {
        console.warn('Failed to parse NDJSON line:', line, e)
      }
    }
  }
  
  // Process any remaining buffer content
  if (buffer.trim()) {
    try {
      const data = JSON.parse(buffer)
      if (data.type !== 'meta') {
        options.onResult(data as AnalysisResult)
      }
    } catch (e) {
      console.warn('Failed to parse final NDJSON line:', buffer, e)
    }
  }
}

/**
 * Fetches AI-suggested remediation for a specific log and reason.
 */
export async function getRemediation(log: LogEntry, reason: string): Promise<string> {
  const response = await fetch('/api/remediate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ log, reason }),
  })

  if (!response.ok) throw new Error('Remediation fetch failed')
  const data = await response.json()
  return data.remediation
}
