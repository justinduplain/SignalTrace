import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { isLogEntry } from '@/types/log-entry';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'zscaler_logs.csv');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Demo file not found" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const result = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    const validEntries = result.data.filter((entry) => isLogEntry(entry));

    return NextResponse.json({ 
      data: validEntries, 
      count: validEntries.length 
    });

  } catch (error) {
    console.error("Demo load error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
