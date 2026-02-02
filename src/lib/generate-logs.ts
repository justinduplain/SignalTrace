import { LogEntry } from '@/types/log-entry';

const TOTAL_LOGS = 500;
const ANOMALY_COUNT = 50;
const GUARANTEED_DROPBOX_EXFIL = 8;

const USERS = ['user.7a3f', 'user.b92c', 'user.d41e', 'user.e58a', 'svc.admin', 'user.f10b', 'user.c03d'];
const APPS = ['Google Drive', 'Dropbox', 'Salesforce', 'Zoom', 'Slack', 'GitHub', 'General Browsing', 'Tor Browser'];
const ACTIONS: Array<'Allow' | 'Block'> = ['Allow', 'Block'];
const THREATS = ['None', 'Botnet', 'Malware', 'Phishing', 'Cryptomining', 'C2 Server', 'Spyware', 'Ransomware', 'Policy Violation', 'DLP Violation'];
const DOMAINS = ['google.com', 'salesforce.com', 'github.com', 'unknown-host.xy', 'update-win32.com', 'facebook.com'];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateIP(): string {
  return `${getRandomInt(10, 192)}.${getRandomInt(0, 255)}.${getRandomInt(0, 255)}.${getRandomInt(1, 254)}`;
}

function generateTimestamp(hour: number | null = null): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  if (hour !== null) {
    date.setHours(hour);
  } else {
    date.setHours(getRandomInt(8, 18));
  }
  date.setMinutes(getRandomInt(0, 59));
  date.setSeconds(getRandomInt(0, 59));
  return date.toISOString();
}

function generateNormalLog(): Omit<LogEntry, 'id'> {
  const app = getRandomElement(APPS.filter(a => a !== 'Tor Browser'));
  const action: 'Allow' | 'Block' = app === 'Google Drive' ? 'Allow' : getRandomElement(ACTIONS);
  let threat = 'None';

  if (action === 'Block') {
    if (app === 'Dropbox') {
      threat = Math.random() > 0.5 ? 'DLP Violation' : 'Policy Violation';
    } else if (['Zoom', 'Slack'].includes(app)) {
      threat = 'Policy Violation';
    } else if (app === 'General Browsing') {
      threat = Math.random() > 0.5
        ? getRandomElement(THREATS.filter(t => !['None', 'Policy Violation', 'DLP Violation'].includes(t)))
        : 'Policy Violation';
    }
  } else {
    if (Math.random() < 0.02) {
      threat = 'Spyware';
    }
  }

  const hour = app === 'Google Drive' ? getRandomInt(9, 17) : null;

  return {
    Timestamp: generateTimestamp(hour),
    SourceIP: generateIP(),
    DestURL: `https://${getRandomElement(DOMAINS)}/path/to/resource`,
    Action: action,
    ThreatCategory: threat,
    BytesSent: getRandomInt(50, 4000),
    BytesReceived: getRandomInt(200, 20000),
    UserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    SourceUser: `${getRandomElement(USERS)}@tenex.com`,
    AppName: app
  };
}

export function generateMockLogs(): LogEntry[] {
  const logs: Array<Omit<LogEntry, 'id'>> = [];

  for (let i = 0; i < TOTAL_LOGS; i++) {
    logs.push(generateNormalLog());
  }

  // Guaranteed Dropbox after-hours exfiltration
  for (let i = 0; i < GUARANTEED_DROPBOX_EXFIL; i++) {
    const randomIndex = getRandomInt(0, TOTAL_LOGS - 1);
    logs[randomIndex] = {
      Timestamp: generateTimestamp(getRandomInt(1, 4)),
      SourceIP: '10.0.0.55',
      DestURL: 'http://unknown-host.xy/upload',
      Action: 'Allow',
      ThreatCategory: 'None',
      BytesSent: getRandomInt(15000000, 50000000),
      BytesReceived: getRandomInt(100, 500),
      UserAgent: getRandomElement(['python-requests/2.28.1', 'curl/7.88.1', 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; Zune 4.0)']),
      SourceUser: 'user.f10b@tenex.com',
      AppName: 'Dropbox'
    };
  }

  // Remaining anomalies (malware + shadow IT)
  const remaining = ANOMALY_COUNT - GUARANTEED_DROPBOX_EXFIL;
  for (let i = 0; i < remaining; i++) {
    const randomIndex = getRandomInt(0, TOTAL_LOGS - 1);
    const anomalyType = getRandomInt(1, 2);

    if (anomalyType === 1) {
      logs[randomIndex] = {
        Timestamp: generateTimestamp(),
        SourceIP: generateIP(),
        DestURL: 'http://update-win32.com/payload.exe',
        Action: 'Block',
        ThreatCategory: 'Malware',
        BytesSent: getRandomInt(100, 500),
        BytesReceived: 0,
        UserAgent: getRandomElement(['Mozilla/5.0 (Windows NT 10.0)', 'Powershell/7.3.4']),
        SourceUser: 'user.c03d@tenex.com',
        AppName: 'General Browsing'
      };
    } else {
      logs[randomIndex] = {
        Timestamp: generateTimestamp(),
        SourceIP: generateIP(),
        DestURL: 'https://onion.router/hidden',
        Action: 'Allow',
        ThreatCategory: 'None',
        BytesSent: getRandomInt(2000, 5000),
        BytesReceived: getRandomInt(2000, 5000),
        UserAgent: 'Mozilla/5.0 (rv:109.0) Gecko/20100101 Firefox/109.0',
        SourceUser: 'user.d41e@tenex.com',
        AppName: 'Tor Browser'
      };
    }
  }

  // Sort by Timestamp and assign IDs
  logs.sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());

  return logs.map(log => ({
    ...log,
    id: crypto.randomUUID()
  }));
}
