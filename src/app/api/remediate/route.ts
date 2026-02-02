import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { log, reason } = await req.json();
    
    if (!log || !reason) {
      return NextResponse.json({ error: 'Log and reason are required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // --- MOCK MODE ---
    if (!apiKey) {
       console.warn("No OpenAI API Key found. Returning mock remediation.");
       
       await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI thinking

       let remediation = "Standard security response: Reset user credentials and perform a full malware scan on the source workstation.";
       
       if (reason.includes("Shadow IT") || log.AppName === "Tor Browser") {
           remediation = "CRITICAL: Block Tor-related IP ranges at the network perimeter. Update endpoint policy to prevent installation of unauthorized browsers. Interview the user regarding bypass attempts.";
       } else if (reason.includes("Large outbound data transfer")) {
           remediation = `INVESTIGATE: Immediate lockdown of account '${log.SourceUser}'. Review recently modified files in Dropbox. Revoke all active OAuth tokens for this user. Validate if this was a scheduled backup or unauthorized exfiltration.`;
       } else if (reason.includes("Known threat category")) {
           remediation = `ISOLATE: Quarantining source IP ${log.SourceIP} immediately. Update firewall signatures for ${log.DestURL}. Run endpoint detection and response (EDR) deep scan on the affected host.`;
       } else if (reason.includes("Suspicious scripted access")) {
           remediation = "ENFORCE: Update Web Proxy policies to block non-browser User-Agents. Require MFA for all command-line tool access to external resources. Review user's shell history.";
       }

       return NextResponse.json({ remediation });
    }

    // --- REAL AI MODE ---
    const openai = new OpenAI({ apiKey });

    const prompt = `
      You are a Senior Security Incident Responder. 
      Analyze the following security anomaly and provide a concise, actionable 1-2 paragraph remediation plan for a SOC team.
      
      LOG ENTRY:
      ${JSON.stringify(log)}
      
      AI REASONING FOR ANOMALY:
      ${reason}
      
      Provide ONLY the remediation text. No introductory or concluding remarks.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a security expert. Provide actionable remediation steps.' },
        { role: 'user', content: prompt }
      ],
    });

    const remediation = response.choices[0]?.message?.content || "Unable to generate remediation. Follow standard IR protocols.";

    return NextResponse.json({ remediation });

  } catch (error) {
    console.error('Remediation failed:', error);
    return NextResponse.json({ error: 'Remediation failed' }, { status: 500 });
  }
}
