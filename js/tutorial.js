// Guided tutorials: spotlight overlay + instruction card + self-ticking task checklist.
// Each step: { t: checklist label (tasks only), title, text, view: tab it lives in, target: () => element,
//              done: () => bool (task), info: true (shows a Next button), auto: () => performs the action (used by tests only) }
(function () {
  'use strict';
  const U = window.SOCUI, ACT = U.ACT;
  const $ = (s, r = document) => r.querySelector(s);
  const G = () => U.G;
  const esc = U.esc;
  const VIEW_NAME = { dashboard: 'Overview', queue: 'Queue', siem: 'SIEM', edr: 'EDR', intel: 'Intel', team: 'Team' };
  const clk = sel => { const e = $(sel); if (e) e.click(); return !!e; };
  const setVal = (sel, v) => { const e = $(sel); if (!e) return; e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
  const nav = v => () => clk('#nav-' + v);
  const tk = id => G().ticket(id);
  const st = id => G().status(id);
  const closePanel = () => { const e = $('#cl-note'); return e && e.closest('.panel'); };
  const escPanel = () => { const e = $('#esc-desc'); return e && e.closest('.panel'); };
  const row = id => () => $('.qrow[data-id="' + id + '"]');
  const openRow = id => ({ t: 'Open ticket ' + id, view: 'queue', title: 'Open ticket ' + id, target: row(id), done: () => U.selAlert === id, auto: () => clk('.qrow[data-id="' + id + '"]') });
  const closeStep = (id, note) => ({
    t: 'Close ' + id + ' with a reason and note', view: 'queue', title: 'Close ' + id, target: closePanel,
    text: 'Pick a <b>reason</b>, write a <b>closing note</b> explaining your evidence, then press <b>Close ticket</b>. A good note lets the next analyst trust your call.',
    done: () => st(id) === 'closed', auto: () => { setVal('#cl-note', note); clk('[data-act=close]'); }
  });

  /* ---------- BASIC (~5 min) ---------- */
  const basic = [
    { info: true, title: 'Welcome to SOC Desk', text: 'This is a <b>safe training shift</b>. Nothing here is real and you can’t fail.<br><br>Do what each card says. The area to use is <b>highlighted</b>, and tasks in the checklist (bottom left) <b>tick off by themselves</b>. Stuck? Use <i>Skip step</i>.' },
    { t: 'Pause the clock', title: 'The shift clock', target: () => $('#playbtn'), text: 'A shift runs on a simulated clock, so alerts arrive through the day. Click <b>Pause</b> to freeze time whenever you need to think.', done: () => G().paused, auto: () => clk('#playbtn') },
    { t: 'Resume the clock', title: 'Resume', target: () => $('#playbtn'), text: 'Click <b>Resume</b> to let time flow again. (The speed dropdown next to it makes the day faster or slower.)', done: () => !G().paused, auto: () => clk('#playbtn') },
    { t: 'Open the Overview tab', title: 'The side menu', target: () => $('#nav-dashboard'), text: 'The left menu is your toolbox: Overview, Queue, SIEM, EDR, Intel and Team. Open <b>Overview</b>.', done: () => U.view === 'dashboard', auto: nav('dashboard') },
    { info: true, view: 'dashboard', title: 'Handover notes', target: () => { const e = $('.handover'); return e && e.closest('.panel'); }, text: 'Every shift starts with the <b>previous analyst’s handover</b>. It lists known maintenance and noisy rules, which is exactly what stops you wasting time on false positives. The tiles above show your queue health.' },
    { t: 'Skip ahead 15 minutes', title: 'Skip time', target: () => $('[data-act=skip]'), text: 'Click <b>+15m</b> to jump forward. A new, higher-severity alert will land in your queue.', done: () => G().visibleAlerts().length >= 3, auto: () => clk('[data-act=skip]') },
    { t: 'Open the Queue tab', title: 'The alert queue', target: () => $('#nav-queue'), text: 'New alerts appear here. The red badge counts alerts nobody has touched yet.', done: () => U.view === 'queue', auto: nav('queue') },
    { info: true, view: 'queue', title: 'Reading the queue', target: () => $('#qlist'), text: 'Each row shows <b>severity</b>, title, source, host, user, status and an <b>SLA timer</b> (how long before it counts as late). Severity is only a hint: scary alerts are often harmless and quiet ones can be real.' },
    { t: 'Open ticket A-0001', view: 'queue', title: 'Open an alert', target: row('A-0001'), text: 'Click <b>A-0001</b>, “Multiple failed logons”. Opening it creates your ticket and stops its SLA clock.', done: () => U.selAlert === 'A-0001', auto: () => clk('.qrow[data-id="A-0001"]') },
    { info: true, view: 'queue', title: 'Read the alert first', target: () => $('#qdetail .ticket > .panel'), text: 'Start with <b>what fired</b>: the rule, the summary and the detail table. Ask: <i>who, which host, what happened, when?</i> Below you will find the host and user cards, indicators and the related log events.' },
    { t: 'Ask the service desk about the user', view: 'queue', title: 'Verify with a human', target: () => $('[data-act=contact][data-who=desk]'), text: 'Real analysts ask people. Click <b>Ask service desk</b> to check whether the IT team knows why this user had trouble.', done: () => (tk('A-0001') || { contacts: [] }).contacts.includes('desk:A-0001'), auto: () => clk('[data-act=contact][data-who=desk]') },
    { t: 'Read the reply in the Team tab', title: 'Team chat', target: () => $('#nav-team'), text: 'Colleagues answer in <b>Team</b>. (In training they reply in seconds, in a real shift it takes minutes.) Open Team and read Sam’s answer.', done: () => U.view === 'team' && G().messages.some(m => tk('A-0001') && m.ticketId === tk('A-0001').id), auto: nav('team') },
    { t: 'Open the user’s logs in the SIEM', view: 'queue', title: 'Pivot into the SIEM', target: () => $('[data-act=pivot][data-q^="user:"]'), text: 'Go back to the ticket and click <b>User logs</b>. This searches the SIEM for everything this user did.', done: () => U.view === 'siem' && /bortiz/i.test(U.siem.q), auto: () => clk('[data-act=pivot][data-q^="user:"]') },
    { info: true, view: 'siem', title: 'Reading logs', target: () => { const e = $('#main table'); return e && e.closest('.panel'); }, text: 'Newest events are on top. Look at the 07:50–08:00 window: <b>3 failed logons (4625)</b>, then a <b>password reset (4724)</b> by IT, then a <b>successful logon</b>. That tells the story. You can also search with <code>host:</code> <code>user:</code> <code>src:</code> <code>dst:</code> <code>source:</code> and quoted text.' },
    { t: 'Expand a log row', view: 'siem', title: 'Log details', target: () => $('tr.ev'), text: 'Click any row to see its fields. Every value is a link: click one to <b>pivot</b> to all events with that value.', done: () => Array.from(U.siem.open).some(x => /^[eg]-/.test(x)), auto: () => clk('tr.ev') },
    { t: 'Open the EDR tab', title: 'EDR: endpoint view', target: () => $('#nav-edr'), text: 'EDR shows what happened <b>on a computer</b>. Open it.', done: () => U.view === 'edr', auto: nav('edr') },
    { info: true, view: 'edr', title: 'Process tree', target: () => $('#main .edr > .panel:nth-child(2)'), text: 'Pick a host on the left to see its <b>process tree</b>, network connections and files. Suspicious processes are flagged. The <b>Isolate host</b> button cuts a computer off the network, but only use it with evidence (isolating a healthy PC gets you a question from the SOC manager).' },
    { t: 'Open the Intel tab', title: 'Threat intel', target: () => $('#nav-intel'), text: 'Intel tells you if an IP, domain or hash is known to be bad. Open it.', done: () => U.view === 'intel', auto: nav('intel') },
    { t: 'Look up the scanner IP 10.10.9.15', view: 'intel', title: 'IOC lookup', target: () => $('#intel-q'), text: 'Type <code>10.10.9.15</code> and press <b>Enter</b>. This is the source of alert A-0002 in the queue.', done: () => U.intel.res && U.intel.res.value === '10.10.9.15', auto: () => ACT.intel({ dataset: { v: '10.10.9.15' } }) },
    { t: 'Open the Change calendar tab', view: 'intel', title: 'Change calendar', target: () => $('[data-act=intel-tab][data-v=changes]'), text: 'Planned work explains a lot of alerts. Open <b>Change calendar</b> and spot the 08:00 vulnerability scan (CHG-100).', done: () => U.view === 'intel' && U.intel.tab === 'changes', auto: () => clk('[data-act=intel-tab][data-v=changes]') },
    { t: 'Go back to ticket A-0001', view: 'queue', title: 'Back to the ticket', target: row('A-0001'), text: 'Return to the Queue and open <b>A-0001</b> again. You have the evidence: the failures are explained by a password reset.', done: () => U.view === 'queue' && U.selAlert === 'A-0001', auto: () => clk('.qrow[data-id="A-0001"]') },
    closeStep('A-0001', 'Forgot password: 3x 4625 then 4724 reset by IT (INC-5001) then normal logon from own workstation. Benign.'),
    { t: 'Open ticket A-0002', view: 'queue', title: 'Next alert', target: row('A-0002'), text: 'Now open <b>A-0002</b>, “Internal network scan detected”. Imagine you are not sure about it. That is what escalation is for.', done: () => U.selAlert === 'A-0002', auto: () => clk('.qrow[data-id="A-0002"]') },
    { t: 'Escalate A-0002 to Bob Harlan (T2)', view: 'queue', title: 'Escalate to Tier 2', target: escPanel, text: 'Choose <b>Bob Harlan (T2)</b>, describe <i>what fired, which host, what you checked and why you’re unsure</i>, then press <b>Escalate</b>.<br><br><span class="faint">e.g. “Scan from SCAN01 hitting 90 hosts on 445/3389. Looks like our scanner but I want a second pair of eyes.”</span>', done: () => ['escalated', 'returned_fp', 'confirmed_tp'].includes(st('A-0002')), auto: () => { setVal('#esc-to', 'bob'); setVal('#esc-desc', 'Scan from SCAN01 hitting 90 hosts on 445 and 3389. Looks like our vulnerability scanner but I want a second opinion.'); clk('[data-act=escalate]'); } },
    { t: 'Wait for Bob’s answer', title: 'Waiting on T2', target: () => $('#nav-team'), text: 'Bob is looking. A reply will pop up (and sit in <b>Team</b>). If it is a false positive he will tell you why. If it is real he takes over.', done: () => st('A-0002') === 'returned_fp' },
    { t: 'Close A-0002 as Bob advised', view: 'queue', title: 'Close it out', target: closePanel, text: 'Bob confirmed it is a false positive. Close the ticket with a note that cites his reasoning and the change ticket.', done: () => st('A-0002') === 'closed', auto: () => { setVal('#cl-note', 'Confirmed FP by Bob: scheduled weekly vulnerability scan CHG-100 from SCAN01.'); clk('[data-act=close]'); } }
  ];

  /* ---------- ADVANCED (~8 min): investigate A-0003 ---------- */
  const adv = [
    { info: true, title: 'Advanced: investigate a real alert', text: 'A <b>high-severity alert (A-0003)</b> just landed. You will work it like a real Tier 1: <b>triage → scope → verify → decide → hand off</b>.<br><br>Use every tool. Only you can decide whether it is real.' },
    openRow('A-0003'),
    { info: true, view: 'queue', title: 'Step 1: Triage', target: () => $('#qdetail .ticket > .panel'), text: 'Read what fired: <b>“Office application spawned hidden PowerShell”</b>. Look at the <b>Parent chain</b> and flags: <code>-w hidden</code> and <code>-enc</code> (an encoded command). Ask yourself: <i>why would Word ever launch PowerShell?</i>' },
    { t: 'Open all related events in the SIEM', view: 'queue', title: 'Step 2: Gather evidence', target: () => $('[data-act=siem-ids]'), text: 'Click <b>Open all in SIEM</b> to see the exact log lines attached to this alert.', done: () => U.view === 'siem' && !!U.siem.ids, auto: () => clk('[data-act=siem-ids]') },
    { t: 'Expand the PowerShell event', view: 'siem', title: 'Find the smoking gun', target: () => Array.from(document.querySelectorAll('tr.ev')).find(r => /ProcessCreate/.test(r.textContent) && /powershell/i.test(r.textContent)), text: 'Click the <b>ProcessCreate</b> row that runs <code>powershell.exe</code>. See the long Base64 string after <code>-enc</code>? Attackers encode commands to hide them. Notice the email event too: <b>SPF and DMARC failed</b>.', done: () => U.siem.open.has('e-t204'), auto: () => { const r = Array.from(document.querySelectorAll('tr.ev')).find(x => /powershell/i.test(x.textContent) && /ProcessCreate/.test(x.textContent)); r && r.click(); } },
    { t: 'Search the SIEM for host HR-LT-05', view: 'siem', title: 'Step 3: Scope the host', target: () => $('#siem-q'), text: 'What else did this laptop do? Type <code>host:HR-LT-05</code> and press <b>Enter</b>.', done: () => U.view === 'siem' && /hr-lt-05/i.test(U.siem.q) && !U.siem.ids, auto: () => { setVal('#siem-q', 'host:HR-LT-05'); clk('[data-act=siem-run]'); } },
    { t: 'Open HR-LT-05 in EDR', title: 'Step 4: Look at the endpoint', target: () => U.view !== 'edr' ? $('#nav-edr') : $('.hrow[data-h="h-hr-05"]'), text: 'Open the <b>EDR</b> tab and select <b>HR-LT-05</b> (Carla Dunn’s laptop).', done: () => U.view === 'edr' && U.edr.host === 'h-hr-05', auto: () => ACT['open-edr']({ dataset: { h: 'h-hr-05' } }) },
    { t: 'Click powershell.exe in the process tree', view: 'edr', title: 'Read the process tree', target: () => $('.pnode[data-pid="3388"]'), text: 'Find <b>OUTLOOK.EXE → WINWORD.EXE → powershell.exe → rundll32.exe</b>. Click <b>powershell.exe</b> to read the full command line and EDR notes.', done: () => U.edr.pid === 3388, auto: () => clk('.pnode[data-pid="3388"]') },
    { info: true, view: 'edr', title: 'What the tree tells you', target: () => $('.ptree'), text: 'An email attachment opened in Word, which started a <b>hidden encoded PowerShell</b>, which started <b>rundll32 with no arguments</b> and made network connections. That is a classic malware chain (flagged yellow/red). Check the <b>Network</b> tab for the outbound destination.' },
    { t: 'Look up careers-docs-portal.example in Intel', title: 'Step 5: Check reputation', target: () => U.view !== 'intel' ? $('#nav-intel') : $('#intel-q'), text: 'Open <b>Intel</b> and look up the domain the PowerShell downloaded from: <code>careers-docs-portal.example</code>.', done: () => U.view === 'intel' && U.intel.res && /careers-docs-portal/.test(U.intel.res.value), auto: () => ACT.intel({ dataset: { v: 'careers-docs-portal.example' } }) },
    { info: true, view: 'intel', title: 'Verdict: malicious', target: () => $('#main .panel'), text: 'A domain registered <b>yesterday</b>, flagged by multiple vendors, serving PowerShell payloads. Combined with the failed SPF/DMARC email, that is strong evidence. Always check <b>how many events in your own telemetry</b> touched it as well.' },
    { t: 'Check the Change calendar', view: 'intel', title: 'Step 6: Rule out planned work', target: () => $('[data-act=intel-tab][data-v=changes]'), text: 'Could this be authorized? Open the <b>Change calendar</b>: only a vulnerability scan and file-server patching are planned. Nothing explains Word spawning PowerShell.', done: () => U.view === 'intel' && U.intel.tab === 'changes', auto: () => clk('[data-act=intel-tab][data-v=changes]') },
    { t: 'Contact the user, Carla Dunn', view: 'queue', title: 'Step 7: Ask the user', target: () => $('[data-act=contact][data-who=user]'), text: 'Go back to the ticket and click <b>Contact user</b>. The human side of the story often settles it.', done: () => (tk('A-0003') || { contacts: [] }).contacts.includes('user:A-0003'), auto: () => clk('[data-act=contact][data-who=user]') },
    { t: 'Read Carla’s reply in Team', title: 'What did she do?', target: () => $('#nav-team'), text: 'Open <b>Team</b> and read her answer.', done: () => U.view === 'team' && G().messages.some(m => tk('A-0003') && m.ticketId === tk('A-0003').id && String(m.from).startsWith('user:')), auto: nav('team') },
    { info: true, view: 'queue', title: 'Step 8: Decide', target: () => $('#qdetail .ticket > .panel'), text: 'Your evidence:<br>• Word → hidden encoded PowerShell (never normal)<br>• Fake job-application email, SPF/DMARC fail<br>• Payload from a 1-day-old malicious domain<br>• Beacon-like rundll32 with network<br>• Nothing on the change calendar<br>• The user enabled macros<br><br><b>Verdict: true positive.</b> Never close this as a false positive. If you did, the app would flash a big red warning at you.' },
    { t: 'Add an investigation note', view: 'queue', title: 'Document as you go', target: () => $('#note-in'), text: 'Write a short note on the ticket, e.g. <i>“Macro doc from spoofed sender, hidden encoded PowerShell, payload from malicious new domain.”</i> Press <b>Add note</b>.', done: () => (tk('A-0003') || { notes: [] }).notes.length > 0, auto: () => { setVal('#note-in', 'Macro doc from spoofed sender, Word spawned hidden encoded PowerShell, payload from a malicious new domain.'); clk('[data-act=addnote]'); } },
    { t: 'Escalate to Incident Response or T2', view: 'queue', title: 'Step 9: Hand off', target: escPanel, text: 'Confirmed compromise goes to <b>IR (Marcus Webb or Imani Brooks)</b>, or T2 if you want a second opinion first. A good handoff says <b>who, what host, what you saw, the evidence and why</b>.<br><br><span class="faint">e.g. “HR-LT-05 / Carla Dunn: Word spawned hidden encoded PowerShell after a fake resume email (SPF/DMARC fail). Payload fetched from careers-docs-portal.example (malicious, 1 day old). Rundll32 child beaconing. Please contain.”</span>', done: () => ['escalated', 'confirmed_tp'].includes(st('A-0003')), auto: () => { setVal('#esc-to', 'marcus'); setVal('#esc-desc', 'HR-LT-05 Carla Dunn: Word spawned hidden encoded PowerShell after a fake resume email (SPF and DMARC fail). Payload downloaded from careers-docs-portal.example, malicious and one day old. Rundll32 child with outbound connections. Please contain the host.'); clk('[data-act=escalate]'); } },
    { t: 'Wait for IR to confirm', title: 'Waiting on IR', target: () => $('#nav-team'), text: 'They are reviewing your handoff. A confirmation will arrive in a few seconds.', done: () => st('A-0003') === 'confirmed_tp' },
    { info: true, title: 'Incident confirmed', text: 'IR confirmed the <b>true positive</b> and will take it from here. They also contain the host a bit later (watch Team). Nice work: you triaged, scoped, verified, and handed off with evidence.' }
  ];

  const TUTS = { basic: { name: 'Basics', steps: basic, advanceTo: '08:04' }, adv: { name: 'Advanced', steps: adv, advanceTo: '08:20' } };

  /* ---------- runtime ---------- */
  let T = null, timer = null, log = [];

  function build() {
    ['tut-spot', 'tut-card', 'tut-list'].forEach(id => { const e = document.getElementById(id); if (e) e.remove(); });
    const mk = (id, cls) => { const e = document.createElement('div'); e.id = id; e.className = cls; document.body.appendChild(e); return e; };
    mk('tut-spot', 'tut-spot'); mk('tut-card', 'tut-card'); mk('tut-list', 'tut-list');
  }
  function start(kind) {
    stop(); log = []; U.closeModal();
    const sc = SOC_SCENARIOS.find(s => s.id === 's0-training'), def = TUTS[kind];
    U.beginGame(sc, { view: 'queue', advanceTo: def.advanceTo, salt: 'tut' });
    T = { k: kind, def, steps: def.steps, i: 0, ok: new Set(), skipped: new Set(), flash: 0, key: '', collapsed: false, scrolled: -1 };
    build(); timer = setInterval(tick, 200); tick();
  }
  function stop() {
    clearInterval(timer); timer = null; T = null;
    ['tut-spot', 'tut-card', 'tut-list'].forEach(id => { const e = document.getElementById(id); if (e) e.remove(); });
  }
  function step(d) {
    if (!T) return;
    log.push((T.steps[T.i].t || T.steps[T.i].title) + (T.ok.has(T.i) ? ' ✓' : ' (skipped/info)'));
    T.i += d; T.key = '';
    if (T.i >= T.steps.length) finish();
  }
  function finish() {
    const k = T.k, name = T.def.name, tasks = T.steps.filter(s => s.done).length, done = T.steps.filter((s, i) => s.done && T.ok.has(i)).length;
    const all = U.lsGet('socdesk.tutDone', {}); all[k] = true; U.lsSet('socdesk.tutDone', all);
    stop(); U.ding();
    U.openModal(`<div class="modal"><h2>🎓 ${esc(name)} tutorial complete</h2><p class="muted">You finished ${done} of ${tasks} tasks.</p>
      <p>${k === 'basic' ? 'Next, try the <b>Advanced tutorial</b>: a full walkthrough of investigating a real attack from first alert to escalation.' : 'You are ready for a real shift. Remember: one real incident hides in every queue. Never close a true positive as a false positive.'}</p>
      <div class="actions" style="justify-content:flex-end">${k === 'basic' ? '<button class="btn primary" data-act="tut-start" data-k="adv">Start Advanced tutorial</button>' : ''}<button class="btn ${k === 'basic' ? '' : 'primary'}" data-act="tut-exit">Back to menu</button></div></div>`);
  }
  ACT['tut-next'] = () => { if (T) { T.ok.add(T.i); step(1); } };
  ACT['tut-skip'] = () => { if (T) { T.skipped.add(T.i); T.flash = 0; step(1); } };
  ACT['tut-toggle'] = () => { if (T) { T.collapsed = !T.collapsed; T.key = ''; sync(); } };

  function resolve(s) {
    if (s.view && U.view !== s.view) { T.detour = s.view; return document.getElementById('nav-' + s.view); }
    T.detour = null;
    try { return s.target ? s.target() : null; } catch (e) { return null; }
  }
  function tick() {
    if (!T || !U.G) return;
    const s = T.steps[T.i]; if (!s) return;
    const now = Date.now();
    if (T.flash && now >= T.flash) { T.flash = 0; step(1); if (!T) return; }
    else if (!T.flash && s.done) { let ok = false; try { ok = s.done(); } catch (e) { ok = false; } if (ok) { T.ok.add(T.i); T.flash = now + 900; U.ding(); T.key = ''; } }
    sync();
  }
  function sync() {
    if (!T) return;
    const s = T.steps[T.i]; if (!s) return;
    const spot = $('#tut-spot'), card = $('#tut-card'), el = resolve(s);
    const key = [T.i, T.flash ? 1 : 0, T.detour || '', T.collapsed ? 1 : 0].join('|');
    if (key !== T.key) { T.key = key; card.innerHTML = cardHtml(s); renderList(); }
    const r = el && el.getBoundingClientRect(), vis = r && r.width > 0 && r.height > 0;
    if (vis && T.scrolled !== T.i && (r.top < 50 || r.bottom > innerHeight - 10)) { el.scrollIntoView({ block: 'center' }); T.scrolled = T.i; }
    else if (vis) T.scrolled = T.i;
    if (vis && !T.flash) {
      spot.style.display = 'block'; spot.style.left = (r.left - 6) + 'px'; spot.style.top = (r.top - 6) + 'px'; spot.style.width = (r.width + 12) + 'px'; spot.style.height = (r.height + 12) + 'px';
    } else spot.style.display = 'none';
    placeCard(card, vis && !T.flash ? r : null);
  }
  function placeCard(card, r) {
    const cw = card.offsetWidth, ch = card.offsetHeight, vw = innerWidth, vh = innerHeight, gap = 18;
    let x, y;
    if (!r) { x = (vw - cw) / 2; y = Math.max(70, vh * 0.2); }
    else {
      const lb = document.getElementById('tut-list'), lr = lb ? lb.getBoundingClientRect() : null;
      const hitsList = (px, py) => lr && px < lr.right + 8 && px + cw > lr.left - 8 && py < lr.bottom + 8 && py + ch > lr.top - 8;
      const fit = (px, py) => px >= 8 && py >= 56 && px + cw <= vw - 8 && py + ch <= vh - 8 && !hitsList(px, py);
      const cands = [[r.right + gap, r.top], [r.left - cw - gap, r.top], [r.left, r.bottom + gap], [r.left, r.top - ch - gap], [r.right + gap, r.bottom - ch], [r.left - cw - gap, r.bottom - ch]];
      const c = cands.find(p => fit(p[0], p[1]));
      if (c) { x = c[0]; y = c[1]; } else { x = vw - cw - 20; y = 70; }
    }
    card.style.left = Math.max(8, Math.min(x, vw - cw - 8)) + 'px'; card.style.top = Math.max(56, Math.min(y, vh - ch - 8)) + 'px';
  }
  function cardHtml(s) {
    const tasks = T.steps.filter(x => x.done), idx = s.done ? tasks.indexOf(s) + 1 : 0;
    const label = s.done ? `Task ${idx} of ${tasks.length}` : (T.i === 0 ? 'Welcome' : T.i === T.steps.length - 1 ? 'Wrap up' : 'Tip');
    if (T.flash) return `<div class="tut-lab">${label}</div><div class="tut-done">✓ Done!</div><div class="muted">${esc(s.t || s.title)}</div>`;
    return `<div class="tut-lab">${label}</div><div class="tut-ttl">${esc(s.title || s.t)}</div><div class="tut-txt">${s.text || ''}</div>
      ${T.detour ? `<div class="tut-detour">↳ First open the <b>${VIEW_NAME[T.detour]}</b> tab (highlighted).</div>` : ''}
      <div class="tut-btns">${s.done ? '' : '<button class="btn primary" data-act="tut-next">' + (T.i >= T.steps.length - 1 ? 'Finish' : 'Next') + '</button>'}<span style="flex:1"></span>${s.done ? '<a class="faint" data-act="tut-skip">Skip step</a>' : ''}</div>`;
  }
  function renderList() {
    const box = $('#tut-list'); if (!box) return;
    const tasks = T.steps.map((s, i) => ({ s, i })).filter(x => x.s.done), n = tasks.filter(x => T.ok.has(x.i)).length;
    box.innerHTML = `<div class="tut-lh" data-act="tut-toggle"><b>${esc(T.def.name)} tutorial</b><span>${n}/${tasks.length} ${T.collapsed ? '▴' : '▾'}</span></div>
      <div class="tut-prog"><i style="width:${n / tasks.length * 100}%"></i></div>
      ${T.collapsed ? '' : `<div class="tut-items">${tasks.map(x => `<div class="tut-it ${T.ok.has(x.i) ? 'ok' : T.skipped.has(x.i) ? 'sk' : x.i === T.i ? 'cur' : ''}"><span class="bx">${T.ok.has(x.i) ? '✓' : T.skipped.has(x.i) ? '–' : ''}</span>${esc(x.s.t)}</div>`).join('')}</div>`}
      <div class="tut-ft"><a class="faint" data-act="tut-exit">Exit tutorial</a></div>`;
  }

  /* test hook: performs each step's scripted action like a user would */
  async function autoplay(kind, upto = Infinity, resume = false) {
    if (!resume) start(kind); let guard = 0, same = 0, last = -1; const stuck = [];
    while (T && T.i < upto && guard++ < 600) {
      const s = T.steps[T.i];
      if (T.i === last) same++; else { same = 0; last = T.i; }
      if (same > 40) { stuck.push(s.t || s.title); ACT['tut-skip'](); same = 0; continue; }
      if (!T.flash) { if (!s.done) ACT['tut-next'](); else if (s.view && U.view !== s.view) clk('#nav-' + s.view); else if (s.auto) { try { s.auto(); } catch (e) { log.push('auto error: ' + e.message); } } }
      await new Promise(r => setTimeout(r, 300));
    }
    return { finished: !T, at: T && T.i, stuck, log: log.length, done: U.lsGet('socdesk.tutDone', {}) };
  }
  window.SOCTut = { start, stop, autoplay, _state: () => T && { i: T.i, of: T.steps.length, ok: T.ok.size }, TUTS };
})();
