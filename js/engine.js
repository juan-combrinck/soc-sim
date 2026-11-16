// SOC Desk engine: pure logic, no DOM. Works in the browser (window.SOCEngine) and in Node (tests).
(function (g) {
  'use strict';

  /* ---------- helpers ---------- */
  const T_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
  function sec(s) { const m = T_RE.exec(String(s || '')); return m ? (+m[1]) * 3600 + (+m[2]) * 60 + (+(m[3] || 0)) : NaN; }
  const p2 = n => String(n).padStart(2, '0');
  function hms(s) { s = Math.max(0, Math.floor(s)); return `${p2(Math.floor(s / 3600) % 24)}:${p2(Math.floor(s / 60) % 60)}:${p2(s % 60)}`; }
  function hm(s) { return hms(s).slice(0, 5); }
  function dur(s) { s = Math.round(s); if (s < 60) return s + 's'; const m = Math.round(s / 60); if (m < 60) return m + 'm'; return Math.floor(m / 60) + 'h ' + (m % 60) + 'm'; }
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  const SEV_RANK = { low: 1, medium: 2, high: 3, critical: 4 };
  const SLA_MIN = { critical: 15, high: 30, medium: 60, low: 120 };
  const DISPOSITIONS = {
    fp: 'False Positive',
    benign: 'Benign / Expected Activity',
    duplicate: 'Duplicate of another alert',
    handoff: 'Handed off (confirmed by T2/IR)'
  };

  /* ---------- background noise ---------- */
  const GOOD_DOMAINS = [
    ['outlook.office365.com', 'Email'], ['teams.microsoft.com', 'Collaboration'], ['login.microsoftonline.com', 'Identity'],
    ['graph.microsoft.com', 'API'], ['www.google.com', 'Search'], ['www.linkedin.com', 'Social'], ['github.com', 'Development'],
    ['stackoverflow.com', 'Development'], ['slack.com', 'Collaboration'], ['zoom.us', 'Collaboration'], ['docs.google.com', 'Productivity'],
    ['www.reuters.com', 'News'], ['fonts.googleapis.com', 'CDN'], ['cdn.jsdelivr.net', 'CDN'], ['ocsp.digicert.com', 'PKI'],
    ['www.salesforce.com', 'Business'], ['en.wikipedia.org', 'Reference'], ['www.amazon.com', 'Shopping'], ['www.fedex.com', 'Business'],
    ['www.ups.com', 'Business'], ['weather.com', 'Weather'], ['update.microsoft.com', 'Updates'], ['sharepoint.com', 'Productivity'],
    ['www.bbc.co.uk', 'News'], ['www.youtube.com', 'Streaming'], ['dl.delivery.mp.microsoft.com', 'Updates']
  ];
  const UAS = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Gecko/20100101 Firefox/133.0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edg/131.0'];
  const NEWSLETTERS = [['news@industryweekly.example', 'Your weekly industry digest'], ['noreply@docusign.net', 'Completed: please review document'], ['billing@zoom.us', 'Your invoice is ready'], ['no-reply@linkedin.com', 'You appeared in 6 searches this week'], ['notifications@github.com', 'PR review requested'], ['hr-updates@benefitsportal.example', 'Open enrollment reminder'], ['it-notices@{domain}', 'Scheduled maintenance this weekend'], ['events@conferencehub.example', 'Early-bird registration closes Friday']];

  function generateNoise(sc, seed) {
    const rnd = mulberry32(seed), out = []; let n = 0;
    const R = (a, b) => a + rnd() * (b - a), I = (a, b) => Math.floor(R(a, b + 1)), pick = a => a[Math.floor(rnd() * a.length)];
    const users = Object.fromEntries((sc.users || []).map(u => [u.id, u]));
    const dc = (sc.hosts || []).find(h => h.type === 'dc');
    const add = (t, source, h, event, msg, o = {}) => {
      out.push({ id: 'g-' + (++n), t: hms(Math.max(0, Math.min(86399, t))), source, hostId: h ? h.id : undefined, user: o.user, src: o.src, dst: o.dst, event, msg, fields: o.fields || {}, _gen: true });
    };
    const base = sec(sc.shift.start), endT = sec(sc.shift.end);
    const dayT = () => { const x = rnd(); return x < .2 ? R(base - 3000, base + 3600) : x < .85 ? R(base + 1800, endT - 3000) : R(endT - 5400, endT - 300); };
    for (const h of sc.hosts || []) {
      const u = users[h.userId];
      const uname = u ? u.username : null;
      if ((h.type === 'workstation' || h.type === 'laptop') && u) {
        const logon = R(base - 2400, base + 4000);
        add(logon, 'WinEvent', h, '4624 Logon', `EventID=4624 LogonType=${rnd() < .85 ? 2 : 10} TargetUserName=${uname} WorkstationName=${h.hostname} Status=Success`, { user: uname, src: h.ip, fields: { code: '4624', logontype: '2' } });
        if (dc) add(logon - 2, 'WinEvent', dc, '4768 Kerberos TGT', `EventID=4768 TargetUserName=${uname} ClientAddress=${h.ip} Status=0x0 TicketEncryptionType=0x12`, { user: uname, src: h.ip, fields: { code: '4768' } });
        for (let k = 0; k < I(2, 4); k++) { const t = dayT(); add(t, 'WinEvent', h, '4800 Workstation locked', `EventID=4800 TargetUserName=${uname} SessionId=1`, { user: uname, fields: { code: '4800' } }); add(t + R(120, 2400), 'WinEvent', h, '4801 Workstation unlocked', `EventID=4801 TargetUserName=${uname} SessionId=1`, { user: uname, fields: { code: '4801' } }); }
        for (let k = 0; k < I(14, 26); k++) { const [d] = pick(GOOD_DOMAINS), t = dayT(); add(t, 'DNS', h, 'DNS Query', `query: ${d} IN A from ${h.ip} -> NOERROR`, { user: uname, src: h.ip, fields: { domain: d, rcode: 'NOERROR' } }); }
        for (let k = 0; k < I(14, 28); k++) {
          const [d, cat] = pick(GOOD_DOMAINS), t = dayT(), st = rnd() < .94 ? 200 : pick([204, 301, 304, 404]);
          add(t, 'Proxy', h, 'HTTP GET', `${h.ip} ${uname} "GET https://${d}/ HTTP/1.1" ${st} ${I(400, 90000)} "${pick(UAS)}" cat="${cat}" action=allowed`, { user: uname, src: h.ip, fields: { domain: d, url: `https://${d}/`, status: String(st), category: cat, action: 'allowed' } });
        }
        for (let k = 0; k < I(5, 10); k++) { const [d] = pick(GOOD_DOMAINS), ip = `52.${I(96, 120)}.${I(1, 250)}.${I(1, 250)}`, t = dayT(); add(t, 'Firewall', h, 'Allow', `ALLOW TCP ${h.ip}:${I(49152, 65000)} -> ${ip}:443 bytes=${I(900, 400000)} app=ssl`, { user: uname, src: h.ip, dst: ip, fields: { action: 'allow', dport: '443', domain: d } }); }
        for (let k = 0; k < I(3, 7); k++) { const [from, subj] = pick(NEWSLETTERS), t = dayT(); add(t, 'Email', null, 'Delivered', `Delivered from=${from.replace('{domain}', sc.company.domain)} to=${u.email} subject="${subj}" spf=pass dkim=pass dmarc=pass verdict=clean`, { user: uname, fields: { sender: from.replace('{domain}', sc.company.domain), recipient: u.email, subject: subj, verdict: 'clean' } }); }
      } else if (h.type === 'server' || h.type === 'dc') {
        for (let t = base - 3600; t < endT; t += 1800 + I(-120, 120)) add(t, 'WinEvent', h, '4624 Logon', `EventID=4624 LogonType=3 TargetUserName=svc-monitor SourceNetworkAddress=10.0.0.${I(20, 40)} Status=Success`, { user: 'svc-monitor', fields: { code: '4624', logontype: '3' } });
        for (let k = 0; k < I(3, 6); k++) add(dayT(), 'WinEvent', h, '7036 Service state', `EventID=7036 Service=${pick(['Windows Update', 'BITS', 'Print Spooler', 'Windows Time'])} entered the running state`, { fields: { code: '7036' } });
      }
    }
    return out;
  }

  /* ---------- default EDR baseline ---------- */
  function baselineEdr(host, user, used, rnd) {
    const procs = [], names = new Set(used.procs.map(p => p.name.toLowerCase()));
    let pid = 300; const nextPid = () => { while (used.pids.has(pid)) pid += 4; used.pids.add(pid); return pid; };
    const boot = sec('06:50') + Math.floor(rnd() * 3000);
    const MS = 'Microsoft Windows', sys = 'C:\\Windows\\System32\\';
    const add = (name, cmd, ppid, usr, start, extra = {}) => {
      if (names.has(name.toLowerCase())) { const ex = used.procs.find(p => p.name.toLowerCase() === name.toLowerCase()); return ex ? ex.pid : 0; }
      const p = Object.assign({ pid: nextPid(), ppid, name, cmd, user: usr, start: hms(start), signed: true, publisher: 'Microsoft Corporation', flag: null }, extra);
      procs.push(p); names.add(name.toLowerCase()); return p.pid;
    };
    const smss = add('smss.exe', sys + 'smss.exe', 4, 'NT AUTHORITY\\SYSTEM', boot);
    const wininit = add('wininit.exe', sys + 'wininit.exe', smss, 'NT AUTHORITY\\SYSTEM', boot + 3);
    const services = add('services.exe', sys + 'services.exe', wininit, 'NT AUTHORITY\\SYSTEM', boot + 5);
    add('lsass.exe', sys + 'lsass.exe', wininit, 'NT AUTHORITY\\SYSTEM', boot + 6);
    for (const s of ['-k netsvcs -p', '-k LocalServiceNetworkRestricted -p', '-k NetworkService -p', '-k DcomLaunch -p']) add('svchost.exe', sys + 'svchost.exe ' + s, services, 'NT AUTHORITY\\SYSTEM', boot + 9, { _dup: true });
    add('MsMpEng.exe', 'C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\MsMpEng.exe', services, 'NT AUTHORITY\\SYSTEM', boot + 14, { publisher: 'Microsoft Corporation' });
    add('EDRSensor.exe', 'C:\\Program Files\\EDR\\EDRSensor.exe', services, 'NT AUTHORITY\\SYSTEM', boot + 16, { publisher: 'Endpoint Security Agent' });
    if (host.type === 'workstation' || host.type === 'laptop') {
      const login = sec('07:25') + Math.floor(rnd() * 4500), uname = user ? 'CORP\\' + user.username : 'CORP\\user';
      const ex = add('explorer.exe', 'C:\\Windows\\explorer.exe', 0, uname, login);
      const outlook = ex && add('OUTLOOK.EXE', 'C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE', ex, uname, login + 40);
      add('Teams.exe', 'C:\\Users\\' + (user ? user.username : 'user') + '\\AppData\\Local\\Microsoft\\Teams\\current\\Teams.exe', ex, uname, login + 55);
      add('chrome.exe', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ex, uname, login + 200, { publisher: 'Google LLC' });
      add('OneDrive.exe', 'C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe /background', ex, uname, login + 30);
    } else {
      add('vmtoolsd.exe', 'C:\\Program Files\\VMware\\VMware Tools\\vmtoolsd.exe', services, 'NT AUTHORITY\\SYSTEM', boot + 20, { publisher: 'VMware, Inc.' });
      add('MonitoringAgent.exe', 'C:\\Program Files\\Zabbix Agent\\zabbix_agentd.exe -c zabbix_agentd.conf', services, 'NT AUTHORITY\\SYSTEM', boot + 22, { publisher: 'Zabbix SIA' });
    }
    return procs;
  }

  /* ---------- Game ---------- */
  class Game {
    constructor(scenario, team, opts = {}) {
      this.sc = scenario; this.team = team; this.opts = opts;
      this.seed = opts.seed != null ? opts.seed : hash(scenario.id + '|' + (opts.salt || ''));
      this.rnd = mulberry32(this.seed ^ 0x9e3779b9);
      this.start = sec(scenario.shift.start) - 5 * 60; this.end = sec(scenario.shift.end);
      this.now = this.start; this.speed = opts.speed || 10; this.paused = true; this.finished = false;
      this.hostById = Object.fromEntries(scenario.hosts.map(h => [h.id, h]));
      this.userById = Object.fromEntries(scenario.users.map(u => [u.id, u]));
      this.teamById = Object.fromEntries(team.map(t => [t.id, t]));
      this.listeners = [];
      this.alerts = scenario.alerts.map(def => ({ def, arrive: sec(def.at) })).sort((a, b) => a.arrive - b.arrive || a.def.id.localeCompare(b.def.id));
      this.alertById = Object.fromEntries(this.alerts.map(a => [a.def.id, a]));
      this.tickets = {}; this.tn = 4100;
      this.messages = []; this.mn = 0; this.unread = 0;
      this.scheduled = []; this.actions = []; this.isolated = {}; this.nudges = 0; this.nudged = new Set();
      this.incidentEscalated = {}; this.missEvents = []; this.seenAlerts = new Set();
      this.events = this._buildEvents();
      this._seedChat();
    }
    on(fn) { this.listeners.push(fn); }
    emit(type, data) { for (const l of this.listeners) l(type, data); }
    log(text, kind = 'action') { this.actions.push({ t: this.now, text, kind }); }

    /* --- events / search --- */
    _buildEvents() {
      const all = (this.sc.events || []).concat(generateNoise(this.sc, this.seed));
      const out = all.map(e => {
        const h = e.hostId ? this.hostById[e.hostId] : null;
        const o = {
          id: e.id, t: sec(e.t), source: e.source, hostId: e.hostId || null, hostname: h ? h.hostname : (e.hostname || ''),
          user: e.user || '', src: e.src || (h ? h.ip : ''), dst: e.dst || '', event: e.event, msg: e.msg, fields: e.fields || {}, gen: !!e._gen
        };
        o.ts = hms(o.t); o.raw = `${o.ts} ${o.hostname || '-'} ${o.source}[${o.event}] ${o.msg}`;
        o.hay = (o.raw + ' ' + o.user + ' ' + o.src + ' ' + o.dst + ' ' + Object.values(o.fields).join(' ')).toLowerCase();
        return o;
      });
      out.sort((a, b) => a.t - b.t);
      this.eventById = Object.fromEntries(out.map(e => [e.id, e]));
      return out;
    }
    _fieldVal(e, key) {
      switch (key) {
        case 'host': case 'hostname': return e.hostname;
        case 'user': return e.user; case 'src': case 'srcip': return e.src; case 'dst': case 'dstip': return e.dst;
        case 'ip': return e.src + ' ' + e.dst; case 'source': return e.source; case 'event': return e.event; case 'msg': return e.msg;
        default: { const f = e.fields; for (const k of Object.keys(f)) if (k.toLowerCase() === key) return String(f[k]); return null; }
      }
    }
    parseQuery(q) {
      const terms = [], re = /(-?)(?:([A-Za-z_]+):)?("[^"]*"|\S+)/g; let m;
      while ((m = re.exec(q || ''))) {
        let v = m[3].replace(/^"|"$/g, '').toLowerCase(); if (!v) continue;
        const rx = v.includes('*') ? new RegExp(v.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')) : null;
        terms.push({ neg: !!m[1], key: m[2] ? m[2].toLowerCase() : null, v, rx });
      }
      return terms;
    }
    search(q, o = {}) {
      const terms = this.parseQuery(q), from = o.from != null ? o.from : 0, to = Math.min(o.to != null ? o.to : this.now, this.now);
      const ids = o.ids ? new Set(o.ids) : null; const res = [];
      for (const e of this.events) {
        if (e.t > to) break; if (e.t < from) continue; if (ids && !ids.has(e.id)) continue;
        if (e.fields.c2 && e.hostId && this.isolated[e.hostId] && e.t > this.isolated[e.hostId].at) continue;
        let ok = true;
        for (const t of terms) {
          let hit;
          if (t.key) { const fv = this._fieldVal(e, t.key); hit = fv != null && (t.rx ? t.rx.test(fv.toLowerCase()) : fv.toLowerCase().includes(t.v)); }
          else hit = t.rx ? t.rx.test(e.hay) : e.hay.includes(t.v);
          if (t.neg ? hit : !hit) { ok = false; break; }
        }
        if (ok) res.push(e);
      }
      return { total: res.length, rows: res.slice(-(o.limit || 600)).reverse(), all: res };
    }
    histogram(rows, bucketMin = 30) {
      const b = bucketMin * 60, s0 = Math.floor((this.start - 3600) / b) * b, n = Math.ceil((this.end - s0) / b), bins = Array.from({ length: n }, (_, i) => ({ t: s0 + i * b, n: 0 }));
      for (const e of rows) { const i = Math.floor((e.t - s0) / b); if (i >= 0 && i < n) bins[i].n++; }
      return bins;
    }

    /* --- alerts / tickets --- */
    visibleAlerts() { return this.alerts.filter(a => a.arrive <= this.now); }
    ticket(alertId) { return this.tickets[alertId] || null; }
    status(alertId) { const t = this.tickets[alertId]; return t ? t.status : 'new'; }
    slaMin(a) { return SLA_MIN[a.def.severity]; }
    slaInfo(alertId) {
      const a = this.alertById[alertId], t = this.tickets[alertId], deadline = a.arrive + SLA_MIN[a.def.severity] * 60;
      if (t && t.firstTouch != null) return { met: t.firstTouch <= deadline, done: true, deadline, took: t.firstTouch - a.arrive };
      return { met: this.now <= deadline, done: false, left: deadline - this.now, deadline };
    }
    related(alertId) {
      const a = this.alertById[alertId].def, iocs = new Set((a.iocs || []).filter(i => !['user', 'host'].includes(i.type)).map(i => String(i.value).toLowerCase()));
      return this.visibleAlerts().filter(o => o.def.id !== alertId && (
        (a.hostId && o.def.hostId === a.hostId) || (a.userId && o.def.userId === a.userId) ||
        (o.def.iocs || []).some(i => iocs.has(String(i.value).toLowerCase())))).map(o => o.def);
    }
    open(alertId) {
      const a = this.alertById[alertId]; if (!a || a.arrive > this.now) return null;
      let t = this.tickets[alertId];
      if (!t) {
        t = this.tickets[alertId] = { id: 'T-' + (++this.tn), alertId, status: 'in_progress', openedAt: this.now, firstTouch: this.now, notes: [], escalation: null, closure: null, contacts: [], reopened: 0 };
        this.log(`Opened ${t.id} for ${a.def.id} "${a.def.title}"`); this.emit('ticket', t);
      }
      return t;
    }
    addNote(alertId, text) { const t = this.open(alertId); if (!t || !text.trim()) return; t.notes.push({ t: this.now, text: text.trim() }); this.emit('ticket', t); }

    escalate(alertId, targetId, description) {
      const a = this.alertById[alertId], t = this.open(alertId), tgt = this.teamById[targetId];
      if (!a || !t || !tgt || !tgt.escalatable) return { error: 'Invalid escalation target' };
      if (t.status === 'closed') return { error: 'Ticket is closed. Reopen it first.' };
      if (t.status === 'escalated') return { error: 'Already escalated and awaiting a response.' };
      description = (description || '').trim();
      if (description.length < 10) return { error: 'Add a short description for the handoff.' };
      const def = a.def, kw = (def.keywords || []), low = description.toLowerCase();
      const hits = kw.filter(k => low.includes(k.toLowerCase())).length;
      const thin = description.length < 50 || (kw.length >= 3 && hits === 0 && description.length < 120);
      t.status = 'escalated'; t.escalation = { to: targetId, at: this.now, desc: description, thin, hits, kw: kw.length, outcome: null, repliedAt: null };
      this.log(`Escalated ${t.id} to ${tgt.name} (${tgt.group}): ${description}`, 'escalate');
      const delay = this.sc.tutorial ? 20 + Math.floor(this.rnd() * 20) : 3 * 60 + Math.floor(this.rnd() * 5 * 60);
      this._schedule(this.now + delay, { kind: 'escalation-reply', alertId });
      this.emit('ticket', t);
      return { ok: true, eta: delay };
    }
    _pick(arr) { return arr[Math.floor(this.rnd() * arr.length)]; }
    _doEscalationReply(alertId, at) {
      const a = this.alertById[alertId], t = this.tickets[alertId], def = a.def, p = this.teamById[t.escalation.to];
      const isTp = def.truth === 'TP', inc = def.incident, already = isTp && this.incidentEscalated[inc];
      let body;
      if (isTp) {
        body = (p.group === 'IR' && def.reply.irTp) ? def.reply.irTp : def.reply.tp;
        if (already) body = `That is part of ${inc}, which I'm already working. I've linked this alert to the case. ` + body;
        body = this._pick(p.tpOpen) + body + ' ' + this._pick(p.tpClose);
        this.incidentEscalated[inc] = { at, by: p.id, alertId };
        t.status = 'confirmed_tp';
      } else {
        t.status = 'returned_fp';
        body = this._pick(p.fpOpen) + def.reply.fp + ' ' + this._pick(p.fpClose);
      }
      if (t.escalation.thin && p.thin) body = this._pick(p.thin) + '\n\n' + body;
      t.escalation.outcome = isTp ? 'tp' : 'fp'; t.escalation.repliedAt = at;
      this._message({ t: at, from: p.id, text: `[${t.id}] ` + body, ticketId: t.id, kind: 'reply' });
      this.log(`${p.name} replied on ${t.id}: ${isTp ? 'TRUE POSITIVE confirmed' : 'false positive'}`, 'reply');
      if (isTp && !already) this._schedule(at + (this.sc.tutorial ? 25 : 8 * 60), { kind: 'ir-update', alertId, by: p.group === 'IR' ? p.id : 'marcus' });
      this.emit('ticket', t);
    }
    _doIrUpdate(s, at) {
      const def = this.alertById[s.alertId].def, host = this.hostById[def.hostId], user = this.userById[def.userId];
      const who = this.teamById[s.by] || this.teamById.marcus;
      if (host) this.isolated[host.id] = { by: 'IR', at };
      this._message({
        t: at, from: who.id, kind: 'update',
        text: `[${def.incident}] Containment update: ${host ? host.hostname + ' is now network-isolated in the EDR console' : 'affected assets contained'}${user ? `, ${user.name}'s credentials are being reset and sessions revoked` : ''}. Scoping has started, thanks for the escalation. Keep triaging, I'll update you if I need anything.`
      });
      this.log(`IR contained ${host ? host.hostname : 'assets'} for ${def.incident}`, 'reply');
    }

    close(alertId, disposition, note) {
      const a = this.alertById[alertId], t = this.tickets[alertId]; if (!a || !t) return { error: 'Open the ticket first.' };
      if (t.status === 'closed') return { error: 'Already closed.' };
      if (t.status === 'escalated') return { error: 'Waiting on the escalation response. You can’t close it yet.' };
      if (!DISPOSITIONS[disposition]) return { error: 'Pick a closing reason.' };
      note = (note || '').trim(); if (note.length < 8) return { error: 'Add a closing note with your reasoning (8+ characters).' };
      const def = a.def, isTp = def.truth === 'TP';
      const escalatedInc = isTp && this.incidentEscalated[def.incident];
      const wrong = isTp && !escalatedInc && ['fp', 'benign', 'duplicate'].includes(disposition) && t.status !== 'confirmed_tp';
      if (isTp && disposition === 'handoff' && !escalatedInc) return { error: '“Handed off” needs an escalation that T2/IR has confirmed.' };
      t.closure = { disposition, note, at: this.now, missed: wrong };
      t.status = 'closed'; this.log(`Closed ${t.id} as "${DISPOSITIONS[disposition]}": ${note}`, wrong ? 'miss' : 'close');
      this.emit('ticket', t);
      if (wrong) {
        this.missEvents.push({ alertId, ticketId: t.id, at: this.now, reopenedAt: null });
        const w = {
          ticketId: t.id, alertId, title: def.title, incident: def.incident, at: this.now, disposition,
          host: def.hostId ? this.hostById[def.hostId].hostname : null, user: def.userId ? this.userById[def.userId].name : null, explain: def.explain
        };
        this.emit('warning', w);
        return { ok: true, warning: w };
      }
      return { ok: true };
    }
    reopen(alertId) {
      const t = this.tickets[alertId]; if (!t || t.status !== 'closed') return { error: 'Not closed.' };
      const m = this.missEvents.find(x => x.alertId === alertId && !x.reopenedAt); if (m) m.reopenedAt = this.now;
      t.status = 'in_progress'; t.closure = null; t.reopened++; t.escalation = null; this.log(`Reopened ${t.id}`, 'action'); this.emit('ticket', t); return { ok: true };
    }

    /* --- verification contacts --- */
    contact(alertId, who) {
      const a = this.alertById[alertId], t = this.open(alertId); if (!a || !t) return { error: 'No ticket' };
      const def = a.def, key = who + ':' + alertId; if (t.contacts.includes(key)) return { error: 'You already asked. Give them a few minutes.' };
      t.contacts.push(key);
      const user = this.userById[def.userId], host = this.hostById[def.hostId];
      let from, text;
      if (who === 'user') {
        if (!user) return { error: 'No user is associated with this alert.' };
        from = 'user:' + user.id;
        text = def.userReply || `Hi, I'm not aware of anything unusual on my side${host ? ' on ' + host.hostname : ''}. I haven't installed or changed anything. Is something wrong?`;
      } else {
        from = 'sam';
        text = def.helpdeskReply || `I've checked the service desk queue and I don't see any open tickets or planned work for ${user ? user.name : 'that user'}${host ? ' / ' + host.hostname : ''}. Want me to call them?`;
      }
      this.log(`Asked ${who === 'user' ? (user && user.name) : 'Service Desk'} about ${t.id}`, 'action');
      this._schedule(this.now + (this.sc.tutorial ? 15 : (4 + Math.floor(this.rnd() * 6)) * 60), { kind: 'chat', from, text: `[${t.id}] ${text}`, ticketId: t.id, msgKind: 'reply' });
      return { ok: true };
    }
    isolateHost(hostId) {
      const h = this.hostById[hostId]; if (!h) return { error: 'Unknown host' };
      if (this.isolated[hostId]) { delete this.isolated[hostId]; this.log(`Released ${h.hostname} from isolation`); return { ok: true, isolated: false }; }
      this.isolated[hostId] = { by: 'T1', at: this.now };
      const tpHosts = new Set(this.sc.alerts.filter(a => a.truth === 'TP').map(a => a.hostId));
      const justified = tpHosts.has(hostId);
      this.log(`Isolated ${h.hostname} via EDR`, justified ? 'action' : 'isolate-fp');
      if (!justified) {
        const crit = h.criticality === 'crown' || h.criticality === 'high' || h.type === 'server' || h.type === 'dc';
        this._schedule(this.now + 90, { kind: 'chat', from: 'dana', msgKind: 'update', text: `Why did you isolate ${h.hostname}? ${crit ? 'That is a business-critical system, someone is already calling the helpdesk. ' : 'The user is already on the phone to the service desk. '}Isolation needs an escalation or a confirmed finding first. Please release it unless you can justify it in the ticket.` });
        this.isolatedWrong = (this.isolatedWrong || 0) + 1;
      } else {
        this._schedule(this.now + 120, { kind: 'chat', from: 'marcus', msgKind: 'update', text: `Saw the isolation on ${h.hostname}. Good instinct, but next time check with T2/IR before containing so we don't lose volatile evidence.` });
      }
      return { ok: true, isolated: true, justified };
    }

    /* --- EDR / intel --- */
    edr(hostId) {
      const h = this.hostById[hostId]; if (!h) return null;
      const d = (this.sc.edr || {})[hostId] || {}, user = this.userById[h.userId];
      const used = { pids: new Set((d.processes || []).map(p => p.pid)), procs: d.processes || [] };
      if (!this._edrBase) this._edrBase = {};
      if (!this._edrBase[hostId]) this._edrBase[hostId] = baselineEdr(h, user, used, mulberry32(hash(hostId)));
      const tsec = x => sec(x.start || x.t);
      const procs = (d.processes || []).concat(this._edrBase[hostId]).filter(p => tsec(p) <= this.now).sort((a, b) => tsec(a) - tsec(b));
      return {
        host: h, user, isolated: this.isolated[hostId] || null, processes: procs,
        connections: (d.connections || []).filter(c => sec(c.t) <= this.now && !(this.isolated[hostId] && sec(c.t) > this.isolated[hostId].at)).sort((a, b) => sec(a.t) - sec(b.t)),
        files: (d.files || []).filter(f => sec(f.t) <= this.now).sort((a, b) => sec(a.t) - sec(b.t))
      };
    }
    intel(value) {
      const v = String(value || '').trim().toLowerCase(); if (!v) return null;
      const sc = (this.sc.intel || {})[v], seen = this.search(v, { from: 0, limit: 1 }).total;
      let r;
      if (sc) r = Object.assign({}, sc);
      else {
        const host = this.sc.hosts.find(h => h.ip === v || h.hostname.toLowerCase() === v), user = this.sc.users.find(u => u.username.toLowerCase() === v || u.email.toLowerCase() === v);
        if (host) r = { verdict: 'benign', summary: `Internal asset: ${host.hostname} (${host.os}), ${host.type}, criticality ${host.criticality}${host.userId ? ', assigned to ' + this.userById[host.userId].name : ''}.`, source: 'CMDB' };
        else if (user) r = { verdict: 'benign', summary: `Internal identity: ${user.name}, ${user.title}, ${user.dept}. Manager: ${user.manager || 'n/a'}.`, source: 'Directory' };
        else if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(v)) r = { verdict: 'unknown', summary: 'Private address not found in the CMDB. Could be a guest, VPN pool or unmanaged device.', source: 'CMDB' };
        else {
          const good = GOOD_DOMAINS.find(([d]) => v === d || v.endsWith('.' + d) || d.endsWith('.' + v) || d.endsWith(v));
          r = good ? { verdict: 'benign', summary: `Well-known domain (${good[1]}). Top-ranked, long-established, no detections.`, source: 'Intel feed' } : { verdict: 'unknown', summary: 'No reputation data. Not found on any blocklist, but no history either. Check registration age and whether anyone else in the org has contacted it.', source: 'Intel feed' };
        }
      }
      r.value = value; r.seen = seen; return r;
    }
    changes() { return (this.sc.changes || []).slice().sort((a, b) => sec(a.at) - sec(b.at)); }

    /* --- time --- */
    _schedule(at, item) { item.at = at; this.scheduled.push(item); this.scheduled.sort((a, b) => a.at - b.at); }
    _message(m) { m.id = ++this.mn; this.messages.push(m); this.unread++; this.emit('message', m); }
    _seedChat() {
      const s = sec(this.sc.shift.start);
      for (const c of this.sc.chat || []) this._schedule(sec(c.at), { kind: 'chat', from: c.from, text: c.text, msgKind: 'ambient' });
      this._schedule(s - 120, { kind: 'chat', from: 'dana', msgKind: 'ambient', text: `Morning. Handover notes are pinned in the Dashboard. Read them before you touch the queue. Escalate anything you can’t clear with evidence, but make the handoff worth reading.` });
      this._schedule(s + 4 * 3600, { kind: 'chat', from: 'tom', msgKind: 'ambient', text: 'Going for lunch, back in 30. Yell if the queue lights up.' });
      this._schedule(this.end - 30 * 60, { kind: 'chat', from: 'dana', msgKind: 'ambient', text: 'Half an hour to handover. Triage what you can and make sure open tickets have notes.' });
    }
    advance(simSeconds) {
      if (this.finished) return;
      const target = Math.min(this.end, this.now + simSeconds);
      while (true) {
        const nx = this.scheduled[0];
        if (nx && nx.at <= target) { this.scheduled.shift(); this.now = Math.max(this.now, nx.at); this._run(nx); continue; }
        break;
      }
      this.now = target;
      for (const a of this.alerts) if (a.arrive <= this.now && !this.seenAlerts.has(a.def.id)) { this.seenAlerts.add(a.def.id); this.emit('alert', a); }
      this._nudges();
      this.emit('tick', this.now);
      if (this.now >= this.end) { this.finished = true; this.paused = true; this.emit('end', this.report()); }
    }
    _nudges() {
      if (this.sc.tutorial || this.nudges >= 3) return;
      for (const a of this.alerts) {
        if (this.nudged.has(a.def.id) || a.arrive > this.now || this.tickets[a.def.id]) continue;
        if (SEV_RANK[a.def.severity] >= 3 && this.now > a.arrive + SLA_MIN[a.def.severity] * 60) {
          this.nudged.add(a.def.id); this.nudges++;
          this._message({ t: this.now, from: 'dana', kind: 'update', text: `Heads up: ${a.def.id} "${a.def.title}" (${a.def.severity}) has been sitting untouched past SLA. Can you pick it up?` }); break;
        }
      }
    }
    _run(s) {
      if (s.kind === 'chat') this._message({ t: s.at, from: s.from, text: s.text, kind: s.msgKind || 'ambient', ticketId: s.ticketId });
      else if (s.kind === 'escalation-reply') this._doEscalationReply(s.alertId, s.at);
      else if (s.kind === 'ir-update') this._doIrUpdate(s, s.at);
    }
    sender(id) {
      if (id && id.startsWith('user:')) { const u = this.userById[id.slice(5)]; return { id, name: u ? u.name : 'User', role: u ? u.title : '', color: '#8a8a86', initials: u ? u.name.split(' ').map(x => x[0]).join('').slice(0, 2) : 'U' }; }
      return this.teamById[id] || { id, name: id, role: '', color: '#8a8a86', initials: '?' };
    }

    endShift() { if (this.finished) return; this.finished = true; this.paused = true; this.emit('end', this.report()); }

    /* --- stats & report --- */
    stats() {
      const vis = this.visibleAlerts(), by = { new: 0, in_progress: 0, escalated: 0, confirmed_tp: 0, returned_fp: 0, closed: 0 };
      for (const a of vis) by[this.status(a.def.id)]++;
      const sev = { low: 0, medium: 0, high: 0, critical: 0 }; vis.forEach(a => sev[a.def.severity]++);
      const hr = []; for (let h = Math.floor(sec(this.sc.shift.start) / 3600); h < Math.ceil(this.end / 3600); h++) hr.push({ h, n: vis.filter(a => Math.floor(a.arrive / 3600) === h).length });
      let sum = 0, cnt = 0, breaches = 0;
      for (const a of vis) { const s = this.slaInfo(a.def.id); if (s.done) { sum += s.took; cnt++; } if (!s.met) breaches++; }
      return { visible: vis.length, by, sev, hr, avgTouch: cnt ? sum / cnt : null, breaches, total: this.alerts.length };
    }
    report() {
      const rows = [], inc = {};
      let slaBreaches = 0, unneeded = 0, left = 0;
      for (const a of this.alerts) {
        const def = a.def, t = this.tickets[def.id], arrived = a.arrive <= this.now;
        const sla = arrived ? this.slaInfo(def.id) : null; if (sla && !sla.met) slaBreaches++;
        let outcome, good;
        if (!arrived) { outcome = 'Did not arrive before end of shift'; good = true; }
        else if (!t) { outcome = 'Never opened'; good = def.truth === 'FP' ? null : false; if (def.truth === 'FP') left++; }
        else if (t.status === 'closed') { outcome = DISPOSITIONS[t.closure.disposition]; good = !t.closure.missed; }
        else if (t.status === 'confirmed_tp') { outcome = 'Escalated, TP confirmed'; good = true; }
        else if (t.status === 'returned_fp') { outcome = 'Escalated, FP confirmed (not closed)'; good = true; }
        else { outcome = 'Left open (' + t.status.replace('_', ' ') + ')'; good = def.truth === 'FP' ? null : false; left += def.truth === 'FP' ? 1 : 0; }
        if (t && t.escalation && def.truth === 'FP') unneeded++;
        rows.push({ id: def.id, title: def.title, severity: def.severity, truth: def.truth, incident: def.incident, outcome, good, explain: def.explain, ticket: t ? t.id : null, sla, arrived });
        if (def.truth === 'TP') inc[def.incident] = inc[def.incident] || a;
      }
      const incs = Object.keys(inc).map(k => {
        const e = this.incidentEscalated[k], first = this.alerts.filter(a => a.def.incident === k)[0], misses = this.missEvents.filter(m => this.alertById[m.alertId].def.incident === k);
        return { id: k, escalated: !!e, escalatedAt: e ? e.at : null, firstAlert: first.arrive, ttEscalate: e ? e.at - first.arrive : null, by: e ? e.by : null, misses };
      });
      let score = 100; const notes = [];
      for (const i of incs) {
        if (!i.escalated) { score -= 45; notes.push(`True positive ${i.id} was never escalated (-45)`); }
        if (i.misses.length) { score -= 15; notes.push(`Closed a true positive as benign/FP ${i.misses.length}x (-15)`); }
        if (i.escalated && i.ttEscalate > 45 * 60) { score -= 8; notes.push(`Escalation of ${i.id} took ${dur(i.ttEscalate)} from first alert (-8)`); }
        else if (i.escalated && i.ttEscalate > 20 * 60) { score -= 3; notes.push(`Escalation of ${i.id} took ${dur(i.ttEscalate)} (-3)`); }
      }
      const unn = Math.max(0, unneeded - 2); if (unn) { score -= unn * 2; notes.push(`${unneeded} false positives escalated, first two are free (-${unn * 2})`); }
      if (slaBreaches) { const p = Math.min(15, slaBreaches); score -= p; notes.push(`${slaBreaches} SLA breaches (-${p})`); }
      if (left) { const p = Math.min(10, left); score -= p; notes.push(`${left} alerts left unworked (-${p})`); }
      if (this.isolatedWrong) { const p = this.isolatedWrong * 5; score -= p; notes.push(`Isolated ${this.isolatedWrong} healthy host(s) without justification (-${p})`); }
      score = Math.max(0, score);
      const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 55 ? 'D' : 'F';
      return { rows, incidents: incs, score, grade, notes, slaBreaches, unneeded, left, closed: rows.filter(r => /Close|False|Benign|Dupl|Handed/.test(r.outcome)).length };
    }
  }

  const API = { Game, sec, hms, hm, dur, SLA_MIN, SEV_RANK, DISPOSITIONS, generateNoise, hash };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else g.SOCEngine = API;
})(typeof window !== 'undefined' ? window : globalThis);
