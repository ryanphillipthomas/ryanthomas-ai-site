#!/usr/bin/env node
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
  const header = q('header');
  const hero = q('.hero');
  const email = q('#contact a');
  const nav = q('.nav a');
  const cs = (el, p) => getComputedStyle(el)[p];
  const r = btn.getBoundingClientRect();
  return {
    innerWidth: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    h1: q('h1').textContent.trim(),
    lead: q('.lead') ? q('.lead').textContent.trim() : '',
    btnText: btn.textContent.trim(),
    btnHref: btn.getAttribute('href'),
    btnHeight: Math.round(r.height),
    btnWidth: Math.round(r.width),
    headerHeight: cs(header, 'height'),
    heroPaddingTop: cs(hero, 'paddingTop'),
    bodyBg: cs(document.body, 'backgroundColor'),
    bodyColor: cs(document.body, 'color'),
    btnBg: cs(btn, 'backgroundColor'),
    btnColor: cs(btn, 'color'),
    btnDeco: cs(btn, 'textDecorationLine'),
    emailColor: cs(email, 'color'),
    emailDeco: cs(email, 'textDecorationLine'),
    emailOffset: cs(email, 'textUnderlineOffset'),
    navColor: cs(nav, 'color'),
    navDeco: cs(nav, 'textDecorationLine'),
    hrefs: [...document.querySelectorAll('a')].map((a) => a.getAttribute('href')),
    bodyText: document.body.innerText,
    hasScript: !!q('script'),
  };
})()`;

const matrix = [];
for (const scheme of ['dark', 'light']) {
  for (const [width, height] of [[1280, 720], [1024, 900], [1023, 900], [768, 900], [390, 844], [320, 844]]) {
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
    await sleep(700);
    const { result } = await cdp.send('Runtime.evaluate', { expression: pageProbe, returnByValue: true });
    const v = result.value;
    runs.push({ scheme, width, ...v, bodyText: undefined });
    const tag = `${scheme} ${width}px`;
    const desktop = width >= 1024;
    check(`${tag}: no horizontal overflow`, v.scrollWidth === v.innerWidth, `scrollWidth ${v.scrollWidth} vs viewport ${v.innerWidth}`);
    check(`${tag}: button meets 44px target`, v.btnHeight >= 44, `height ${v.btnHeight}px`);
    check(`${tag}: mailto link intact`, v.btnHref === 'mailto:info@ryanthomas.ai', v.btnHref);
    check(`${tag}: no script element`, !v.hasScript, `hasScript=${v.hasScript}`);
    check(`${tag}: ${desktop ? 'desktop' : 'mobile'} layout`,
      desktop
        ? v.headerHeight === '72px' && v.heroPaddingTop === '128px'
        : v.headerHeight === '64px' && v.heroPaddingTop === '64px',
      `header ${v.headerHeight}, hero padding-top ${v.heroPaddingTop}`);
    check(`${tag}: button label`, v.btnText === 'Say hello', v.btnText);
    check(`${tag}: button is not underlined`, v.btnDeco === 'none', v.btnDeco);
    if (scheme === 'dark') {
      check(`${tag}: dark palette`, v.bodyBg === 'rgb(16, 17, 18)', v.bodyBg);
      check(`${tag}: dark button`, v.btnBg === 'rgb(233, 233, 235)' && v.btnColor === 'rgb(16, 17, 18)', `${v.btnBg} / ${v.btnColor}`);
      check(`${tag}: primary link color`, v.emailColor === 'rgb(233, 233, 235)', v.emailColor);
      check(`${tag}: nav link color`, v.navColor === 'rgb(185, 187, 191)', v.navColor);
    } else {
      check(`${tag}: light palette`, v.bodyBg === 'rgb(244, 244, 245)', v.bodyBg);
      check(`${tag}: light button`, v.btnBg === 'rgb(23, 24, 26)' && v.btnColor === 'rgb(255, 255, 255)', `${v.btnBg} / ${v.btnColor}`);
      check(`${tag}: primary link color`, v.emailColor === 'rgb(23, 24, 26)', v.emailColor);
      check(`${tag}: nav link color`, v.navColor === 'rgb(61, 64, 70)', v.navColor);
    }
    check(`${tag}: content links underlined`, v.emailDeco === 'underline' && v.emailOffset === '4px', `${v.emailDeco} offset ${v.emailOffset}`);
    check(`${tag}: nav links not underlined`, v.navDeco === 'none', v.navDeco);
    check(`${tag}: products nav target`, v.hrefs.includes('#products'), '');
    check(`${tag}: contact nav target`, v.hrefs.includes('#contact'), '');
    check(`${tag}: github target`, v.hrefs.includes('https://github.com/ryanphillipthomas'), '');
    check(`${tag}: x target`, v.hrefs.includes('https://x.com/phazebludesign'), '');
    check(`${tag}: visible copy`,
      v.h1 === 'Building useful software, one small thing at a time.'
        && v.bodyText.includes('Focx')
        && v.bodyText.includes('AI for learning.')
        && v.bodyText.includes('focx.ai')
        && v.bodyText.includes('2026 Ryan Thomas'),
      v.h1);
    check(`${tag}: no retired name or placeholder copy`,
      !v.bodyText.includes("I'm Ryan Thomas")
        && !v.bodyText.includes('I’m Ryan Thomas')
        && !v.bodyText.includes('Placeholder')
        && !v.bodyText.includes('handle to confirm'),
      '');
    check(`${tag}: focx is linked`,
      v.hrefs.includes('https://focx.ai'),
      (v.hrefs || []).filter((h) => h && h.includes('focx')).join(', '));
    check(`${tag}: footer home link`, v.hrefs.includes('/'), '');
    for (const t of expect) check(`${tag}: page contains "${t}"`, v.bodyText.includes(t), '');
    for (const t of absent) check(`${tag}: page does not contain "${t}"`, !v.bodyText.includes(t), '');
    if (width === 1280 || width === 390 || width === 320) {
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(join(outDir, `${scheme}-${width}.png`), Buffer.from(shot.data, 'base64'));
    }
  }
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Emulation.setEmulatedMedia', { features: [
    { name: 'prefers-color-scheme', value: 'dark' },
    { name: 'prefers-reduced-motion', value: 'reduce' },
  ] });
  await cdp.send('Page.navigate', { url });
  await sleep(700);
  const { result: rmResult } = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const hero = getComputedStyle(document.querySelector('.hero'));
      const link = getComputedStyle(document.querySelector('#contact a'));
      return { anim: hero.animationName, animDur: hero.animationDuration, transDur: link.transitionDuration };
    })()`,
    returnByValue: true,
  });
  const rm = rmResult.value;
  check('reduced motion: hero animation off', rm.anim === 'none', rm.anim);
  check('reduced motion: animation duration 0', rm.animDur === '0s' || rm.animDur === '0ms', rm.animDur);
  check('reduced motion: transition duration 0', rm.transDur === '0s' || rm.transDur === '0ms', rm.transDur);
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
