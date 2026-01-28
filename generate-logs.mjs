import fs from 'fs';
import path from 'path';

const TOTAL_LOGS = 500;
const ANOMALY_COUNT = 30;

const USERS = ['j.doe', 'a.smith', 'm.chen', 'k.patel', 'sysadmin', 'finance_lead', 'intern_01'];
const APPS = ['Google Drive', 'Dropbox', 'Salesforce', 'Zoom', 'Slack', 'GitHub', 'General Browsing', 'Tor Browser'];
const ACTIONS = ['Allow', 'Block'];
const THREATS = ['None', 'Botnet', 'Malware', 'Phishing', 'Cryptomining'];
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

// Generate Normal Traffic
for (let i = 0; i < TOTAL_LOGS - ANOMALY_COUNT; i++) {
  logs.push({
    Timestamp: generateTimestamp(),
    SourceIP: generateIP(),
    DestURL: `https://${getRandomElement(DOMAINS)}/path/to/resource`,
    Action: getRandomElement(ACTIONS),
    ThreatCategory: 'None',
    BytesSent: getRandomInt(100, 5000),
    BytesReceived: getRandomInt(500, 50000),
    UserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    SourceUser: `${getRandomElement(USERS)}@tenex.com`,
    AppName: getRandomElement(APPS.filter(a => a !== 'Tor Browser'))
  });
}

// Generate Anomalies
for (let i = 0; i < ANOMALY_COUNT; i++) {
  const anomalyType = getRandomInt(1, 3);
  let entry = {};

  if (anomalyType === 1) { // High Data Exfiltration at 3 AM
    entry = {
      Timestamp: generateTimestamp(3),
      SourceIP: '10.0.0.55', // Suspicious internal IP
      DestURL: 'http://unknown-host.xy/upload',
      Action: 'Allow',
      ThreatCategory: 'None', // Often undetected initially
      BytesSent: getRandomInt(1000000, 50000000), // Huge upload
      BytesReceived: getRandomInt(100, 500),
      UserAgent: 'python-requests/2.28.1',
      SourceUser: 'finance_lead@tenex.com', // Compromised account?
      AppName: 'Dropbox'
    };
  } else if (anomalyType === 2) { // Malware Download
    entry = {
      Timestamp: generateTimestamp(),
      SourceIP: generateIP(),
      DestURL: 'http://update-win32.com/payload.exe',
      Action: 'Block',
      ThreatCategory: 'Malware',
      BytesSent: getRandomInt(100, 500),
      BytesReceived: 0, // Blocked
      UserAgent: 'Mozilla/5.0 (Windows NT 10.0)',
      SourceUser: 'intern_01@tenex.com',
      AppName: 'General Browsing'
    };
  } else { // Shadow IT / Policy Violation
    entry = {
      Timestamp: generateTimestamp(),
      SourceIP: generateIP(),
      DestURL: 'https://onion.router/hidden',
      Action: 'Allow',
      ThreatCategory: 'None',
      BytesSent: getRandomInt(2000, 5000),
      BytesReceived: getRandomInt(2000, 5000),
      UserAgent: 'Mozilla/5.0 (rv:109.0)',
      SourceUser: 'm.chen@tenex.com',
      AppName: 'Tor Browser'
    };
  }
  logs.push(entry);
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
