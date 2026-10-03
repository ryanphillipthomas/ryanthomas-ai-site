#!/usr/bin/env node
// Drive the site in headless Chrome over CDP and print a JSON verdict.
// Usage: node drive.mjs <url> <evidence-dir> [--expect "text"]... [--absent "text"]...
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, outDir, ...rest] = process.argv.slice(2);
if (!url || !outDir) {
  console.error('usage: drive.mjs <url> <evidence-dir> [--expect text]... [--absent text]...');
  process.exit(2);
}
const expect = [];
const absent = [];
for (let i = 0; i < rest.length; i += 2) {
  if (rest[i] === '--expect') expect.push(rest[i + 1]);
  else if (rest[i] === '--absent') absent.push(rest[i + 1]);
}
mkdirSync(outDir, { recursive: true });

const chromePath = '/opt/google/chrome/chrome';
const profile = mkdtempSync(join(tmpdir(), 'verify-chrome-'));
const chrome = spawn(chromePath, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function cleanup() {
  chrome.kill('SIGKILL');
  await sleep(200);
  rmSync(profile, { recursive: true, force: true });
}

async function connect() {
  const portFile = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100);
  const port = readFileSync(portFile, 'utf8').split('\n')[0];
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
    } else listeners.forEach((l) => l(msg));
  };
  const send = (method, params = {}) => new Promise((res, rej) => {
    pending.set(++id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
  return { send, on: (l) => listeners.push(l), close: () => ws.close() };
}

const pageProbe = `(() => {
  const q = (s) => document.querySelector(s);
  const btn = q('.btn');
  const main = q('main');
  const cs = (el, p) => getComputedStyle(el)[p];
  const r = btn.getBoundingClientRect();
  const mr = main.getBoundingClientRect();
  return {
    innerWidth: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    h1: q('h1').textContent.trim(),
    h1Top: Math.round(q('h1').getBoundingClientRect().top),
    lead: q('.lead').textContent.trim(),
    btnText: btn.textContent.trim(),
    btnHref: btn.getAttribute('href'),
    btnHeight: Math.round(r.height),
    btnWidth: Math.round(r.width),
    mainWidth: Math.round(mr.width),
    mainPaddingTop: cs(main, 'paddingTop'),
    mainPaddingBottom: cs(main, 'paddingBottom'),
    bodyBg: cs(document.body, 'backgroundColor'),
    bodyColor: cs(document.body, 'color'),
    btnBg: cs(btn, 'backgroundColor'),
    btnColor: cs(btn, 'color'),
    bodyText: document.body.innerText,
    hasScript: !!q('script'),
  };
})()`;

const matrix = [];
for (const scheme of ['dark', 'light']) {
  for (const [width, height] of [[1280, 720], [731, 900], [730, 900], [390, 844]]) {
    matrix.push({ scheme, width, height });
  }
}

const checks = [];
const check = (name, ok, detail) => checks.push({ name, ok: !!ok, detail });
const runs = [];
const problems = [];

try {
  const cdp = await connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  cdp.on((m) => {
    if (m.method === 'Runtime.exceptionThrown') problems.push(`exception: ${m.params.exceptionDetails.text}`);
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) {
      problems.push(`console.${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`);
    }
    if (m.method === 'Network.loadingFailed') problems.push(`request failed: ${m.params.errorText}`);
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) {
      problems.push(`HTTP ${m.params.response.status}: ${m.params.response.url}`);
    }
  });

  for (const { scheme, width, height } of matrix) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
    await cdp.send('Page.navigate', { url });
    await sleep(600);
    const { result } = await cdp.send('Runtime.evaluate', { expression: pageProbe, returnByValue: true });
    const v = result.value;
    runs.push({ scheme, width, ...v, bodyText: undefined });
    const tag = `${scheme} ${width}px`;
    check(`${tag}: no horizontal overflow`, v.scrollWidth === v.innerWidth, `scrollWidth ${v.scrollWidth} vs viewport ${v.innerWidth}`);
    check(`${tag}: button meets 44px target`, v.btnHeight >= 44, `height ${v.btnHeight}px`);
    check(`${tag}: mailto link intact`, /^mailto:.+@.+/.test(v.btnHref || ''), v.btnHref);
    check(`${tag}: no script element`, !v.hasScript, `hasScript=${v.hasScript}`);
    const mobile = width <= 730;
    check(`${tag}: ${mobile ? 'mobile' : 'desktop'} layout`,
      mobile ? v.btnWidth === v.mainWidth
             : v.btnWidth < v.mainWidth && v.mainPaddingTop === '96px',
      `button ${v.btnWidth}px of main ${v.mainWidth}px, padding-top ${v.mainPaddingTop}`);
    if (mobile) check(`${tag}: hero sits in optical band`, v.h1Top >= 240 && v.h1Top <= 270, `h1 top ${v.h1Top}px`);
    if (scheme === 'dark') check(`${tag}: dark palette`, v.bodyBg === 'rgb(16, 17, 18)', v.bodyBg);
    else check(`${tag}: light palette`, v.bodyBg === 'rgb(244, 244, 245)', v.bodyBg);
    for (const t of expect) check(`${tag}: page contains "${t}"`, v.bodyText.includes(t), '');
    for (const t of absent) check(`${tag}: page does not contain "${t}"`, !v.bodyText.includes(t), '');
    if (width === 1280 || width === 390) {
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(join(outDir, `${scheme}-${width}.png`), Buffer.from(shot.data, 'base64'));
    }
  }
  check('no console errors, failed requests, or HTTP errors', problems.length === 0, problems.join('; '));
  cdp.close();
} finally {
  await cleanup();
}

const verdict = { url, ok: checks.every((c) => c.ok), checks, runs };
writeFileSync(join(outDir, 'report.json'), JSON.stringify(verdict, null, 2));
for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.name}${c.ok ? '' : `  [${c.detail}]`}`);
console.log(`\n${verdict.ok ? 'ALL PASS' : 'FAILURES'}  ${checks.filter((c) => c.ok).length}/${checks.length}  evidence: ${outDir}`);
process.exit(verdict.ok ? 0 : 1);
