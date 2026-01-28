'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogUploader } from "@/components/log-uploader"
import { LogEntry } from "@/types/log-entry"
import { DataTable } from "@/components/data-table"

export default function Home() {
  const router = useRouter()
  const [logs, setLogs] = useState<LogEntry[]>([])

  const handleLogout = () => {
    document.cookie = "auth=; path=/; max-age=0"
    router.push('/login')
    router.refresh()
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
               <Button variant="outline" onClick={() => setLogs([])} className="border-slate-700 hover:bg-slate-800">
                 Upload New File
               </Button>
             </div>
             <DataTable data={logs} />
           </div>
        )}
      </div>
    </main>
  );
}
