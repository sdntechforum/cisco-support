#!/usr/bin/env node

/**
 * Test Cisco API credentials and connectivity
 * Usage: node scripts/test-cisco-auth.js
 *        (from project root, with .env configured)
 *
 * Requires: CISCO_CLIENT_ID and CISCO_CLIENT_SECRET in .env
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function testCiscoAuth() {
  console.log('\n🔐 Cisco Support API - Credential Test\n');
  console.log('─'.repeat(50));

  // Step 1: Check env vars
  const clientId = process.env.CISCO_CLIENT_ID;
  const clientSecret = process.env.CISCO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ Missing credentials in .env');
    console.error('   Required: CISCO_CLIENT_ID, CISCO_CLIENT_SECRET');
    console.error('   Check that .env exists and contains these values.');
    process.exit(1);
  }

  if (clientId === 'your_client_id_here' || clientSecret === 'your_client_secret_here') {
    console.error('❌ Placeholder credentials detected');
    console.error('   Replace your_client_id_here and your_client_secret_here with real values.');
    process.exit(1);
  }

  console.log('✅ Credentials found in .env');
  console.log(`   Client ID: ${clientId.substring(0, 8)}...`);

  // Step 2: Get OAuth token
  console.log('\n📡 Requesting OAuth2 token from Cisco (id.cisco.com)...');
  const tokenUrl = 'https://id.cisco.com/oauth2/default/v1/token';
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  let token;
  try {
    const authResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: 'grant_type=client_credentials'
    });

    if (!authResponse.ok) {
      const errText = await authResponse.text();
      console.error(`\n❌ OAuth2 failed (${authResponse.status} ${authResponse.statusText})`);
      console.error('   Response:', errText.substring(0, 300));
      if (authResponse.status === 401) {
        console.error('\n   → Check that Client ID and Client Secret are correct.');
        console.error('   → Ensure the credentials have Bug Search API access.');
      }
      process.exit(1);
    }

    const tokenData = await authResponse.json();
    token = tokenData.access_token;
    if (!token) {
      console.error('❌ No access_token in response');
      process.exit(1);
    }

    console.log('✅ OAuth2 token obtained successfully');
    console.log(`   Expires in: ${tokenData.expires_in || 'N/A'} seconds`);
  } catch (err) {
    console.error('\n❌ OAuth2 request failed:', err.message);
    if (err.cause) console.error('   Cause:', err.cause.message);
    process.exit(1);
  }

  // Step 3: Test Bug API (keyword search: /bugs/keyword/{keyword})
  console.log('\n📡 Testing Bug Search API (apix.cisco.com)...');
  const bugApiUrl = 'https://apix.cisco.com/bug/v2.0/bugs/keyword/Cisco?' + new URLSearchParams({
    modified_date: '1',
    page_index: '1',
    page_size: '2'
  }).toString();

  try {
    const bugResponse = await fetch(bugApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'User-Agent': 'mcp-cisco-support/1.0'
      }
    });

    if (!bugResponse.ok) {
      const errText = await bugResponse.text();
      console.log(`\n❌ Bug API failed (${bugResponse.status}) - ${errText.substring(0, 80)}...`);
      if (bugResponse.status === 403) {
        console.log('   → Bug Search API access may not be enabled for your account.');
      }
    } else {
      const bugData = await bugResponse.json();
      const count = bugData.bugs?.length ?? bugData.total_results ?? 0;
      console.log('✅ Bug API connection successful');
      console.log(`   Retrieved: ${count} bug(s)`);
    }
  } catch (err) {
    console.log('\n❌ Bug API request failed:', err.message);
  }

  // Step 4: Try other APIs (PSIRT, EoX, Product)
  console.log('\n📡 Testing other Cisco APIs...');
  const apis = [
    { name: 'PSIRT (Security Advisories)', url: 'https://apix.cisco.com/security/advisories/v2/latest/5' },
    { name: 'EoX (End of Life)', url: 'https://apix.cisco.com/supporttools/eox/rest/5/EOXByDates/1/2024-01-01/2024-12-31' },
    { name: 'Product Info', url: 'https://apix.cisco.com/product/v1/information/product_ids/C9300-24P?page_index=1' }
  ];

  const working = [];
  for (const api of apis) {
    try {
      const r = await fetch(api.url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (r.ok) {
        console.log(`   ✅ ${api.name}`);
        working.push(api.name);
      } else {
        console.log(`   ❌ ${api.name} (${r.status})`);
      }
    } catch (e) {
      console.log(`   ❌ ${api.name} (${e.message})`);
    }
  }

  console.log('\n' + '─'.repeat(50));
  if (working.length > 0) {
    console.log('✅ Working APIs:', working.join(', '));
    console.log('\n   You can use these via Cisco Support MCP. Set SUPPORT_API=all or include the API names in .env');
  } else {
    console.log('❌ No additional APIs accessible. OAuth works but API access may be restricted.');
  }
  console.log('');
}

testCiscoAuth();
