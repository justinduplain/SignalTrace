'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogEntry } from "@/types/log-entry"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"

interface LogChartProps {
  logs: LogEntry[]
  selectedHour: string | null
  onHourSelect: (hour: string | null) => void
}

export function LogChart({ logs, selectedHour, onHourSelect }: LogChartProps) {
  // Group logs by hour
  const data = logs.reduce((acc, log) => {
    const date = new Date(log.Timestamp)
    const hour = date.getHours().toString().padStart(2, '0') + ":00"
    
    if (!acc[hour]) {
      acc[hour] = { name: hour, allowed: 0, blocked: 0 }
    }
    
    if (log.Action === 'Allow') {
      acc[hour].allowed++
    } else {
      acc[hour].blocked++
    }
    
    return acc
  }, {} as Record<string, { name: string, allowed: number, blocked: number }>)

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
        <CardTitle className="text-slate-200">Traffic Volume</CardTitle>
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
              dataKey="allowed"
              name="Allowed"
              fill="#adfa1d"
              radius={[4, 4, 0, 0]}
              stackId="a"
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell 
                    key={`cell-allowed-${index}`} 
                    fill="#adfa1d"
                    opacity={!selectedHour || selectedHour === entry.name ? 1 : 0.3}
                />
              ))}
            </Bar>
            <Bar
              dataKey="blocked"
              name="Blocked"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              stackId="a"
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell 
                    key={`cell-blocked-${index}`} 
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
