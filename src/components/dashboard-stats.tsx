import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogEntry } from "@/types/log-entry"
import { AnalysisResult } from "@/types/analysis-result"
import { ShieldAlert, ShieldCheck, Activity, HardDriveDownload } from "lucide-react"

interface DashboardStatsProps {
  logs: LogEntry[]
  analysisResults: Record<string, AnalysisResult>
}

export function DashboardStats({ logs, analysisResults }: DashboardStatsProps) {
  const totalEvents = logs.length
  
  const anomalies = Object.values(analysisResults).filter(r => r.confidence > 50).length
  const blockedCount = logs.filter(l => l.Action === 'Block').length
  
  // Calculate total bytes sent for high-confidence anomalies (potential exfiltration)
  const exfiltratedBytes = logs
    .filter(l => {
      const result = analysisResults[l.id]
      return result && result.confidence > 50 && l.Action === 'Allow'
    })
    .reduce((sum, l) => sum + l.BytesSent, 0)

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">
            Total Events
          </CardTitle>
          <Activity className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-100">{totalEvents.toLocaleString()}</div>
          <p className="text-xs text-slate-500">
            Logs ingested
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">
            Critical Anomalies
          </CardTitle>
          <ShieldAlert className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-400">{anomalies}</div>
          <p className="text-xs text-slate-500">
            Requires immediate attention
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">
            Threats Prevented
          </CardTitle>
          <ShieldCheck className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-400">{blockedCount.toLocaleString()}</div>
          <p className="text-xs text-slate-500">
            Blocked by firewall
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">
            Risk Exposure
          </CardTitle>
          <HardDriveDownload className="h-4 w-4 text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-400">{formatBytes(exfiltratedBytes)}</div>
          <p className="text-xs text-slate-500">
            Data involved in anomalies
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
