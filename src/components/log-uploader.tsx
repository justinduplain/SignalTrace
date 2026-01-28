'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogEntry } from '@/types/log-entry'

interface LogUploaderProps {
  onUploadSuccess: (data: LogEntry[]) => void
}

export function LogUploader({ onUploadSuccess }: LogUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      if (result.data) {
        onUploadSuccess(result.data)
      }
    } catch (error) {
      console.error("Upload failed", error)
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
          {uploading ? 'Parsing...' : 'Analyze Logs'}
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
          onClick={async () => {
            setUploading(true)
            try {
              const res = await fetch('/api/demo')
              const data = await res.json()
              if (data.data) onUploadSuccess(data.data)
            } catch (e) {
              console.error(e)
            } finally {
              setUploading(false)
            }
          }}
          disabled={uploading}
          className="w-full border-slate-700 hover:bg-slate-800 text-slate-300"
        >
          Load Demo Data
        </Button>
      </CardContent>
    </Card>
  )
}
