(function () {
  const D = 'meridiancb.example';
  const EVL = []; const K = {}; let seq = 100;
  const ev = (k, t, source, hostId, event, msg, fields = {}, x = {}) => { const id = 'e-' + (++seq); K[k] = id; EVL.push({ id, t, source, hostId, event, msg, fields, ...x }); return id; };
  const ids = (...ks) => ks.map(k => { if (!K[k]) throw new Error('missing event key ' + k); return K[k]; });
  const hms = s => [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60].map(x => String(x).padStart(2, '0')).join(':');
  const sh = n => (n + 'a1b2c3d4e5f60718293a4b5c6d7e8f90').repeat(8).slice(0, 64);
  const GP = 'Palo Alto GlobalProtect';
  // Entra sign-in log line
  const sl = (k, t, u, ip, loc, code, res, app, dev, mfa) => ev(k, t, 'Auth', null, code === 0 ? 'SignIn Success' : 'SignIn Failure ' + code,
    `2026-11-04 ${t} SigninLogs UserPrincipalName=${u}@${D} AppDisplayName="${app}" IPAddress=${ip} Location=${loc} ResultType=${code} ResultDescription="${res}" DeviceDetail="${dev}"${mfa ? ` MfaDetail="${mfa}"` : ''}`,
    { app, resultType: String(code), location: loc, device: dev }, { user: u, src: ip });
  // M365 unified audit log
  const au = (k, t, wl, op, u, ip, extra, hostId = null) => ev(k, t, 'Cloud', hostId, op,
    `{"CreationTime":"2026-11-04T${t}","Workload":"${wl}","Operation":"${op}","UserId":"${u}@${D}","ClientIP":"${ip}",${extra}}`,
    { workload: wl, operation: op }, { user: u, src: ip });
  const wn = (k, t, h, id, name, u, src, msg, fields = {}) => ev(k, t, 'WinEvent', h, id + ' ' + name, msg, fields, { user: u, src });

  // ===================== TP storyline: MFA fatigue on nkowalczyk =====================
  const ATK = '203.0.113.77';
  for (let i = 1; i <= 21; i++) {
    const s = 6 * 3600 + 2 * 60 + 7 + (i - 1) * 52 + (i % 3) * 3;
    const timeout = i % 2 === 1;
    sl('push' + i, hms(s), 'nkowalczyk', ATK, 'MD', i === 1 ? 50074 : 500121,
      i === 1 ? 'Strong Authentication is required.' : (timeout ? 'Authentication failed during strong authentication request. MFA push not answered (timeout)' : 'Authentication failed during strong authentication request. User denied MFA push'),
      GP, 'Windows 10 / Chrome 118 / unregistered device', i === 1 ? 'PhoneAppNotification sent' : (timeout ? 'PhoneAppNotification timeout' : 'PhoneAppNotification denied'));
  }
  sl('mfaok', '06:21:08', 'nkowalczyk', ATK, 'MD', 0, 'Success', GP, 'Windows 10 / Chrome 118 / unregistered device', 'PhoneAppNotification approved (Authenticator, iPhone)');
  ev('gpportal', '06:21:12', 'VPN', 'h-vpn-01', 'GLOBALPROTECT portal-auth', `Nov  4 06:21:12 PA-VPN-01 1,2026/11/04 06:21:12,013201008812,GLOBALPROTECT,0,2305,vsys1,portal-auth,login,Portal-Corp,,SAML,"MERIDIAN\\nkowalczyk",MD,WIN-8KQ2M4T1VDR,${ATK},0.0.0.0,client_ver=6.1.4-12,"Microsoft Windows Server 2022 Datacenter",status=success`, { user: 'nkowalczyk', country: 'MD', machine: 'WIN-8KQ2M4T1VDR', status: 'success' }, { user: 'nkowalczyk', src: ATK });
  ev('gpgw', '06:21:33', 'VPN', 'h-vpn-01', 'GLOBALPROTECT gateway-auth', `Nov  4 06:21:33 PA-VPN-01 1,2026/11/04 06:21:33,013201008812,GLOBALPROTECT,0,2305,vsys1,gateway-auth,login,Gateway-Corp,,SAML,"MERIDIAN\\nkowalczyk",MD,WIN-8KQ2M4T1VDR,${ATK},10.60.8.41,client_ver=6.1.4-12,"Microsoft Windows Server 2022 Datacenter",status=success,asn="AS64496 Northgate Hosting Ltd"`, { user: 'nkowalczyk', country: 'MD', asn: 'AS64496', private_ip: '10.60.8.41', status: 'success' }, { user: 'nkowalczyk', src: ATK, dst: '10.60.8.41' });
  ev('gphip', '06:21:35', 'VPN', 'h-vpn-01', 'GLOBALPROTECT hip-report', `Nov  4 06:21:35 PA-VPN-01 1,2026/11/04 06:21:35,013201008812,GLOBALPROTECT,0,2305,vsys1,hip-report,,Gateway-Corp,,,"MERIDIAN\\nkowalczyk",MD,WIN-8KQ2M4T1VDR,${ATK},10.60.8.41,hip-match="No-Corp-Cert;No-EDR;Unmanaged" machine_not_domain_joined=yes`, { hip: 'Unmanaged', domainJoined: 'no' }, { user: 'nkowalczyk', src: ATK });
  ev('gptun', '06:21:40', 'VPN', 'h-vpn-01', 'GLOBALPROTECT tunnel-up', `Nov  4 06:21:40 PA-VPN-01 1,2026/11/04 06:21:40,013201008812,GLOBALPROTECT,0,2305,vsys1,gateway-tunnel,connected,Gateway-Corp,,,"MERIDIAN\\nkowalczyk",MD,WIN-8KQ2M4T1VDR,${ATK},10.60.8.41,tunnel=ipsec,split_tunnel=on`, { assigned: '10.60.8.41' }, { user: 'nkowalczyk', src: ATK, dst: '10.60.8.41' });
  sl('exo', '06:23:44', 'nkowalczyk', ATK, 'MD', 0, 'Success', 'Office 365 Exchange Online', 'Windows 10 / Python 3.11 aiohttp/3.9.1', 'Previously satisfied (token claim)');
  au('rule', '06:24:51', 'Exchange', 'New-InboxRule', 'nkowalczyk', ATK, '"Parameters":[{"Name":"Name","Value":"."},{"Name":"SubjectOrBodyContainsWords","Value":"remittance;ERA;EFT;payment;wire;invoice"},{"Name":"ForwardTo","Value":"nk.billing.archive@mailrelay-hub.example"},{"Name":"MarkAsRead","Value":"True"},{"Name":"DeleteMessage","Value":"True"}],"ClientInfoString":"Client=REST;Client=RESTSystem;;","UserAgent":"python-requests/2.31.0"');
  au('mfareg', '06:26:10', 'AzureActiveDirectory', 'User registered security info', 'nkowalczyk', ATK, '"Target":"Phone (SMS) +37369XXXXX14","Result":"Success","Reason":"User registered phone method","Initiator":"nkowalczyk"');
  au('oauth', '06:31:05', 'AzureActiveDirectory', 'Consent to application', 'nkowalczyk', ATK, '"Application":"MailSyncPro","AppId":"7c1e44d0-2b8a-4f66-9a31-5d0e1c9a77b2","Scopes":"Mail.ReadWrite Mail.Send offline_access Files.Read.All","PublisherVerified":"false"');
  au('mailacc', '06:33:12', 'Exchange', 'MailItemsAccessed', 'nkowalczyk', ATK, '"OperationProperties":[{"Name":"MailAccessType","Value":"Bind"}],"Folders":["\\\\Inbox","\\\\Sent Items","\\\\Remits"],"ItemCount":1420,"ClientInfoString":"Client=REST;Client=RESTSystem;;","UserAgent":"python-requests/2.31.0"');
  au('srch', '06:40:55', 'Exchange', 'SearchQueryInitiated', 'nkowalczyk', ATK, '"QueryText":"wire transfer OR routing number OR ACH OR remittance advice","Folder":"Inbox"');
  au('spdl1', '06:47:02', 'SharePoint', 'FileDownloaded', 'nkowalczyk', ATK, '"SiteUrl":"https://meridiancb.sharepoint.example/sites/RevenueCycle","SourceFileName":"Payer_Remit_Contacts_Q4.xlsx","UserAgent":"python-requests/2.31.0"');
  au('spdl2', '06:47:19', 'SharePoint', 'FileDownloaded', 'nkowalczyk', ATK, '"SiteUrl":"https://meridiancb.sharepoint.example/sites/RevenueCycle","SourceFileName":"ACH_Banking_Details_Providers.xlsx","UserAgent":"python-requests/2.31.0"');
  au('spdl3', '06:48:40', 'SharePoint', 'FileSyncDownloadedFull', 'nkowalczyk', ATK, '"SiteUrl":"https://meridiancb.sharepoint.example/sites/RevenueCycle","ItemCountInWindow":312,"WindowSeconds":120,"UserAgent":"python-requests/2.31.0"');
  ev('dnsatk', '06:49:30', 'DNS', 'h-dc-01', 'DNS Query', 'Nov  4 06:49:30 DC01 dns query client=10.60.8.41 name=mailrelay-hub.example type=A rcode=NOERROR answer=192.0.2.131', { domain: 'mailrelay-hub.example' }, { src: '10.60.8.41', user: 'nkowalczyk' });
  ev('ldap', '06:51:12', 'WinEvent', 'h-dc-01', '4624 Logon', 'Microsoft-Windows-Security-Auditing 4624 An account was successfully logged on. LogonType=3 Account=MERIDIAN\\nkowalczyk WorkstationName=WIN-8KQ2M4T1VDR SourceNetworkAddress=10.60.8.41 AuthPackage=Kerberos', { logonType: '3', workstation: 'WIN-8KQ2M4T1VDR' }, { user: 'nkowalczyk', src: '10.60.8.41' });
  wn('smb1', '06:52:30', 'h-fs-01', '5140', 'Share accessed', 'nkowalczyk', '10.60.8.41', 'Microsoft-Windows-Security-Auditing 5140 A network share object was accessed. Account=MERIDIAN\\nkowalczyk SourceAddress=10.60.8.41 ShareName=\\\\FS01\\BillingExports AccessMask=0x1', { share: 'BillingExports' });
  wn('smb2', '06:52:41', 'h-fs-01', '5145', 'Share file check', 'nkowalczyk', '10.60.8.41', 'Microsoft-Windows-Security-Auditing 5145 Network share object checked. Account=MERIDIAN\\nkowalczyk SourceAddress=10.60.8.41 RelativeTarget=2026-Q3\\PatientBalances_Export.csv Accesses=ReadData', { file: 'PatientBalances_Export.csv' });
  ev('fwsmb', '06:53:05', 'Firewall', 'h-vpn-01', 'Allow', 'Nov  4 06:53:05 PA-VPN-01 TRAFFIC end src=10.60.8.41 dst=10.50.0.20 dport=445 proto=tcp app=ms-ds-smb action=allow bytes_sent=14822 bytes_recv=912883341 zone=gp-vpn->servers', { action: 'allow', dport: '445', bytes: '912883341' }, { src: '10.60.8.41', dst: '10.50.0.20', user: 'nkowalczyk' });
  ev('proxyatk', '06:58:20', 'Proxy', null, 'HTTP POST', 'Nov  4 06:58:20 proxy01 10.60.8.41 POST https://mailrelay-hub.example/upload bytes_out=88411203 status=200 ua="curl/8.4.0" cat=uncategorized', { domain: 'mailrelay-hub.example', method: 'POST', bytes_out: '88411203' }, { src: '10.60.8.41', dst: '192.0.2.131', user: 'nkowalczyk' });
  ev('gpout', '07:12:40', 'VPN', 'h-vpn-01', 'GLOBALPROTECT logout', `Nov  4 07:12:40 PA-VPN-01 1,2026/11/04 07:12:40,013201008812,GLOBALPROTECT,0,2305,vsys1,gateway-logout,,Gateway-Corp,,,"MERIDIAN\\nkowalczyk",MD,WIN-8KQ2M4T1VDR,${ATK},10.60.8.41,duration=3067s,bytes_total=1004212998`, { duration: '3067s' }, { user: 'nkowalczyk', src: ATK });
  // benign context for the real user (laptop was fully powered off overnight)
  ev('bil014boot', '08:31:47', 'WinEvent', 'h-bil-014', '6005 EventLog started', 'Microsoft-Windows-Eventlog 6005 The Event log service was started. (Cold boot; previous shutdown 11/03 17:58:11 clean)', {}, { src: '10.50.9.14' });
  wn('bil014logon', '08:36:04', 'h-bil-014', '4624', 'Logon', 'nkowalczyk', '10.50.9.14', 'Microsoft-Windows-Security-Auditing 4624 Successful logon. LogonType=2 Account=MERIDIAN\\nkowalczyk Workstation=BIL-LT-014 FirstInteractiveLogonToday=true', { logonType: '2' });
  sl('nkoffice', '08:36:40', 'nkowalczyk', '203.0.113.10', 'US', 0, 'Success', 'Microsoft Teams', 'Windows 11 / BIL-LT-014 / compliant', 'Previously satisfied (device claim)');

  // ===================== FP1 impossible travel (exec on carrier NAT) =====================
  sl('tr1', '07:10:22', 'glindqvist', '192.0.2.55', 'GB', 0, 'Success', 'Microsoft Teams', 'Windows 11 / EXE-LT-003 / compliant', 'Previously satisfied (device claim)');
  sl('tr4', '07:32:05', 'glindqvist', '192.0.2.55', 'GB', 0, 'Success', 'Office 365 Exchange Online', 'Windows 11 / EXE-LT-003 / compliant');
  sl('tr2', '07:46:51', 'glindqvist', '198.51.100.200', 'US', 0, 'Success', 'Microsoft Outlook (iOS)', 'iOS 18.1 / iPhone 15 Pro / registered+compliant (deviceId a41c...e9)', 'Previously satisfied (device claim)');
  ev('tr3', '07:58:14', 'Auth', null, 'RiskDetection ImpossibleTravel', '2026-11-04 07:58:14 IdentityProtection riskEventType=impossibleTravel user=glindqvist@meridiancb.example riskLevel=medium ip1=192.0.2.55(GB) ip2=198.51.100.200(US) interval=36min ip2_asn="CarrierNet US Mobility"', { risk: 'impossibleTravel' }, { user: 'glindqvist', src: '198.51.100.200' });

  // ===================== FP2 password spray from internet scanner, zero success =====================
  const SP = '198.51.100.23';
  [['07:50:12', 'tgrimaldi'], ['07:53:41', 'cwhitlock'], ['07:56:09', 'amoreau'], ['07:59:30', 'jpark'], ['08:01:44', 'evasquez'], ['08:04:02', 'lfontaine'], ['08:06:55', 'rmenon'], ['08:09:18', 'dachebe']].forEach(([t, u], i) =>
    sl('sp' + (i + 1), t, u, SP, ['RU', 'BR', 'VN', 'NG', 'IN', 'ID', 'TR', 'EG'][i], 50126, 'Invalid username or password or Invalid on-premise username or password.', 'Exchange ActiveSync', 'Unknown / python-requests'));
  sl('splock', '08:10:31', 'ssorensen', SP, 'RU', 50053, 'Account is locked because user tried to sign in too many times with an incorrect user ID or password (Smart Lockout)', 'Exchange ActiveSync', 'Unknown / python-requests');
  ev('spsum', '08:13:50', 'Auth', null, 'Correlation Summary', 'SIEM correlation PasswordSpray-01: src=198.51.100.23 attempts=312 distinct_users=61 window=24min successes=0 mfa_prompts_generated=0 ca_blocked_legacy_auth=312', { attempts: '312', successes: '0' }, { src: SP });

  // ===================== FP3 service account after password rotation =====================
  wn('svc4724', '07:02:15', 'h-dc-01', '4724', 'Password reset attempt', 'tgrimaldi', '10.50.2.111', 'Microsoft-Windows-Security-Auditing 4724 An attempt was made to reset an account password. Subject=MERIDIAN\\tgrimaldi Target=MERIDIAN\\svc-billing-sync (CHG-5120 scheduled rotation)', { target: 'svc-billing-sync' });
  wn('svc1', '08:10:44', 'h-dc-01', '4771', 'Kerberos pre-auth failed', 'svc-billing-sync', '10.50.0.45', 'Microsoft-Windows-Security-Auditing 4771 Kerberos pre-authentication failed. Account=svc-billing-sync ClientAddress=10.50.0.45 FailureCode=0x18', { code: '0x18', client: 'BILL-APP01' });
  wn('svc2', '08:20:44', 'h-dc-01', '4771', 'Kerberos pre-auth failed', 'svc-billing-sync', '10.50.0.45', 'Microsoft-Windows-Security-Auditing 4771 Kerberos pre-authentication failed. Account=svc-billing-sync ClientAddress=10.50.0.45 FailureCode=0x18', { code: '0x18', client: 'BILL-APP01' });
  wn('svc3', '08:29:12', 'h-app-bil-01', '4625', 'Logon failure', 'svc-billing-sync', '10.50.0.45', 'Microsoft-Windows-Security-Auditing 4625 An account failed to log on. LogonType=5 (Service) Account=MERIDIAN\\svc-billing-sync Status=0xC000006D SubStatus=0xC000006A Process=services.exe Service=BillingSyncSvc', { logonType: '5', service: 'BillingSyncSvc' });
  wn('svc5', '08:46:30', 'h-app-bil-01', '4624', 'Logon', 'svc-billing-sync', '10.50.0.45', 'Microsoft-Windows-Security-Auditing 4624 Successful logon. LogonType=5 Account=MERIDIAN\\svc-billing-sync Service=BillingSyncSvc (credential updated by tgrimaldi 08:44)', { logonType: '5' });

  // ===================== FP4 Tenable authenticated scan =====================
  wn('tn1', '08:31:05', 'h-dc-01', '4624', 'Logon', 'svc-tenable', '10.50.2.40', 'Microsoft-Windows-Security-Auditing 4624 Successful logon. LogonType=3 Account=MERIDIAN\\svc-tenable SourceAddress=10.50.2.40 Workstation=TENABLE-SC01', { logonType: '3' });
  ev('tn2', '08:32:11', 'Firewall', 'h-tenable-01', 'Allow', 'Nov  4 08:32:11 PA-INT-01 TRAFFIC end src=10.50.2.40 dst=10.50.0.0/22 dport=1-1024 app=incomplete action=allow sessions=48210 zone=mgmt->servers', { action: 'allow', sessions: '48210' }, { src: '10.50.2.40' });
  ev('tn3', '08:38:27', 'Firewall', 'h-tenable-01', 'Allow', 'Nov  4 08:38:27 PA-INT-01 TRAFFIC end src=10.50.2.40 dst=10.50.9.0/24 dport=445,3389,5985 app=ms-ds-smb action=allow sessions=2210 zone=mgmt->user', { action: 'allow' }, { src: '10.50.2.40' });
  ev('tn4', '08:44:00', 'Firewall', 'h-tenable-01', 'NDR Scan Detect', 'Nov  4 08:44:00 ndr01 ALERT HorizontalPortScan src=10.50.2.40 unique_dst=412 unique_dport=1000 window=12min ua="Nessus"', { unique_dst: '412' }, { src: '10.50.2.40' });
  ev('tn5', '08:47:15', 'Proxy', 'h-tenable-01', 'HTTP GET', 'Nov  4 08:47:15 proxy01 10.50.2.40 GET http://10.50.0.30:9419/ ua="Nessus SOAP" status=401 bytes=211', { ua: 'Nessus SOAP' }, { src: '10.50.2.40', dst: '10.50.0.30' });

  // ===================== FP5 marketing bulk mailer =====================
  ev('bm1', '09:01:12', 'Email', null, 'Accepted', `Nov  4 09:01:12 mailgw01 smtp accepted from=webinars@${D} via=bounce.mailpulse-mkt.example ip=198.51.100.61 spf=pass dkim=pass(d=${D}) subj="Q4 Provider Webinar: Faster Remits" rcpts=1840`, { spf: 'pass', dkim: 'pass', rcpts: '1840' }, { user: 'pdunmore', src: '198.51.100.61' });
  ev('bm2', '09:04:30', 'Email', null, 'Rate Alert', 'Nov  4 09:04:30 mailgw01 ratelimit sender=webinars@meridiancb.example recipients_10min=1840 threshold=500 header X-Campaign-ID=WEB-Q4-PROV X-Mailer=MailPulse', { recipients: '1840' }, { user: 'pdunmore', src: '198.51.100.61' });
  ev('bm3', '09:07:02', 'Email', null, 'Delivered', 'Nov  4 09:07:02 mailgw01 delivered rcpt=external-provider-list recipients=1796 bounces=44 list=ProviderContacts_Q4 unsubscribe=yes', { delivered: '1796' }, { user: 'pdunmore' });
  ev('bm4', '09:08:11', 'Proxy', 'h-mkt-007', 'HTTP POST', 'Nov  4 09:08:11 proxy01 10.50.7.7 POST https://app.mailpulse-mkt.example/campaigns/send status=200 user=pdunmore', { domain: 'app.mailpulse-mkt.example' }, { user: 'pdunmore', src: '10.50.7.7' });

  // ===================== FP6 new admin first logon =====================
  au('na1', '07:52:40', 'AzureActiveDirectory', 'Add member to role', 'tgrimaldi', '203.0.113.10', '"Target":"kasante@meridiancb.example","Role":"Exchange Administrator (PIM eligible)","Ticket":"HD-48812"');
  wn('na2', '08:55:10', 'h-it-020', '4624', 'Logon', 'kasante', '10.50.2.120', 'Microsoft-Windows-Security-Auditing 4624 Successful logon. LogonType=2 Account=MERIDIAN\\kasante Workstation=IT-LT-020 FirstLogonOnHost=true', { logonType: '2' });
  sl('na3', '08:58:12', 'kasante', '203.0.113.10', 'US', 0, 'Success', 'Azure Portal', 'Windows 11 / IT-LT-020 / compliant (enrolled 08:41 today)', 'Authenticator registration completed during sign-in');
  au('na4', '09:02:50', 'AzureActiveDirectory', 'User registered security info', 'kasante', '203.0.113.10', '"Target":"Microsoft Authenticator (iPhone)","Result":"Success"');
  au('na5', '09:24:30', 'AzureActiveDirectory', 'Add member to role completed (PIM activation)', 'kasante', '203.0.113.10', '"Role":"Exchange Administrator","Justification":"Onboarding task HD-48812 shared mailbox review"');

  // ===================== FP7 PowerShell via SCCM =====================
  ev('ps1', '09:46:03', 'EDR', 'h-fin-019', 'ProcessCreate', 'Sysmon 1 ProcessCreate: Image=C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe ParentImage=C:\\Windows\\CCM\\CcmExec.exe User=NT AUTHORITY\\SYSTEM CommandLine="powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand JABpAG4AdgAgAD0AIABHAGUAdAAtAEMAaQBtAEkAbgBzAHQAYQBuAGMAZQA=" ', { process: 'powershell.exe', parent: 'CcmExec.exe' }, { user: 'SYSTEM', src: '10.50.6.19' });
  ev('ps2', '09:46:04', 'WinEvent', 'h-fin-019', '4104 ScriptBlock', 'Microsoft-Windows-PowerShell 4104 Creating Scriptblock text: $inv = Get-CimInstance Win32_Product | Select Name,Version; $inv | ConvertTo-Json | Out-File \\\\SCCM01\\inv$\\FIN-WS-019.json  # CHG-5131 software inventory', { eventId: '4104' }, { user: 'SYSTEM', src: '10.50.6.19' });
  ev('ps3', '09:46:20', 'Firewall', 'h-fin-019', 'Allow', 'Nov  4 09:46:20 PA-INT-01 TRAFFIC end src=10.50.6.19 dst=10.50.0.50 dport=8530 app=ms-update action=allow zone=user->servers', { dport: '8530' }, { src: '10.50.6.19', dst: '10.50.0.50' });
  ev('ps4', '09:46:01', 'WinEvent', 'h-fin-019', 'CCM AppEnforce', 'CCM execmgr 09:46:01 Script run started: Package=FIN00A41 Program="Hardware-Software Inventory (CHG-5131)" RunAs=SYSTEM Deployed-by=MERIDIAN\\tgrimaldi', { package: 'FIN00A41' }, { user: 'SYSTEM', src: '10.50.6.19' });

  // ===================== FP9 OOO auto-forward (billing, near TP) =====================
  sl('oo1', '08:51:20', 'hbrandt', '203.0.113.10', 'US', 0, 'Success', 'Office 365 Exchange Online', 'Windows 11 / BIL-LT-009 / compliant', 'Previously satisfied (device claim)');
  au('oo2', '10:27:33', 'Exchange', 'Set-MailboxAutoReplyConfiguration', 'hbrandt', '203.0.113.10', '"Parameters":[{"Name":"AutoReplyState","Value":"Scheduled"},{"Name":"StartTime","Value":"11/05/2026"},{"Name":"EndTime","Value":"11/19/2026"}],"UserAgent":"OWA"');
  au('oo3', '10:29:14', 'Exchange', 'New-InboxRule', 'hbrandt', '203.0.113.10', '"Parameters":[{"Name":"Name","Value":"OOO coverage - Stefan"},{"Name":"ForwardTo","Value":"ssorensen@meridiancb.example"},{"Name":"StopProcessingRules","Value":"False"}],"UserAgent":"OWA (Chrome 119 / BIL-LT-009)"');
  sl('oo4', '10:29:02', 'hbrandt', '203.0.113.10', 'US', 0, 'Success', 'Office 365 Exchange Online', 'Windows 11 / BIL-LT-009 / compliant');

  // ===================== FP8 DLP, entitled sender =====================
  ev('dl1', '11:18:40', 'DLP', 'h-bil-022', 'Policy Match PHI-SSN-BULK', 'Nov  4 11:18:40 dlp01 MATCH policy=PHI-SSN-BULK sender=rmenon@meridiancb.example rcpt=edi@claimlinkexchange.example attachment=CLM837_20261104_1100.zip.pgp matches=SSN:1204 action=notify+allow(exception: PartnerBatch)', { policy: 'PHI-SSN-BULK', matches: '1204' }, { user: 'rmenon', src: '10.50.9.22' });
  ev('dl2', '11:18:44', 'Email', 'h-bil-022', 'Sent', 'Nov  4 11:18:44 mailgw01 sent from=rmenon@meridiancb.example to=edi@claimlinkexchange.example connector=Partner-ClaimLink-TLS tls=1.3 cipher=TLS_AES_256_GCM_SHA384 size=3.1MB', { tls: '1.3' }, { user: 'rmenon', src: '10.50.9.22', dst: '192.0.2.88' });
  ev('dl3', '09:20:05', 'Email', 'h-bil-022', 'Sent', 'Nov  4 09:20:05 mailgw01 sent from=rmenon@meridiancb.example to=edi@claimlinkexchange.example connector=Partner-ClaimLink-TLS tls=1.3 attachment=CLM837_20261104_0900.zip.pgp size=2.8MB', { attachment: 'CLM837_20261104_0900.zip.pgp' }, { user: 'rmenon', src: '10.50.9.22', dst: '192.0.2.88' });
  ev('dl4', '11:18:30', 'WinEvent', 'h-bil-022', 'File Create', 'Sysmon 11 FileCreate: Image=C:\\Program Files\\EDIBatch\\EDIBatch.exe TargetFilename=C:\\EDI\\out\\CLM837_20261104_1100.zip.pgp User=MERIDIAN\\rmenon', { process: 'EDIBatch.exe' }, { user: 'rmenon', src: '10.50.9.22' });

  // ===================== FP10 Veeam / VSS on FS01 =====================
  ev('vv1', '12:00:09', 'WinEvent', 'h-veeam-01', 'Veeam Job Start', 'Veeam Backup 12:00:09 [Job Started] Backup_FS01_SyntheticFull (application-aware processing, VSS) Target=FS01 Initiator=Scheduler change=CHG-5124', { job: 'Backup_FS01_SyntheticFull' }, { user: 'svc-veeam', src: '10.50.0.30' });
  ev('vv2', '12:00:38', 'EDR', 'h-fs-01', 'ProcessCreate', 'Sysmon 1 ProcessCreate: Image=C:\\Windows\\System32\\cmd.exe ParentImage=C:\\Windows\\VeeamVssSupport\\VeeamGuestHelper.exe CommandLine="cmd.exe /c C:\\Windows\\VeeamVssSupport\\pre-freeze.cmd" User=SYSTEM', { process: 'cmd.exe', parent: 'VeeamGuestHelper.exe' }, { user: 'SYSTEM', src: '10.50.0.20' });
  ev('vv3', '12:00:40', 'EDR', 'h-fs-01', 'ProcessCreate', 'Sysmon 1 ProcessCreate: Image=C:\\Windows\\System32\\vssadmin.exe ParentImage=cmd.exe CommandLine="vssadmin.exe Resize ShadowStorage /For=D: /On=D: /MaxSize=UNBOUNDED" User=SYSTEM', { process: 'vssadmin.exe' }, { user: 'SYSTEM', src: '10.50.0.20' });
  ev('vv4', '12:01:02', 'WinEvent', 'h-fs-01', '8222 VSS Shadow copy created', 'Volume Shadow Copy Service 8222 Shadow copy has been created. Requestor=Veeam Backup & Replication Volume=D:', { eventId: '8222' }, { user: 'SYSTEM', src: '10.50.0.20' });

  // ===================== FP11 MFA device change, helpdesk ticket =====================
  sl('md1', '12:52:10', 'mtanaka', '203.0.113.10', 'US', 0, 'Success', 'My Security Info', 'Windows 11 / BIL-LT-031 / compliant', 'Authenticator (old iPhone 12) approved');
  au('md2', '12:55:47', 'AzureActiveDirectory', 'User registered security info', 'mtanaka', '203.0.113.10', '"Target":"Microsoft Authenticator (iPhone 16)","Result":"Success"');
  au('md3', '12:58:31', 'AzureActiveDirectory', 'User deleted security info', 'mtanaka', '203.0.113.10', '"Target":"Microsoft Authenticator (iPhone 12)","Result":"Success"');

  // ===================== FP12 phishing simulation click =====================
  ev('ph1', '13:36:02', 'Email', null, 'Delivered', 'Nov  4 13:36:02 mailgw01 delivered from=hr-notices@benefitsportal-updates.example to=dachebe@meridiancb.example subj="Action required: benefits enrollment closes today" X-PhishGuard-Campaign=Q4-AWARE-2026 allowlist=phishsim', { campaign: 'Q4-AWARE-2026' }, { user: 'dachebe', src: '198.51.100.140' });
  ev('ph2', '13:41:15', 'Proxy', 'h-hr-005', 'HTTP GET', 'Nov  4 13:41:15 proxy01 10.50.5.5 GET https://secure-training-hub.example/lp/q4-aware?u=dachebe status=200 cat=Security-Awareness-Training', { domain: 'secure-training-hub.example' }, { user: 'dachebe', src: '10.50.5.5', dst: '192.0.2.145' });
  ev('ph3', '13:41:19', 'Proxy', 'h-hr-005', 'HTTP POST', 'Nov  4 13:41:19 proxy01 10.50.5.5 POST https://secure-training-hub.example/lp/q4-aware/submit status=200 bytes_out=96 note="no credential fields captured by training vendor (hash only)"', { domain: 'secure-training-hub.example' }, { user: 'dachebe', src: '10.50.5.5', dst: '192.0.2.145' });
  ev('ph4', '13:44:30', 'Email', null, 'URL Click', 'Nov  4 13:44:30 mailgw01 urlclick user=dachebe url=https://secure-training-hub.example/lp/q4-aware verdict=suspicious-lookalike rule=EGW-0207', { rule: 'EGW-0207' }, { user: 'dachebe', src: '10.50.5.5' });

  // ===================== FP13 printer fleet telemetry =====================
  for (let i = 0; i < 5; i++) ev('pf' + (i + 1), hms(14 * 3600 + 33 * 60 + i * 60 + 1), 'Firewall', 'h-prt-01', 'Allow', `Nov  4 ${hms(14 * 3600 + 33 * 60 + i * 60 + 1)} PA-INT-01 TRAFFIC end src=10.50.0.60 dst=192.0.2.150 dport=443 app=ssl action=allow bytes_sent=412 bytes_recv=198 sni=telemetry.printfleet-cloud.example interval=60s`, { action: 'allow', dport: '443', sni: 'telemetry.printfleet-cloud.example' }, { src: '10.50.0.60', dst: '192.0.2.150' });
  ev('pf6', '14:30:12', 'DNS', 'h-prt-01', 'DNS Query', 'Nov  4 14:30:12 DC01 dns query client=10.50.0.60 name=telemetry.printfleet-cloud.example type=A rcode=NOERROR answer=192.0.2.150', { domain: 'telemetry.printfleet-cloud.example' }, { src: '10.50.0.60' });
  ev('pf7', '14:31:00', 'WinEvent', 'h-prt-01', '7036 Service running', 'Service Control Manager 7036 The PrintFleet Data Collector Agent service entered the running state. (Installed under PO-22817, vendor: PrintFleet Technologies)', {}, { src: '10.50.0.60' });

  // extra context so the SIEM has texture around the TP
  sl('nkprev', '05:58:40', 'nkowalczyk', '198.51.100.250', 'US', 0, 'Success', 'Microsoft Authenticator', 'iOS 18.1 / iPhone / registered (home commute, Columbus OH carrier IP)', 'Passive: authenticator app heartbeat');
  ev('helpdesk1', '08:20:15', 'Cloud', null, 'Ticket Created', 'ServiceDesk 08:20:15 HD-48790 created by mtanaka: "New phone - need MFA moved" status=Assigned(Sam W.)', { ticket: 'HD-48790' }, { user: 'mtanaka' });
  ev('helpdesk2', '07:20:00', 'Cloud', null, 'Ticket Created', 'ServiceDesk 07:20:00 HD-48812 created by HR-onboarding: "New hire Kwabena Asante - Systems Admin - IT-LT-020 + admin role" status=In Progress', { ticket: 'HD-48812' }, { user: 'kasante' });

  // additional texture
  for (let i = 1; i <= 6; i++) sl('spx' + i, hms(7 * 3600 + 40 * 60 + i * 97), ['pdunmore', 'jpark', 'kasante', 'hbrandt', 'mtanaka', 'nkowalczyk'][i - 1], SP, ['CN', 'RU', 'BR', 'IN', 'VN', 'NG'][i - 1], 50126, 'Invalid username or password or Invalid on-premise username or password.', 'Exchange ActiveSync', 'Unknown / python-requests');
  for (let i = 1; i <= 4; i++) ev('tnx' + i, hms(8 * 3600 + 34 * 60 + i * 130), 'Firewall', 'h-tenable-01', 'Allow', `Nov  4 ${hms(8 * 3600 + 34 * 60 + i * 130)} PA-INT-01 TRAFFIC end src=10.50.2.40 dst=10.50.${i + 4}.0/24 dport=135,445 app=msrpc action=allow sessions=${900 + i * 41} zone=mgmt->user`, { action: 'allow' }, { src: '10.50.2.40' });
  wn('svcx', '08:35:10', 'h-app-bil-01', '7000', 'Service failed to start', 'svc-billing-sync', '10.50.0.45', 'Service Control Manager 7000 The BillingSyncSvc service failed to start due to the following error: The service did not start due to a logon failure.', { service: 'BillingSyncSvc' });
  ev('bmx', '09:00:40', 'Cloud', null, 'MailPulse Campaign Start', 'MailPulse audit 09:00:40 campaign=WEB-Q4-PROV started_by=pdunmore@meridiancb.example list=ProviderContacts_Q4 size=1840 from=webinars@meridiancb.example', { campaign: 'WEB-Q4-PROV' }, { user: 'pdunmore', src: '203.0.113.10' });
  ev('nax', '08:41:05', 'Cloud', null, 'Intune Enroll', 'Intune 08:41:05 Device IT-LT-020 enrolled and marked compliant; primary user kasante; ticket HD-48812', { device: 'IT-LT-020' }, { user: 'kasante', src: '10.50.2.120' });
  ev('psx', '09:15:00', 'Cloud', null, 'SCCM Deployment', 'MECM 09:15:00 Deployment created: "Hardware-Software Inventory (CHG-5131)" target=Collection:Finance-Workstations by=tgrimaldi', { change: 'CHG-5131' }, { user: 'tgrimaldi', src: '10.50.2.111' });
  ev('ooox', '10:26:48', 'Cloud', null, 'Calendar OOO', 'Exchange 10:26:48 Calendar event created hbrandt: "OOO - leave 11/05-11/19" visible to Revenue Cycle', { }, { user: 'hbrandt', src: '203.0.113.10' });
  ev('mdx', '12:49:10', 'Auth', null, 'Helpdesk MFA reset note', 'ServiceDesk 12:49:10 HD-48790 note: user keeping old phone until Authenticator moved; approve via old device then re-register', { ticket: 'HD-48790' }, { user: 'mtanaka' });
  ev('vvx', '12:09:20', 'WinEvent', 'h-veeam-01', 'Veeam Job Progress', 'Veeam Backup 12:09:20 [Job Progress] Backup_FS01_SyntheticFull processed 48% (FS01 D:) status=Running', { job: 'Backup_FS01_SyntheticFull' }, { user: 'svc-veeam', src: '10.50.0.30' });
  ev('phx', '13:36:30', 'Email', null, 'Delivered', 'Nov  4 13:36:30 mailgw01 delivered from=hr-notices@benefitsportal-updates.example rcpts=212 X-PhishGuard-Campaign=Q4-AWARE-2026 allowlist=phishsim', { campaign: 'Q4-AWARE-2026' }, { src: '198.51.100.140' });
  ev('dlx', '10:58:12', 'WinEvent', 'h-bil-022', 'Process Create', 'Sysmon 1 ProcessCreate: Image=C:\Program Files\EDIBatch\EDIBatch.exe CommandLine="EDIBatch.exe --batch 837P --encrypt pgp --out C:\EDI\out" User=MERIDIAN\rmenon', { process: 'EDIBatch.exe' }, { user: 'rmenon', src: '10.50.9.22' });
  ev('tpx1', '06:34:20', 'Cloud', null, 'Set-Mailbox', '{"CreationTime":"2026-11-04T06:34:20","Workload":"Exchange","Operation":"Set-InboxRule","UserId":"nkowalczyk@meridiancb.example","ClientIP":"203.0.113.77","Parameters":[{"Name":"Identity","Value":"."},{"Name":"Enabled","Value":"True"}]}', {}, { user: 'nkowalczyk', src: ATK });
  ev('tpx2', '06:36:44', 'Cloud', null, 'Send', '{"CreationTime":"2026-11-04T06:36:44","Workload":"Exchange","Operation":"Send","UserId":"nkowalczyk@meridiancb.example","ClientIP":"203.0.113.77","Item":{"Subject":"Updated remittance banking details","Recipients":3,"Internal":false}}', {}, { user: 'nkowalczyk', src: ATK });
  ev('tpx3', '06:44:15', 'Auth', null, 'SignIn Success', '2026-11-04 06:44:15 SigninLogs UserPrincipalName=nkowalczyk@meridiancb.example AppDisplayName="MailSyncPro" IPAddress=203.0.113.77 Location=MD ResultType=0 ResultDescription="Success" ClientAppUsed="Other clients" DeviceDetail="Unknown / python-requests"', { app: 'MailSyncPro' }, { user: 'nkowalczyk', src: ATK });
  ev('tpx4', '06:56:48', 'Firewall', 'h-vpn-01', 'Allow', 'Nov  4 06:56:48 PA-VPN-01 TRAFFIC end src=10.60.8.41 dst=10.50.0.10 dport=389,88,135 app=ldap action=allow sessions=214 zone=gp-vpn->servers', { action: 'allow' }, { src: '10.60.8.41', dst: '10.50.0.10', user: 'nkowalczyk' });
  ev('tpx5', '09:14:00', 'Cloud', null, 'Report', 'ServiceDesk 09:14:00 HD-48801 created by csupport: "Remittance bank details changed email received by provider ABC Clinic - claims forward rule?" status=New', { ticket: 'HD-48801' }, { user: 'cwhitlock' });
  ev('tpx6', '08:22:00', 'Auth', null, 'SignIn Failure 50126', '2026-11-04 08:22:00 SigninLogs UserPrincipalName=nkowalczyk@meridiancb.example AppDisplayName="Exchange ActiveSync" IPAddress=198.51.100.23 Location=RU ResultType=50126 ResultDescription="Invalid username or password" DeviceDetail="Unknown / python-requests"', {}, { user: 'nkowalczyk', src: '198.51.100.23' });
  ev('lg1', '07:05:00', 'VPN', 'h-vpn-01', 'GLOBALPROTECT gateway-auth', 'Nov  4 07:05:00 PA-VPN-01 1,2026/11/04 07:05:00,013201008812,GLOBALPROTECT,0,2305,vsys1,gateway-auth,login,Gateway-Corp,,SAML,"MERIDIAN\tgrimaldi",US,IT-LT-011,198.51.100.201,10.60.8.12,client_ver=6.1.4-12,"Microsoft Windows 11 Pro",status=success', { country: 'US' }, { user: 'tgrimaldi', src: '198.51.100.201' });
  ev('lg2', '07:48:10', 'VPN', 'h-vpn-01', 'GLOBALPROTECT gateway-auth', 'Nov  4 07:48:10 PA-VPN-01 1,2026/11/04 07:48:10,013201008812,GLOBALPROTECT,0,2305,vsys1,gateway-auth,login,Gateway-Corp,,SAML,"MERIDIAN\glindqvist",GB,EXE-LT-003,192.0.2.55,10.60.8.19,client_ver=6.1.4-12,"Microsoft Windows 11 Enterprise",status=success', { country: 'GB' }, { user: 'glindqvist', src: '192.0.2.55' });

  window.SOC_SCENARIOS.push({
    id: 's2-vpn-mfa',
    title: 'Push Notification Fatigue',
    tagline: 'A VPN login from abroad, a pile of denied MFA prompts, and a quiet inbox rule. Or just a busy Wednesday.',
    difficulty: 'Medium',
    date: '2026-11-04',
    shift: { start: '08:00', end: '16:00' },
    company: { name: 'Meridian Care Billing', domain: D, industry: 'Healthcare revenue cycle and billing services', blurb: 'About 600 staff in Columbus OH and two remote billing centres. Entra ID with Authenticator push MFA, Palo Alto GlobalProtect VPN, Microsoft 365, hybrid AD. Handles claims and patient balances for regional clinics, so PHI and bank details are everywhere.' },
    handover: 'Night shift: quiet. Entra ID Protection and UEBA rules run as batch jobs with up to ~3h lag, so alerts can describe activity from earlier this morning.\nCHG-5120: svc-billing-sync password rotated 07:00 by IT; BILL-APP01 service may need its stored credential updated.\nCHG-5127: Tenable authenticated scan of the internal ranges 08:30-10:30 from TENABLE-SC01 (10.50.2.40).\nCHG-5131: SCCM inventory script goes to Finance workstations from 09:15. CHG-5124: Veeam synthetic full on FS01 at 12:00.\nExec travel: CFO Gregory Lindqvist is in London 11/03-11/07 (geo exception TRV-2210).\nKnown noisy: internet password-spray against Exchange ActiveSync, Q4 security-awareness phishing simulation (Thursday campaign may start early).',
    users: [
      { id: 'u-nkowalczyk', name: 'Nadia Kowalczyk', username: 'nkowalczyk', email: 'nkowalczyk@' + D, dept: 'Revenue Cycle', title: 'Billing Operations Supervisor', manager: 'Carys Whitlock', location: 'Columbus HQ' },
      { id: 'u-rmenon', name: 'Ravi Menon', username: 'rmenon', email: 'rmenon@' + D, dept: 'Revenue Cycle', title: 'EDI Analyst', manager: 'Carys Whitlock', location: 'Columbus HQ' },
      { id: 'u-mtanaka', name: 'Mei Tanaka', username: 'mtanaka', email: 'mtanaka@' + D, dept: 'Revenue Cycle', title: 'Claims Specialist', manager: 'Nadia Kowalczyk', location: 'Columbus HQ' },
      { id: 'u-hbrandt', name: 'Hollis Brandt', username: 'hbrandt', email: 'hbrandt@' + D, dept: 'Revenue Cycle', title: 'Billing Team Lead', manager: 'Carys Whitlock', location: 'Columbus HQ' },
      { id: 'u-ssorensen', name: 'Stefan Sorensen', username: 'ssorensen', email: 'ssorensen@' + D, dept: 'Revenue Cycle', title: 'Billing Analyst', manager: 'Hollis Brandt', location: 'Columbus HQ' },
      { id: 'u-cwhitlock', name: 'Carys Whitlock', username: 'cwhitlock', email: 'cwhitlock@' + D, dept: 'Revenue Cycle', title: 'Director, Revenue Cycle', manager: 'Gregory Lindqvist', location: 'Columbus HQ' },
      { id: 'u-glindqvist', name: 'Gregory Lindqvist', username: 'glindqvist', email: 'glindqvist@' + D, dept: 'Executive', title: 'Chief Financial Officer', manager: 'CEO', location: 'Columbus HQ (travelling: London)' },
      { id: 'u-evasquez', name: 'Elena Vasquez', username: 'evasquez', email: 'evasquez@' + D, dept: 'Finance', title: 'Senior Accountant', manager: 'Gregory Lindqvist', location: 'Columbus HQ' },
      { id: 'u-kasante', name: 'Kwabena Asante', username: 'kasante', email: 'kasante@' + D, dept: 'IT', title: 'Systems Administrator (new hire)', manager: 'Louis Fontaine', location: 'Columbus HQ' },
      { id: 'u-tgrimaldi', name: 'Tomas Grimaldi', username: 'tgrimaldi', email: 'tgrimaldi@' + D, dept: 'IT', title: 'IT Systems Engineer', manager: 'Louis Fontaine', location: 'Columbus HQ' },
      { id: 'u-lfontaine', name: 'Louis Fontaine', username: 'lfontaine', email: 'lfontaine@' + D, dept: 'IT', title: 'Chief Information Officer', manager: 'CEO', location: 'Columbus HQ' },
      { id: 'u-pdunmore', name: 'Priscilla Dunmore', username: 'pdunmore', email: 'pdunmore@' + D, dept: 'Marketing', title: 'Marketing Manager', manager: 'Jin Park', location: 'Columbus HQ' },
      { id: 'u-jpark', name: 'Jin Park', username: 'jpark', email: 'jpark@' + D, dept: 'Marketing', title: 'Marketing Director', manager: 'CEO', location: 'Columbus HQ' },
      { id: 'u-dachebe', name: 'Desmond Achebe', username: 'dachebe', email: 'dachebe@' + D, dept: 'Human Resources', title: 'HR Generalist', manager: 'Adele Moreau', location: 'Columbus HQ' },
      { id: 'u-amoreau', name: 'Adele Moreau', username: 'amoreau', email: 'amoreau@' + D, dept: 'Human Resources', title: 'HR Director', manager: 'CEO', location: 'Columbus HQ' },
      { id: 'u-svc-bill', name: 'svc-billing-sync', username: 'svc-billing-sync', email: 'svc-billing-sync@' + D, dept: 'IT', title: 'Service account (Billing sync)', manager: 'Tomas Grimaldi', location: 'n/a' },
      { id: 'u-svc-tnbl', name: 'svc-tenable', username: 'svc-tenable', email: 'svc-tenable@' + D, dept: 'IT', title: 'Service account (Tenable scanner)', manager: 'Louis Fontaine', location: 'n/a' }
    ],
    hosts: [
      { id: 'h-bil-014', hostname: 'BIL-LT-014', ip: '10.50.9.14', os: 'Windows 11 Pro', type: 'laptop', userId: 'u-nkowalczyk', dept: 'Revenue Cycle', criticality: 'medium', agent: '7.4.1' },
      { id: 'h-bil-022', hostname: 'BIL-LT-022', ip: '10.50.9.22', os: 'Windows 11 Pro', type: 'laptop', userId: 'u-rmenon', dept: 'Revenue Cycle', criticality: 'medium', agent: '7.4.1' },
      { id: 'h-bil-031', hostname: 'BIL-LT-031', ip: '10.50.9.31', os: 'Windows 11 Pro', type: 'laptop', userId: 'u-mtanaka', dept: 'Revenue Cycle', criticality: 'low', agent: '7.4.1' },
      { id: 'h-bil-009', hostname: 'BIL-LT-009', ip: '10.50.9.9', os: 'Windows 11 Pro', type: 'laptop', userId: 'u-hbrandt', dept: 'Revenue Cycle', criticality: 'low', agent: '7.4.1' },
      { id: 'h-exe-003', hostname: 'EXE-LT-003', ip: '10.50.1.3', os: 'Windows 11 Enterprise', type: 'laptop', userId: 'u-glindqvist', dept: 'Executive', criticality: 'high', agent: '7.4.1' },
      { id: 'h-fin-019', hostname: 'FIN-WS-019', ip: '10.50.6.19', os: 'Windows 10 Enterprise', type: 'workstation', userId: 'u-evasquez', dept: 'Finance', criticality: 'medium', agent: '7.4.0' },
      { id: 'h-it-020', hostname: 'IT-LT-020', ip: '10.50.2.120', os: 'Windows 11 Pro', type: 'laptop', userId: 'u-kasante', dept: 'IT', criticality: 'high', agent: '7.4.1' },
      { id: 'h-it-011', hostname: 'IT-LT-011', ip: '10.50.2.111', os: 'Windows 11 Pro', type: 'laptop', userId: 'u-tgrimaldi', dept: 'IT', criticality: 'high', agent: '7.4.1' },
      { id: 'h-mkt-007', hostname: 'MKT-LT-007', ip: '10.50.7.7', os: 'macOS 14.6', type: 'laptop', userId: 'u-pdunmore', dept: 'Marketing', criticality: 'low', agent: '7.3.2' },
      { id: 'h-hr-005', hostname: 'HR-LT-005', ip: '10.50.5.5', os: 'Windows 11 Pro', type: 'laptop', userId: 'u-dachebe', dept: 'Human Resources', criticality: 'medium', agent: '7.4.1' },
      { id: 'h-fs-01', hostname: 'FS01', ip: '10.50.0.20', os: 'Windows Server 2022', type: 'server', userId: null, dept: 'IT', criticality: 'high', agent: '7.4.1' },
      { id: 'h-dc-01', hostname: 'DC01', ip: '10.50.0.10', os: 'Windows Server 2022', type: 'dc', userId: null, dept: 'IT', criticality: 'crown', agent: '7.4.1' },
      { id: 'h-vpn-01', hostname: 'PA-VPN-01', ip: '10.50.0.2', os: 'PAN-OS 11.1', type: 'network', userId: null, dept: 'IT', criticality: 'high', agent: 'n/a' },
      { id: 'h-tenable-01', hostname: 'TENABLE-SC01', ip: '10.50.2.40', os: 'Red Hat Enterprise Linux 9', type: 'server', userId: 'u-svc-tnbl', dept: 'IT', criticality: 'medium', agent: '7.4.1' },
      { id: 'h-app-bil-01', hostname: 'BILL-APP01', ip: '10.50.0.45', os: 'Windows Server 2019', type: 'server', userId: 'u-svc-bill', dept: 'Revenue Cycle', criticality: 'high', agent: '7.4.1' },
      { id: 'h-prt-01', hostname: 'PRINT-MON01', ip: '10.50.0.60', os: 'Windows Server 2019', type: 'server', userId: null, dept: 'IT', criticality: 'low', agent: '7.4.0' },
      { id: 'h-veeam-01', hostname: 'VEEAM01', ip: '10.50.0.30', os: 'Windows Server 2022', type: 'server', userId: null, dept: 'IT', criticality: 'high', agent: '7.4.1' }
    ],
    alerts: [
      { id: 'A-3001', at: '08:04', title: 'Impossible travel: sign-ins from GB and US 36 minutes apart', severity: 'high', source: 'IAM', rule: 'IAM-0114 Impossible travel (Identity Protection)', hostId: 'h-exe-003', userId: 'u-glindqvist',
        summary: 'Identity Protection flagged two successful sign-ins for the CFO from different countries within 36 minutes.',
        details: { 'User': 'glindqvist (CFO)', 'Sign-in 1': '07:10 GB 192.0.2.55 Teams', 'Sign-in 2': '07:46 US 198.51.100.200 Outlook iOS', 'Risk level': 'medium', 'Distance': '~3,700 mi' },
        eventIds: ids('tr1', 'tr4', 'tr2', 'tr3'), iocs: [{ type: 'ip', value: '192.0.2.55' }, { type: 'ip', value: '198.51.100.200' }, { type: 'user', value: 'glindqvist' }], truth: 'FP',
        explain: 'The CFO is in London on an approved trip (TRV-2210, geo exception on the change calendar and in the handover). The GB sign-in is his managed compliant laptop on hotel wifi. The US sign-in is his registered iPhone, whose traffic egresses through the carrier\'s US gateway (ASN is a mobile carrier CGNAT). Both used the same registered devices, no MFA anomalies.',
        reply: { fp: 'Travel is documented (TRV-2210) and both sign-ins are his registered, compliant devices. The US IP is a mobile carrier gateway, a classic roaming false positive. Close it.' },
        keywords: ['travel', 'carrier', 'compliant', 'london', 'registered'],
        userReply: 'I am in London until Friday for the lender meetings. Yes both my laptop and phone are with me, nothing odd on my end.',
        helpdeskReply: 'Gregory flew out Tuesday, travel notice TRV-2210 is on file and Chidi added the geo exception. Phone is on roaming.' },
      { id: 'A-3002', at: '08:15', title: 'Password spray: 312 failed sign-ins across 61 accounts from one IP', severity: 'high', source: 'IAM', rule: 'IAM-0201 Password spray (many users, one source)', userId: 'u-ssorensen',
        summary: 'A single external IP generated 312 failed authentications against 61 distinct accounts in 24 minutes.',
        details: { 'Source IP': '198.51.100.23', 'Protocol': 'Exchange ActiveSync (legacy)', 'Failed attempts': '312', 'Distinct users': '61', 'Lockouts': '1 (ssorensen)' },
        eventIds: ids('sp1', 'sp2', 'sp3', 'splock', 'spsum'), iocs: [{ type: 'ip', value: '198.51.100.23' }], truth: 'FP',
        explain: 'Internet-wide spray against the legacy ActiveSync endpoint. Every attempt failed (50126), one account hit smart lockout, the correlation summary shows successes=0, no MFA prompts were generated, and Conditional Access blocks legacy auth. IP is a known scanner. Nothing succeeded, so no account was compromised.',
        reply: { fp: 'Zero successes, all blocked by CA legacy-auth block and smart lockout, and the source is a known spray scanner. Nothing to action beyond a block on the IP.' },
        keywords: ['spray', 'zero', 'successes', 'blocked', 'legacy'],
        helpdeskReply: 'Stefan called to say his account locked out around 08:10. We unlocked it, he did not mistype anything, probably that spray.' },
      { id: 'A-3003', at: '08:31', title: 'Repeated failed logons for service account svc-billing-sync', severity: 'medium', source: 'SIEM', rule: 'SIEM-0332 Service account auth failures', hostId: 'h-app-bil-01', userId: 'u-svc-bill',
        summary: 'Service account svc-billing-sync failed Kerberos and service logons 3 times from BILL-APP01.',
        details: { 'Account': 'svc-billing-sync', 'Source host': 'BILL-APP01', 'Failure code': '0x18 / 0xC000006A (bad password)', 'Count': '3 in 19 min' },
        eventIds: ids('svc4724', 'svc1', 'svc2', 'svc3'), iocs: [{ type: 'user', value: 'svc-billing-sync' }, { type: 'host', value: 'BILL-APP01' }], truth: 'FP',
        explain: 'Password for this service account was rotated at 07:02 (4724 by tgrimaldi, CHG-5120). The BillingSyncSvc service on BILL-APP01 kept using the old stored credential. Failures are from its single known host, and a successful logon appears at 08:46 once IT updated the stored credential.',
        reply: { fp: 'Matches CHG-5120 password rotation; failures stop at 08:44 when the stored service credential was updated. Close it.' },
        keywords: ['rotation', 'service', 'chg-5120', 'password', 'stale'],
        helpdeskReply: 'Tomas rotated that password this morning and is fixing the service credential on BILL-APP01 now.' },
      { id: 'A-3004', at: '08:50', title: 'Horizontal port scan from internal server', severity: 'high', source: 'NDR', rule: 'NDR-0077 Internal horizontal scan', hostId: 'h-tenable-01',
        summary: 'TENABLE-SC01 contacted 412 internal hosts across 1000 ports in 12 minutes using SMB, RDP and WinRM probes.',
        details: { 'Source': '10.50.2.40 TENABLE-SC01', 'Unique destinations': '412', 'Unique ports': '1000', 'Credentialed logon seen': 'svc-tenable on DC01' },
        eventIds: ids('tn1', 'tn2', 'tn3', 'tn4', 'tn5'), iocs: [{ type: 'ip', value: '10.50.2.40' }, { type: 'host', value: 'TENABLE-SC01' }], truth: 'FP',
        explain: 'Scheduled authenticated vulnerability scan, CHG-5127 (08:30-10:30). Source is the Tenable scanner, the scan account svc-tenable authenticated to DC01, and the user-agent is Nessus.',
        reply: { fp: 'This is the approved Tenable scan from CHG-5127, inside its window and from the scanner host. Close it.' },
        keywords: ['tenable', 'scan', 'chg-5127', 'change', 'scanner'], helpdeskReply: 'Yes, the vulnerability scan window is 08:30 to 10:30 today, Chidi announced it.' },
      { id: 'A-3005', at: '09:12', title: 'Mass email: 1,840 recipients in 10 minutes', severity: 'low', source: 'Email GW', rule: 'EGW-0113 Bulk outbound mail volume', userId: 'u-pdunmore',
        summary: 'Outbound mail volume for webinars@ exceeded 500 recipients per 10 minutes.',
        details: { 'Sender': 'webinars@' + D, 'Recipients': '1840', 'Relay': 'bounce.mailpulse-mkt.example 198.51.100.61', 'SPF/DKIM': 'pass/pass' },
        eventIds: ids('bm1', 'bm2', 'bm3', 'bm4'), iocs: [{ type: 'ip', value: '198.51.100.61' }, { type: 'email', value: 'webinars@' + D }], truth: 'FP',
        explain: 'Marketing\'s approved MailPulse campaign "Q4 Provider Webinar". SPF and DKIM pass for our domain, the relay IP is the registered MailPulse sender, the campaign was started by Priscilla from the MailPulse console, and recipients are the external provider list with unsubscribe.',
        reply: { fp: 'Legitimate marketing campaign through our contracted bulk mailer with valid SPF and DKIM. Close as FP.' },
        keywords: ['marketing', 'mailpulse', 'campaign', 'dkim', 'spf'],
        userReply: 'Yes that is the Q4 provider webinar invite, I scheduled it this morning in MailPulse. Sorry, should have warned security.' },
      { id: 'A-3006', at: '09:30', title: 'New privileged role activation shortly after first-ever sign-in', severity: 'high', source: 'IAM', rule: 'IAM-0310 First sign-in followed by admin role activation', hostId: 'h-it-020', userId: 'u-kasante',
        summary: 'A brand-new account activated Exchange Administrator and registered an MFA method within 30 minutes of first sign-in.',
        details: { 'User': 'kasante', 'Account age': '1 day', 'Role': 'Exchange Administrator (PIM)', 'MFA registered': '09:02 Authenticator (iPhone)', 'Source IP': '203.0.113.10 (corporate NAT)' },
        eventIds: ids('na1', 'na2', 'na3', 'na4', 'na5'), iocs: [{ type: 'user', value: 'kasante' }, { type: 'host', value: 'IT-LT-020' }], truth: 'FP',
        explain: 'Onboarding of a new Systems Administrator under HD-48812. The role was assigned by tgrimaldi at 07:52 (ticket referenced), the sign-in came from the corporate IP on the freshly enrolled compliant laptop, and the PIM justification cites the same ticket.',
        reply: { fp: 'This is the new hire from HD-48812: role assigned by IT, compliant new device, corporate IP and ticket in the PIM justification. Close it.' },
        keywords: ['onboarding', 'new hire', 'hd-48812', 'pim', 'ticket'],
        userReply: 'Hi, it is my first day on the sysadmin team. Tomas set up my laptop and added me as eligible for Exchange admin.',
        helpdeskReply: 'Kwabena Asante started today, HD-48812. Tomas gave him Exchange admin via PIM for the shared-mailbox cleanup.' },
      { id: 'A-3007', at: '09:41', title: 'Excessive MFA denials followed by approval', severity: 'medium', source: 'IAM', rule: 'IAM-0233 MFA fatigue pattern (batch UEBA)', hostId: 'h-bil-014', userId: 'u-nkowalczyk',
        summary: 'User nkowalczyk generated 20 failed MFA push challenges in 18 minutes from a single IP before one was approved.',
        details: { 'User': 'nkowalczyk', 'Application': 'Palo Alto GlobalProtect', 'Failed MFA (500121)': '20', 'Result': 'Approved 06:21:08', 'Source IP': '203.0.113.77 (MD)', 'Device': 'Unregistered Windows 10' },
        eventIds: ids('push1', 'push2', 'push10', 'push21', 'mfaok'), iocs: [{ type: 'ip', value: '203.0.113.77' }, { type: 'user', value: 'nkowalczyk' }], truth: 'TP', incident: 'INC-1',
        explain: 'Classic MFA push fatigue. Nadia\'s password had been phished days earlier (she entered it on a lookalike "password expiry" page). At 06:02 the attacker started GlobalProtect SAML sign-ins from a hosting provider in Moldova, generating 20 pushes (500121 denied or timed out), and she approved one at 06:21 on her commute to make it stop. The sign-in device was unregistered and the IP was not her normal US carrier IP.',
        reply: { fp: 'n/a', tp: 'Repeated denied pushes then an approval from a foreign hosting IP on an unregistered device is textbook MFA fatigue. Reset her password, revoke sessions and MFA methods, block the IP. I am opening the incident.', irTp: 'MFA fatigue success, confirmed. We will disable the account, revoke tokens and remove the attacker-registered MFA method and OAuth app.' },
        keywords: ['mfa', 'fatigue', 'push', 'approved', '203.0.113.77', 'unregistered', 'compromised'],
        userReply: 'I got a bunch of prompts at around six this morning on the train and finally pressed approve to make it stop. I did type my password into a "password expiry" page last Friday. Did I do something wrong?',
        helpdeskReply: 'Nadia has not called in. Her laptop only came online at 08:31 this morning.' },
      { id: 'A-3008', at: '09:58', title: 'Encoded PowerShell launched by system process', severity: 'high', source: 'EDR', rule: 'EDR-0420 PowerShell -EncodedCommand with bypass', hostId: 'h-fin-019', userId: 'u-evasquez',
        summary: 'powershell.exe ran with -ExecutionPolicy Bypass and -EncodedCommand as SYSTEM on FIN-WS-019.',
        details: { 'Process': 'powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand', 'Parent': 'CcmExec.exe', 'User': 'SYSTEM', 'Host': 'FIN-WS-019' },
        eventIds: ids('ps4', 'ps1', 'ps2', 'ps3'), iocs: [{ type: 'host', value: 'FIN-WS-019' }], truth: 'FP',
        explain: 'Parent is the SCCM client (CcmExec.exe), the script text (4104) is a Win32_Product inventory written to \\\\SCCM01\\inv$ referencing CHG-5131, the deployment was created by tgrimaldi, and the host talks only to the SCCM MP. Change calendar covers it.',
        reply: { fp: 'SCCM-pushed inventory script (CHG-5131, deployed by Tomas). Decoded payload is just Get-CimInstance Win32_Product. Close it.' },
        keywords: ['sccm', 'ccmexec', 'chg-5131', 'inventory', 'encoded'],
        helpdeskReply: 'Tomas is pushing a software inventory to the Finance machines this morning.' },
      { id: 'A-3009', at: '10:20', title: 'VPN login from new country and hosting-provider ASN', severity: 'medium', source: 'FW', rule: 'FW-0508 GlobalProtect login from anomalous geo/ASN', userId: 'u-nkowalczyk',
        summary: 'GlobalProtect gateway login for nkowalczyk from a country never seen for this user, on a non-domain machine, over a hosting provider network.',
        details: { 'User': 'nkowalczyk', 'Public IP': '203.0.113.77 (MD)', 'ASN': 'AS64496 Northgate Hosting Ltd', 'Client OS': 'Windows Server 2022', 'Machine name': 'WIN-8KQ2M4T1VDR', 'Assigned IP': '10.60.8.41', 'HIP': 'Unmanaged' },
        eventIds: ids('gpportal', 'gpgw', 'gphip', 'gptun', 'gpout'), iocs: [{ type: 'ip', value: '203.0.113.77' }, { type: 'host', value: 'WIN-8KQ2M4T1VDR' }], truth: 'TP', incident: 'INC-1',
        explain: 'The attacker\'s VPN session that followed the approved MFA push: foreign hosting ASN, a Windows Server 2022 VPS (not the user\'s managed laptop, which was powered off), HIP report unmanaged. Inside the tunnel (10.60.8.41) they enumerated DC01, pulled ~900 MB from FS01\\BillingExports over SMB and POSTed 88 MB to mailrelay-hub.example.',
        reply: { fp: 'n/a', tp: 'Foreign hosting-provider VPN login on an unmanaged server OS right after the MFA fatigue approval, then SMB to FS01 and a large upload. Confirmed compromise. Kill the VPN session and block the IP.', irTp: 'Confirmed. Pulling VPN session data for 10.60.8.41 and scoping what left FS01.' },
        keywords: ['vpn', 'globalprotect', 'hosting', 'asn', 'moldova', '10.60.8.41', 'unmanaged'],
        userReply: 'I was on the train at that time. I do not have anything that connects from Moldova, obviously.' },
      { id: 'A-3010', at: '10:34', title: 'Mailbox rule created forwarding all mail', severity: 'medium', source: 'SIEM', rule: 'M365-0042 New inbox rule with forward action', hostId: 'h-bil-009', userId: 'u-hbrandt',
        summary: 'New-InboxRule created for hbrandt forwarding incoming messages to another address.',
        details: { 'User': 'hbrandt', 'Rule': 'OOO coverage - Stefan', 'Forward to': 'ssorensen@' + D, 'Client': 'OWA', 'Source IP': '203.0.113.10' },
        eventIds: ids('oo1', 'oo2', 'oo4', 'oo3'), iocs: [{ type: 'user', value: 'hbrandt' }, { type: 'email', value: 'ssorensen@' + D }], truth: 'FP',
        explain: 'Hollis is going on leave 11/05-11/19 (scheduled auto-reply set 2 minutes earlier) and forwards to his teammate Stefan, an internal mailbox. Created from OWA on his compliant laptop via the corporate IP, no hiding or deleting, no foreign IP. Contrast with Nadia\'s rule: external address, delete + mark read, from a foreign IP.',
        reply: { fp: 'Internal forward to a coworker for leave coverage, from his own device and corporate IP, with a matching auto-reply. Close it.' },
        keywords: ['internal', 'forward', 'leave', 'auto-reply', 'coverage'],
        userReply: 'Yes, I am out starting tomorrow for two weeks. Carys asked me to forward my queue to Stefan so nothing gets missed.' },
      { id: 'A-3011', at: '10:52', title: 'Suspicious inbox rule and bulk mailbox access from foreign IP', severity: 'high', source: 'SIEM', rule: 'M365-0058 Rule hiding/forwarding externally + mass MailItemsAccessed', hostId: 'h-bil-014', userId: 'u-nkowalczyk',
        summary: 'Mailbox nkowalczyk got a rule forwarding finance keywords to an external address and deleting the originals, followed by 1,420 items accessed and 312 SharePoint downloads.',
        details: { 'User': 'nkowalczyk', 'Rule name': '.', 'Forward to': 'nk.billing.archive@mailrelay-hub.example', 'Actions': 'MarkAsRead, DeleteMessage', 'Items accessed': '1420', 'Client': 'python-requests/2.31.0', 'IP': '203.0.113.77', 'OAuth consent': 'MailSyncPro (unverified)' },
        eventIds: ids('rule', 'oauth', 'mailacc', 'spdl2', 'spdl3', 'mfareg'), iocs: [{ type: 'email', value: 'nk.billing.archive@mailrelay-hub.example' }, { type: 'domain', value: 'mailrelay-hub.example' }, { type: 'ip', value: '203.0.113.77' }], truth: 'TP', incident: 'INC-1',
        explain: 'Post-compromise actions by the attacker minutes after the VPN login: a rule named "." that forwards remittance/ACH/wire mail to an external relay and deletes it, an unverified OAuth app (MailSyncPro) for persistence, a new attacker-owned phone MFA method, mass MailItemsAccessed, and bulk SharePoint downloads of banking details, all from 203.0.113.77 with a python-requests user agent.',
        reply: { fp: 'n/a', tp: 'Hidden external-forward rule, rogue OAuth consent and bulk downloads from the same foreign IP: business email compromise in progress. Disable the account, remove the rule, OAuth app and phone method.', irTp: 'BEC staging, confirmed. I will purge the rule/app and check what left via mailrelay-hub.example.' },
        keywords: ['inbox rule', 'forward', 'external', 'oauth', 'mailsyncpro', 'bec', 'mailitemsaccessed', 'persistence'],
        userReply: 'I never made a rule called "." and I certainly would not forward mail outside. I noticed my Sent items looked odd but thought it was sync lag.' },
      { id: 'A-3012', at: '11:25', title: 'DLP: 1,204 SSNs sent externally', severity: 'medium', source: 'DLP', rule: 'DLP-0021 PHI-SSN-BULK to external recipient', hostId: 'h-bil-022', userId: 'u-rmenon',
        summary: 'EDI analyst sent an attachment containing 1,204 Social Security numbers to an external recipient.',
        details: { 'Sender': 'rmenon', 'Recipient': 'edi@claimlinkexchange.example', 'Attachment': 'CLM837_20261104_1100.zip.pgp', 'Matches': 'SSN x 1204', 'Transport': 'TLS 1.3 partner connector' },
        eventIds: ids('dl4', 'dl1', 'dl2', 'dl3'), iocs: [{ type: 'email', value: 'edi@claimlinkexchange.example' }, { type: 'domain', value: 'claimlinkexchange.example' }], truth: 'FP',
        explain: 'Ravi is the EDI analyst and submits 837 claim batches to the contracted clearinghouse ClaimLink on a schedule (a BAA partner). The file is PGP-encrypted, generated by the EDIBatch tool, and sent over the forced-TLS partner connector. The same pattern occurred at 09:20.',
        reply: { fp: 'Scheduled 837 claim submission to our approved clearinghouse over the partner TLS connector. Entitled user, expected. Close as FP.' },
        keywords: ['clearinghouse', 'edi', 'claimlink', 'baa', 'partner', 'encrypted'],
        userReply: 'That is the routine claims batch to ClaimLink, I send one every two hours. It is generated by EDIBatch and goes out encrypted.',
        helpdeskReply: 'ClaimLink is our clearinghouse vendor, Ravi sends the batches all day.' },
      { id: 'A-3013', at: '12:10', title: 'Shadow copy storage manipulation on file server', severity: 'critical', source: 'EDR', rule: 'EDR-0611 vssadmin shadow storage resize / possible ransomware prep', hostId: 'h-fs-01',
        summary: 'vssadmin.exe was run with Resize ShadowStorage UNBOUNDED on FS01 by a script launched from a helper service.',
        details: { 'Host': 'FS01', 'Command': 'vssadmin.exe Resize ShadowStorage /For=D: /On=D: /MaxSize=UNBOUNDED', 'Parent': 'cmd.exe <- VeeamGuestHelper.exe', 'User': 'SYSTEM' },
        eventIds: ids('vv1', 'vv2', 'vv3', 'vv4'), iocs: [{ type: 'host', value: 'FS01' }], truth: 'FP',
        explain: 'Veeam application-aware backup pre-freeze script. The Veeam job Backup_FS01_SyntheticFull started on VEEAM01 at 12:00:09 (CHG-5124), the process chain is VeeamGuestHelper.exe -> pre-freeze.cmd -> vssadmin, and event 8222 shows Veeam as the VSS requestor. No deletion of shadow copies, no encryption activity.',
        reply: { fp: 'Veeam pre-freeze script during the CHG-5124 synthetic full. Shadows were created (8222) not deleted. Close it.' },
        keywords: ['veeam', 'backup', 'vss', 'chg-5124', 'pre-freeze', 'vssadmin'],
        helpdeskReply: 'The Veeam full on FS01 runs at noon today, Tomas confirmed it is scheduled.' },
      { id: 'A-3014', at: '13:05', title: 'New MFA method registered and old method removed', severity: 'low', source: 'IAM', rule: 'IAM-0188 Security info changed', hostId: 'h-bil-031', userId: 'u-mtanaka',
        summary: 'User mtanaka registered a new Authenticator device and removed the previous one within 6 minutes.',
        details: { 'User': 'mtanaka', 'Added': 'Microsoft Authenticator (iPhone 16)', 'Removed': 'Microsoft Authenticator (iPhone 12)', 'Source IP': '203.0.113.10 (corporate NAT)' },
        eventIds: ids('md1', 'md2', 'md3', 'helpdesk1'), iocs: [{ type: 'user', value: 'mtanaka' }], truth: 'FP',
        explain: 'Mei replaced her phone and opened HD-48790 at 08:20. She approved the change with her old device from her compliant laptop on the corporate IP, then registered the new one. In Nadia\'s case the new method was a phone number registered from a foreign IP, with no ticket.',
        reply: { fp: 'Phone upgrade covered by ticket HD-48790, done from her managed laptop on the corporate network and approved with the old device. Close it.' },
        keywords: ['new phone', 'hd-48790', 'authenticator', 'corporate', 'ticket'],
        userReply: 'Yes I got a new phone, Sam helped me with the ticket. Moved my authenticator over about an hour ago.',
        helpdeskReply: 'HD-48790, Mei\'s new phone. I walked her through moving the Authenticator at her desk.' },
      { id: 'A-3015', at: '13:50', title: 'User clicked link to suspected credential-harvesting site', severity: 'high', source: 'Email GW', rule: 'EGW-0207 URL click on lookalike domain', hostId: 'h-hr-005', userId: 'u-dachebe',
        summary: 'A user clicked a link in an email from an unfamiliar sender that points to a recently registered lookalike domain, followed by a form POST.',
        details: { 'User': 'dachebe', 'Sender': 'hr-notices@benefitsportal-updates.example', 'URL': 'https://secure-training-hub.example/lp/q4-aware', 'POST': 'yes 96 bytes', 'Subject': 'Action required: benefits enrollment closes today' },
        eventIds: ids('ph1', 'ph2', 'ph3', 'ph4'), iocs: [{ type: 'domain', value: 'secure-training-hub.example' }, { type: 'domain', value: 'benefitsportal-updates.example' }, { type: 'email', value: 'hr-notices@benefitsportal-updates.example' }], truth: 'FP',
        explain: 'Security-awareness phishing simulation Q4-AWARE-2026 (X-PhishGuard-Campaign header, allowlisted, planned in the change calendar). The landing page category is Security-Awareness-Training and the vendor domains are in our internal intel as the training platform.',
        reply: { fp: 'It is our PhishGuard Q4 simulation campaign. Landing page is the training vendor. User should be enrolled in remedial training, no incident.' },
        keywords: ['simulation', 'phishguard', 'training', 'campaign', 'awareness'],
        userReply: 'Oh no, was that a test? I clicked it and saw a training page. I did not put in my real password.',
        helpdeskReply: 'Security awareness started the Q4 campaign today, we got a few calls about the benefits email.' },
      { id: 'A-3016', at: '14:40', title: 'Periodic beaconing to rare external domain', severity: 'medium', source: 'NDR', rule: 'NDR-0140 Fixed-interval outbound beacon', hostId: 'h-prt-01',
        summary: 'PRINT-MON01 makes an outbound HTTPS connection to a rarely seen domain every 60 seconds.',
        details: { 'Host': 'PRINT-MON01', 'Destination': 'telemetry.printfleet-cloud.example (192.0.2.150)', 'Interval': '60s +/- 1s', 'Bytes out per beat': '412' },
        eventIds: ids('pf1', 'pf2', 'pf3', 'pf6', 'pf7'), iocs: [{ type: 'domain', value: 'telemetry.printfleet-cloud.example' }, { type: 'ip', value: '192.0.2.150' }], truth: 'FP',
        explain: 'PrintFleet Data Collector agent installed under PO-22817 reports printer status to the vendor cloud on a 60s interval. EDR shows the signed PrintFleetAgent.exe service as the originating process, the domain is registered to the vendor, and it is a long-standing installation.',
        reply: { fp: 'Signed PrintFleet agent doing its vendor telemetry, process and domain both check out. Close it and add the domain to the NDR allowlist.' },
        keywords: ['printfleet', 'telemetry', 'vendor', 'signed', 'print'],
        helpdeskReply: 'That server runs the printer monitoring software, it phones home to the vendor. Been there for years.' }
    ],
    events: EVL,
    edr: {
      'h-bil-014': {
        processes: [
          { pid: 4, ppid: 0, name: 'System', cmd: 'System', user: 'NT AUTHORITY\\SYSTEM', start: '08:31:10', signed: true, publisher: 'Microsoft Corporation', sha256: sh('01'), flag: null, note: 'Cold boot at 08:31:10. Host was fully powered off from 11/03 17:58 to 08:31, no sessions overnight.' },
          { pid: 612, ppid: 4, name: 'wininit.exe', cmd: 'wininit.exe', user: 'NT AUTHORITY\\SYSTEM', start: '08:31:14', signed: true, publisher: 'Microsoft Corporation', sha256: sh('02'), flag: null, note: null },
          { pid: 704, ppid: 612, name: 'services.exe', cmd: 'C:\\Windows\\system32\\services.exe', user: 'NT AUTHORITY\\SYSTEM', start: '08:31:16', signed: true, publisher: 'Microsoft Corporation', sha256: sh('03'), flag: null, note: null },
          { pid: 1288, ppid: 704, name: 'svchost.exe', cmd: 'C:\\Windows\\system32\\svchost.exe -k netsvcs -p', user: 'NT AUTHORITY\\SYSTEM', start: '08:31:20', signed: true, publisher: 'Microsoft Corporation', sha256: sh('04'), flag: null, note: null },
          { pid: 1544, ppid: 704, name: 'MsSense.exe', cmd: 'C:\\Program Files\\Windows Defender Advanced Threat Protection\\MsSense.exe', user: 'NT AUTHORITY\\SYSTEM', start: '08:31:22', signed: true, publisher: 'Microsoft Corporation', sha256: sh('05'), flag: null, note: 'EDR sensor. Healthy, no detections.' },
          { pid: 1722, ppid: 704, name: 'PanGPS.exe', cmd: 'C:\\Program Files\\Palo Alto Networks\\GlobalProtect\\PanGPS.exe', user: 'NT AUTHORITY\\SYSTEM', start: '08:31:25', signed: true, publisher: 'Palo Alto Networks, Inc.', sha256: sh('06'), flag: null, note: 'GlobalProtect agent. No tunnel established today (user on LAN).' },
          { pid: 3912, ppid: 4, name: 'winlogon.exe', cmd: 'winlogon.exe', user: 'NT AUTHORITY\\SYSTEM', start: '08:31:30', signed: true, publisher: 'Microsoft Corporation', sha256: sh('07'), flag: null, note: null },
          { pid: 5120, ppid: 0, name: 'explorer.exe', cmd: 'C:\\Windows\\Explorer.EXE', user: 'MERIDIAN\\nkowalczyk', start: '08:36:20', signed: true, publisher: 'Microsoft Corporation', sha256: sh('08'), flag: null, note: 'First interactive logon of the day at 08:36.' },
          { pid: 5604, ppid: 5120, name: 'OUTLOOK.EXE', cmd: '"C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE"', user: 'MERIDIAN\\nkowalczyk', start: '08:36:48', signed: true, publisher: 'Microsoft Corporation', sha256: sh('09'), flag: null, note: null },
          { pid: 5740, ppid: 5120, name: 'ms-teams.exe', cmd: '"C:\\Program Files\\WindowsApps\\MSTeams\\ms-teams.exe"', user: 'MERIDIAN\\nkowalczyk', start: '08:37:02', signed: true, publisher: 'Microsoft Corporation', sha256: sh('0a'), flag: null, note: null },
          { pid: 6012, ppid: 5120, name: 'chrome.exe', cmd: '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"', user: 'MERIDIAN\\nkowalczyk', start: '08:41:10', signed: true, publisher: 'Google LLC', sha256: sh('0b'), flag: null, note: null },
          { pid: 6420, ppid: 5120, name: 'EXCEL.EXE', cmd: '"C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE" "C:\\Users\\nkowalczyk\\Documents\\Remits_Oct_Reconciliation.xlsx"', user: 'MERIDIAN\\nkowalczyk', start: '09:05:44', signed: true, publisher: 'Microsoft Corporation', sha256: sh('0c'), flag: null, note: null }
        ],
        connections: [
          { t: '08:36:55', pid: 5604, proc: 'OUTLOOK.EXE', dst: '192.0.2.10:443', domain: 'outlook.office365.com', proto: 'TCP' },
          { t: '08:37:10', pid: 5740, proc: 'ms-teams.exe', dst: '192.0.2.11:443', domain: 'teams.microsoft.example', proto: 'TCP' },
          { t: '08:41:30', pid: 6012, proc: 'chrome.exe', dst: '192.0.2.12:443', domain: 'meridiancb.sharepoint.example', proto: 'TCP' }
        ],
        files: [
          { t: '08:37:15', pid: 5604, op: 'modify', path: 'C:\\Users\\nkowalczyk\\AppData\\Local\\Microsoft\\Outlook\\nkowalczyk@meridiancb.example.ost', sha256: sh('11') },
          { t: '09:05:50', pid: 6420, op: 'modify', path: 'C:\\Users\\nkowalczyk\\Documents\\Remits_Oct_Reconciliation.xlsx', sha256: sh('12') }
        ]
      },
      'h-fin-019': {
        processes: [
          { pid: 4, ppid: 0, name: 'System', cmd: 'System', user: 'NT AUTHORITY\\SYSTEM', start: '07:58:02', signed: true, publisher: 'Microsoft Corporation', sha256: sh('21'), flag: null, note: null },
          { pid: 612, ppid: 4, name: 'wininit.exe', cmd: 'wininit.exe', user: 'NT AUTHORITY\\SYSTEM', start: '07:58:05', signed: true, publisher: 'Microsoft Corporation', sha256: sh('22'), flag: null, note: null },
          { pid: 704, ppid: 612, name: 'services.exe', cmd: 'C:\\Windows\\system32\\services.exe', user: 'NT AUTHORITY\\SYSTEM', start: '07:58:07', signed: true, publisher: 'Microsoft Corporation', sha256: sh('23'), flag: null, note: null },
          { pid: 2210, ppid: 704, name: 'CcmExec.exe', cmd: 'C:\\Windows\\CCM\\CcmExec.exe', user: 'NT AUTHORITY\\SYSTEM', start: '07:58:30', signed: true, publisher: 'Microsoft Corporation', sha256: sh('24'), flag: null, note: 'SCCM / MECM client agent.' },
          { pid: 9120, ppid: 2210, name: 'powershell.exe', cmd: 'powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand JABpAG4AdgAgAD0AIABHAGUAdAAtAEMAaQBtAEkAbgBzAHQAYQBuAGMAZQA=', user: 'NT AUTHORITY\\SYSTEM', start: '09:46:03', signed: true, publisher: 'Microsoft Corporation', sha256: sh('25'), flag: 'suspicious', note: 'Parent is CcmExec.exe. Decoded: inventory collection (Get-CimInstance Win32_Product) to \\\\SCCM01\\inv$. Matches CHG-5131.' },
          { pid: 9132, ppid: 9120, name: 'conhost.exe', cmd: 'conhost.exe 0xffffffff -ForceV1', user: 'NT AUTHORITY\\SYSTEM', start: '09:46:03', signed: true, publisher: 'Microsoft Corporation', sha256: sh('26'), flag: null, note: null },
          { pid: 5088, ppid: 0, name: 'explorer.exe', cmd: 'C:\\Windows\\Explorer.EXE', user: 'MERIDIAN\\evasquez', start: '08:12:40', signed: true, publisher: 'Microsoft Corporation', sha256: sh('27'), flag: null, note: null },
          { pid: 5390, ppid: 5088, name: 'EXCEL.EXE', cmd: '"EXCEL.EXE" "C:\\Users\\evasquez\\Documents\\Q3_Close_Workbook.xlsx"', user: 'MERIDIAN\\evasquez', start: '08:20:11', signed: true, publisher: 'Microsoft Corporation', sha256: sh('28'), flag: null, note: null }
        ],
        connections: [
          { t: '09:46:20', pid: 2210, proc: 'CcmExec.exe', dst: '10.50.0.50:8530', domain: 'sccm01.meridiancb.example', proto: 'TCP' },
          { t: '09:47:41', pid: 9120, proc: 'powershell.exe', dst: '10.50.0.50:445', domain: 'sccm01.meridiancb.example', proto: 'TCP' }
        ],
        files: [
          { t: '09:46:02', pid: 2210, op: 'create', path: 'C:\\Windows\\CCM\\SystemTemp\\5f3a9c1e-77d2-4b0e-9a5c-0e1b2c3d4e5f.ps1', sha256: sh('31') },
          { t: '09:47:40', pid: 9120, op: 'create', path: '\\\\SCCM01\\inv$\\FIN-WS-019.json', sha256: sh('32') }
        ]
      },
      'h-fs-01': {
        processes: [
          { pid: 4, ppid: 0, name: 'System', cmd: 'System', user: 'NT AUTHORITY\\SYSTEM', start: '02:10:04', signed: true, publisher: 'Microsoft Corporation', sha256: sh('41'), flag: null, note: null },
          { pid: 612, ppid: 4, name: 'wininit.exe', cmd: 'wininit.exe', user: 'NT AUTHORITY\\SYSTEM', start: '02:10:08', signed: true, publisher: 'Microsoft Corporation', sha256: sh('42'), flag: null, note: null },
          { pid: 704, ppid: 612, name: 'services.exe', cmd: 'C:\\Windows\\system32\\services.exe', user: 'NT AUTHORITY\\SYSTEM', start: '02:10:10', signed: true, publisher: 'Microsoft Corporation', sha256: sh('43'), flag: null, note: null },
          { pid: 1840, ppid: 704, name: 'VeeamTransportSvc.exe', cmd: 'C:\\Program Files\\Veeam\\Backup Transport\\VeeamTransportSvc.exe', user: 'NT AUTHORITY\\SYSTEM', start: '02:10:40', signed: true, publisher: 'Veeam Software Group GmbH', sha256: sh('44'), flag: null, note: 'Veeam transport service.' },
          { pid: 2300, ppid: 1840, name: 'VeeamGuestHelper.exe', cmd: 'C:\\Windows\\VeeamVssSupport\\VeeamGuestHelper.exe -pipe veeamguest_9a1f', user: 'NT AUTHORITY\\SYSTEM', start: '12:00:30', signed: true, publisher: 'Veeam Software Group GmbH', sha256: sh('45'), flag: null, note: 'Started by Veeam job Backup_FS01_SyntheticFull.' },
          { pid: 7320, ppid: 2300, name: 'cmd.exe', cmd: 'cmd.exe /c C:\\Windows\\VeeamVssSupport\\pre-freeze.cmd', user: 'NT AUTHORITY\\SYSTEM', start: '12:00:38', signed: true, publisher: 'Microsoft Corporation', sha256: sh('46'), flag: null, note: null },
          { pid: 7344, ppid: 7320, name: 'vssadmin.exe', cmd: 'vssadmin.exe Resize ShadowStorage /For=D: /On=D: /MaxSize=UNBOUNDED', user: 'NT AUTHORITY\\SYSTEM', start: '12:00:40', signed: true, publisher: 'Microsoft Corporation', sha256: sh('47'), flag: 'suspicious', note: 'Shadow storage resize (no delete). Parent chain is Veeam pre-freeze script.' },
          { pid: 7390, ppid: 704, name: 'vssvc.exe', cmd: 'C:\\Windows\\system32\\vssvc.exe', user: 'NT AUTHORITY\\SYSTEM', start: '12:00:41', signed: true, publisher: 'Microsoft Corporation', sha256: sh('48'), flag: null, note: 'Volume Shadow Copy service.' }
        ],
        connections: [
          { t: '12:00:12', pid: 1840, proc: 'VeeamTransportSvc.exe', dst: '10.50.0.30:6162', domain: 'veeam01.meridiancb.example', proto: 'TCP' }
        ],
        files: [
          { t: '12:00:38', pid: 7320, op: 'modify', path: 'C:\\Windows\\VeeamVssSupport\\pre-freeze.cmd', sha256: sh('51') },
          { t: '12:01:02', pid: 7390, op: 'create', path: 'D:\\System Volume Information\\{3808876b-c176-4e48-b7ae-04046e6cc752}', sha256: sh('52') }
        ]
      },
      'h-prt-01': {
        processes: [
          { pid: 4, ppid: 0, name: 'System', cmd: 'System', user: 'NT AUTHORITY\\SYSTEM', start: '01:00:03', signed: true, publisher: 'Microsoft Corporation', sha256: sh('61'), flag: null, note: null },
          { pid: 704, ppid: 4, name: 'services.exe', cmd: 'C:\\Windows\\system32\\services.exe', user: 'NT AUTHORITY\\SYSTEM', start: '01:00:09', signed: true, publisher: 'Microsoft Corporation', sha256: sh('62'), flag: null, note: null },
          { pid: 2900, ppid: 704, name: 'PrintFleetAgent.exe', cmd: '"C:\\Program Files\\PrintFleet\\DataCollector\\PrintFleetAgent.exe" /service', user: 'NT AUTHORITY\\NETWORK SERVICE', start: '01:00:41', signed: true, publisher: 'PrintFleet Technologies Inc.', sha256: sh('63'), flag: null, note: 'Vendor printer-fleet monitoring agent, installed under PO-22817.' },
          { pid: 3120, ppid: 704, name: 'spoolsv.exe', cmd: 'C:\\Windows\\System32\\spoolsv.exe', user: 'NT AUTHORITY\\SYSTEM', start: '01:00:20', signed: true, publisher: 'Microsoft Corporation', sha256: sh('64'), flag: null, note: null }
        ],
        connections: [1, 2, 3, 4, 5, 6, 7, 8].map(i => ({ t: hms(14 * 3600 + 32 * 60 + i * 60 + 1), pid: 2900, proc: 'PrintFleetAgent.exe', dst: '192.0.2.150:443', domain: 'telemetry.printfleet-cloud.example', proto: 'TCP' })),
        files: [
          { t: '14:33:02', pid: 2900, op: 'modify', path: 'C:\\ProgramData\\PrintFleet\\DataCollector\\cache\\devices.db', sha256: sh('71') }
        ]
      }
    },
    intel: {
      '203.0.113.77': { verdict: 'malicious', summary: 'Hosting-provider VPS (AS64496 Northgate Hosting Ltd, Moldova). Seen in credential-stuffing and MFA-fatigue campaigns; reported for anonymous VPN abuse. Never seen from Meridian users.', source: 'VirusTotal' },
      'as64496': { verdict: 'suspicious', summary: 'Northgate Hosting Ltd - bulletproof-leaning VPS provider, high abuse volume; no legitimate Meridian business presence.', source: 'WHOIS' },
      'mailrelay-hub.example': { verdict: 'malicious', summary: 'Registered 6 days ago, free mail-relay panel. Used as drop mailbox for BEC forward rules in recent OTX pulses.', source: 'OTX' },
      'nk.billing.archive@mailrelay-hub.example': { verdict: 'malicious', summary: 'Mailbox on mailrelay-hub.example; matches the forward target pattern used in BEC inbox rules.', source: 'OTX' },
      'meridiancb-sso.example': { verdict: 'malicious', summary: 'Lookalike Meridian SSO "password expiry" phishing page; registered 9 days ago, hosted on 192.0.2.120. Reported to threat intel Friday afternoon.', source: 'Internal' },
      '192.0.2.120': { verdict: 'malicious', summary: 'Hosts meridiancb-sso.example phishing kit.', source: 'Internal' },
      'mailsyncpro': { verdict: 'suspicious', summary: 'Unverified third-party OAuth app requesting Mail.ReadWrite, Mail.Send, Files.Read.All and offline_access. No publisher verification, not in the approved app list.', source: 'Internal' },
      '198.51.100.23': { verdict: 'suspicious', summary: 'Known mass password-spray / scanner source; thousands of failed auths across tenants this week. Opportunistic, no successes recorded.', source: 'VirusTotal' },
      '198.51.100.200': { verdict: 'benign', summary: 'CarrierNet US Mobility CGNAT gateway. Mobile traffic frequently geolocates to the carrier gateway city rather than the device.', source: 'WHOIS' },
      '192.0.2.55': { verdict: 'benign', summary: 'Guest wifi of a London hotel (GB residential/commercial). Matches CFO travel plan.', source: 'WHOIS' },
      '203.0.113.10': { verdict: 'benign', summary: 'Meridian Care Billing corporate egress NAT (Columbus HQ).', source: 'Internal' },
      '198.51.100.61': { verdict: 'benign', summary: 'MailPulse marketing platform sending IP, included in our SPF record; contracted vendor.', source: 'Internal' },
      'mailpulse-mkt.example': { verdict: 'benign', summary: 'Commercial email marketing service used by Marketing (contract MKT-2026-04).', source: 'Internal' },
      'claimlinkexchange.example': { verdict: 'benign', summary: 'ClaimLink Exchange, contracted healthcare clearinghouse. BAA on file. Forced-TLS partner connector.', source: 'Internal' },
      '192.0.2.88': { verdict: 'benign', summary: 'ClaimLink Exchange EDI gateway.', source: 'Internal' },
      'secure-training-hub.example': { verdict: 'benign', summary: 'PhishGuard security-awareness training platform used for Q4-AWARE-2026 simulation landing pages.', source: 'Internal' },
      'benefitsportal-updates.example': { verdict: 'benign', summary: 'Sender domain owned by PhishGuard for simulated campaigns (allowlisted for Q4-AWARE-2026).', source: 'Internal' },
      'telemetry.printfleet-cloud.example': { verdict: 'benign', summary: 'PrintFleet Technologies vendor cloud for printer fleet monitoring; WHOIS matches vendor, referenced in PO-22817.', source: 'WHOIS' },
      '192.0.2.150': { verdict: 'benign', summary: 'PrintFleet cloud ingestion endpoint.', source: 'WHOIS' },
      '10.50.2.40': { verdict: 'benign', summary: 'TENABLE-SC01, authorized vulnerability scanner (service account svc-tenable).', source: 'Internal' },
      '198.51.100.250': { verdict: 'unknown', summary: 'US residential/mobile range in Ohio; no reputation data. Previously seen for nkowalczyk during her commute.', source: 'WHOIS' },
      'win-8kq2m4t1vdr': { verdict: 'suspicious', summary: 'Default random Windows Server hostname (cloud VPS template). Not a Meridian-managed machine.', source: 'Internal' }
    },
    changes: [
      { at: '07:00', system: 'DC01 / BILL-APP01', desc: 'Scheduled password rotation for svc-billing-sync; service credential on BILL-APP01 to be updated after rotation', owner: 'Tomas Grimaldi', ticket: 'CHG-5120' },
      { at: '08:30', system: 'TENABLE-SC01', desc: 'Authenticated vulnerability scan of internal ranges 10.50.0.0/16 until 10:30 (svc-tenable, Nessus)', owner: 'Chidi Eze', ticket: 'CHG-5127' },
      { at: '09:15', system: 'SCCM01', desc: 'Deploy "Hardware-Software Inventory" PowerShell script to Finance workstations (runs as SYSTEM via CcmExec)', owner: 'Tomas Grimaldi', ticket: 'CHG-5131' },
      { at: '12:00', system: 'VEEAM01 / FS01', desc: 'Veeam synthetic full backup of FS01 with application-aware processing (VSS pre-freeze script)', owner: 'Tomas Grimaldi', ticket: 'CHG-5124' },
      { at: '06:00', system: 'Entra Conditional Access / PA-VPN-01', desc: 'Geo exception for CFO Gregory Lindqvist (GB) 11/03 - 11/07; devices: EXE-LT-003 + registered iPhone', owner: 'Chidi Eze', ticket: 'TRV-2210' },
      { at: '13:30', system: 'Mail gateway / PhishGuard', desc: 'Q4-AWARE-2026 phishing simulation; sender benefitsportal-updates.example and landing page secure-training-hub.example allowlisted', owner: 'Dana Okafor', ticket: 'CHG-5133' }
    ],
    chat: [
      { at: '08:05', from: 'dana', text: 'Morning. Queue is already moving, handover notes are in the ticket system. Remember the UEBA batch lag when you read alert times.' },
      { at: '08:40', from: 'tom', text: 'Anyone else seeing the spray alert? Looks like ActiveSync noise again.' },
      { at: '09:25', from: 'sam', text: 'Heads up, new sysadmin Kwabena started today, he will be doing admin things on his first day. Please do not panic.' },
      { at: '10:10', from: 'lena', text: 'IOC digest is out. Several lookalike SSO domains in this week\'s phishing, check the digest if you see a password-expiry page.' },
      { at: '10:45', from: 'chidi', text: 'FYI the GlobalProtect portal logs are searchable in the SIEM under VPN. Tell me if you need a session killed.' },
      { at: '11:40', from: 'tom', text: 'Going to lunch, shout if the queue gets spicy.' },
      { at: '12:30', from: 'sam', text: 'Veeam job on FS01 is running a bit long today, no action needed from you.' },
      { at: '13:20', from: 'dana', text: 'Reminder: the Q4 phishing simulation starts this afternoon. Check for the PhishGuard header before escalating click alerts.' },
      { at: '14:15', from: 'lena', text: 'Coffee machine on 3 is dead. That is the only P1 I know about right now.' }
    ]
  });
})();
