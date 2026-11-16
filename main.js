const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const SMOKE = process.argv.includes('--smoke');
if (SMOKE) app.setPath('userData', path.join(require('os').tmpdir(), 'socdesk-smoke-' + process.pid)); // keep test runs out of the real profile
let win;

function createWindow() {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    width: 1500, height: 940, minWidth: 1180, minHeight: 720,
    backgroundColor: '#111215', title: 'SOC Desk', autoHideMenuBar: true, show: true,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadFile('index.html');
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', e => e.preventDefault());
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
  win.on('focus', () => win.flashFrame(false));
  if (SMOKE) runSmoke();
}

ipcMain.on('flash', () => { if (win && !win.isFocused()) win.flashFrame(true); });

async function runSmoke() {
  const out = process.env.SMOKE_OUT || path.join(__dirname, 'smoke-out');
  fs.mkdirSync(out, { recursive: true });
  const errors = [], trace = [];
  win.webContents.on('console-message', (e, level, msg) => { const lv = e && e.level !== undefined ? e.level : level, m = e && e.message !== undefined ? e.message : msg; if (lv === 'error' || lv === 3 || lv === 2 || lv === 'warning') errors.push('console: ' + m); });
  win.webContents.on('render-process-gone', () => errors.push('renderer gone'));
  await new Promise(r => win.webContents.once('did-finish-load', r));
  const shot = async name => { try { const img = await win.webContents.capturePage(); fs.writeFileSync(path.join(out, name + '.png'), img.toPNG()); } catch (e) { trace.push('screenshot ' + name + ' failed: ' + e.message); } };
  const run = code => win.webContents.executeJavaScript(code);
  try {
    await new Promise(r => setTimeout(r, 400));
    win.setSize(1500, 940); await shot('01-menu');
    const res = await run(`window.__smoke && window.__smoke(${JSON.stringify(process.env.SMOKE_MODE || '')})`);
    for (const step of (res || [])) { try { const o = await run(step.js); if (o && typeof o === 'object') trace.push(step.name + ' result ' + JSON.stringify(o).slice(0, 1800)); } catch (e) { errors.push(step.name + ': ' + e.message); } await new Promise(r => setTimeout(r, step.wait || 150)); try { trace.push(step.name + ' => ' + JSON.stringify(await run('window.__smokeInfo()'))); } catch (e) { trace.push(step.name + ' trace err ' + e.message); } await shot(step.name); }
    const info = await run('window.__smokeInfo ? window.__smokeInfo() : null');
    fs.writeFileSync(path.join(out, 'info.json'), JSON.stringify({ errors, trace, info }, null, 2));
  } catch (e) { errors.push('smoke failure: ' + e.message); fs.writeFileSync(path.join(out, 'info.json'), JSON.stringify({ errors }, null, 2)); }
  app.exit(errors.length ? 2 : 0);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
