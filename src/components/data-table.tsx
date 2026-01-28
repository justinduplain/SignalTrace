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
import { ArrowUpDown, ShieldAlert, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const columns: ColumnDef<LogEntry>[] = [
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
          {isBlock ? <ShieldAlert className="mr-1 h-3 w-3" /> : <ShieldCheck className="mr-1 h-3 w-3" />}
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
]

export function DataTable({ data }: { data: LogEntry[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  
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
            return (
              <div
                key={row.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex items-center border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
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
  )
}
