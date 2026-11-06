// Shared helpers for the test suite. Paths come from the environment so the suite runs anywhere:
//   GAME     path to math-quest.html   (default: ../math-quest.html, i.e. this folder sits next to the game)
//   ADMIN    path to admin.html        (default: ../admin.html)
//   CHROMIUM path to a Chromium binary (default: Playwright's own, or /opt/pw-browsers/chromium when present)
const fs = require('fs'), path = require('path');
const ROOT = __dirname;
const GAME = path.resolve(process.env.GAME || path.join(ROOT, '..', 'math-quest.html'));
const ADMIN = path.resolve(process.env.ADMIN || path.join(ROOT, '..', 'admin.html'));
if(!fs.existsSync(GAME)){ console.log('FAIL game file not found: '+GAME+' (set GAME=/path/to/math-quest.html)'); process.exit(1); }
const launchOpts = {...(process.env.CHROMIUM ? {executablePath: process.env.CHROMIUM} : (fs.existsSync('/opt/pw-browsers/chromium') ? {executablePath: '/opt/pw-browsers/chromium'} : {})), args: ['--allow-file-access-from-files']};   // the page is opened from the file system: its picture files must count as the same origin (tests read pixels)
const read = () => fs.readFileSync(GAME, 'utf8');
// A slice of the game's source between two markers (the pure, UI-free parts: stats engine, save-code codec, sync planner).
function section(start, end){
  const s = read(), a = s.indexOf(start), b = s.indexOf(end, a + 1);
  if(a < 0 || b < 0) throw new Error('markers not found in the game: ' + start + ' ... ' + end);
  return s.slice(a, b);
}
// The same slice, evaluated, returning the named functions/constants. Always the current code, never a stale copy.
function extract(start, end, names){ return new Function('window', section(start, end) + '\n;return {' + names.join(',') + '};')({}); }   // `window` is a stand-in for the few debug hooks the section registers
// A copy of the game with Firebase replaced by an in-memory fake (see cloud/mock_init.js), for the cloud tests.
function cloudBuild(){
  let s = read();
  const cfg = /const CLOUD_CONFIG = [^\n]*;/; if(!cfg.test(s)) throw new Error('CLOUD_CONFIG line not found');
  s = s.replace(cfg, 'const CLOUD_CONFIG = {mock:1};');
  const hook = 'if(!cloud.ad) cloud.ad = firebaseAdapter(CLOUD_CONFIG);'; if(!s.includes(hook)) throw new Error('adapter hook not found');
  s = s.replace(hook, 'if(!cloud.ad) cloud.ad = (window.__mockAd||firebaseAdapter)(CLOUD_CONFIG);');
  s = s.replace('<head>', '<head><base href="file://' + path.dirname(GAME) + '/">');   // the copy lives elsewhere: keep the relative picture links working
  const dir = path.join(ROOT, '_build'); fs.mkdirSync(dir, {recursive: true});
  const f = path.join(dir, 'test_build_' + process.pid + '.html'); fs.writeFileSync(f, s); return f;
}

// The parent area asks for a birth year (the adult check) before it opens. Tests that are not about that check
// pass it automatically after every page load, so they can open the parent area as before.
// A test about the check itself calls T.gate.on() before launching, to see the real thing.
const gate = {bypass: true, on(){ this.bypass = false; }};
{
  const {chromium} = require('playwright'), orig = chromium.launch.bind(chromium);
  const hook = ctx => ctx.on('page', pg => pg.on('domcontentloaded', () => { if(gate.bypass) pg.evaluate("if(typeof adult!=='undefined') adult.ok = true").catch(()=>{}); }));
  chromium.launch = async (o) => {
    const b = await orig(o), nc = b.newContext.bind(b), np = b.newPage.bind(b);
    b.newContext = async (...a) => { const c = await nc(...a); hook(c); return c; };
    b.newPage = async (...a) => { const pg = await np(...a); pg.on('domcontentloaded', () => { if(gate.bypass) pg.evaluate("if(typeof adult!=='undefined') adult.ok = true").catch(()=>{}); }); return pg; };
    return b;
  };
}
module.exports = {gate, ROOT, GAME, ADMIN, URL: 'file://' + GAME, ADMIN_URL: 'file://' + ADMIN, launchOpts, section, extract, cloudBuild, p: rel => path.join(ROOT, rel)};
