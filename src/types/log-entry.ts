export interface LogEntry {
  Timestamp: string;
  SourceIP: string;
  DestURL: string;
  Action: 'Allow' | 'Block';
  ThreatCategory: string;
  BytesSent: number;
  UserAgent: string;
}

export function isLogEntry(entry: any): entry is LogEntry {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    typeof entry.Timestamp === 'string' &&
    typeof entry.SourceIP === 'string' &&
    typeof entry.DestURL === 'string' &&
    (entry.Action === 'Allow' || entry.Action === 'Block') &&
    typeof entry.ThreatCategory === 'string' &&
    (typeof entry.BytesSent === 'number' || (typeof entry.BytesSent === 'string' && !isNaN(Number(entry.BytesSent)))) &&
    typeof entry.UserAgent === 'string'
  );
}

export function parseBytes(bytes: string | number): number {
    if (typeof bytes === 'number') return bytes;
    return parseInt(bytes, 10);
}
