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

export function isLogEntry(entry: any): entry is Omit<LogEntry, 'id'> {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    typeof entry.Timestamp === 'string' &&
    typeof entry.SourceIP === 'string' &&
    typeof entry.DestURL === 'string' &&
    (entry.Action === 'Allow' || entry.Action === 'Block') &&
    typeof entry.ThreatCategory === 'string' &&
    (typeof entry.BytesSent === 'number' || (typeof entry.BytesSent === 'string' && !isNaN(Number(entry.BytesSent)))) &&
    (typeof entry.BytesReceived === 'number' || (typeof entry.BytesReceived === 'string' && !isNaN(Number(entry.BytesReceived)))) &&
    typeof entry.UserAgent === 'string' &&
    typeof entry.SourceUser === 'string' &&
    typeof entry.AppName === 'string'
  );
}

export function parseBytes(bytes: string | number): number {
    if (typeof bytes === 'number') return bytes;
    return parseInt(bytes, 10);
}
