'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogEntry } from '@/types/log-entry'
import { Loader2 } from 'lucide-react'

interface LogUploaderProps {
  onUploadSuccess: (data: LogEntry[]) => void
}

export function LogUploader({ onUploadSuccess }: LogUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        setError(result?.error || `Upload failed (${response.status})`)
        return
      }
      const result = await response.json()
      if (result.data) {
        onUploadSuccess(result.data)
      } else {
        setError('No valid log entries found in file')
      }
    } catch {
      setError('Upload failed — check your connection and try again')
    } finally {
      setUploading(false)
    }
  }

  const handleLoadDemo = async () => {
    setUploading(true)
    setError(null)
    try {
      const res = await fetch('/api/demo')
      if (!res.ok) {
        setError(`Failed to load demo data (${res.status})`)
        return
      }
      const data = await res.json()
      if (data.data) {
        onUploadSuccess(data.data)
      } else {
        setError('Demo data generation returned no results')
      }
    } catch {
      setError('Failed to load demo data — check your connection and try again')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mb-8 bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-slate-100">Upload Log File</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="bg-slate-950 border-slate-700 text-slate-100 file:bg-slate-800 file:text-slate-100 file:border-0"
        />
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {uploading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Parsing...</>
          ) : (
            'Analyze Logs'
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-500">Or</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleLoadDemo}
          disabled={uploading}
          className="w-full border-slate-700 hover:bg-slate-800 text-slate-300"
        >
          {uploading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</>
          ) : (
            'Load Demo Data'
          )}
        </Button>

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}
