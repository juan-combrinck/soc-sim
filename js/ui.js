(function () {
  'use strict';
  const { Game, sec, hms, hm, dur, DISPOSITIONS } = SOCEngine;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };

  const DEFAULT_WARNING = 'You closed a TRUE POSITIVE as a false positive. That is a FALSE NEGATIVE. The attacker is still inside the network.';
  const S = Object.assign({ name: 'Analyst', warning: DEFAULT_WARNING, sound: true, speed: 10 }, lsGet('socdesk.settings', {}));
  const saveSettings = () => lsSet('socdesk.settings', S);

  let G = null, view = 'dashboard', selAlert = null, timer = null, lastTs = 0, qFilter = 'all', menuSel = null, modalOpen = false;
  const drafts = {}, fresh = new Set();
  const siem = { q: '', range: 'all', ids: null, idsLabel: '', open: new Set() };
  const edr = { host: null, tab: 'proc', pid: null };
  const intel = { tab: 'lookup', q: '', hist: [], res: null };
  const team = { filter: null };

  /* ---------- audio ---------- */
  let ac = null;
  function tone(f, d, v = 0.05, type = 'sine', at = 0) {
    if (!S.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + at;
      o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + d);
    } catch (e) { /* audio unavailable */ }
  }
  const ding = () => { tone(880, .12, .04); tone(1320, .18, .03, 'sine', .1); };
  const alarm = () => { for (let i = 0; i < 6; i++) { tone(i % 2 ? 520 : 880, .22, .09, 'square', i * .24); } };

  /* ---------- icons ---------- */
  const ICON = {
    dashboard: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
    queue: '<svg viewBox="0 0 24 24"><path d="M4 13l2-8h12l2 8v6H4z"/><path d="M4 13h4l1 2h6l1-2h4"/></svg>',
    siem: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg>',
    edr: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><path d="M9 10l2 2 4-4"/></svg>',
    intel: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
    team: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>'
  };
  const NAV = [['dashboard', 'Overview'], ['queue', 'Queue'], ['siem', 'SIEM'], ['edr', 'EDR'], ['intel', 'Intel'], ['team', 'Team']];
  const STATUS = { new: 'New', in_progress: 'In progress', escalated: 'Escalated', confirmed_tp: 'TP confirmed', returned_fp: 'FP confirmed', closed: 'Closed' };

  /* ---------- menu ---------- */
  const DIFF = { Easy: 0, Medium: 1, Hard: 2 };
  const shifts = () => SOC_SCENARIOS.filter(s => !s.tutorial).sort((a, b) => (DIFF[a.difficulty] ?? 9) - (DIFF[b.difficulty] ?? 9));
  const tutDone = () => lsGet('socdesk.tutDone', {});
  const tutDoneCount = () => Object.keys(tutDone()).length;
  function renderMenu() {
    if (!menuSel || !shifts().some(s => s.id === menuSel)) menuSel = shifts()[0].id;
    $('#app').innerHTML = `<div class="menu">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap"><div><h1>SOC DESK</h1><div class="sub">A day in the life of a Tier 1 SOC analyst. Pick a shift. One real incident is hiding in the queue. Everything else is noise.</div></div>
      <button class="btn primary" data-act="tut-pick" style="padding:10px 22px;font-size:15px">Take tutorial${tutDoneCount() >= 2 ? ' ✓' : ''}</button></div>
      <div class="cards">${shifts().map(s => `<div class="card ${s.id === menuSel ? 'sel' : ''}" data-act="menu-sel" data-id="${s.id}">
        <div class="cardrow"><span class="chip">${esc(s.date)}</span><span class="chip">${esc(s.difficulty)}</span><span class="chip">${esc(s.shift.start)}–${esc(s.shift.end)}</span></div>
        <h2>${esc(s.title)}</h2><div class="muted">${esc(s.tagline)}</div>
        <div class="faint" style="margin-top:6px">${esc(s.company.name)} · ${esc(s.company.industry)}</div></div>`).join('')}</div>
      <div class="setrow">
        <div><label>Your name</label><input type="text" id="set-name" value="${esc(S.name)}" maxlength="30"></div>
        <div><label>Clock speed (sim time per real second)</label><select id="set-speed">${[5, 10, 20, 30, 60].map(x => `<option value="${x}" ${S.speed === x ? 'selected' : ''}>${x}x ${x === 10 ? '(recommended, ~48 min per shift)' : ''}</option>`).join('')}</select></div>
        <button class="btn primary" data-act="start" style="padding:9px 26px;font-size:15px">Badge in & start shift</button>
        <button class="btn" data-act="settings">Settings</button>
      </div>
      <div class="muted" style="max-width:760px;line-height:1.7">You work the queue like a real Tier 1: triage alerts, pivot into the SIEM and EDR, check intel, ask the user or service desk, then <b>close with a reason</b> or <b>escalate</b> to Tier 2 (Bob, Priya) or Incident Response (Marcus, Imani). If you close a true positive as a false positive, you will be told about it, loudly.</div>
    </div>`;
  }

  /* ---------- game lifecycle ---------- */
  function startGame() {
    S.name = ($('#set-name') && $('#set-name').value.trim()) || S.name || 'Analyst';
    S.speed = +($('#set-speed') && $('#set-speed').value) || S.speed; saveSettings();
    beginGame(SOC_SCENARIOS.find(s => s.id === menuSel), {});
  }
  let quiet = false;
  function beginGame(sc, o) {
    G = new Game(sc, SOC_TEAM, { speed: S.speed, salt: o.salt || String(Math.random()) });
    G.on(onGame);
    Object.keys(drafts).forEach(k => delete drafts[k]); fresh.clear();
    selAlert = null; view = o.view || 'dashboard'; qFilter = 'all'; edr.host = null; edr.pid = null; edr.tab = 'proc'; intel.hist = []; intel.res = null; intel.q = ''; intel.tab = 'lookup'; siem.q = ''; siem.ids = null; siem.range = 'all'; siem.open.clear(); team.filter = null;
    G.paused = false; lastTs = performance.now();
    quiet = true; if (o.advanceTo) G.advance(sec(o.advanceTo) - G.now); quiet = false;
    renderShell(); setView(view);
    clearInterval(timer); timer = setInterval(tick, 250);
    G.advance(0);
  }
  function tick() {
    const now = performance.now(), dt = Math.min(1, (now - lastTs) / 1000); lastTs = now;
    if (!G || G.paused || modalOpen || G.finished) { updateTop(); return; }
    G.advance(dt * G.speed);
  }
  function onGame(type, d) {
    if (type === 'tick') { updateTop(); updateSla(); }
    else if (quiet) { /* silent catch-up */ }
    else if (type === 'alert') {
      const a = d.def; fresh.add(a.id); setTimeout(() => fresh.delete(a.id), 3000);
      toast(`<b>${esc(a.id)}</b> <span class="pill ${a.severity}">${a.severity}</span><br>${esc(a.title)}`, a.severity === 'critical' ? 'critical' : a.severity === 'high' ? 'high' : '', () => { setView('queue'); selectAlert(a.id); });
      if (a.severity === 'critical' || a.severity === 'high') { tone(660, .15, .05, 'triangle'); tone(990, .2, .05, 'triangle', .14); } else ding();
      updateBadges(); if (view === 'queue') renderQueueList(); else if (view === 'dashboard') render();
    } else if (type === 'message') {
      const s = G.sender(d.from);
      toast(`<b>${esc(s.name)}</b> <span class="faint">${esc(s.role)}</span><br>${esc(d.text.length > 140 ? d.text.slice(0, 140) + '…' : d.text)}`, 'msg', () => setView('team'));
      ding(); updateBadges(); if (view === 'team') render();
    } else if (type === 'ticket') {
      updateBadges();
      if (view === 'queue') { renderQueueList(); if (selAlert === d.alertId) renderTicketPane(); }
      else if (view === 'dashboard') render();
    } else if (type === 'warning') showWarning(d);
    else if (type === 'end') { clearInterval(timer); updateTop(); setView('report'); }
  }

  /* ---------- shell ---------- */
  function renderShell() {
    $('#app').innerHTML = `<div class="shell">
      <header class="top">
        <div class="brand"><i></i>SOC DESK</div>
        <span class="chip">${esc(G.sc.company.name)}</span><span class="chip">${esc(G.sc.date)}</span><span class="chip">${esc(S.name)} · Tier 1 Analyst</span>
        <div class="sp"></div>
        <span class="chip" id="cnt"></span>
        <span class="clock" id="clock"></span>
        <button class="btn" data-act="play" id="playbtn"></button>
        <select id="speed" style="width:78px" data-act-change="speed">${[5, 10, 20, 30, 60].map(x => `<option value="${x}" ${G.speed === x ? 'selected' : ''}>${x}x</option>`).join('')}</select>
        <button class="btn" data-act="skip" title="Skip ahead 15 simulated minutes">+15m</button>
        <button class="btn" data-act="settings" title="Settings">⚙</button>
        ${G.sc.tutorial ? '<button class="btn danger" data-act="tut-exit">Exit tutorial</button>' : '<button class="btn danger" data-act="end" id="endbtn">End shift</button>'}
      </header>
      <nav class="side">${NAV.map(([k, l]) => `<button data-act="nav" data-v="${k}" id="nav-${k}">${ICON[k]}<span>${l}</span><span class="badge zero" id="bd-${k}">0</span></button>`).join('')}</nav>
      <main id="main"></main></div>`;
    updateTop(); updateBadges();
  }
  function updateTop() {
    if (!G) return;
    const c = $('#clock'); if (!c) return;
    c.textContent = hms(G.now);
    const st = G.stats();
    $('#cnt').textContent = `${st.by.new} untouched · ${st.breaches} SLA breach${st.breaches === 1 ? '' : 'es'}`;
    $('#playbtn').textContent = G.finished ? 'Shift over' : G.paused ? '▶ Resume' : '❚❚ Pause';
    const eb = $('#endbtn'); if (eb) { eb.textContent = G.finished ? '📋 Shift report' : 'End shift'; eb.classList.toggle('primary', !!G.finished); eb.classList.toggle('danger', !G.finished); }
  }
  function updateBadges() {
    if (!G) return;
    const st = G.stats(), set = (k, n) => { const b = $('#bd-' + k); if (b) { b.textContent = n; b.classList.toggle('zero', !n); } };
    set('queue', st.by.new); set('team', view === 'team' ? 0 : G.unread);
  }
  function setView(v) {
    view = v; if (v === 'team') G.unread = 0;
    $$('.side button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); updateBadges(); render();
  }
  function toast(html, cls, onclick) {
    const el = document.createElement('div'); el.className = 'toast ' + (cls || ''); el.innerHTML = html;
    el.onclick = () => { el.remove(); onclick && onclick(); };
    $('#toasts').appendChild(el); setTimeout(() => el.remove(), 9000);
    while ($('#toasts').children.length > 4) $('#toasts').firstChild.remove();
  }

  /* ---------- views ---------- */
  function render() {
    const m = $('#main'); if (!m) return;
    const keep = m.scrollTop;
    ({ dashboard: vDash, queue: vQueue, siem: vSiem, edr: vEdr, intel: vIntel, team: vTeam, report: vReport }[view])(m);
    if (view !== 'queue') m.scrollTop = keep;
  }

  /* dashboard */
  function barChart(hrs) {
    const w = 560, h = 170, pl = 28, pb = 24, max = Math.max(4, ...hrs.map(x => x.n)), bw = Math.min(46, (w - pl) / hrs.length - 14), gap = (w - pl) / hrs.length;
    let s = `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Alerts per hour">`;
    for (let i = 0; i <= 4; i++) { const y = 8 + (h - pb - 8) * (1 - i / 4); s += `<line x1="${pl}" x2="${w}" y1="${y}" y2="${y}" stroke="#2c3039" stroke-width="1"/><text x="${pl - 6}" y="${y + 4}" fill="#6b6f79" font-size="10" text-anchor="end">${Math.round(max * i / 4)}</text>`; }
    hrs.forEach((x, i) => {
      const bh = (h - pb - 8) * x.n / max, bx = pl + i * gap + (gap - bw) / 2, by = h - pb - bh;
      s += `<g><title>${String(x.h).padStart(2, '0')}:00 – ${x.n} alert${x.n === 1 ? '' : 's'}</title>` + (x.n ? `<path d="M${bx},${h - pb} V${by + 4} Q${bx},${by} ${bx + 4},${by} H${bx + bw - 4} Q${bx + bw},${by} ${bx + bw},${by + 4} V${h - pb} Z" fill="#3987e5"/><text x="${bx + bw / 2}" y="${by - 4}" fill="#e8e8e5" font-size="11" text-anchor="middle">${x.n}</text>` : '') + `<text x="${bx + bw / 2}" y="${h - 8}" fill="#9a9da6" font-size="10" text-anchor="middle">${String(x.h).padStart(2, '0')}:00</text></g>`;
    });
    return s + '</svg>';
  }
  function vDash(m) {
    const st = G.stats(), sevCol = { critical: 'var(--sev-critical)', high: 'var(--sev-high)', medium: 'var(--sev-medium)', low: 'var(--sev-low)' }, sevIcon = { critical: '▲▲', high: '▲', medium: '●', low: '○' };
    const mx = Math.max(1, ...Object.values(st.sev)), msgs = G.messages.slice(-4).reverse();
    m.innerHTML = `<div class="kpis">
      ${[['Untouched', st.by.new], ['In progress', st.by.in_progress + st.by.confirmed_tp + st.by.returned_fp], ['Awaiting T2/IR', st.by.escalated], ['Closed', st.by.closed], ['SLA breaches', st.breaches], ['Avg time to first touch', st.avgTouch == null ? '–' : dur(st.avgTouch)]].map(([l, v]) => `<div class="kpi"><b>${v}</b><span>${l}</span></div>`).join('')}
    </div>
    <div class="dash2"><div class="grid">
      <div class="panel"><h3>Shift handover from the previous analyst</h3><ul class="handover" style="margin:0;padding-left:18px">${G.sc.handover.split('\n').map(l => `<li>${esc(l)}</li>`).join('')}</ul></div>
      <div class="panel"><h3>Alerts per hour (so far)</h3>${barChart(st.hr)}</div></div>
      <div class="grid">
        <div class="panel"><h3>By severity</h3>${['critical', 'high', 'medium', 'low'].map(k => `<div class="barrow"><span><span class="faint">${sevIcon[k]}</span> ${k}</span><div class="bartrack"><i style="width:${st.sev[k] / mx * 100}%;background:${sevCol[k]}"></i></div><b>${st.sev[k]}</b></div>`).join('')}</div>
        <div class="panel"><h3>Recent team messages</h3>${msgs.length ? msgs.map(x => { const s = G.sender(x.from); return `<div class="msg-row"><div class="av" style="background:${s.color}">${esc(s.initials)}</div><div class="bd"><div><span class="nm">${esc(s.name)}</span> <span class="faint mono">${hm(x.t)}</span></div><div>${esc(x.text.slice(0, 160))}</div></div></div>`; }).join('') : '<div class="faint">No messages yet.</div>'}</div>
        <div class="panel"><h3>Your tools</h3><div class="muted">Queue to triage alerts · SIEM to search logs · EDR for host process trees · Intel for IOC lookups, the change calendar and the asset list · Team to talk to colleagues.</div></div>
      </div></div>`;
  }

  /* queue */
  function slaHtml(id) {
    const s = G.slaInfo(id);
    if (s.done) return s.met ? `<span class="sla met">touched in ${dur(s.took)}</span>` : `<span class="sla bad">touched late (${dur(s.took)})</span>`;
    if (s.left >= 0) return `<span class="sla ${s.left < 300 ? 'low' : 'ok'}">SLA ${dur(s.left)}</span>`;
    return `<span class="sla bad">SLA breached +${dur(-s.left)}</span>`;
  }
  function updateSla() { $$('[data-sla]').forEach(e => { e.innerHTML = slaHtml(e.dataset.sla); }); }
  function vQueue(m) {
    m.innerHTML = `<div class="split"><div class="panel" style="padding:0" id="qlist"></div><div id="qdetail"></div></div>`;
    m.style.overflow = 'hidden'; renderQueueList(); renderTicketPane();
  }
  const FILTERS = [['all', 'All'], ['new', 'Untouched'], ['active', 'Working'], ['closed', 'Closed'], ['high', 'High+']];
  function renderQueueList() {
    const box = $('#qlist'); if (!box) return;
    const scroll = box.scrollTop;
    const items = G.visibleAlerts().slice().reverse().filter(a => {
      const s = G.status(a.def.id);
      return qFilter === 'all' || (qFilter === 'new' && s === 'new') || (qFilter === 'active' && s !== 'new' && s !== 'closed') || (qFilter === 'closed' && s === 'closed') || (qFilter === 'high' && G.sc.alerts && ['high', 'critical'].includes(a.def.severity));
    });
    box.innerHTML = `<div class="qfilters">${FILTERS.map(([k, l]) => `<span class="f ${qFilter === k ? 'on' : ''}" data-act="qf" data-v="${k}">${l}</span>`).join('')}<span class="faint" style="margin-left:auto">${items.length} alert${items.length === 1 ? '' : 's'}</span></div>` +
      (items.length ? items.map(a => {
        const d = a.def, st = G.status(d.id), h = G.hostById[d.hostId], u = G.userById[d.userId];
        return `<div class="qrow ${selAlert === d.id ? 'sel' : ''} ${fresh.has(d.id) ? 'fresh' : ''}" data-act="sel" data-id="${d.id}">
          <div><span class="pill ${d.severity}">${d.severity}</span><div class="faint mono" style="margin-top:3px">${d.id}</div></div>
          <div class="t">${esc(d.title)}</div>
          <div class="m"><span class="mono">${hm(a.arrive)}</span><span>${esc(d.source)}</span>${h ? `<span>${esc(h.hostname)}</span>` : ''}${u ? `<span>${esc(u.username)}</span>` : ''}<span class="st ${st}">${STATUS[st]}</span><span data-sla="${d.id}">${slaHtml(d.id)}</span></div></div>`;
      }).join('') : '<div class="empty">Nothing here. Grab a coffee, more will come.</div>');
    box.scrollTop = scroll;
  }
  function selectAlert(id) { G.open(id); selAlert = id; renderQueueList(); renderTicketPane(); }
  function entLinks(q) { return `<a data-act="pivot" data-q="${esc(q)}">SIEM</a>`; }
  function renderTicketPane() {
    const box = $('#qdetail'); if (!box) return;
    if (!selAlert) { box.innerHTML = '<div class="panel empty">Select an alert from the queue to open its ticket.</div>'; return; }
    const id = selAlert, a = G.alertById[id].def, t = G.ticket(id) || G.open(id);
    const h = G.hostById[a.hostId], u = G.userById[a.userId], dr = drafts[id] = drafts[id] || {};
    const locked = t.status === 'closed', waiting = t.status === 'escalated';
    const rel = G.related(id);
    const tl = [{ t: t.openedAt, kind: 'it', text: `Ticket ${t.id} opened by ${S.name}` }]
      .concat(t.notes.map(n => ({ t: n.t, kind: 'it', text: 'Note: ' + n.text })))
      .concat(G.messages.filter(x => x.ticketId === t.id).map(x => ({ t: x.t, kind: 'msg', text: `${G.sender(x.from).name}: ${x.text.replace(/^\[[^\]]+\]\s*/, '')}` })));
    if (t.escalation) tl.push({ t: t.escalation.at, kind: 'esc', text: `Escalated to ${G.teamById[t.escalation.to].name}: ${t.escalation.desc}` });
    if (t.closure) tl.push({ t: t.closure.at, kind: 'close', text: `Closed as ${DISPOSITIONS[t.closure.disposition]}: ${t.closure.note}` });
    tl.sort((x, y) => x.t - y.t);
    const T2 = SOC_TEAM.filter(x => x.escalatable === 'T2'), IR = SOC_TEAM.filter(x => x.escalatable === 'IR');
    const debrief = locked ? `<div class="debrief ${a.truth === 'TP' ? 'tp' : ''}"><b>Debrief: this alert was a ${a.truth === 'TP' ? 'TRUE POSITIVE' : 'FALSE POSITIVE'}.</b><div style="margin-top:4px">${esc(a.explain)}</div></div>` : '';
    box.innerHTML = `<div class="ticket">
      <div class="panel"><div class="tk-head"><span class="pill ${a.severity}">${a.severity}</span><h2>${esc(a.title)}</h2><span class="st ${t.status}">${STATUS[t.status]}</span><span data-sla="${id}">${slaHtml(id)}</span></div>
        <div class="muted" style="margin:6px 0 10px">${t.id} · ${id} · ${esc(a.source)} · <span class="mono">${esc(a.rule)}</span> · fired ${a.at}</div>
        <div>${esc(a.summary)}</div>
        <dl class="kv" style="margin-top:10px">${Object.entries(a.details).map(([k, v]) => `<dt>${esc(k)}</dt><dd class="mono">${esc(v)}</dd>`).join('')}</dl></div>
      <div class="two">
        <div class="panel"><h3>Host</h3>${h ? `<div class="ent"><span class="nm">${esc(h.hostname)}</span><span class="mono muted">${esc(h.ip)} · ${esc(h.os)}</span><span class="muted">${esc(h.dept)} · criticality: <b>${esc(h.criticality)}</b> · ${esc(h.type)}</span>
          <div class="actions" style="margin-top:6px"><button class="btn sm" data-act="open-edr" data-h="${h.id}">Open in EDR</button><button class="btn sm" data-act="pivot" data-q="host:${esc(h.hostname)}">Host logs</button></div></div>` : '<span class="faint">No host associated.</span>'}</div>
        <div class="panel"><h3>User</h3>${u ? `<div class="ent"><span class="nm">${esc(u.name)}</span><span class="mono muted">${esc(u.username)} · ${esc(u.email)}</span><span class="muted">${esc(u.title)} · ${esc(u.dept)} · mgr: ${esc(u.manager || 'n/a')}</span>
          <div class="actions" style="margin-top:6px"><button class="btn sm" data-act="pivot" data-q="user:${esc(u.username)}">User logs</button><button class="btn sm" data-act="contact" data-who="user" ${t.contacts.includes('user:' + id) || locked ? 'disabled' : ''}>${t.contacts.includes('user:' + id) ? 'Asked user' : 'Contact user'}</button><button class="btn sm" data-act="contact" data-who="desk" ${t.contacts.includes('desk:' + id) || locked ? 'disabled' : ''}>${t.contacts.includes('desk:' + id) ? 'Asked service desk' : 'Ask service desk'}</button></div></div>` : '<span class="faint">No user associated.</span>'}</div>
      </div>
      <div class="panel"><h3>Indicators</h3>${a.iocs.length ? a.iocs.map(i => `<div class="iocrow"><span class="ty">${esc(i.type)}</span><span class="mono">${esc(i.value)}</span><a data-act="intel" data-v="${esc(i.value)}">Intel</a>${['user', 'host'].includes(i.type) ? '' : `<a data-act="pivot" data-q="${esc(/[\s]/.test(i.value) ? '"' + i.value + '"' : i.value)}">Search SIEM</a>`}</div>`).join('') : '<span class="faint">None extracted.</span>'}</div>
      <div class="panel"><div style="display:flex;justify-content:space-between;align-items:center"><h3>Related events (${a.eventIds.length})</h3><button class="btn sm" data-act="siem-ids" data-id="${id}">Open all in SIEM</button></div>
        ${a.eventIds.map(eid => G.eventById[eid]).filter(Boolean).sort((x, y) => x.t - y.t).map(e => `<div class="evrow ${siem.open.has('t' + e.id) ? 'open' : ''}" data-act="evtoggle" data-id="t${e.id}"><span>${e.ts}</span><span class="src">${esc(e.source)}</span><span class="msg">${esc(e.hostname ? e.hostname + ' ' : '')}${esc(e.msg)}</span></div>`).join('')}</div>
      ${rel.length ? `<div class="panel"><h3>Related alerts (${rel.length})</h3>${rel.map(r => `<div class="iocrow"><span class="pill ${r.severity}">${r.severity}</span><a data-act="sel" data-id="${r.id}">${r.id}</a><span>${esc(r.title)}</span><span class="st ${G.status(r.id)}">${STATUS[G.status(r.id)]}</span></div>`).join('')}</div>` : ''}
      <div class="panel"><h3>Ticket timeline</h3><div class="tl">${tl.map(x => `<div class="it ${x.kind}"><span class="mono faint">${hm(x.t)}</span> ${esc(x.text)}</div>`).join('')}</div>
        ${locked ? '' : `<div style="display:flex;gap:8px;margin-top:10px"><input type="text" id="note-in" placeholder="Add an investigation note…" data-draft="note" value="${esc(dr.note || '')}" data-enter="addnote"><button class="btn" data-act="addnote">Add note</button></div>`}</div>
      ${debrief}
      ${locked ? `<div class="panel"><button class="btn" data-act="reopen">Reopen ticket</button></div>` : waiting ? `<div class="panel"><h3>Escalation</h3><div class="muted">Waiting for ${esc(G.teamById[t.escalation.to].name)} to respond. Keep working the queue.</div></div>` : `
      <div class="two">
        <div class="panel"><h3>Escalate</h3>
          <label class="muted">To</label><select id="esc-to" data-draft="escTo"><optgroup label="Tier 2 SOC">${T2.map(p => `<option value="${p.id}" ${dr.escTo === p.id ? 'selected' : ''}>${esc(p.name)} (T2)</option>`).join('')}</optgroup><optgroup label="Incident Response">${IR.map(p => `<option value="${p.id}" ${dr.escTo === p.id ? 'selected' : ''}>${esc(p.name)} (IR)</option>`).join('')}</optgroup></select>
          <label class="muted" style="margin-top:8px;display:block">Handoff description (what you saw, evidence, why)</label>
          <textarea id="esc-desc" data-draft="escDesc" placeholder="Host / user / what fired / what you found in the logs / why you can’t clear it">${esc(dr.escDesc || '')}</textarea>
          <div style="margin-top:8px"><button class="btn primary" data-act="escalate">Escalate</button></div></div>
        <div class="panel"><h3>Close ticket</h3>
          <label class="muted">Reason</label><select id="cl-disp" data-draft="clDisp">${t.status === 'confirmed_tp' ? '<option value="handoff">Handed off (confirmed by T2/IR)</option>' : ''}${['fp', 'benign', 'duplicate'].map(k => `<option value="${k}" ${dr.clDisp === k ? 'selected' : ''}>${DISPOSITIONS[k]}</option>`).join('')}</select>
          <label class="muted" style="margin-top:8px;display:block">Closing note (your reasoning and evidence)</label>
          <textarea id="cl-note" data-draft="clNote" placeholder="Why is this safe to close? Cite the evidence you checked.">${esc(dr.clNote || '')}</textarea>
          <div style="margin-top:8px"><button class="btn" data-act="close">Close ticket</button></div></div>
      </div>`}
    </div>`;
  }

  /* siem */
  const RANGES = [['all', 'Today (all)'], ['15', 'Last 15 min'], ['60', 'Last hour'], ['240', 'Last 4 hours']];
  function hist(rows) {
    const bins = G.histogram(rows, 30), mx = Math.max(1, ...bins.map(b => b.n)), w = 900, h = 90, gap = w / bins.length, bw = gap - 4;
    return `<svg viewBox="0 0 ${w} ${h + 16}" width="100%" role="img" aria-label="Events over time">` + bins.map((b, i) => {
      const bh = Math.max(b.n ? 2 : 0, (h - 4) * b.n / mx), x = i * gap + 2;
      return `<g><title>${hm(b.t)} – ${b.n} events</title>` + (b.n ? `<path d="M${x},${h} V${h - bh + 3} Q${x},${h - bh} ${x + 3},${h - bh} H${x + bw - 3} Q${x + bw},${h - bh} ${x + bw},${h - bh + 3} V${h} Z" fill="#3987e5"/>` : '') + (i % 2 === 0 ? `<text x="${x + bw / 2}" y="${h + 12}" fill="#6b6f79" font-size="9" text-anchor="middle">${hm(b.t)}</text>` : '') + '</g>';
    }).join('') + '</svg>';
  }
  function vSiem(m) {
    const from = siem.ids ? 0 : (siem.range === 'all' ? 0 : G.now - (+siem.range) * 60);
    const r = G.search(siem.q, { from, ids: siem.ids, limit: 400 });
    const srcs = Array.from(new Set(G.events.filter(e => e.t <= G.now).map(e => e.source))).sort();
    m.innerHTML = `<div class="sbar"><input type="text" id="siem-q" value="${esc(siem.q)}" placeholder='Search logs. e.g.  host:FIN-LT-031   user:hdoyle   source:proxy   dst:198.51.100.23   "powershell" -svchost' data-bind="siem.q" data-enter="siem-run">
      <select id="siem-range" data-act-change="siem-range">${RANGES.map(([k, l]) => `<option value="${k}" ${siem.range === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <button class="btn primary" data-act="siem-run">Search</button><button class="btn" data-act="siem-clear">Clear</button></div>
      ${siem.ids ? `<div class="panel" style="margin-bottom:8px;border-color:var(--accent)">Showing ${esc(siem.idsLabel)} <a data-act="siem-clear" style="margin-left:10px">clear</a></div>` : ''}
      <div class="chips"><span class="faint">Sources:</span>${srcs.map(s => `<span class="f" data-act="pivot" data-q="source:${s}">${esc(s)}</span>`).join('')}</div>
      <div class="panel" style="margin-bottom:10px"><h3>${r.total.toLocaleString()} events${r.total > 400 ? ' (showing the latest 400, narrow your search)' : ''}</h3>${hist(r.all)}</div>
      <div class="panel" style="padding:0;overflow:auto"><table><thead><tr><th style="width:70px">Time</th><th style="width:120px">Host</th><th style="width:90px">User</th><th style="width:80px">Source</th><th style="width:150px">Event</th><th>Message</th></tr></thead><tbody>
      ${r.rows.map(e => `<tr class="ev" data-act="evtoggle" data-id="${e.id}"><td class="mono">${e.ts}</td><td>${esc(e.hostname || '–')}</td><td>${esc(e.user || '')}</td><td><span class="src">${esc(e.source)}</span></td><td>${esc(e.event)}</td><td class="mono">${esc(e.msg.length > 150 ? e.msg.slice(0, 150) + '…' : e.msg)}</td></tr>${siem.open.has(e.id) ? evDetail(e) : ''}`).join('') || '<tr><td colspan="6" class="empty">No events match.</td></tr>'}
      </tbody></table></div>`;
  }
  function pv(k, v) { const q = /\s/.test(v) ? `${k}:"${v}"` : `${k}:${v}`; return `<a data-act="pivot" data-q="${esc(q)}">${esc(v)}</a>`; }
  function evDetail(e) {
    const rows = [['host', e.hostname], ['user', e.user], ['src', e.src], ['dst', e.dst], ['source', e.source], ['event', e.event]].filter(x => x[1]).map(([k, v]) => `<tr><td class="faint">${k}</td><td>${pv(k, v)}${/^\d+\.\d+\.\d+\.\d+$/.test(v) || k === 'host' ? ` <a data-act="intel" data-v="${esc(v)}" class="faint">[intel]</a>` : ''}</td></tr>`).join('') +
      Object.entries(e.fields).filter(([k]) => k !== 'c2').map(([k, v]) => `<tr><td class="faint">${esc(k)}</td><td>${pv(k.toLowerCase(), String(v))} <a data-act="intel" data-v="${esc(v)}" class="faint">[intel]</a></td></tr>`).join('');
    return `<tr class="detail"><td colspan="6"><div class="mono" style="white-space:pre-wrap;word-break:break-all;margin-bottom:8px">${esc(e.raw)}</div><table class="fieldtbl"><tbody>${rows}</tbody></table></td></tr>`;
  }

  /* edr */
  function vEdr(m) {
    const hosts = G.sc.hosts.slice().sort((a, b) => a.hostname.localeCompare(b.hostname));
    if (!edr.host) edr.host = hosts[0].id;
    const d = G.edr(edr.host), h = d.host, activeAlerts = id => G.visibleAlerts().filter(a => a.def.hostId === id && G.status(a.def.id) !== 'closed').length;
    let body = '';
    if (edr.tab === 'proc') {
      const byPid = new Map(d.processes.map(p => [p.pid, p])), kids = new Map();
      d.processes.forEach(p => { const k = byPid.has(p.ppid) && p.ppid !== p.pid ? p.ppid : 0; (kids.get(k) || kids.set(k, []).get(k)).push(p); });
      const node = p => `<div><div class="pnode ${p.flag || ''} ${edr.pid === p.pid ? 'sel' : ''}" data-act="proc" data-pid="${p.pid}"><span class="nm">${esc(p.name)}</span><span class="faint">${p.pid}</span><span class="faint">${esc(p.start)}</span>${p.flag ? `<span class="flag ${p.flag}">${p.flag}</span>` : ''}${p.signed === false ? '<span class="flag unsigned">unsigned</span>' : ''}<span class="cmd">${esc(p.cmd)}</span></div>${(kids.get(p.pid) || []).length ? `<div class="pch">${kids.get(p.pid).map(node).join('')}</div>` : ''}</div>`;
      const sel = d.processes.find(p => p.pid === edr.pid);
      body = `<div class="ptree">${(kids.get(0) || []).map(node).join('') || '<div class="faint">No process data yet.</div>'}</div>` + (sel ? `<div class="panel" style="margin-top:12px;background:var(--panel2)"><h3>${esc(sel.name)} (pid ${sel.pid})</h3><dl class="kv"><dt>Command line</dt><dd class="mono">${esc(sel.cmd)}</dd><dt>User</dt><dd>${esc(sel.user)}</dd><dt>Started</dt><dd>${esc(sel.start)}</dd><dt>Signature</dt><dd>${sel.signed === false ? 'Unsigned' : 'Signed: ' + esc(sel.publisher || 'unknown')}</dd>${sel.sha256 ? `<dt>SHA-256</dt><dd class="mono">${esc(sel.sha256)} <a data-act="intel" data-v="${esc(sel.sha256)}">intel</a></dd>` : ''}<dt>Parent pid</dt><dd>${sel.ppid || '–'}</dd>${sel.note ? `<dt>EDR note</dt><dd>${esc(sel.note)}</dd>` : ''}</dl><div class="actions" style="margin-top:8px"><button class="btn sm" data-act="pivot" data-q='host:${esc(h.hostname)} "${esc(sel.name)}"'>Search SIEM for this process</button></div></div>` : '');
    } else if (edr.tab === 'net') {
      body = `<table><thead><tr><th>Time</th><th>Process</th><th>PID</th><th>Destination</th><th>Domain</th><th>Proto</th></tr></thead><tbody>${d.connections.slice().reverse().slice(0, 150).map(c => `<tr><td class="mono">${esc(c.t)}</td><td>${esc(c.proc)}</td><td>${c.pid}</td><td class="mono">${esc(c.dst)} <a data-act="intel" data-v="${esc(c.dst.split(':')[0])}">intel</a></td><td>${c.domain ? `${esc(c.domain)} <a data-act="intel" data-v="${esc(c.domain)}">intel</a>` : ''}</td><td>${esc(c.proto)}</td></tr>`).join('') || '<tr><td colspan="6" class="empty">No notable connections recorded by the sensor.</td></tr>'}</tbody></table>`;
    } else {
      body = `<table><thead><tr><th>Time</th><th>Op</th><th>PID</th><th>Path</th><th>SHA-256</th></tr></thead><tbody>${d.files.slice().reverse().slice(0, 150).map(f => `<tr><td class="mono">${esc(f.t)}</td><td>${esc(f.op)}</td><td>${f.pid}</td><td class="mono">${esc(f.path)}</td><td class="mono">${f.sha256 ? esc(f.sha256.slice(0, 16)) + '… <a data-act="intel" data-v="' + esc(f.sha256) + '">intel</a>' : ''}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">No file telemetry of interest.</td></tr>'}</tbody></table>`;
    }
    m.style.overflow = 'hidden';
    m.innerHTML = `<div class="edr"><div class="panel" style="padding:0">${hosts.map(x => { const iso = G.isolated[x.id], n = activeAlerts(x.id); return `<div class="hrow ${edr.host === x.id ? 'sel' : ''}" data-act="edr-host" data-h="${x.id}"><span class="dot ${iso ? 'iso' : n ? 'alert' : ''}"></span><div><b>${esc(x.hostname)}</b> <span class="faint">${esc(x.type)}</span><div class="muted" style="font-size:12px">${esc(x.userId ? G.userById[x.userId].name : x.dept)}${iso ? ' · <span class="badc">ISOLATED</span>' : n ? ` · ${n} open alert${n > 1 ? 's' : ''}` : ''}</div></div></div>`; }).join('')}</div>
      <div class="panel"><div class="tk-head"><h2>${esc(h.hostname)}</h2><span class="chip">${esc(h.ip)}</span><span class="chip">${esc(h.os)}</span><span class="chip">criticality: ${esc(h.criticality)}</span><span class="chip">agent ${esc(h.agent || '7.4.1')}</span>${d.isolated ? `<span class="pill critical">isolated by ${d.isolated.by}</span>` : '<span class="pill low" style="background:var(--ok)">online</span>'}<div style="flex:1"></div>
        <button class="btn ${d.isolated ? '' : 'danger'}" data-act="isolate" data-h="${h.id}">${d.isolated ? 'Release from isolation' : 'Isolate host'}</button></div>
        <div class="muted" style="margin:4px 0 10px">${d.user ? `Assigned to ${esc(d.user.name)} (${esc(d.user.title)})` : 'Server / shared asset'}</div>
        <div class="tabs">${[['proc', 'Process tree'], ['net', 'Network'], ['files', 'Files']].map(([k, l]) => `<div class="tab ${edr.tab === k ? 'on' : ''}" data-act="edr-tab" data-v="${k}">${l}</div>`).join('')}</div>${body}</div></div>`;
  }

  /* intel */
  function doIntel(v) {
    v = (v || '').trim(); if (!v) return;
    intel.q = v; intel.res = G.intel(v); intel.tab = 'lookup';
    intel.hist = [v].concat(intel.hist.filter(x => x !== v)).slice(0, 12);
  }
  function vIntel(m) {
    m.style.overflow = '';
    let body = '';
    if (intel.tab === 'lookup') {
      const r = intel.res;
      body = `<div class="sbar"><input type="text" id="intel-q" value="${esc(intel.q)}" placeholder="IP, domain, URL, file hash, email, username or hostname" data-bind="intel.q" data-enter="intel-run"><button class="btn primary" data-act="intel-run">Look up</button></div>
      ${r ? `<div class="panel" style="margin-bottom:12px"><div class="tk-head"><h2 class="mono" style="font-size:14px;word-break:break-all">${esc(r.value)}</h2><span class="tag ${r.verdict}">${r.verdict.toUpperCase()}</span><span class="faint">source: ${esc(r.source)}</span></div><p>${esc(r.summary)}</p><div class="muted">Seen in ${r.seen} event${r.seen === 1 ? '' : 's'} in our telemetry so far. <a data-act="pivot" data-q="${esc(/\s/.test(r.value) ? '"' + r.value + '"' : r.value)}">Search SIEM</a></div></div>` : '<div class="panel empty">Paste an indicator to check its reputation.</div>'}
      ${intel.hist.length ? `<div class="panel"><h3>Recent lookups</h3>${intel.hist.map(x => `<div><a data-act="intel" data-v="${esc(x)}" class="mono">${esc(x)}</a></div>`).join('')}</div>` : ''}`;
    } else if (intel.tab === 'changes') {
      body = `<div class="panel" style="padding:0"><table><thead><tr><th>Window</th><th>Ticket</th><th>System</th><th>Owner</th><th>Description</th></tr></thead><tbody>${G.changes().map(c => `<tr><td class="mono">${esc(c.at)}</td><td>${esc(c.ticket || '')}</td><td>${esc(c.system)}</td><td>${esc(c.owner || '')}</td><td>${esc(c.desc)}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">No changes scheduled.</td></tr>'}</tbody></table></div>`;
    } else {
      body = `<div class="grid" style="grid-template-columns:1fr 1fr;align-items:start"><div class="panel" style="padding:0"><table><thead><tr><th>Host</th><th>IP</th><th>Owner</th><th>Crit.</th></tr></thead><tbody>${G.sc.hosts.map(h => `<tr><td><a data-act="open-edr" data-h="${h.id}">${esc(h.hostname)}</a></td><td class="mono">${esc(h.ip)}</td><td>${esc(h.userId ? G.userById[h.userId].name : '–')}</td><td>${esc(h.criticality)}</td></tr>`).join('')}</tbody></table></div>
      <div class="panel" style="padding:0"><table><thead><tr><th>User</th><th>Title</th><th>Dept</th><th>Manager</th></tr></thead><tbody>${G.sc.users.map(u => `<tr><td>${pv('user', u.username)}<div class="faint">${esc(u.name)}</div></td><td>${esc(u.title)}</td><td>${esc(u.dept)}</td><td>${esc(u.manager || '–')}</td></tr>`).join('')}</tbody></table></div></div>`;
    }
    m.innerHTML = `<div class="tabs">${[['lookup', 'IOC lookup'], ['changes', 'Change calendar'], ['assets', 'Assets & directory']].map(([k, l]) => `<div class="tab ${intel.tab === k ? 'on' : ''}" data-act="intel-tab" data-v="${k}">${l}</div>`).join('')}</div>${body}`;
  }

  /* team */
  function vTeam(m) {
    m.style.overflow = 'hidden'; G.unread = 0;
    const msgs = G.messages.filter(x => !team.filter || x.from === team.filter);
    m.innerHTML = `<div class="team"><div class="panel" style="padding:0"><div class="person ${team.filter ? '' : 'sel'}" data-act="tf" data-v=""><b>Everyone</b></div>${SOC_TEAM.map(p => `<div class="person ${team.filter === p.id ? 'sel' : ''}" data-act="tf" data-v="${p.id}"><div class="av" style="background:${p.color}">${p.initials}</div><div><b>${esc(p.name)}</b><div class="muted" style="font-size:12px">${esc(p.role)}</div>${p.escalatable ? `<span class="tag">escalation: ${p.escalatable}</span>` : ''}</div></div>`).join('')}</div>
      <div class="panel" id="msgbox">${team.filter ? `<div class="muted" style="margin-bottom:8px">${esc(G.teamById[team.filter].bio)}</div>` : ''}${msgs.length ? msgs.map(x => { const s = G.sender(x.from); return `<div class="msg-row ${x.kind === 'reply' ? 'reply' : ''}"><div class="av" style="background:${s.color}">${esc(s.initials)}</div><div class="bd"><div><span class="nm">${esc(s.name)}</span> <span class="faint">${esc(s.role)}</span> <span class="faint mono">${hm(x.t)}</span></div><div class="tx">${esc(x.text)}</div></div></div>`; }).join('') : '<div class="empty">No messages yet.</div>'}</div></div>`;
    const b = $('#msgbox'); if (b) b.scrollTop = b.scrollHeight;
  }

  /* report */
  function vReport(m) {
    m.style.overflow = ''; const r = G.report(), tp = r.incidents[0];
    const caught = tp && tp.escalated, missedClose = tp && tp.misses.length;
    m.innerHTML = `<div class="panel" style="display:flex;gap:30px;align-items:center;flex-wrap:wrap"><div class="grade ${r.score >= 70 ? 'good' : 'badc'}">${r.grade}</div><div style="flex:1;min-width:300px"><h2 style="font-size:22px">Shift report · ${esc(G.sc.title)}</h2><div class="muted">${esc(S.name)} · ${esc(G.sc.company.name)} · score ${r.score}/100</div>
      <p style="margin:8px 0">${caught ? `<b class="good">You caught the incident</b> (${tp.id}) and escalated it ${tp.ttEscalate != null ? dur(tp.ttEscalate) + ' after the first alert' : ''}.` : `<b class="badc">The real incident (${tp ? tp.id : '?'}) was never escalated.</b> The attacker was still active at the end of the shift.`}${missedClose ? ` You also closed a true positive as benign ${tp.misses.length} time${tp.misses.length > 1 ? 's' : ''}.` : ''}</p>
      <ul style="margin:0;padding-left:18px">${r.notes.map(n => `<li>${esc(n)}</li>`).join('') || '<li>Clean shift. No deductions.</li>'}</ul></div>
      <div><button class="btn primary" data-act="menu" style="padding:8px 20px">Back to menu</button></div></div>
      <div class="panel" style="margin-top:12px;padding:0"><table><thead><tr><th>Alert</th><th>Sev</th><th>Title</th><th>Truth</th><th>Your outcome</th><th>Result</th></tr></thead><tbody>${r.rows.map(x => `<tr><td class="mono" style="white-space:nowrap">${x.id}</td><td><span class="pill ${x.severity}">${x.severity}</span></td><td>${esc(x.title)}<div class="faint" style="font-size:12px;margin-top:2px">${esc(x.explain)}</div></td><td><b class="${x.truth === 'TP' ? 'badc' : ''}">${x.truth === 'TP' ? 'TRUE POSITIVE' : 'False positive'}</b></td><td>${esc(x.outcome)}</td><td>${x.good === null ? '<span class="muted">– not worked</span>' : x.good ? '<span class="good">✓ correct</span>' : '<span class="badc">✗ missed</span>'}</td></tr>`).join('')}</tbody></table></div>`;
  }

  /* ---------- modals ---------- */
  function openModal(html, cls) { modalOpen = true; $('#modal-root').innerHTML = `<div class="overlay ${cls || ''}">${html}</div>`; }
  function closeModal() { modalOpen = false; $('#modal-root').innerHTML = ''; lastTs = performance.now(); }
  function showWarning(w) {
    alarm(); try { window.socdesk && window.socdesk.flash(); } catch (e) { /* ignore */ }
    openModal(`<div class="warn-box"><div class="warn-title">⚠ WARNING ⚠<br>WARNING<br>⚠ WARNING ⚠</div>
      <div class="warn-text">${esc(S.warning || DEFAULT_WARNING)}</div>
      <div class="warn-evid"><b>Ticket ${esc(w.ticketId)}</b> (${esc(w.alertId)}: ${esc(w.title)}) was a <b>TRUE POSITIVE</b>, part of incident <b>${esc(w.incident)}</b>.${w.host ? `<br>Host: ${esc(w.host)}` : ''}${w.user ? ` · User: ${esc(w.user)}` : ''}<br><br><b>What you missed:</b> ${esc(w.explain)}</div>
      <div class="actions" style="justify-content:center"><button class="btn danger" data-act="warn-reopen" data-id="${esc(w.alertId)}" style="padding:9px 24px;font-size:15px">Reopen ticket and escalate</button><button class="btn" data-act="warn-ack">I understand</button></div></div>`, 'warn-overlay');
  }
  function showSettings() {
    openModal(`<div class="modal"><h2>Settings</h2>
      <div class="row"><label>Your name</label><input type="text" id="st-name" value="${esc(S.name)}"></div>
      <div class="row"><label>Warning text (shown when you close a true positive as a false positive)</label><textarea id="st-warn" style="min-height:90px">${esc(S.warning)}</textarea></div>
      <div class="row"><label><input type="checkbox" id="st-snd" ${S.sound ? 'checked' : ''} style="width:auto"> Sound effects</label></div>
      <div class="actions" style="justify-content:flex-end"><button class="btn" data-act="st-reset">Reset warning text</button><button class="btn" data-act="st-cancel">Cancel</button><button class="btn primary" data-act="st-save">Save</button></div></div>`);
  }

  /* ---------- actions ---------- */
  const ACT = {
    'menu-sel': el => { menuSel = el.dataset.id; renderMenu(); },
    start: () => startGame(),
    settings: () => showSettings(),
    'st-save': () => { S.name = $('#st-name').value.trim() || 'Analyst'; S.warning = $('#st-warn').value.trim() || DEFAULT_WARNING; S.sound = $('#st-snd').checked; saveSettings(); closeModal(); if (G) renderShell(), setView(view); else renderMenu(); },
    'st-cancel': () => closeModal(),
    'st-reset': () => { $('#st-warn').value = DEFAULT_WARNING; },
    nav: el => setView(el.dataset.v),
    play: () => { if (G.finished) return; G.paused = !G.paused; lastTs = performance.now(); updateTop(); },
    skip: () => { if (!G.finished) G.advance(15 * 60); },
    end: () => G.finished ? setView('report') : openModal(`<div class="modal"><h2>End your shift now?</h2><p class="muted">Anything you haven’t triaged is handed to the next shift and counted against you in the report.</p><div class="actions" style="justify-content:flex-end"><button class="btn" data-act="st-cancel">Keep working</button><button class="btn danger" data-act="end-yes">End shift & see report</button></div></div>`),
    'end-yes': () => { closeModal(); G.endShift(); },
    menu: () => { if (window.SOCTut) window.SOCTut.stop(); G = null; clearInterval(timer); renderMenu(); },
    'tut-pick': () => { const d = tutDone(); openModal(`<div class="modal"><h2>Take the tutorial</h2><p class="muted">Guided practice on a safe training shift. The screen highlights what to click and tasks tick off as you do them.</p>
      <div class="cards" style="grid-template-columns:1fr">
        <div class="card" data-act="tut-start" data-k="basic"><div class="cardrow"><span class="chip">~5 min</span><span class="chip">Beginner</span>${d.basic ? '<span class="chip" style="color:var(--ok)">✓ completed</span>' : ''}</div><h2>Basics: tour the desk</h2><div class="muted">Clock, queue, tickets, SIEM, EDR, intel, team chat. Close one alert and escalate another.</div></div>
        <div class="card" data-act="tut-start" data-k="adv"><div class="cardrow"><span class="chip">~8 min</span><span class="chip">Advanced</span>${d.adv ? '<span class="chip" style="color:var(--ok)">✓ completed</span>' : ''}</div><h2>Advanced: investigate a real alert</h2><div class="muted">A full walkthrough: triage, SIEM pivots, EDR process tree, intel, change calendar, ask the user, then escalate a true positive.</div></div>
      </div><div class="actions" style="justify-content:flex-end;margin-top:12px"><button class="btn" data-act="st-cancel">Cancel</button></div></div>`); },
    'tut-start': el => { closeModal(); window.SOCTut.start(el.dataset.k); },
    'tut-exit': () => { closeModal(); window.SOCTut.stop(); ACT.menu(); },
    qf: el => { qFilter = el.dataset.v; renderQueueList(); },
    sel: el => { if (view !== 'queue') setView('queue'); selectAlert(el.dataset.id); },
    addnote: () => { const i = $('#note-in'); if (!i || !i.value.trim()) return; G.addNote(selAlert, i.value); drafts[selAlert].note = ''; },
    escalate: () => {
      const to = $('#esc-to').value, r = G.escalate(selAlert, to, $('#esc-desc').value);
      if (r.error) return toast(esc(r.error), 'high');
      drafts[selAlert].escDesc = ''; toast(`Escalated to ${esc(G.teamById[to].name)}. Awaiting response…`);
    },
    close: () => {
      const r = G.close(selAlert, $('#cl-disp').value, $('#cl-note').value);
      if (r.error) return toast(esc(r.error), 'high');
      drafts[selAlert].clNote = '';
    },
    reopen: () => { G.reopen(selAlert); },
    contact: el => { const r = G.contact(selAlert, el.dataset.who === 'user' ? 'user' : 'desk'); if (r.error) return toast(esc(r.error), 'high'); toast('Message sent. You will get a reply in a few minutes.', 'msg'); renderTicketPane(); },
    pivot: el => { siem.q = el.dataset.q; siem.ids = null; siem.range = 'all'; setView('siem'); },
    'siem-ids': el => { const a = G.alertById[el.dataset.id].def; siem.ids = a.eventIds; siem.idsLabel = `${a.eventIds.length} events related to ${a.id}`; siem.q = ''; setView('siem'); },
    'siem-run': () => { siem.q = $('#siem-q').value; siem.ids = null; render(); },
    'siem-clear': () => { siem.q = ''; siem.ids = null; render(); },
    evtoggle: el => { const id = el.dataset.id; siem.open.has(id) ? siem.open.delete(id) : siem.open.add(id); if (view === 'queue') renderTicketPane(); else render(); },
    'open-edr': el => { edr.host = el.dataset.h; edr.tab = 'proc'; edr.pid = null; setView('edr'); },
    'edr-host': el => { edr.host = el.dataset.h; edr.pid = null; render(); },
    'edr-tab': el => { edr.tab = el.dataset.v; render(); },
    proc: el => { edr.pid = +el.dataset.pid; render(); },
    isolate: el => {
      const r = G.isolateHost(el.dataset.h); if (r.error) return toast(esc(r.error), 'high');
      toast(r.isolated ? 'Isolation command sent. Host is cut off from the network.' : 'Host released from isolation.', r.isolated ? 'high' : ''); render();
    },
    intel: el => { doIntel(el.dataset.v); setView('intel'); },
    'intel-run': () => { doIntel($('#intel-q').value); render(); },
    'intel-tab': el => { intel.tab = el.dataset.v; render(); },
    tf: el => { team.filter = el.dataset.v || null; render(); },
    'warn-ack': () => { closeModal(); },
    'warn-reopen': el => { closeModal(); G.reopen(el.dataset.id); setView('queue'); selectAlert(el.dataset.id); }
  };
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const f = ACT[el.dataset.act]; if (f) { e.preventDefault(); f(el); }
  });
  document.addEventListener('change', e => {
    const a = e.target.dataset.actChange;
    if (a === 'speed') { G.speed = +e.target.value; S.speed = G.speed; saveSettings(); }
    else if (a === 'siem-range') { siem.range = e.target.value; render(); }
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.draft && selAlert) { drafts[selAlert] = drafts[selAlert] || {}; drafts[selAlert][t.dataset.draft] = t.value; }
    if (t.dataset.bind === 'siem.q') siem.q = t.value; if (t.dataset.bind === 'intel.q') intel.q = t.value;
  });
  document.addEventListener('keydown', e => {
    const t = e.target;
    if (e.key === 'Enter' && t.dataset && t.dataset.enter) { e.preventDefault(); const f = ACT[t.dataset.enter]; f && f(t); }
  });

  /* smoke-test hooks (used by `electron . --smoke`) */
  window.__smokeInfo = () => ({ view, alerts: G ? G.visibleAlerts().length : 0, now: G ? hms(G.now) : null, scenarios: SOC_SCENARIOS.map(s => s.id) });
  window.__smoke = mode => {
    if (mode === 'tut') return [
      { name: 't01-picker', js: `document.querySelector('[data-act=tut-pick]').click()`, wait: 900 },
      { name: 't02-welcome', js: `window.SOCTut.start('basic')`, wait: 1200 },
      { name: 't03-clock', js: `window.SOCTut.autoplay('basic', 1, true)`, wait: 1200 },
      { name: 't04-readalert', js: `window.SOCTut.autoplay('basic', 10, true)`, wait: 1500 },
      { name: 't05-siem', js: `window.SOCTut.autoplay('basic', 15, true)`, wait: 1500 },
      { name: 't06-basic-done', js: `window.SOCTut.autoplay('basic', 1e9, true)`, wait: 1500 },
      { name: 't07-adv-start', js: `window.SOCTut.start('adv')`, wait: 1200 },
      { name: 't08-adv-mid', js: `window.SOCTut.autoplay('adv', 8, true)`, wait: 1500 },
      { name: 't09-adv-done', js: `window.SOCTut.autoplay('adv', 1e9, true)`, wait: 1500 }
    ];
    const J = s => s, steps = [];
    steps.push({ name: '02-dashboard', js: `document.querySelector('[data-id=s1-monday]').click(); document.querySelector('[data-act=start]').click(); SOCDBG.adv(1500)`, wait: 900 });
    steps.push({ name: '03-queue', js: `SOCDBG.adv(2*3600+1800); document.querySelector('[data-act=nav][data-v=queue]').click(); SOCDBG.sel('A-1007')`, wait: 900 });
    steps.push({ name: '04-siem', js: `SOCDBG.siemIds('A-1007')`, wait: 900 });
    steps.push({ name: '05-edr', js: `SOCDBG.edr('h-fin-031')`, wait: 900 });
    steps.push({ name: '06-intel', js: `SOCDBG.intel('msupdate-cdn-check.example')`, wait: 900 });
    steps.push({ name: '07-team', js: `document.querySelector('[data-act=nav][data-v=team]').click()`, wait: 900 });
    steps.push({ name: '08-warning', js: `SOCDBG.closeWrong('A-1007')`, wait: 900 });
    steps.push({ name: '09-report', js: `document.querySelector('[data-act=warn-ack]').click(); SOCDBG.end()`, wait: 900 });
    return steps;
  };
  window.SOCDBG = {
    adv: s => { G.advance(s); },
    sel: id => { selectAlert(id); },
    siemIds: id => { ACT['siem-ids']({ dataset: { id } }); },
    edr: h => { ACT['open-edr']({ dataset: { h } }); },
    intel: v => { ACT.intel({ dataset: { v } }); },
    closeWrong: id => { setView('queue'); selectAlert(id); G.close(id, 'fp', 'looks like a normal update, closing'); },
    end: () => { ACT['end-yes'](); },
    game: () => G
  };

  window.SOCUI = {
    get G() { return G; }, get view() { return view; }, get selAlert() { return selAlert; }, siem, edr, intel, team, ACT, S, esc,
    beginGame, setView, selectAlert, openModal, closeModal, renderMenu, lsGet, lsSet, tone, ding,
    stopGame() { clearInterval(timer); G = null; }
  };
  renderMenu();
})();
