#!/usr/bin/env node

/**
 * Fetch latest Cisco security advisories via PSIRT API
 * Usage: node scripts/fetch-psirt-advisories.js [number]
 * Example: node scripts/fetch-psirt-advisories.js 5
 *
 * Requires: CISCO_CLIENT_ID and CISCO_CLIENT_SECRET in .env
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function getToken() {
  const { CISCO_CLIENT_ID, CISCO_CLIENT_SECRET } = process.env;
  if (!CISCO_CLIENT_ID || !CISCO_CLIENT_SECRET) {
    throw new Error('Missing CISCO_CLIENT_ID or CISCO_CLIENT_SECRET in .env');
  }
  const credentials = Buffer.from(`${CISCO_CLIENT_ID}:${CISCO_CLIENT_SECRET}`).toString('base64');
  const r = await fetch('https://id.cisco.com/oauth2/default/v1/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: 'grant_type=client_credentials'
  });
  if (!r.ok) throw new Error(`OAuth failed: ${r.status}`);
  const data = await r.json();
  return data.access_token;
}

async function fetchAdvisories(token, count = 5) {
  const url = `https://apix.cisco.com/security/advisories/v2/latest/${count}`;
  const r = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  if (!r.ok) throw new Error(`PSIRT API failed: ${r.status} ${await r.text()}`);
  return r.json();
}

async function main() {
  const count = parseInt(process.argv[2] || '5', 10) || 5;
  console.log(`\n📡 Fetching latest ${count} Cisco security advisories...\n`);

  const token = await getToken();
  const data = await fetchAdvisories(token, count);

  const advisories = data?.advisories || (data?.advisory ? [data.advisory] : []);
  if (advisories.length === 0) {
    console.log('No advisories found. Raw keys:', Object.keys(data || {}));
    return;
  }

  console.log('─'.repeat(60));
  advisories.forEach((a, i) => {
    if (!a || typeof a !== 'object') return;
    const title = a.advisoryTitle || a.title || 'N/A';
    const id = a.advisoryId || 'N/A';
    const severity = a.sir || a.cvssBaseScore || a.severity || 'N/A';
    const published = a.firstPublished || a.publicationDate || 'N/A';
    const summary = (a.summary || '').replace(/<[^>]+>/g, ' ').trim();
    console.log(`${i + 1}. ${title}`);
    console.log(`   ID: ${id}`);
    console.log(`   Severity: ${severity} | Published: ${published}`);
    if (summary) {
      const s = String(summary);
      console.log(`   Summary: ${s.substring(0, 150)}${s.length > 150 ? '...' : ''}`);
    }
    console.log('');
  });
  console.log('─'.repeat(60));
  console.log(`✅ Retrieved ${advisories.length} advisory(ies)\n`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
