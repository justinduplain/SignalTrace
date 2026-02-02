import fs from 'fs';
import path from 'path';

const TOTAL_LOGS = 500;
const ANOMALY_COUNT = 50; // Increased for better demo density

const USERS = ['user.7a3f', 'user.b92c', 'user.d41e', 'user.e58a', 'svc.admin', 'user.f10b', 'user.c03d'];
const APPS = ['Google Drive', 'Dropbox', 'Salesforce', 'Zoom', 'Slack', 'GitHub', 'General Browsing', 'Tor Browser'];
const ACTIONS = ['Allow', 'Block'];
const THREATS = ['None', 'Botnet', 'Malware', 'Phishing', 'Cryptomining', 'C2 Server', 'Spyware', 'Ransomware', 'Policy Violation', 'DLP Violation'];
const DOMAINS = ['google.com', 'salesforce.com', 'github.com', 'unknown-host.xy', 'update-win32.com', 'facebook.com'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateIP() {
  return `${getRandomInt(10, 192)}.${getRandomInt(0, 255)}.${getRandomInt(0, 255)}.${getRandomInt(1, 254)}`;
}

function generateTimestamp(hour = null) {
  const date = new Date();
  date.setDate(date.getDate() - 1); // Yesterday
  if (hour !== null) {
    date.setHours(hour);
  } else {
    date.setHours(getRandomInt(8, 18)); // Business hours
  }
  date.setMinutes(getRandomInt(0, 59));
  date.setSeconds(getRandomInt(0, 59));
  return date.toISOString();
}

const logs = [];

// Helper to generate a normal log
function generateNormalLog() {
  let app = getRandomElement(APPS.filter(a => a !== 'Tor Browser')); // Normal traffic rarely uses Tor
  let action = app === 'Google Drive' ? 'Allow' : getRandomElement(ACTIONS);
  let threat = 'None';

  // Smarter Block Logic
  if (action === 'Block') {
     if (app === 'Dropbox') {
         threat = Math.random() > 0.5 ? 'DLP Violation' : 'Policy Violation';
     } else if (['Zoom', 'Slack'].includes(app)) {
         threat = 'Policy Violation'; // Usually allowed, but if blocked, it's policy
     } else if (app === 'General Browsing') {
         // 50% chance it's a real threat, 50% just a forbidden site
         threat = Math.random() > 0.5 ? getRandomElement(THREATS.filter(t => !['None', 'Policy Violation', 'DLP Violation'].includes(t))) : 'Policy Violation';
     }
  } else {
      // Allowed Traffic
      // Small chance of a "Missed" threat (False Negative for human to find)
      if (Math.random() < 0.02) {
          threat = 'Spyware'; // Sneaky
      }
  }

  // Google Drive traffic only during business hours (9-17)
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

// Generate all logs first, then inject anomalies randomly
for (let i = 0; i < TOTAL_LOGS; i++) {
  logs.push(generateNormalLog());
}

// --- Guaranteed Dropbox after-hours exfiltration (always present) ---
const GUARANTEED_DROPBOX_EXFIL = 8;
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

// --- Inject remaining anomalies (malware + shadow IT) at random indices ---
const REMAINING_ANOMALIES = ANOMALY_COUNT - GUARANTEED_DROPBOX_EXFIL;
for (let i = 0; i < REMAINING_ANOMALIES; i++) {
  const randomIndex = getRandomInt(0, TOTAL_LOGS - 1);
  const anomalyType = getRandomInt(1, 2);
  let entry = {};

  if (anomalyType === 1) { // Malware Download (Blocked)
    entry = {
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
  } else { // Shadow IT
    entry = {
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
  logs[randomIndex] = entry;
}

// Sort by Timestamp
logs.sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));

// CSV Header
const header = ['Timestamp', 'SourceIP', 'DestURL', 'Action', 'ThreatCategory', 'BytesSent', 'BytesReceived', 'UserAgent', 'SourceUser', 'AppName'];
const csvContent = [
  header.join(','),
  ...logs.map(log => [
    log.Timestamp,
    log.SourceIP,
    log.DestURL,
    log.Action,
    log.ThreatCategory,
    log.BytesSent,
    log.BytesReceived,
    `"${log.UserAgent}"`, // Quote UserAgent to handle spaces
    log.SourceUser,
    log.AppName
  ].join(','))
].join('\n');

fs.writeFileSync(path.join(process.cwd(), 'zscaler_logs.csv'), csvContent);
console.log(`Generated ${TOTAL_LOGS} logs to zscaler_logs.csv`);
