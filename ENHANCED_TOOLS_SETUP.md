# Cisco Support MCP: Enhanced Tools & Resources Setup Guide

This guide documents how we increased the number of available tools from 6 to 14, and enabled 2 MCP resources. It is written for readers with limited software development experience.

---

## Table of Contents

1. [What We Achieved](#what-we-achieved)
2. [Understanding the Cisco Support MCP Server](#understanding-the-cisco-support-mcp-server)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Configuration](#step-by-step-configuration)
5. [Credential Testing](#credential-testing)
6. [Helper Scripts We Created](#helper-scripts-we-created)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)
9. [Summary Checklist](#summary-checklist)

---

## What We Achieved

| Before | After |
|--------|-------|
| **6 tools** (Enhanced Analysis only) | **14 tools** (Enhanced Analysis + PSIRT) |
| **0 resources** | **2 resources** (Recent & Critical Security Advisories) |

### The 14 Tools Now Available

**Enhanced Analysis (6 tools):**
- `smart_search_strategy` – Suggests optimal search approaches for finding bugs
- `progressive_bug_search` – Tries multiple search strategies automatically
- `multi_severity_search` – Searches multiple severity levels and combines results
- `comprehensive_analysis` – Full product analysis with bug search and web guidance
- `compare_software_versions` – Compares bugs across software versions
- `product_name_resolver` – Converts product IDs to full names

**PSIRT / Security Advisories (8 tools):**
- `get_all_security_advisories` – All published advisories with pagination
- `get_security_advisory_by_id` – Specific advisory by ID (e.g., cisco-sa-20180221-ucdm)
- `get_security_advisory_by_cve` – Advisory by CVE (e.g., CVE-2026-20079)
- `get_security_advisories_by_severity` – Filter by critical, high, medium, low
- `get_security_advisory_by_bug_id` – Advisory by Cisco Bug ID
- `get_latest_security_advisories` – Latest N advisories
- `get_security_advisories_by_year` – Advisories published in a specific year
- `get_security_advisories_by_first_published` – Advisories by date range

### The 2 Resources

- **Recent Security Advisories** – Latest 20 security advisories from Cisco PSIRT
- **Critical Security Advisories** – Critical severity security advisories

---

## Understanding the Cisco Support MCP Server

### What is an MCP Server?

**MCP** stands for **Model Context Protocol**. It is a standard that lets AI assistants (like Cursor) connect to external services. The Cisco Support MCP server connects Cursor to Cisco’s support APIs.

### What is a “Tool”?

A **tool** is a function the AI can call. For example, when you ask “What’s the latest Cisco security advisory?”, the AI can call the `get_latest_security_advisories` tool to get real data.

### What is a “Resource”?

A **resource** is a data source the AI can read. Resources use URIs (addresses) like `cisco://security/advisories/recent`. The AI can fetch these directly without needing to know which tool to call.

### What is SUPPORT_API?

The Cisco Support MCP server can connect to several Cisco APIs:

| API Name | What It Does | Tools Count |
|----------|--------------|-------------|
| `enhanced_analysis` | Bug search with smart strategies | 6 |
| `bug` | Direct Bug Search API | 14 |
| `psirt` | Security Advisories (CVEs, etc.) | 8 |
| `eox` | End-of-Life product info | 4 |
| `product` | Product catalog | 3 |
| `case` | Support cases | 4 |
| `software` | Software releases | 6 |
| `serial` | Serial number lookup | 3 |
| `rma` | RMA (returns) | 3 |

**Important:** Your Cisco API access determines which APIs work. Not all accounts have access to all APIs. We verified that your account has **PSIRT** access but not Bug Search, EoX, or Product APIs.

---

## Prerequisites

Before making changes, ensure you have:

1. **Node.js** installed (version 18 or higher). Check with: `node --version`
2. **Cisco API credentials** – Client ID and Client Secret from the [Cisco API Console](https://apiconsole.cisco.com/)
3. **Cisco Support MCP** installed and configured in Cursor (see the main README)

---

## Step-by-Step Configuration

### Step 1: Locate the Configuration File

The configuration is stored in a file named `.env` inside the Cisco Support MCP project folder.

**Typical path:**  
`/Users/your-username/MCP/mcp-cisco-support/.env`

If the file does not exist, copy it from the example:

```bash
cd /Users/your-username/MCP/mcp-cisco-support
cp .env.example .env
```

### Step 2: Add Your Cisco API Credentials

Open `.env` in a text editor and set:

```
CISCO_CLIENT_ID=your_actual_client_id_here
CISCO_CLIENT_SECRET=your_actual_client_secret_here
```

**Where to get these:**
1. Go to [Cisco API Console](https://apiconsole.cisco.com/)
2. Sign in with your Cisco account
3. Create or select an application
4. Enable the **PSIRT** (Security Advisories) API
5. Copy the Client ID and Client Secret

**Security:** Never share these values or commit them to version control.

### Step 3: Enable Additional APIs

Find the line that says:

```
SUPPORT_API=enhanced_analysis
```

Change it to:

```
SUPPORT_API=psirt,enhanced_analysis
```

**What this does:**
- `enhanced_analysis` – Keeps the 6 enhanced analysis tools
- `psirt` – Adds the 8 PSIRT tools and 2 resources

**Other examples:**
- `SUPPORT_API=psirt` – Only PSIRT tools (8 tools, 2 resources)
- `SUPPORT_API=all` – All APIs your account can access (may fail for APIs you don’t have)

### Step 4: Save the File

Save `.env` and close the editor.

### Step 5: Restart Cursor

The MCP server reads the configuration when it starts. To apply changes:

1. Fully quit Cursor (Cmd+Q on Mac, or File → Exit)
2. Reopen Cursor
3. Open a project that uses the Cisco Support MCP

Alternatively, use **Developer: Reload Window** from the Command Palette (Cmd+Shift+P).

---

## Credential Testing

Before relying on the MCP in Cursor, it helps to verify that your credentials work.

### Test Script: `test-cisco-auth.js`

This script checks:

1. **Credentials** – Are they present in `.env`?
2. **OAuth2** – Can we get a token from Cisco?
3. **Bug API** – Do we have Bug Search access?
4. **PSIRT API** – Do we have Security Advisories access?
5. **EoX API** – Do we have End-of-Life access?
6. **Product API** – Do we have Product catalog access?

**How to run:**

```bash
cd /Users/your-username/MCP/mcp-cisco-support
node scripts/test-cisco-auth.js
```

**Example output (success):**

```
🔐 Cisco Support API - Credential Test
──────────────────────────────────────────────────
✅ Credentials found in .env
✅ OAuth2 token obtained successfully
❌ Bug API failed (403) - Developer Inactive
   ✅ PSIRT (Security Advisories)
   ❌ EoX (End of Life) (403)
   ❌ Product Info (403)
──────────────────────────────────────────────────
✅ Working APIs: PSIRT (Security Advisories)
```

This tells you which APIs you can use. In the example, only PSIRT works, so we enabled `psirt` in `SUPPORT_API`.

---

## Helper Scripts We Created

### 1. `scripts/test-cisco-auth.js`

**Purpose:** Verify Cisco API credentials and list which APIs are accessible.

**Usage:**
```bash
node scripts/test-cisco-auth.js
```

**When to use:** After changing credentials or when tools return no data.

---

### 2. `scripts/fetch-psirt-advisories.js`

**Purpose:** Fetch the latest Cisco security advisories from the command line without using Cursor.

**Usage:**
```bash
node scripts/fetch-psirt-advisories.js 5   # Fetch 5 advisories (default)
node scripts/fetch-psirt-advisories.js 10  # Fetch 10 advisories
```

**When to use:** Quick sanity check that PSIRT works, or to get advisories without opening Cursor.

**Example output:**
```
📡 Fetching latest 5 Cisco security advisories...

1. Cisco Catalyst SD-WAN Vulnerabilities
   ID: cisco-sa-sdwan-authbp-qwCX8D4v
   Severity: Critical | Published: 2026-02-26

2. Cisco Secure Firewall ASA/FTD IKEv2 Denial of Service
   ...
```

---

## Verification

### In Cursor

1. Open Cursor and open a project.
2. Open the chat or start a new conversation.
3. Ask: *"List the latest security advisories from Cisco."*
4. The AI should use the `get_latest_security_advisories` tool to answer.

### Check MCP Server Status

In Cursor:

1. Open **Settings** (Cmd+,)
2. Go to **MCP** or **Features → MCP**
3. Find **cisco-support** in the list
4. Confirm it shows as connected and lists 14 tools and 2 resources

---

## Troubleshooting

### “Tool not found” when calling a PSIRT tool

**Cause:** Cursor is still using an old MCP server instance.

**Fix:** Restart Cursor completely (quit and reopen). Then try again.

---

### All tools return 0 results or empty data

**Cause:** Credentials may be wrong, or the API is not enabled for your account.

**Fix:**
1. Run `node scripts/test-cisco-auth.js`
2. Check which APIs show as working
3. If PSIRT fails, verify your Cisco API Console credentials and that PSIRT is enabled for your app

---

### “Developer Inactive” or 403 Forbidden

**Cause:** Your Cisco API account does not have access to that API.

**Fix:** In the [Cisco API Console](https://apiconsole.cisco.com/), enable the APIs you need (e.g., PSIRT) for your application. Some APIs require approval or a specific contract.

---

### `.env` changes not taking effect

**Cause:** The MCP server is started when Cursor starts and keeps the old config.

**Fix:** Restart Cursor completely. Do not rely on “Reload Window” alone; fully quit and reopen.

---

## Summary Checklist

Use this checklist to confirm everything is set up correctly:

- [ ] `.env` file exists in `mcp-cisco-support` folder
- [ ] `CISCO_CLIENT_ID` and `CISCO_CLIENT_SECRET` are set in `.env`
- [ ] `SUPPORT_API=psirt,enhanced_analysis` in `.env`
- [ ] `node scripts/test-cisco-auth.js` runs and shows PSIRT as working
- [ ] `node scripts/fetch-psirt-advisories.js 5` returns advisories
- [ ] Cursor has been restarted after changing `.env`
- [ ] Cursor MCP settings show cisco-support with 14 tools and 2 resources
- [ ] A test query like “List latest Cisco security advisories” works in chat

---

## File Reference

| File | Purpose |
|------|---------|
| `.env` | Configuration file (credentials, SUPPORT_API) |
| `scripts/test-cisco-auth.js` | Test credentials and API access |
| `scripts/fetch-psirt-advisories.js` | Fetch advisories from command line |
| `ENHANCED_TOOLS_SETUP.md` | This guide |

---

## Additional Resources

- [Cisco API Console](https://apiconsole.cisco.com/) – Manage API credentials
- [Cisco PSIRT OpenVuln API](https://developer.cisco.com/docs/cisco-security-advisories/) – API documentation
- [Cisco Support MCP GitHub](https://github.com/sieteunoseis/mcp-cisco-support) – Project source and docs
