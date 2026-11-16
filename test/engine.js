// Engine behaviour tests: plays each scenario through the core flows.
const assert = require('assert');
const { load } = require('./invariants');
const path = require('path'), fs = require('fs'), vm = require('vm');
const { ctx, loaded } = load();
const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'engine.js'), 'utf8');
vm.runInContext(code, ctx);
const { Game, sec } = ctx.SOCEngine;
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };

for (const l of loaded.filter(x => x.scenario && !x.scenario.tutorial)) {
  const sc = l.scenario, tag = sc.id;
  const mk = () => new Game(sc, ctx.SOC_TEAM, { seed: 7 });
  const tpAll = sc.alerts.filter(a => a.truth === 'TP'); const T0 = Math.max(...tpAll.map(a => sec(a.at))) + 60;
  const early = sc.alerts.filter(a => a.truth === 'FP' && sec(a.at) < T0);

  // 1. run full day, noise exists, alerts arrive in order
  let g = mk(); const seen = []; g.on((t, d) => { if (t === 'alert') seen.push(d.def.id); });
  for (let i = 0; i < 2000 && !g.finished; i++) g.advance(30);
  ok(g.finished, tag + ': shift ends'); ok(seen.length === sc.alerts.length, tag + ': all alerts arrive');
  ok(g.events.length > sc.events.length + 200, tag + ': noise generated');
  ok(g.report().rows.length === sc.alerts.length, tag + ': report builds');

  // 2. escalate TP -> confirmed, incident escalated, IR update isolates host, grade good
  g = mk(); g.advance(T0 - g.now);
  const tpA = sc.alerts.filter(a => a.truth === 'TP').sort((a, b) => sec(a.at) - sec(b.at));
  g.open(tpA[0].id);
  ok(g.escalate(tpA[0].id, 'bob', 'x').error, tag + ': short description rejected');
  const r = g.escalate(tpA[0].id, 'bob', 'Suspicious ' + tpA[0].keywords.join(' ') + ' on the host, user clicked a link, looks malicious');
  ok(r.ok, tag + ': escalate ok');
  ok(g.close(tpA[0].id, 'fp', 'trying to close while waiting').error, tag + ': cannot close while waiting');
  g.advance(20 * 60);
  ok(g.ticket(tpA[0].id).status === 'confirmed_tp', tag + ': TP confirmed by T2');
  ok(g.messages.some(m => m.from === 'bob' && /\[T-/.test(m.text)), tag + ': reply message from Bob');
  ok(g.incidentEscalated[tpA[0].incident], tag + ': incident escalated');
  ok(Object.keys(g.isolated).length >= 1, tag + ': IR contained a host');
  const rep = g.report(); ok(rep.incidents[0].escalated && rep.score >= 55, tag + ': good score ' + rep.score);

  // 3. closing TP as FP -> warning; reopen records miss
  g = mk(); g.advance(T0 - g.now); let warned = null; g.on((t, d) => { if (t === 'warning') warned = d; });
  g.open(tpA[0].id); const c = g.close(tpA[0].id, 'fp', 'looks fine, closing it out');
  ok(c.warning && warned && warned.incident === tpA[0].incident, tag + ': warning raised on TP closed as FP');
  g.reopen(tpA[0].id); ok(g.missEvents[0].reopenedAt != null, tag + ': miss recorded + reopened');
  ok(g.report().score <= 55, tag + ': missed TP scores badly (' + g.report().score + ')');

  // 4. FP closes cleanly, no warning; FP escalation returns FP; sibling duplicate ok after escalation
  g = mk(); g.advance(T0 - g.now); warned = null; g.on((t, d) => { if (t === 'warning') warned = d; });
  const fp = early[0]; g.open(fp.id);
  ok(g.close(fp.id, 'fp', 'verified benign activity').ok && !warned, tag + ': FP closes with no warning');
  const fp2 = early[1]; g.open(fp2.id);
  g.escalate(fp2.id, 'priya', 'Please confirm this is benign, I could not verify the process ' + fp2.keywords[0]); g.advance(20 * 60);
  ok(g.ticket(fp2.id).status === 'returned_fp', tag + ': escalated FP returned as FP');
  if (tpA.length > 1) {
    g.open(tpA[0].id); g.escalate(tpA[0].id, 'marcus', 'Confirmed compromise, encoded powershell and beaconing from the host'); g.advance(20 * 60);
    g.open(tpA[1].id); const d = g.close(tpA[1].id, 'duplicate', 'same incident already escalated'); ok(d.ok && !d.warning, tag + ': sibling TP duplicate allowed after escalation');
  }

  // 5. search, edr, intel
  g = mk(); g.advance(T0 - g.now);
  const tpUser = sc.users.find(u => u.id === tpA[0].userId); ok(g.search('user:' + tpUser.username).total > 0, tag + ': field search works for TP user');
  ok(g.search('nonexistent_string_zzz').total === 0, tag + ': empty search');
  ok(g.edr(tpA[0].hostId).processes.length > 5, tag + ': edr processes + baseline');
  ok(g.intel(tpA[0].iocs.find(i => ['domain', 'ip'].includes(i.type)).value).verdict, tag + ': intel verdict');
  ok(g.intel('10.99.99.99').verdict === 'unknown', tag + ': unknown intel');
  // 6. isolate wrong host triggers Dana
  const wrong = sc.hosts.find(h => !tpA.some(a => a.hostId === h.id) && h.type === 'workstation');
  g.isolateHost(wrong.id); g.advance(300); ok(g.messages.some(m => m.from === 'dana' && /isolate/i.test(m.text)), tag + ': Dana questions wrong isolation');
}
// tutorial sim: replies arrive in seconds, and it never nags
{
  const t = loaded.find(x => x.scenario && x.scenario.id === 's0-training').scenario;
  const g = new Game(t, ctx.SOC_TEAM, { seed: 3 }); g.advance(sec('08:20') - g.now);
  ok(g.visibleAlerts().length === 3, 'tutorial: 3 alerts visible');
  g.open('A-0003'); g.escalate('A-0003', 'marcus', 'Word spawned hidden encoded powershell after a fake resume email, please contain the host');
  g.advance(60); ok(g.ticket('A-0003').status === 'confirmed_tp', 'tutorial: IR replies within a minute');
  g.open('A-0001'); g.contact('A-0001', 'desk'); g.advance(30); ok(g.messages.some(m => m.from === 'sam' && m.ticketId), 'tutorial: service desk replies in seconds');
  ok(g.nudges === 0, 'tutorial: no manager nudges');
}
console.log('engine tests passed:', n, 'assertions across', loaded.filter(x => x.scenario && !x.scenario.tutorial).length, 'scenarios');
