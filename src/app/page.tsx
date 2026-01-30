'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogUploader } from "@/components/log-uploader"
import { LogEntry } from "@/types/log-entry"
import { DataTable } from "@/components/data-table"
import { AnalysisResult } from "@/types/analysis-result"
import { Sparkles, Loader2, X } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult>>({})
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set())
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleLogout = () => {
    document.cookie = "auth=; path=/; max-age=0"
    router.push('/login')
    router.refresh()
  }

  const handleStopAnalysis = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
        setIsAnalyzing(false)
        setAnalyzingIds(new Set()) // Clear loading indicators
    }
  }

  const handleAnalyze = async () => {
    // 1. Sort by Timestamp Descending (Newest first)
    const sortedLogs = [...logs].sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime())
    const logsToProcess = sortedLogs.slice(0, 200)
    
    // 2. Optimization: Pre-filter Blocked logs as "Mitigated"
    // We don't need to pay OpenAI to tell us a Blocked log is safe.
    const blockedLogs = logsToProcess.filter(l => l.Action === 'Block')
    const allowedLogs = logsToProcess.filter(l => l.Action === 'Allow')

    // 3. Instant updates for Blocked logs
    const blockedResults: Record<string, AnalysisResult> = {}
    blockedLogs.forEach(log => {
        blockedResults[log.id] = {
            id: log.id,
            confidence: 0,
            reason: `Threat mitigated by perimeter controls (${log.ThreatCategory !== 'None' ? log.ThreatCategory : 'Policy'}). Action was blocked.`
        }
    })
    
    setAnalysisResults(prev => ({ ...prev, ...blockedResults }))

    // 4. Send ONLY Allowed logs to AI
    if (allowedLogs.length === 0) return

    // Mark ONLY allowed IDs as 'scanning'
    const idsToAnalyze = new Set(allowedLogs.map(l => l.id))
    setAnalyzingIds(idsToAnalyze)
    setIsAnalyzing(true)
    
    // Setup AbortController
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: allowedLogs }),
        signal: abortControllerRef.current.signal
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
        
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || trimmedLine.startsWith('```') || trimmedLine === 'ndjson') continue
          
          try {
            // console.log("Received Line:", trimmedLine); // Debug
            const data = JSON.parse(trimmedLine)
            
            // Handle Metadata
            if (data.type === 'meta') {
                // console.log("Meta:", data); // Debug
                const actualCount = data.count
                if (actualCount < allowedLogs.length) {
                    // Truncate the scanning indicators to match what the server is actually doing
                    const actualIds = new Set(allowedLogs.slice(0, actualCount).map(l => l.id))
                    setAnalyzingIds(actualIds)
                }
                continue
            }

            const result: AnalysisResult = data
            
            setAnalysisResults(prev => ({
              ...prev,
              [result.id]: result
            }))

            setAnalyzingIds(prev => {
                const next = new Set(prev)
                next.delete(result.id)
                return next
            })
          } catch (e) {
            console.warn('Failed to parse NDJSON line:', line, e)
          }
        }
      }
      
      // Process any remaining buffer content after stream ends
      if (buffer.trim()) {
         try {
            const data = JSON.parse(buffer)
            if (data.type !== 'meta') {
                const result: AnalysisResult = data
                setAnalysisResults(prev => ({ ...prev, [result.id]: result }))
                setAnalyzingIds(prev => {
                    const next = new Set(prev)
                    next.delete(result.id)
                    return next
                })
            }
         } catch (e) {
            console.warn('Failed to parse final NDJSON line:', buffer, e)
         }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
          console.log('Analysis stopped by user')
      } else {
          console.error(error)
      }
    } finally {
      setIsAnalyzing(false)
      setAnalyzingIds(new Set())
      abortControllerRef.current = null
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-950 text-slate-100">
      <div className="z-10 w-full max-w-7xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <p className="flex w-full justify-center lg:justify-start items-center">
          SignalTrace&nbsp;
          <code className="font-mono font-bold bg-slate-800 px-2 py-1 rounded text-blue-400">SOC Dashboard</code>
        </p>
        <div className="flex w-full justify-center lg:justify-end mt-4 lg:mt-0">
          <Button variant="outline" onClick={handleLogout} className="border-slate-700 hover:bg-slate-800 hover:text-slate-100">
            Logout
          </Button>
        </div>
      </div>

      <div className="w-full max-w-7xl">
        <div className="flex flex-col items-center mb-12">
           <h1 className="text-4xl font-bold tracking-tight mb-4">Threat Intelligence Platform</h1>
           <p className="text-slate-400">Upload ZScaler logs to detect anomalies.</p>
        </div>

        {logs.length === 0 ? (
           <LogUploader onUploadSuccess={setLogs} />
        ) : (
           <div className="space-y-4">
             <div className="flex justify-between items-center">
               <h2 className="text-xl font-semibold text-slate-200">Live Log Analysis</h2>
               <div className="flex gap-2 items-center">
                 {isAnalyzing && (
                    <span className="text-xs font-mono text-purple-400 animate-pulse mr-2">
                        Analyzing {analyzingIds.size} remaining...
                    </span>
                 )}
                 
                 {isAnalyzing ? (
                    <Button 
                        onClick={handleStopAnalysis} 
                        variant="destructive"
                        className="bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-200"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Stop Analysis
                    </Button>
                 ) : (
                    <Button 
                        onClick={handleAnalyze} 
                        disabled={Object.keys(analysisResults).length > 0}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {Object.keys(analysisResults).length > 0 ? 'Analysis Complete' : 'Analyze Anomalies'}
                    </Button>
                 )}

                 <Button variant="outline" onClick={() => { setLogs([]); setAnalysisResults({}); }} className="border-slate-700 hover:bg-slate-800">
                   Upload New File
                 </Button>
               </div>
             </div>
             <DataTable 
                data={logs} 
                analysisResults={analysisResults} 
                analyzingIds={analyzingIds}
             />
           </div>
        )}
      </div>
    </main>
  );
}
