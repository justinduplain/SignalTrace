'use client'

import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { LogEntry } from '@/types/log-entry'
import { AnalysisResult } from '@/types/analysis-result'
import { ArrowUpDown, ShieldCheck, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function DataTable({ data, analysisResults, analyzingIds }: { data: LogEntry[], analysisResults?: Record<string, AnalysisResult>, analyzingIds?: Set<string> }) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'Timestamp', desc: true }])
  const [selectedRow, setSelectedRow] = React.useState<LogEntry | null>(null)
  
  const columns = React.useMemo<ColumnDef<LogEntry>[]>(() => [
    {
      id: 'ai_insight',
      accessorFn: (row) => {
          const result = analysisResults?.[row.id];
          if (!result) return 0; // Not Analyzed
          return result.confidence > 50 ? 2 : 1; // Anomaly = 2, Clear = 1
      },
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer hover:text-slate-100"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            AI Insight
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => {
        const result = analysisResults?.[row.original.id]
        const isAnalyzing = analyzingIds?.has(row.original.id)

        if (isAnalyzing) {
             return (
                <div className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20 animate-pulse">
                    SCANNING...
                </div>
            )
        }

        if (result) {
            if (result.confidence > 50) {
                return (
                    <div className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-400/10 text-red-400 ring-1 ring-inset ring-red-400/20">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        ANOMALY
                    </div>
                )
            } else {
                return (
                    <div className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-green-400/10 text-green-400 ring-1 ring-inset ring-green-400/20">
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        CLEAR
                    </div>
                )
            }
        }
        
        return (
            <div className="text-[10px] font-medium text-slate-500 uppercase">
                Not Analyzed
            </div>
        )
      },
      size: 110,
    },
    {
      accessorKey: 'Timestamp',
      header: ({ column }) => {
          return (
            <div
              className="flex items-center cursor-pointer hover:text-slate-100"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Timestamp
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          )
      },
      cell: ({ row }) => <div className="font-mono text-xs text-slate-400">{row.getValue('Timestamp')}</div>,
      size: 180,
    },
    {
      accessorKey: 'SourceUser',
      header: ({ column }) => {
          return (
            <div
              className="flex items-center cursor-pointer hover:text-slate-100"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              User
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          )
      },
      cell: ({ row }) => <div className="text-xs text-slate-300 truncate" title={row.getValue('SourceUser')}>{row.getValue('SourceUser')}</div>,
      size: 140,
    },
    {
      accessorKey: 'SourceIP',
      header: ({ column }) => {
          return (
            <div
              className="flex items-center cursor-pointer hover:text-slate-100"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Source IP
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          )
      },
      cell: ({ row }) => <div className="font-mono text-xs text-blue-400">{row.getValue('SourceIP')}</div>,
      size: 120,
    },
    {
      accessorKey: 'Action',
      header: ({ column }) => {
          return (
            <div
              className="flex items-center cursor-pointer hover:text-slate-100"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          )
      },
      cell: ({ row }) => {
        const action = row.getValue('Action') as string
        const isBlock = action === 'Block'
        return (
          <div className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
            isBlock 
              ? "bg-red-400/10 text-red-400 ring-red-400/20" 
              : "bg-green-400/10 text-green-400 ring-green-400/20"
          )}>
            {action}
          </div>
        )
      },
      size: 90,
    },
    {
      accessorKey: 'AppName',
      header: ({ column }) => {
          return (
            <div
              className="flex items-center cursor-pointer hover:text-slate-100"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              App
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          )
      },
      cell: ({ row }) => <div className="text-xs text-slate-300">{row.getValue('AppName')}</div>,
      size: 110,
    },
    {
      accessorKey: 'ThreatCategory',
      header: ({ column }) => {
          return (
            <div
              className="flex items-center cursor-pointer hover:text-slate-100"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Threat Category
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          )
      },
      cell: ({ row }) => {
          const cat = row.getValue('ThreatCategory') as string
          return (
              <div className={cn("text-xs truncate", cat !== 'None' && "text-orange-300")}>
                  {cat}
              </div>
          )
      },
      size: 130,
    },
    {
      accessorKey: 'DestURL',
      header: ({ column }) => {
          return (
            <div
              className="flex items-center cursor-pointer hover:text-slate-100"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Destination URL
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          )
      },
      cell: ({ row }) => <div className="truncate text-xs text-slate-400" title={row.getValue('DestURL')}>{row.getValue('DestURL')}</div>,
      size: 200,
    },
    {
      accessorKey: 'BytesSent',
      header: ({ column }) => {
          return (
            <div
              className="flex items-center justify-end cursor-pointer hover:text-slate-100"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Sent
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          )
      },
      cell: ({ row }) => <div className="text-right font-mono text-xs text-slate-500">{row.getValue<number>('BytesSent').toLocaleString()}</div>,
      size: 80,
    },
    {
      accessorKey: 'BytesReceived',
      header: ({ column }) => {
          return (
            <div
              className="flex items-center justify-end cursor-pointer hover:text-slate-100"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Recv
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          )
      },
      cell: ({ row }) => <div className="text-right font-mono text-xs text-slate-500">{row.getValue<number>('BytesReceived').toLocaleString()}</div>,
      size: 80,
    },
  ], [analysisResults, analyzingIds])

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  const { rows } = table.getRowModel()

  const parentRef = React.useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35, // Estimate row height
    overscan: 10,
  })

  return (
    <>
      <div className="rounded-md border border-slate-800 bg-slate-900/50">
        <div className="flex items-center p-2 border-b border-slate-800 bg-slate-900 text-xs font-medium text-slate-400 uppercase tracking-wider">
          {table.getFlatHeaders().map((header) => {
              const size = header.column.columnDef.size
              const style = size ? { width: size, minWidth: size, flex: 'none' } : { flex: 1, minWidth: 200 }
              
              return (
                  <div key={header.id} style={style} className="px-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
              )
          })}
        </div>

        <div 
          ref={parentRef} 
          className="h-[600px] overflow-auto relative"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              const anomaly = analysisResults?.[row.original.id]
              const isAnomaly = !!anomaly

              return (
                <div
                  key={row.id}
                  onClick={() => setSelectedRow(row.original)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className={cn(
                    "flex items-center border-b border-slate-800/50 transition-colors cursor-pointer",
                    isAnomaly ? "bg-red-950/20 hover:bg-red-900/30" : "hover:bg-slate-800/30",
                    selectedRow?.id === row.original.id ? "bg-slate-800" : ""
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                      const size = cell.column.columnDef.size
                      const style = size ? { width: size, minWidth: size, flex: 'none' } : { flex: 1, minWidth: 200 }
                      
                      return (
                          <div key={cell.id} style={style} className="px-2 overflow-hidden">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                      )
                  })}
                </div>
              )
            })}
          </div>
        </div>
        <div className="p-2 border-t border-slate-800 text-xs text-slate-500 bg-slate-900">
            Total Rows: {data.length.toLocaleString()}
        </div>
      </div>

      {selectedRow && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" 
            onClick={() => setSelectedRow(null)}
        >
            <div 
                className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
                    <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                        Log Details
                        <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{selectedRow.id}</span>
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedRow(null)} className="h-8 w-8 hover:bg-slate-800">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* AI Analysis Section - Now at the top */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center justify-center gap-2">
                            AI Analysis
                            {analysisResults?.[selectedRow.id] && (
                                <span className="bg-purple-900/30 text-purple-300 text-[10px] px-2 py-0.5 rounded-full border border-purple-800/50">
                                    GPT-4o
                                </span>
                            )}
                        </h4>
                        
                        {analysisResults?.[selectedRow.id] ? (
                            analysisResults[selectedRow.id].confidence > 50 ? (
                                // ANOMALY UI (Red)
                                <div className="max-w-xl mx-auto bg-red-950/20 border border-red-900/30 rounded-lg p-6 space-y-4">
                                    <div className="flex items-center justify-center gap-2 text-red-400 font-semibold text-lg">
                                        <AlertTriangle className="h-6 w-6" />
                                        Anomaly Detected
                                    </div>
                                    <div className="space-y-1 text-center">
                                        <div className="text-xs text-slate-500 uppercase tracking-tight">Reasoning</div>
                                        <p className="text-slate-200 text-base leading-relaxed">
                                            {analysisResults[selectedRow.id].reason}
                                        </p>
                                    </div>
                                    <div className="space-y-2 max-w-sm mx-auto">
                                        <div className="flex justify-between text-xs text-slate-500 uppercase tracking-tight">
                                            <span>Confidence Score</span>
                                            <span className="font-mono text-red-400">
                                                {analysisResults[selectedRow.id].confidence}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-red-500 rounded-full" 
                                                style={{ width: `${analysisResults[selectedRow.id].confidence}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // CLEAR UI (Green) - New State for "Analyzed but Clear"
                                <div className="max-w-xl mx-auto bg-green-950/20 border border-green-900/30 rounded-lg p-6 space-y-4">
                                    <div className="flex items-center justify-center gap-2 text-green-400 font-semibold text-lg">
                                        <ShieldCheck className="h-6 w-6" />
                                        Activity Verified Clear
                                    </div>
                                    <div className="space-y-1 text-center">
                                        <div className="text-xs text-slate-500 uppercase tracking-tight">Reasoning</div>
                                        <p className="text-slate-200 text-base leading-relaxed">
                                            {analysisResults[selectedRow.id].reason}
                                        </p>
                                    </div>
                                    <div className="space-y-2 max-w-sm mx-auto">
                                        <div className="flex justify-between text-xs text-slate-500 uppercase tracking-tight">
                                            <span>Risk Score</span>
                                            <span className="font-mono text-green-400">
                                                {analysisResults[selectedRow.id].confidence}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-green-500 rounded-full" 
                                                style={{ width: `0%` }} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="max-w-xl mx-auto flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-lg p-8">
                                <ShieldCheck className="h-8 w-8 mb-2 opacity-50 text-slate-500" />
                                <p className="text-sm text-center">No analysis run for this entry.</p>
                            </div>
                        )}
                    </div>

                    {/* Raw Data Section - Now underneath */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider text-center">Raw Log Data</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-950/50 p-6 rounded-lg border border-slate-800/50">
                            <div className="space-y-1">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Timestamp</div>
                                <div className="text-sm text-slate-200 font-mono bg-slate-900/50 px-2 py-1 rounded border border-slate-800">{selectedRow.Timestamp}</div>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Source IP</div>
                                <div className="text-sm text-blue-400 font-mono bg-slate-900/50 px-2 py-1 rounded border border-slate-800">{selectedRow.SourceIP}</div>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">User</div>
                                <div className="text-sm text-slate-200 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">{selectedRow.SourceUser}</div>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Action</div>
                                <div className={cn(
                                    "text-sm font-semibold px-2 py-1 rounded border", 
                                    selectedRow.Action === 'Block' 
                                        ? "text-red-400 bg-red-400/5 border-red-400/20" 
                                        : "text-green-400 bg-green-400/5 border-green-400/20"
                                )}>{selectedRow.Action}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">App Name</div>
                                <div className="text-sm text-slate-200 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">{selectedRow.AppName}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Bytes Sent</div>
                                <div className="text-sm text-slate-300 font-mono bg-slate-900/50 px-2 py-1 rounded border border-slate-800">{selectedRow.BytesSent.toLocaleString()}</div>
                            </div>

                            <div className="sm:col-span-2 lg:col-span-3 space-y-1">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Destination URL</div>
                                <div className="text-sm text-slate-400 break-all font-mono bg-slate-900/50 px-2 py-1 rounded border border-slate-800">{selectedRow.DestURL}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  )
}
