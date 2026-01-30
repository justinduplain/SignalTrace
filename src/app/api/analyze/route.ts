import { NextResponse } from 'next/server';
import { LogEntry } from '@/types/log-entry';
import OpenAI from 'openai';

// Create an OpenAI client instance (edge-friendly if needed, but standard works in Node 18+)
// We initialize it inside the handler or globally if we had a lib file.
// For this single route, we'll instantiate if key exists.

export const runtime = 'nodejs'; // Use nodejs runtime for full stream support if needed, though edge works too.

export async function POST(req: Request) {
  try {
    const { logs } = await req.json();
    
    if (!logs || !Array.isArray(logs)) {
      return NextResponse.json({ error: 'Invalid logs provided' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // --- MOCK MODE (Streaming) ---
    if (!apiKey) {
       const logsToAnalyze = logs.slice(0, 200); // Analyze up to 200 in mock mode
       console.warn("No OpenAI API Key found. Returning mock streaming analysis.");
       
       const encoder = new TextEncoder();
       const stream = new ReadableStream({
         async start(controller) {
           // Send Metadata first
           controller.enqueue(encoder.encode(JSON.stringify({ type: 'meta', count: logsToAnalyze.length }) + '\n'));

           for (const log of logsToAnalyze) {
             // Simulate processing time per log (faster than real AI, but noticeable)
             await new Promise(resolve => setTimeout(resolve, 50)); 

             // Refined Mock Logic v5: Perfectly Aligned with AI Prompt
             const isBlocked = log.Action === 'Block';
             
             // 1. Critical Threats (if Allowed)
             const criticalThreats = ['Malware', 'Botnet', 'Ransomware', 'C2 Server', 'Spyware'];
             const isCritical = criticalThreats.includes(log.ThreatCategory) && !isBlocked; 

             // 2. Shadow IT (if Allowed)
             const isShadowIT = !isBlocked && (log.AppName === 'Tor Browser');

             // 3. Suspicious Patterns (if Allowed)
             const isSuspiciousClient = !isBlocked && (
                log.UserAgent.toLowerCase().includes('python') || 
                log.UserAgent.toLowerCase().includes('curl') || 
                log.UserAgent.toLowerCase().includes('powershell')
             );
             const isHighVolume = !isBlocked && (log.BytesSent > 10000000);
             
             const isAnomaly = isCritical || isShadowIT || isSuspiciousClient || isHighVolume;
             
             const result = {
                 id: log.id,
                 confidence: isAnomaly 
                    ? (isShadowIT ? 100 : isCritical ? 95 : isHighVolume ? 85 : 75) 
                    : 0,
                 reason: isAnomaly 
                    ? (isShadowIT ? 'CRITICAL: Unauthorized Shadow IT application allowed through firewall.' : 
                       isCritical ? `Known threat category (${log.ThreatCategory}) allowed through firewall.` : 
                       isHighVolume ? 'Large outbound data transfer (>10MB) to unverified destination.' :
                       'Suspicious scripted access detected.')
                    : (isBlocked ? 'Threat mitigated by perimeter controls.' : 'Traffic appears normal.')
             };

             // Send NDJSON line
             controller.enqueue(encoder.encode(JSON.stringify(result) + '\n'));
           }
           controller.close();
         }
       });

       return new Response(stream, {
         headers: { 'Content-Type': 'application/x-ndjson' }
       });
    }

    // --- REAL AI MODE (Streaming) ---
    const logsToAnalyze = logs.slice(0, 50); // Limit to 50 for real AI to save costs
    const openai = new OpenAI({ apiKey });

    const prompt = `
      You are a Senior SOC Analyst. Your job is to flag security anomalies in web proxy logs.
      
      OUTPUT FORMAT REQUIREMENT:
      - Return ONLY raw JSON objects separated by newlines (NDJSON).
      - DO NOT use markdown code blocks.
      - DO NOT include any introductory or concluding text.
      - Each line must be a single, valid JSON object.

      Analyze this log entry step-by-step:
      
      STEP 1: CHECK MITIGATION (HIGHEST PRIORITY)
      - If Action is "Block", the threat is MITIGATED.
      - Return { "id": "LOG_ENTRY_ID", "confidence": 0, "reason": "Threat mitigated by perimeter controls." }
      - STOP.

      STEP 2: CHECK SHADOW IT (CRITICAL)
      - If AppName contains "Tor", "BitTorrent", "Psiphon" AND Action is "Allow".
      - Return { "id": "LOG_ENTRY_ID", "confidence": 100, "reason": "CRITICAL: Unauthorized Shadow IT application allowed through firewall." }
      - STOP.

      STEP 3: CHECK DATA EXFILTRATION
      - If BytesSent > 10,000,000 (10MB) AND Action is "Allow".
      - Return { "id": "LOG_ENTRY_ID", "confidence": 85, "reason": "Large outbound data transfer (>10MB) to unverified destination." }
      - STOP.

      STEP 4: CHECK KNOWN THREATS
      - If ThreatCategory is NOT "None" AND Action is "Allow".
      - Return { "id": "LOG_ENTRY_ID", "confidence": 95, "reason": "Known threat category allowed through firewall." }
      - STOP.

      STEP 5: CHECK SUSPICIOUS CLIENTS
      - If UserAgent contains "python", "curl", "powershell" AND Action is "Allow".
      - Return { "id": "LOG_ENTRY_ID", "confidence": 75, "reason": "Suspicious scripted access detected." }
      - STOP.

      DEFAULT:
      - Return { "id": "LOG_ENTRY_ID", "confidence": 0, "reason": "Traffic appears normal." }

      Examples:
      Input: {"id": "LOG_ENTRY_ID", "AppName": "Tor Browser", "Action": "Allow", "BytesSent": 500}
      Output: {"id": "LOG_ENTRY_ID", "confidence": 100, "reason": "CRITICAL: Unauthorized Shadow IT application allowed through firewall."}

      Input: {"id": "LOG_ENTRY_ID", "AppName": "General Browsing", "Action": "Block", "ThreatCategory": "Malware"}
      Output: {"id": "LOG_ENTRY_ID", "confidence": 0, "reason": "Threat mitigated by perimeter controls."}

      Input: {"id": "LOG_ENTRY_ID", "AppName": "Dropbox", "Action": "Block", "BytesSent": 50000000, "ThreatCategory": "DLP Violation"}
      Output: {"id": "LOG_ENTRY_ID", "confidence": 0, "reason": "Threat mitigated by perimeter controls."}

      Input: {"id": "LOG_ENTRY_ID", "AppName": "Dropbox", "Action": "Allow", "BytesSent": 50000000}
      Output: {"id": "LOG_ENTRY_ID", "confidence": 85, "reason": "Large outbound data transfer (>10MB) to unverified destination."}

      Logs to Analyze:
      ${JSON.stringify(logsToAnalyze.map((l: LogEntry) => ({
          id: l.id, 
          Timestamp: l.Timestamp, 
          SourceUser: l.SourceUser,
          SourceIP: l.SourceIP, 
          Action: l.Action, 
          ThreatCategory: l.ThreatCategory, 
          DestURL: l.DestURL, 
          BytesSent: l.BytesSent,
          AppName: l.AppName,
          UserAgent: l.UserAgent
      })))} 
    `;

    const chatStream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a cybersecurity expert. Stream analysis results as NDJSON.' },
        { role: 'user', content: prompt }
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        // Send Metadata first
        controller.enqueue(encoder.encode(JSON.stringify({ type: 'meta', count: logsToAnalyze.length }) + '\n'));

        let buffer = '';

        for await (const chunk of chatStream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            // console.log("Received chunk length:", content.length); // Debug
            buffer += content;
            
            // Try to split by newline and send complete JSON objects
            const lines = buffer.split('\n');
            
            // Keep the last part (potential incomplete JSON) in the buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
               if (line.trim()) {
                 controller.enqueue(encoder.encode(line + '\n'));
               }
            }
          }
        }
        
        // Flush remaining buffer
        if (buffer.trim()) {
          controller.enqueue(encoder.encode(buffer + '\n'));
        }
        
        controller.close();
      }
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'application/x-ndjson' }
    });

  } catch (error) {
    console.error('Analysis failed:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}