export interface LogEntry {
  id: string;
  Timestamp: string;
  SourceIP: string;
  DestURL: string;
  Action: 'Allow' | 'Block';
  ThreatCategory: string;
  BytesSent: number;
  BytesReceived: number;
  UserAgent: string;
  SourceUser: string;
  AppName: string;
}

export function isLogEntry(entry: unknown): entry is Omit<LogEntry, 'id'> {
  const e = entry as Record<string, unknown>; 
  return (
    typeof e === 'object' &&
    e !== null &&
    typeof e.Timestamp === 'string' &&
    typeof e.SourceIP === 'string' &&
    typeof e.DestURL === 'string' &&
    (e.Action === 'Allow' || e.Action === 'Block') &&
    typeof e.ThreatCategory === 'string' &&
    (typeof e.BytesSent === 'number' || (typeof e.BytesSent === 'string' && !isNaN(Number(e.BytesSent)))) &&
    (typeof e.BytesReceived === 'number' || (typeof e.BytesReceived === 'string' && !isNaN(Number(e.BytesReceived)))) &&
    typeof e.UserAgent === 'string' &&
    typeof e.SourceUser === 'string' &&
    typeof e.AppName === 'string'
  );
}

export function parseBytes(bytes: string | number): number {
    if (typeof bytes === 'number') return bytes;
    return parseInt(bytes, 10);
}
