// Validates every scenario in js/scenarios against SCHEMA.md. Usage: node test/invariants.js [scenario-file-substring]
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');

function load(filter) {
  const ctx = { console, btoa: globalThis.btoa }; ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'js/team.js'), 'utf8'), ctx, { filename: 'js/team.js' });
  const dir = path.join(root, 'js', 'scenarios');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.js') && (!filter || f.includes(filter))).sort() : [];
  const loaded = [];
  for (const f of files) {
    const before = ctx.SOC_SCENARIOS.length;
    try { vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f }); }
    catch (e) { loaded.push({ file: f, error: 'LOAD ERROR: ' + e.message }); continue; }
    loaded.push({ file: f, scenario: ctx.SOC_SCENARIOS[before] });
  }
  return { ctx, loaded };
}

const T_RE = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;
function sec(s) { const m = T_RE.exec(s || ''); return m ? (+m[1]) * 3600 + (+m[2]) * 60 + (+(m[3] || 0)) : NaN; }
const SEV = ['low', 'medium', 'high', 'critical'];
const CRIT = ['low', 'medium', 'high', 'crown'];
const VERD = ['malicious', 'suspicious', 'benign', 'unknown'];
const HTYPE = ['workstation', 'laptop', 'server', 'dc', 'network'];

function validate(s, teamIds) {
  const errs = [], warns = [];
  const E = m => errs.push(m), W = m => warns.push(m);
  const need = (o, k, where) => { if (o == null || o[k] == null || o[k] === '') { E(`${where}: missing "${k}"`); return false; } return true; };
  for (const k of ['id', 'title', 'tagline', 'difficulty', 'date', 'handover']) need(s, k, 'scenario');
  if (!s.shift || isNaN(sec(s.shift.start)) || isNaN(sec(s.shift.end))) E('scenario.shift start/end invalid');
  if (!s.company || !s.company.name || !s.company.domain) E('scenario.company needs name+domain');
  const S0 = sec(s.shift && s.shift.start), S1 = sec(s.shift && s.shift.end);

  const uniq = (arr, what, key = 'id') => { const seen = new Set(); for (const x of arr || []) { if (seen.has(x[key])) E(`${what}: duplicate ${key} ${x[key]}`); seen.add(x[key]); } return seen; };
  const userIds = uniq(s.users, 'users'); const hostIds = uniq(s.hosts, 'hosts');
  if (!(s.users || []).length || !(s.hosts || []).length) E('need users and hosts');
  for (const u of s.users || []) for (const k of ['name', 'username', 'email', 'dept', 'title']) need(u, k, 'user ' + u.id);
  for (const h of s.hosts || []) {
    for (const k of ['hostname', 'ip', 'os', 'type', 'criticality']) need(h, k, 'host ' + h.id);
    if (h.type && !HTYPE.includes(h.type)) E(`host ${h.id}: bad type ${h.type}`);
    if (h.criticality && !CRIT.includes(h.criticality)) E(`host ${h.id}: bad criticality`);
    if (h.userId && !userIds.has(h.userId)) E(`host ${h.id}: unknown userId ${h.userId}`);
  }
  if ((s.hosts || []).length < 10 && !s.tutorial) W('fewer than 10 hosts - feels empty');

  const evIds = uniq(s.events, 'events'); const evById = {};
  for (const e of s.events || []) {
    evById[e.id] = e;
    if (isNaN(sec(e.t))) E(`event ${e.id}: bad time ${e.t}`);
    if (!e.source || !e.event || !e.msg) E(`event ${e.id}: needs source, event, msg`);
    if (e.hostId && !hostIds.has(e.hostId)) E(`event ${e.id}: unknown hostId ${e.hostId}`);
    if (e.fields && typeof e.fields !== 'object') E(`event ${e.id}: fields must be object`);
  }
  if ((s.events || []).length < 60 && !s.tutorial) E(`only ${(s.events || []).length} hand-written events (need >= 60)`);

  uniq(s.alerts, 'alerts');
  const alerts = s.alerts || [];
  if ((alerts.length < 14 || alerts.length > 24) && !s.tutorial) E(`alert count ${alerts.length} not in 14-24`);
  const tp = alerts.filter(a => a.truth === 'TP'), fp = alerts.filter(a => a.truth === 'FP');
  if (tp.length < 1 || tp.length > 3) E(`TP alert count ${tp.length} must be 1-3`);
  if (new Set(tp.map(a => a.incident)).size !== 1 || tp.some(a => !a.incident)) E('all TP alerts must share one incident id');
  if (fp.length < 11 && !s.tutorial) E(`FP count ${fp.length} < 11`);
  if (fp.filter(a => ['high', 'critical'].includes(a.severity)).length < 2 && !s.tutorial) E('need >= 2 FP alerts with high/critical severity');
  for (const a of alerts) {
    const w = 'alert ' + a.id;
    if (!/^A-\d+$/.test(a.id || '')) E(`${w}: bad id`);
    for (const k of ['title', 'summary', 'rule', 'source', 'explain']) need(a, k, w);
    if (!SEV.includes(a.severity)) E(`${w}: bad severity`);
    if (!['TP', 'FP'].includes(a.truth)) E(`${w}: truth must be TP or FP`);
    const t = sec(a.at); if (isNaN(t)) E(`${w}: bad at`); else if (t < S0 || t > S1) E(`${w}: at ${a.at} outside shift`);
    if (a.hostId && !hostIds.has(a.hostId)) E(`${w}: unknown hostId`);
    if (a.userId && !userIds.has(a.userId)) E(`${w}: unknown userId`);
    if (!a.hostId && !a.userId) W(`${w}: no host or user`);
    if (!a.details || !Object.keys(a.details).length) E(`${w}: details empty`);
    if (!Array.isArray(a.iocs)) E(`${w}: iocs must be array`);
    if (!Array.isArray(a.keywords) || !a.keywords.length) E(`${w}: keywords needed`);
    if (!a.reply || !a.reply[a.truth === 'TP' ? 'tp' : 'fp']) E(`${w}: reply.${a.truth === 'TP' ? 'tp' : 'fp'} missing`);
    if (!Array.isArray(a.eventIds) || a.eventIds.length < (s.tutorial ? 3 : 3)) E(`${w}: needs >= 3 eventIds`);
    else for (const id of a.eventIds) {
      if (!evById[id]) E(`${w}: eventId ${id} not found`);
      else if (sec(evById[id].t) > t + 59) E(`${w}: event ${id} (${evById[id].t}) is after the alert time ${a.at}`);
    }
    if (a.truth === 'FP' && a.incident) E(`${w}: FP must not have incident`);
  }
  // TP placement
  const sorted = alerts.slice().sort((x, y) => sec(x.at) - sec(y.at));
  if (tp.length && !s.tutorial) {
    const firstIdx = Math.min(...tp.map(a => sorted.indexOf(a))) / sorted.length;
    if (firstIdx < 0.25 || firstIdx > 0.85) E(`first TP alert is at ${(firstIdx * 100).toFixed(0)}% of timeline (need 25-85%)`);
  }
  for (const [h, d] of Object.entries(s.edr || {})) {
    if (!hostIds.has(h)) { E(`edr: unknown host ${h}`); continue; }
    const pids = new Set((d.processes || []).map(p => p.pid));
    if (pids.size !== (d.processes || []).length) E(`edr ${h}: duplicate pids`);
    for (const p of d.processes || []) {
      if (!p.name || !p.cmd || isNaN(sec(p.start))) E(`edr ${h} pid ${p.pid}: needs name, cmd, valid start`);
      if (p.ppid && !pids.has(p.ppid)) W(`edr ${h} pid ${p.pid}: ppid ${p.ppid} not listed`);
    }
    for (const c of d.connections || []) if (isNaN(sec(c.t)) || !c.dst) E(`edr ${h}: bad connection`);
    for (const f of d.files || []) if (isNaN(sec(f.t)) || !f.path) E(`edr ${h}: bad file event`);
  }
  for (const a of tp) if (a.hostId && !(s.edr || {})[a.hostId]) E(`TP host ${a.hostId} needs edr data`);
  for (const [k, v] of Object.entries(s.intel || {})) {
    if (k !== k.toLowerCase()) E(`intel key ${k} must be lowercase`);
    if (!VERD.includes(v.verdict) || !v.summary) E(`intel ${k}: bad verdict/summary`);
  }
  for (const a of tp) for (const i of a.iocs || []) if (['ip', 'domain', 'hash', 'url'].includes(i.type) && !(s.intel || {})[String(i.value).toLowerCase()]) W(`TP ioc ${i.value} has no intel entry`);
  for (const c of s.chat || []) { if (isNaN(sec(c.at)) || !teamIds.has(c.from) || !c.text) E(`chat entry invalid: ${JSON.stringify(c).slice(0, 80)}`); }
  for (const c of s.changes || []) if (isNaN(sec(c.at)) || !c.system || !c.desc) E('change entry invalid');
  return { errs, warns };
}

module.exports = { load, validate, sec };

if (require.main === module) {
  const { ctx, loaded } = load(process.argv[2]);
  const teamIds = new Set(ctx.SOC_TEAM.map(t => t.id));
  let bad = 0;
  if (!loaded.length) console.log('no scenarios found');
  for (const l of loaded) {
    if (l.error) { console.log(`✗ ${l.file}: ${l.error}`); bad++; continue; }
    if (!l.scenario) { console.log(`✗ ${l.file}: pushed no scenario`); bad++; continue; }
    const { errs, warns } = validate(l.scenario, teamIds);
    console.log(`${errs.length ? '✗' : '✓'} ${l.file} (${l.scenario.id}) alerts=${l.scenario.alerts.length} events=${l.scenario.events.length} hosts=${l.scenario.hosts.length}`);
    errs.forEach(e => console.log('   ERROR ' + e)); warns.forEach(w => console.log('   warn  ' + w));
    if (errs.length) bad++;
  }
  process.exit(bad ? 1 : 0);
}
