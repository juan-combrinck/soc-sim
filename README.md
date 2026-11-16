# SOC Desk

Offline desktop simulator: a day in the life of a Tier 1 SOC analyst.

## Run
- Double-click the **SOC Desk** shortcut, or `npm start` in this folder.
- Rebuild the standalone exe: `npm run package` (output in `dist/`).

## Tutorials
Press **Take tutorial** on the main menu. Two guided runs on a safe training shift (colleagues reply in seconds):
- **Basics (~5 min):** clock, queue, ticket, SIEM, EDR, intel, change calendar, team chat; close one alert, escalate another.
- **Advanced (~8 min):** a full walkthrough of a real attack: triage, SIEM pivots, EDR process tree, intel, change calendar, contact the user, note, escalate to IR, confirmation.
The screen dims and a yellow spotlight shows exactly what to click. Tasks tick off in the checklist automatically (bottom left).

## How it plays
Badge in, read the handover, then work the alert queue in real time (sim clock, pausable, 5x-60x).
Pivot through **SIEM** (field search: `host:` `user:` `src:` `dst:` `source:` `event:` `process:` `domain:` plus free text, quotes, `-negation`, `*` wildcards),
**EDR** (process tree / network / files, isolate host), **Intel** (IOC lookup, change calendar, assets), and **Team** chat.
Ask the user or service desk, then **close** with a reason or **escalate** to T2 (Bob Harlan, Priya Nair) or IR (Marcus Webb, Imani Brooks).

- Escalate a false positive: the T2/IR analyst tells you it is a false positive and why.
- Escalate the real incident: they confirm a true positive, take ownership, and IR contains the host.
- Close the real incident as FP/benign: a flashing red WARNING, the missed evidence, and a failing score.
- Each sim contains exactly **one** true-positive incident (up to 3 correlated alerts); everything else is noise.

Change the warning text in the Settings (gear) dialog.

## Sims
| id | title | difficulty |
|---|---|---|
| s4-easy-start | First Day on the Desk (fake invoice to Emotet + mimikatz) | Easy |
| s1-monday | Monday Morning (phishing to beacon) | Medium |
| s2-vpn-mfa | Push Notification Fatigue (MFA fatigue to VPN) | Medium |
| s3-patch-tuesday | Patch Tuesday (ransomware precursor in patch noise) | Hard |

## Add a sim
Drop a file in `js/scenarios/`, add its `<script>` tag (tutorial steps live in `js/tutorial.js`) to `index.html`, follow `SCHEMA.md`, and run `npm test`.
