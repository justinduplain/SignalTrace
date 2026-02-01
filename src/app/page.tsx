'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogUploader } from "@/components/log-uploader"
import { LogEntry } from "@/types/log-entry"
import { DataTable } from "@/components/data-table"
import { AnalysisResult } from "@/types/analysis-result"
import { Sparkles, X } from "lucide-react"
import { logout } from '@/lib/auth'
import { processBlockedLogs, streamAnalysis, getRemediation } from '@/lib/analysis'
import { DashboardStats } from "@/components/dashboard-stats"
import { LogChart } from "@/components/log-chart"

export default function Home() {
  const router = useRouter()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedHour, setSelectedHour] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult>>({})
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set())
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleLogout = () => {
    logout()
    router.push('/login')
    router.refresh()
  }

  const handleStopAnalysis = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
    }
    setIsAnalyzing(false)
    setAnalyzingIds(new Set())
  }

  const handleReset = () => {
    handleStopAnalysis()
    setLogs([])
    setSelectedHour(null)
    setAnalysisResults({})
  }

  const handleAnalyze = async () => {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime())
    const logsToProcess = sortedLogs.slice(0, 200)
    
    // 1. Instant updates for Blocked logs
    const blockedResults = processBlockedLogs(logsToProcess)
    setAnalysisResults(prev => ({ ...prev, ...blockedResults }))

    // 2. Identify allowed logs for AI analysis
    const allowedLogs = logsToProcess.filter(l => l.Action === 'Allow')
    if (allowedLogs.length === 0) return

    setAnalyzingIds(new Set(allowedLogs.map(l => l.id)))
    setIsAnalyzing(true)
    abortControllerRef.current = new AbortController()

    try {
      await streamAnalysis(allowedLogs, {
        signal: abortControllerRef.current.signal,
        onMeta: (data) => {
          if (data.count < allowedLogs.length) {
            setAnalyzingIds(new Set(allowedLogs.slice(0, data.count).map(l => l.id)))
          }
        },
        onResult: (result) => {
          setAnalysisResults(prev => ({ ...prev, [result.id]: result }))
          setAnalyzingIds(prev => {
            const next = new Set(prev)
            next.delete(result.id)
            return next
          })
        }
      })
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Analysis failed:', error)
      }
    } finally {
      setIsAnalyzing(false)
      setAnalyzingIds(new Set())
      abortControllerRef.current = null
    }
  }

  const handleRemediate = async (log: LogEntry) => {
    const reason = analysisResults[log.id]?.reason || ""
    try {
        const remediation = await getRemediation(log, reason)
        setAnalysisResults(prev => ({
            ...prev,
            [log.id]: {
                ...prev[log.id],
                remediation
            }
        }))
    } catch (error) {
        console.error("Remediation failed:", error)
    }
  }

  const filteredLogs = selectedHour 
    ? logs.filter(log => {
        const hour = new Date(log.Timestamp).getHours().toString().padStart(2, '0') + ":00"
        return hour === selectedHour
      })
    : logs

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
             <DashboardStats logs={logs} analysisResults={analysisResults} />
             <LogChart 
                logs={logs} 
                selectedHour={selectedHour}
                onHourSelect={setSelectedHour}
             />
             
             <div className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <h2 className="text-xl font-semibold text-slate-200">
                    {selectedHour ? `Logs for ${selectedHour}` : 'Live Log Analysis'}
                 </h2>
                 {selectedHour && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedHour(null)}
                        className="text-slate-400 hover:text-slate-100 h-8 px-2"
                    >
                        <X className="mr-1 h-3 w-3" />
                        Clear Filter
                    </Button>
                 )}
               </div>
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

                 <Button variant="outline" onClick={handleReset} className="border-slate-700 hover:bg-slate-800">
                   Upload New File
                 </Button>
               </div>
             </div>
             <DataTable 
                data={filteredLogs} 
                analysisResults={analysisResults} 
                analyzingIds={analyzingIds}
                onRemediate={handleRemediate}
             />
           </div>
        )}
      </div>
    </main>
  );
}