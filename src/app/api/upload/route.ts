import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { LogEntry, isLogEntry, parseBytes } from '@/types/log-entry';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();

    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: {
        BytesSent: true,
        BytesReceived: true
      },
    });

    if (result.errors.length > 0) {
       console.error("CSV Parsing errors:", result.errors);
    }

    const validEntries: LogEntry[] = [];
    const invalidEntries: any[] = [];

    result.data.forEach((entry: any, index: number) => {
       if (isLogEntry(entry)) {
         const fullEntry: LogEntry = {
            ...entry,
            id: crypto.randomUUID()
         };
         validEntries.push(fullEntry);
       } else {
         invalidEntries.push({ index, entry, reason: "Invalid schema" });
       }
    });

    return NextResponse.json({ 
      data: validEntries, 
      count: validEntries.length,
      invalidCount: invalidEntries.length,
      errors: invalidEntries.length > 0 ? invalidEntries : undefined
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
