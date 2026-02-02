import { NextResponse } from 'next/server';
import { generateMockLogs } from '@/lib/generate-logs';

export async function GET() {
  try {
    const logs = generateMockLogs();

    return NextResponse.json({
      data: logs,
      count: logs.length
    });
  } catch (error) {
    console.error("Demo generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
