# Cisco Support MCP Server — Prompt Library

## Tool Domain Map

The Cisco Support MCP server wraps Cisco's official Support APIs with OAuth2 authentication, structured JSON responses, and guided elicitation workflows. Each API group can be enabled independently: [developer.cisco](https://developer.cisco.com/codeexchange/github/repo/sieteunoseis/mcp-cisco-support/)

| API Group | Tools | Scope |
|---|---|---|
| **Bug API** | `search_bugs_by_keyword`, `search_bugs_by_product`, `search_bugs_by_version`, `get_bug_details`, `get_bugs_by_id`, `search_bugs_enhanced`, `analyze_bugs_for_upgrade`, `bug_impact_analysis` | 14 tools |
| **Case API** | `get_case_details`, `get_cases_by_contract`, `create_case`, `update_case` | 4 tools |
| **EoX API** | `get_eox_by_product_id`, `get_eox_by_serial_numbers`, `get_eox_by_software_release`, `get_eox_by_date_range` | 4 tools |
| **PSIRT API** | `get_advisories_by_cve`, `get_advisories_by_product`, `get_advisories_by_version`, `get_advisory_detail`, `get_all_critical_advisories`, `get_advisories_by_severity`, `get_latest_advisories`, `get_advisories_by_year` | 8 tools |
| **Product API** | `get_product_information`, `get_product_by_mdf_id`, `get_compatible_components`, `get_product_images` | 4 tools |
| **Software API** | `get_software_suggestions`, `get_suggested_release`, `get_software_by_mdf_id`, `validate_software_compatibility` | 4 tools |
| **Serial API** | `get_coverage_by_serial`, `get_owner_coverage`, `get_contract_by_serial`, `get_warranty_by_serial` | 4 tools |
| **RMA API** | `create_rma`, `get_rma_status`, `get_rma_by_case`, `update_rma` | 4 tools |
| **Enhanced Analysis** | `comprehensive_bug_analysis`, `upgrade_readiness_report`, `vulnerability_impact_report`, `lifecycle_risk_report`, `contract_coverage_audit`, `fleet_health_summary` | 6 tools |

***

## 🐛 Category 1 — Bug Research & Investigation

For **NOC Engineers, TAC Liaisons, and Network Operations Teams** researching known defects before and during incidents.

1. **"Search for all known bugs affecting Cisco IOS-XE version `17.9.4a` on the Catalyst 9300 platform. Filter for bugs with severity 1 and 2 only. Return bug ID, headline, affected releases, fixed releases, and workaround status."**

2. **"I am seeing `%OSPF-5-ADJCHG: Process 1, Nbr 10.0.0.1 on GigabitEthernet0/0 from LOADING to FULL` followed immediately by neighbor drops. Search the Cisco bug database for keywords `OSPF adjacency drop IOS-XE` and return the top 10 matching bugs — show bug ID, severity, status, and affected version ranges."**

3. **"Get the full details for Cisco bug `CSCwb12345`. Show the headline, description, symptoms, conditions, workaround, affected releases, fixed releases, and last modified date."**

4. **"We are planning an upgrade from IOS-XE `17.6.5` to `17.12.3` on Catalyst 9500 switches. Search for all open severity 1–3 bugs in the target release `17.12.3` that affect the 9500 platform. Give me a pre-upgrade bug risk assessment."**

5. **"Search for bugs matching the symptom `memory leak` in NX-OS versions `10.2.x` on Nexus 9000 series. Show bugs that are still `Open` or `Resolved` — include any bugs that were resolved in a specific maintenance release so I know the minimum safe version."**

6. **"Run an enhanced bug analysis for Cisco Catalyst Center version `2.3.7.6`. Identify all known bugs affecting the assurance and telemetry subsystems specifically. Rank results by severity and show which bugs have active workarounds versus requiring a code upgrade."**

7. **"I have a ticket where a Nexus 9000 is experiencing `%ETHPORT-5-IF_DOWN_CHANNEL_MEMBERSHIP_UPDATE_FAILURE` errors causing port-channel flaps. Search the bug database for this exact syslog message and return all matching bugs with their status and fix versions."**

***

## 🔒 Category 2 — PSIRT Security Advisory Management

For **Security Teams, Vulnerability Management, and CISO Organizations** tracking Cisco CVEs and security advisories.

8. **"What is the Cisco PSIRT advisory for `CVE-2025-20188`? Return the full advisory detail — affected products, CVSS score, attack vector, impact description, fixed software releases, and any available workarounds."**

9. **"Get all current Cisco PSIRT advisories with a CVSS score of 9.0 or above (Critical severity). List them by CVSS score descending — show advisory ID, CVE ID, affected product families, and publication date."**

10. **"Search for all Cisco PSIRT advisories affecting IOS-XE version `17.9.x`. Show the advisory title, CVE IDs, CVSS score, and whether the fixed release is available. I need this for a patch prioritization report."**

11. **"Search for all Cisco PSIRT advisories published in 2025 that affect the Firepower Threat Defense (FTD) platform. Group by severity (Critical, High, Medium) and show which ones have patches available versus only workarounds."**

12. **"Our security team has been notified of `CVE-2025-54321` affecting network infrastructure. Run a PSIRT advisory lookup for this CVE — show which Cisco products are affected and whether our deployed versions of IOS-XE `17.12.3`, NX-OS `10.3.3`, and FTD `7.4.1` are vulnerable."**

13. **"Get all Cisco PSIRT advisories from the last 90 days that affect Nexus 9000 series switches. Show advisory title, CVSS score, affected NX-OS versions, and recommended fixed versions. Rank by CVSS score."**

14. **"Pull the latest 20 Cisco PSIRT advisories regardless of product. I want a running view of what Cisco has published most recently — show the advisory ID, title, severity, affected products, and publication date in a table."**

15. **"Generate a vulnerability impact report for our entire Cisco infrastructure: IOS-XE `17.9.4a` (Catalyst switches), NX-OS `10.2.3` (Nexus 9000), FTD `7.2.5` (Firepower), and APIC `6.0.3` (ACI). Use the PSIRT API to check each version and return a consolidated exposure summary ranked by CVSS score."**

***

## 📅 Category 3 — End-of-Life & Lifecycle Planning (EoX)

For **IT Asset Managers, Network Architects, and Procurement Teams** planning hardware and software refresh cycles.

16. **"Get the End-of-Life information for Cisco product ID `WS-C3850-48P-S`. Show the End-of-Sale date, End-of-Software Maintenance date, End-of-Security Vulnerability Support date, End-of-Support date, and the recommended replacement product."**

17. **"Look up EoX data for the following serial numbers from our inventory: `FDO2049A0BC`, `FDO2049A0BD`, `FDO2049A0BE`. For each device, show the product ID, EoX milestone dates, and days remaining until End-of-Support. Flag any device with less than 365 days of support remaining."**

18. **"What is the End-of-Life status for Cisco IOS-XE software release `16.12.x`? Show the End-of-Maintenance Engineering date, End-of-Bug Fix date, and the recommended migration release for customers still running this version."**

19. **"Get all Cisco products that reached End-of-Sale between January 2024 and December 2025. Filter for Nexus 9000 and Catalyst 9000 series products only. Show product ID, product name, End-of-Sale date, and successor product — I need this for our 3-year refresh plan."**

20. **"Generate a full lifecycle risk report for our network infrastructure. Use the EoX API to check the lifecycle status of: Catalyst 9200 (C9200-48P), Catalyst 9300 (C9300-48U), Nexus 93180YC-FX (N9K-C93180YC-FX), and ASR 1001-X (ASR1001-X). Show all EoX dates and flag any product within 18 months of End-of-Support."**

***

## 📦 Category 4 — Software Recommendations & Upgrade Planning

For **Change Advisory Boards, Network Engineers, and Compliance Teams** planning controlled software upgrades.

21. **"Get the Cisco recommended software release for the Catalyst 9300 platform (MDF ID `286315874`). Show the current suggested release, the type designation (Gold Star, Deferred, etc.), release date, and any active bugs in that release that I should be aware of before upgrading."**

22. **"I need to upgrade our Catalyst 9500 core switches. Use the Software Suggestions API to get the recommended release for `C9500-32QC`. Return the Gold Star release, the latest maintenance release in the recommended train, and validate compatibility with our supervisor module `C9500-SUP-A`."**

23. **"Validate that NX-OS `10.3.3(F)` is compatible with Nexus 9300-FX3 series hardware (`N9K-C9336C-FX2`). Use the Software API to confirm platform compatibility, retrieve the image name and checksum, and show the release type (feature vs. maintenance)."**

24. **"Run a comprehensive upgrade readiness report for our planned migration from IOS-XE `17.9.4a` to `17.12.4` on Catalyst 9300 switches. Use the Bug API to find known bugs in `17.12.4`, the PSIRT API to check for unpatched vulnerabilities, and the Software API to confirm `17.12.4` is on the recommended train. Produce a go/no-go recommendation."**

25. **"Get software suggestions for the Cisco ASR 1000 Series router platform. Show the recommended IOS-XE release for the `ASR1002-HX` — include the suggested release name, release date, TAC-recommended designation, and the previous suggested release for rollback reference."**

***

## 🎫 Category 5 — Support Case Management

For **TAC Liaisons, NOC Leads, and IT Operations** managing Cisco support cases programmatically.

26. **"Get the details for Cisco support case `693838838`. Show the case title, severity, status, product, platform, assigned TAC engineer, last activity date, and current action items. Has there been any update in the last 48 hours?"**

27. **"List all open Cisco support cases associated with contract `93838291`. Group by severity — show severity 1 and 2 cases first. For each case, show the case number, title, status, creation date, product, and days since last update."**

28. **"Which open TAC cases on contract `93838291` have had no update in more than 5 business days? Flag these as stalled — show case number, title, severity, assigned engineer, and last activity date. These need escalation follow-up."**

29. **"Create a new Cisco support case for a severity 2 issue on device `WAN-EDGE-01` (Catalyst 8300 running IOS-XE 17.12.3). The problem statement is: BGP session to ISP peer `203.0.113.1` is resetting every 4–6 hours with error `%BGP-3-NOTIFICATION: sent to neighbor 203.0.113.1 6/0`. Show the case draft before submitting."**

30. **"Update support case `693838839` with the following new information: we have completed the requested packet capture and the results show malformed BGP OPEN messages from the peer. Attach this summary note to the case and request escalation to the BGP engineering team."**

***

## 🔖 Category 6 — Serial Number, Coverage & Contract Audits

For **Asset Management, Procurement, and IT Finance Teams** auditing Cisco contract coverage and warranty status.

31. **"Check the support coverage status for serial number `FDO2049A0BC`. Show the product ID, contract number, service level (SNTC, SMARTnet tier), contract start date, contract end date, and days until expiry. Flag if the contract expires within 90 days."**

32. **"Run a contract coverage audit for the following serial numbers: `FDO2049A0BC`, `JAD2203ABCD`, `FCW2244EFGH`, `FXS2301IJKL`. For each device, show coverage status, service level, and expiry date. Flag any device that is NOT covered or has coverage expiring within 6 months."**

33. **"What is the warranty status for device with serial `FCW2244EFGH`? Show the product ID, warranty type, warranty start date, warranty end date, and whether a service contract is active beyond the base warranty."**

34. **"Get all devices associated with service contract `93838291`. Show each device's serial number, product ID, hostname (if registered), service level, and contract end date. Flag any device where the contract ends before our 3-year planning horizon."**

***

## 🔄 Category 7 — RMA & Hardware Replacement

For **NOC Engineers and Procurement** managing hardware failure replacements.

35. **"What is the current status of RMA `800-00001234`? Show the RMA type, failed product, replacement product, tracking number, expected delivery date, and return shipping instructions."**

36. **"Get all RMAs associated with support case `693838838`. Show RMA number, product, status, creation date, and current disposition — I need this for a hardware replacement status review."**

37. **"Initiate an RMA for a failed power supply on device `DC-LEAF-103` with serial `FDO2049A0BC`. The failed component is `PWR-C1-715WAC-P`, confirmed failed after `show environment` showed power supply fault. Show the RMA request details and confirm before submitting."**

***

## 🧠 Category 8 — Enhanced Analysis & Fleet Intelligence

For **IT Directors, Network Architects, and CISOs** needing aggregated operational intelligence across the entire Cisco installed base. [skywork](https://skywork.ai/skypage/en/cisco-support-ai-mcp-server/1981271515824619520)

38. **"Run a comprehensive fleet health summary for our entire Cisco inventory. Use Bug, PSIRT, EoX, Software, and Coverage APIs together to produce: (1) top 5 open critical bugs affecting our deployed versions; (2) unpatched CVEs with CVSS ≥ 8.0; (3) devices within 12 months of EoX; (4) devices off recommended software train; (5) devices with expiring coverage. Present as an executive risk dashboard."**

39. **"I need a board-ready infrastructure risk report. Summarize: total CVE exposure across our Cisco fleet by severity, percentage of devices on recommended software releases, percentage with active SMARTnet coverage, and top 3 lifecycle refresh priorities with estimated replacement timelines."**

40. **"Run a pre-maintenance window intelligence brief for our scheduled Catalyst 9300 upgrade next Saturday. Pull: (1) all open severity 1–2 bugs in current version `17.9.4a`; (2) known bugs in target version `17.12.4`; (3) PSIRT advisories fixed by the upgrade; (4) software suggestion confirmation for `17.12.4`. Give me a go/no-go recommendation with evidence."**

***

## 🏭 Vertical-Specific Prompt Packs

### Financial Services / Risk & Compliance
- *"Generate a regulatory compliance evidence package for Cisco infrastructure: (1) PSIRT — list all CVEs affecting our deployed Cisco versions and their patch status; (2) EoX — list all devices past or within 12 months of End-of-Security-Vulnerability-Support; (3) Coverage — confirm all devices have active SMARTnet. Format as a compliance attestation report."*

### Healthcare / Patient Safety Uptime
- *"Flag all Cisco devices in our clinical network inventory (provided serial list) where: the running software has an unpatched PSIRT advisory with CVSS ≥ 7.0, OR the device is within 6 months of End-of-Support, OR the SMARTnet contract expires within 90 days. Any device meeting any of these criteria represents a patient safety risk."*

### Manufacturing / OT Uptime Assurance
- *"Search for all open Cisco bugs affecting IOS-XE `16.12.7` on Catalyst 3850 switches (our OT network access layer). Filter for bugs with symptoms related to `port flap`, `STP`, `power cycling`, or `crash` — in OT environments, any unexpected device restart can halt production. Return severity, status, and fixed version for each."*

### MSP / Multi-Customer Management
- *"For each customer contract ID in our MSP portfolio, run a coverage audit to identify any customer device not covered by an active SMARTnet contract. Group results by customer, flag critical infrastructure gaps (core switches, firewalls, WAN routers), and generate a renewal outreach priority list."*

### Government / Continuous ATO
- *"Produce a Continuous Authorization to Operate (ATO) evidence package for Cisco infrastructure: PSIRT advisories acknowledged or patched in the last 90 days, EoX status for all devices, software currency (percentage on recommended releases), and open TAC cases with severity 1–2. Format for submission to the ISSO."*

***

## 🔁 Cross-Ecosystem / Multi-MCP Prompts

The Cisco Support MCP is the **knowledge and lifecycle intelligence layer** of the entire suite — it uniquely bridges operational incidents from other MCP servers with Cisco's authoritative engineering knowledge base. [fastmcp](https://fastmcp.me/MCP/Details/137/cisco-support-apis)

***

### 🔗 Cisco Support + IOS-XE — Live Device vs. Known Bugs

41. **"The IOS-XE MCP server has pulled `show version` from all WAN edge routers — they are running `17.9.4a`. Cross-reference with the Cisco Bug API: are there any open severity 1–2 bugs in `17.9.4a` affecting BGP or interface stability on Catalyst 8300? If yes, check if the bugs are fixed in `17.12.4` and whether `17.12.4` is the current recommended release via the Software Suggestions API."**

42. **"IOS-XE MCP shows `%IOSXE-3-PLATFORM: SIP0: cpp_cp: QFP:0.0 Thread:000: RP:0 TS:0000161547 %CPPHA-3-FAULT` on `CORE-RTR-01`. Search the Cisco Bug database for this exact platform fault message on IOS-XE 17.x. Return matching bugs, their severity, and whether they involve a known ASIC or QFP firmware defect with a fix available."**

***

### 🔗 Cisco Support + NX-OS — DC Fleet Vulnerability Assessment

43. **"NX-OS MCP shows all Nexus 9000 spines are running NX-OS `10.2.3(F)`. Use the PSIRT API to check all current advisories affecting that version. Then use the Software Suggestions API to confirm whether `10.2.3(F)` is on the recommended train or whether we should upgrade to a newer maintenance release. Produce a combined patch advisory with upgrade recommendation."**

44. **"Run `show version` across all Nexus leaf switches via NX-OS MCP and collect the NX-OS versions. For each unique version found, query the Cisco Bug API for severity 1–2 open bugs affecting vPC or VXLAN BGP EVPN. Return a per-version risk table — which leaf groups have the highest known defect exposure?"**

***

### 🔗 Cisco Support + ACI — APIC & Fabric Vulnerability Management

45. **"ACI MCP shows our APIC cluster is running version `6.0.3h`. Use the PSIRT API to check for advisories against ACI/APIC `6.0.3` and the Bug API to find known issues affecting the APIC cluster or spine/leaf fabric on this release. Then check EoX for the hardware models in our fabric to confirm we are not approaching unsupported hardware territory."**

***

### 🔗 Cisco Support + FMC — Firepower Vulnerability & Upgrade Intelligence

46. **"FMC MCP shows our FTD devices are running `7.2.5`. Use the Cisco Support MCP to: (1) check PSIRT advisories for FTD `7.2.5`; (2) search for open bugs affecting IPS/Snort engine stability on that release; (3) get the software suggestion for FTD on our FPR-2140 platform to confirm the recommended upgrade path. Produce a firewall security currency report."**

***

### 🔗 Cisco Support + Catalyst Center — SWIM Intelligence Brief

47. **"Catalyst Center's SWIM module shows our recommended golden image is IOS-XE `17.12.4`. Before designating this as golden, use the Cisco Support MCP to: (1) pull all known bugs in `17.12.4` severity 1–2; (2) confirm it is the current Gold Star recommended release via the Software API; (3) check PSIRT for any unpatched advisories specific to `17.12.4`. Return a software validation brief to support the golden image designation decision."**

***

### 🔗 Cisco Support + Splunk — Incident-to-Bug Correlation

48. **"Splunk has been collecting IOS-XE syslog messages for 30 days. Run a Splunk search for the top 20 most frequent `%` facility error messages across all Cisco routers and switches. For each of the top 5 most frequent error messages, use the Cisco Bug API to search for known bugs matching that syslog signature. Build a 'known issue registry' mapping our top operational errors to their corresponding Cisco bug IDs and fix versions."**

***

### 🔗 Cisco Support + All MCP Servers — Quarterly Infrastructure Health Review

49. **"Orchestrate a comprehensive quarterly infrastructure health review using all MCP servers: (1) IOS-XE & NX-OS MCP — collect running software versions across all devices; (2) Cisco Support Bug API — check each version for open critical bugs; (3) PSIRT API — check each version for unpatched CVEs; (4) EoX API — check all hardware serial numbers for lifecycle status; (5) Software API — confirm which devices are off the recommended software train; (6) Coverage API — identify any device without active SMARTnet; (7) Splunk — pull open incident count by device. Produce a ranked remediation action plan with effort and risk prioritization."**

***

## Prompt Engineering Tips for Cisco Support MCP

| Principle | Guidance |
|---|---|
| **Enable only needed API groups** | Each API group requires separate Cisco API credentials — only enable `SUPPORT_API=` for the groups your org has licensed access to  [github](https://github.com/sieteunoseis/mcp-cisco-support) |
| **Anchor bug searches to version + platform** | Bug searches scoped to `version + platform` return far more relevant results than keyword-only searches — always include both  [developer.cisco](https://developer.cisco.com/codeexchange/github/repo/sieteunoseis/mcp-cisco-support/) |
| **Use enhanced analysis for exec reports** | The 6 enhanced analysis tools (`fleet_health_summary`, `vulnerability_impact_report`, etc.) combine multiple APIs in a single call — ideal for management reporting  [skywork](https://skywork.ai/skypage/en/cisco-support-ai-mcp-server/1981271515824619520) |
| **PSIRT + EoX is the security lifecycle pair** | Always run PSIRT and EoX together when assessing device risk — a device may be fully patched but approaching End-of-Security-Vulnerability-Support, which is equally dangerous  [developer.cisco](https://developer.cisco.com/docs/cx-cloud/list-software-eol-bulletins/) |
| **Software API before any upgrade** | Never upgrade without running `get_software_suggestions` first — Cisco regularly defers releases that had post-release critical bugs discovered  [fastmcp](https://fastmcp.me/MCP/Details/137/cisco-support-apis) |
| **Case creation requires contract ID** | `create_case` requires a valid SMARTnet contract ID tied to the device serial number — always run `get_coverage_by_serial` first to confirm coverage before opening a case  [developer.cisco](https://developer.cisco.com/codeexchange/github/repo/sieteunoseis/mcp-cisco-support/) |
| **Elicitation for missing parameters** | The server's `ElicitationRequest` feature will interactively prompt for missing parameters (e.g., platform, version) if you submit an incomplete query — use this for exploratory prompts  [github](https://github.com/sieteunoseis/mcp-cisco-support) |

***

The Cisco Support MCP server is the **engineering knowledge and lifecycle backbone** of the entire suite. Every other MCP server tells you what is happening on your network *right now* — the Cisco Support server tells you *why* it is happening (known bugs), *how dangerous* it is (PSIRT), *how long you have* to fix it (EoX), and *what to upgrade to* (Software Suggestions). Together they close the loop between live operational data and Cisco's authoritative engineering intelligence, enabling true AI-driven infrastructure lifecycle management. [skywork](https://skywork.ai/skypage/en/cisco-support-ai-mcp-server/1981271515824619520)
