'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogEntry } from "@/types/log-entry"
import { AnalysisResult } from "@/types/analysis-result"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"

interface LogChartProps {
  logs: LogEntry[]
  analysisResults: Record<string, AnalysisResult>
  selectedHour: string | null
  onHourSelect: (hour: string | null) => void
  analyzingCount?: number
}

export function LogChart({ logs, analysisResults, selectedHour, onHourSelect, analyzingCount }: LogChartProps) {
  // Group logs by hour, categorized by AI insight status
  const data = logs.reduce((acc, log) => {
    const date = new Date(log.Timestamp)
    const hour = date.getHours().toString().padStart(2, '0') + ":00"

    if (!acc[hour]) {
      acc[hour] = { name: hour, anomaly: 0, clear: 0, notAnalyzed: 0 }
    }

    const result = analysisResults[log.id]
    if (!result) {
      acc[hour].notAnalyzed++
    } else if (result.confidence > 50) {
      acc[hour].anomaly++
    } else {
      acc[hour].clear++
    }

    return acc
  }, {} as Record<string, { name: string, anomaly: number, clear: number, notAnalyzed: number }>)

  // Convert to array and sort by hour
  const chartData = Object.values(data).sort((a, b) => a.name.localeCompare(b.name))

  const handleClick = (state: unknown) => {
    const s = state as { activeLabel?: string };
    if (s && s.activeLabel) {
        if (selectedHour === s.activeLabel) {
            onHourSelect(null)
        } else {
            onHourSelect(s.activeLabel)
        }
    }
  }

  return (
    <Card className="col-span-4 bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle className="text-slate-200">Traffic Volume</CardTitle>
          {analyzingCount !== undefined && analyzingCount > 0 && (
            <span className="text-xs font-mono text-purple-400 animate-pulse">
              Analyzing {analyzingCount} remaining...
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">Click a bar to filter results</p>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} onClick={handleClick}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                itemStyle={{ color: '#f8fafc' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Bar
              dataKey="notAnalyzed"
              name="Not Analyzed"
              fill="#64748b"
              radius={[0, 0, 0, 0]}
              stackId="a"
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                    key={`cell-na-${index}`}
                    fill="#64748b"
                    opacity={!selectedHour || selectedHour === entry.name ? 1 : 0.3}
                />
              ))}
            </Bar>
            <Bar
              dataKey="clear"
              name="Clear"
              fill="#22c55e"
              radius={[0, 0, 0, 0]}
              stackId="a"
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                    key={`cell-clear-${index}`}
                    fill="#22c55e"
                    opacity={!selectedHour || selectedHour === entry.name ? 1 : 0.3}
                />
              ))}
            </Bar>
            <Bar
              dataKey="anomaly"
              name="Anomaly"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              stackId="a"
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                    key={`cell-anomaly-${index}`}
                    fill="#ef4444"
                    opacity={!selectedHour || selectedHour === entry.name ? 1 : 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
