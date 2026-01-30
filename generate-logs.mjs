import fs from 'fs';
import path from 'path';

const TOTAL_LOGS = 500;
const ANOMALY_COUNT = 50; // Increased for better demo density

const USERS = ['j.doe', 'a.smith', 'm.chen', 'k.patel', 'sysadmin', 'finance_lead', 'intern_01'];
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
  let action = getRandomElement(ACTIONS);
  let threat = 'None';
  
  // Smarter Block Logic
  if (action === 'Block') {
     if (['Google Drive', 'Dropbox'].includes(app)) {
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

  return {
    Timestamp: generateTimestamp(),
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

// Inject Anomalies at random indices
for (let i = 0; i < ANOMALY_COUNT; i++) {
  const randomIndex = getRandomInt(0, TOTAL_LOGS - 1);
  const anomalyType = getRandomInt(1, 3);
  let entry = {};

  if (anomalyType === 1) { // High Data Exfiltration (Random time)
    entry = {
      Timestamp: generateTimestamp(getRandomInt(0, 23)),
      SourceIP: '10.0.0.55',
      DestURL: 'http://unknown-host.xy/upload',
      Action: 'Allow',
      ThreatCategory: 'None',
      BytesSent: getRandomInt(15000000, 50000000), // Very high
      BytesReceived: getRandomInt(100, 500),
      UserAgent: getRandomElement(['python-requests/2.28.1', 'curl/7.88.1', 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; Zune 4.0)'] ),
      SourceUser: 'finance_lead@tenex.com',
      AppName: 'Dropbox'
    };
  } else if (anomalyType === 2) { // Malware Download (Blocked)
    entry = {
      Timestamp: generateTimestamp(),
      SourceIP: generateIP(),
      DestURL: 'http://update-win32.com/payload.exe',
      Action: 'Block',
      ThreatCategory: 'Malware',
      BytesSent: getRandomInt(100, 500),
      BytesReceived: 0,
      UserAgent: getRandomElement(['Mozilla/5.0 (Windows NT 10.0)', 'Powershell/7.3.4']),
      SourceUser: 'intern_01@tenex.com',
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
      SourceUser: 'm.chen@tenex.com',
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
