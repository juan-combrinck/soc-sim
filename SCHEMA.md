# SOC Desk scenario schema

A scenario is one JS file in `js/scenarios/` that pushes one object onto `window.SOC_SCENARIOS`.
Validate with `node test/invariants.js` (run from the project root). It must print no errors for your file.

```js
(function () {
  // local helper functions are fine, e.g. const ev = (id,t,source,hostId,event,msg,fields)=>({...});
  window.SOC_SCENARIOS.push({
    id: 's2-example',                 // unique, kebab-case
    title: 'Short Title', tagline: 'one line teaser', difficulty: 'Easy|Medium|Hard',
    date: '2026-11-10',
    shift: { start: '08:00', end: '16:00' },
    company: { name, domain, industry, blurb },
    handover: 'Previous-shift notes. Lines separated by \n. Realistic: open items, known maintenance, noisy rules.',
    users: [{ id:'u-jsmith', name:'Jordan Smith', username:'jsmith', email:'jsmith@x.com', dept, title, manager, location }],
    hosts: [{ id:'h-fin-031', hostname:'FIN-LT-031', ip:'10.20.4.31', os:'Windows 11 Pro',
              type:'workstation|laptop|server|dc|network', userId:'u-jsmith' /*or null*/, dept,
              criticality:'low|medium|high|crown', agent:'7.4.1' }],
    alerts: [ ...see below ],
    events: [ ...see below ],
    edr:   { 'h-fin-031': { processes:[], connections:[], files:[] } },   // only for hosts that matter; others auto-generated
    intel: { 'evil.example': { verdict:'malicious|suspicious|benign|unknown', summary:'...', source:'VirusTotal|OTX|Internal|WHOIS' } }, // keys lowercase
    changes: [{ at:'07:00', system:'FS01', desc:'...', owner:'Chidi Eze', ticket:'CHG-1234' }],   // change calendar, searchable by the analyst
    chat: [{ at:'08:30', from:'sam', text:'ambient colleague message (team ids from js/team.js)' }]
  });
})();
```

## alerts[]
```js
{ id:'A-2001',                 // unique, /^A-\d+$/
  at:'09:41',                  // HH:MM sim time the alert lands in the queue (must be inside the shift)
  title:'WINWORD.EXE spawned powershell.exe', severity:'low|medium|high|critical',
  source:'SIEM|EDR|Email GW|Proxy|IAM|NDR|DLP|FW',
  rule:'EDR-0412 Office child process',
  hostId:'h-fin-031', userId:'u-hdoyle',          // optional but normally present
  summary:'1-2 sentences in the voice of the detection tool, NOT revealing the verdict.',
  details:{ 'Process':'powershell.exe', 'Parent':'WINWORD.EXE' },   // key/value table shown in the ticket
  eventIds:['e-203', ...],     // >= 3 related events, all must exist, each at or before the alert time (+59s)
  iocs:[{ type:'ip|domain|hash|url|email|user|host', value:'...' }],
  truth:'TP' | 'FP',
  incident:'INC-1',            // TP alerts only. ALL TP alerts in the scenario share ONE incident id (max 3 TP alerts)
  explain:'Post-shift reveal: why this is TP/FP, and the exact evidence that proves it.',
  reply:{ fp:'what a T2 analyst says if this FP is escalated (neutral voice, 1-3 sentences, cites evidence)',
          tp:'what a T2 analyst says if this TP is escalated (TP alerts only)',
          irTp:'optional, if IR gets the TP directly' },
  keywords:['powershell','encoded'],   // lowercase words a good escalation note would mention
  userReply:'what the user says if the analyst contacts them (optional but nice)',
  helpdeskReply:'what Sam (service desk) says if asked about the user/host/ticket (optional)' }
```

## events[] (raw logs the analyst searches in the SIEM view)
```js
{ id:'e-203', t:'09:12:44', source:'WinEvent|Proxy|DNS|Firewall|Email|Auth|VPN|EDR|DLP|Cloud',
  hostId:'h-fin-031', user:'hdoyle', src:'10.20.4.31', dst:'203.0.113.9',
  event:'ProcessCreate',     // short event name/ID e.g. '4624 Logon','HTTP GET','DNS Query','Allow','Delivered'
  msg:'full realistic single-line raw log text (this is what is displayed and text-searched)',
  fields:{ process:'powershell.exe', domain:'x.com', url:'...', action:'allow', status:'200' } }
```
Background noise (logons, DNS, proxy, firewall for ordinary users) is generated automatically,
so hand-write ONLY the storyline and the evidence for each alert (incl. FP evidence). Timestamps may precede the shift
(e.g. the TP's early stages at 07:12).

## edr{}
```js
processes:[{ pid:4120, ppid:3320, name:'powershell.exe', cmd:'full command line', user:'CORP\\hdoyle',
             start:'09:40:12', signed:true|false, publisher:'Microsoft Corporation', sha256:'...',
             flag:'malicious|suspicious|null', note:'EDR tooltip' }],
connections:[{ t:'09:40:15', pid:4120, proc:'powershell.exe', dst:'203.0.113.9:443', domain:'x.com', proto:'TCP' }],
files:[{ t:'09:40:13', pid:4120, op:'create|modify|delete|rename', path:'C:\\Users\\...', sha256:'...' }]
```
Give every process a realistic parent chain (explorer.exe, svchost.exe, etc.); include the benign processes around it.

## Hard design rules (the validator enforces most)
1. EXACTLY ONE true-positive incident per scenario (1-3 correlated alerts, same `incident` id). Everything else is FP.
2. 14-24 alerts total, at least 11 FP. The TP's first alert must land between 25% and 85% of the alert timeline (not first/last).
3. Severity must NOT give the answer away: at least 2 FP alerts must be `high` or `critical`; the TP may be medium/high.
4. FP verdicts must be provable from the data (logs, EDR, intel, change calendar, userReply/helpdeskReply). TP must be provable too.
   An observant analyst can always tell, with pivots. No coin-flips, no unexplained "trust me".
5. Make it realistic: real log formats, real Windows event IDs, plausible IPs (10.x internal; documentation ranges 203.0.113.0/24,
   198.51.100.0/24, 192.0.2.0/24 for external), real tools (Veeam, SCCM/Intune, Tenable, Defender, Okta/Entra), real attack tradecraft.
   Fake C2 domains must be fake (use .example/.test or invented lookalikes - never real brands' domains as malicious).
6. Never reuse names of the shared team (Bob, Priya, Marcus, Imani, Dana, Tom, Lena, Sam, Chidi) as company employees.
