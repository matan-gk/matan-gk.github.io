#!/usr/bin/env node
// Runs the whole suite and prints one line per test.   node run.js [--quick] [--only a,b] [--jobs 4] [--list]
const {spawn, execSync} = require('child_process'), fs = require('fs'), path = require('path');
const ROOT = __dirname;
const TESTS = [
  // name, file, what it covers, slow
  ['ut','ut.js','questions: every generator gives a valid question; answer is among distinct choices'],
  ['st','st.js','stats storage, saving and cleaning'],
  ['ft','ft.js','fonts load, no outside requests'],
  ['it','it.js','icon images and fallbacks'],
  ['sct','sct.js','save codes in the Backup tab: create, preview, restore, safety copy'],
  ['codectest','codectest.js','save-code format, checksum, tampering and size limits'],
  ['engtest','engtest.js','stats engine: assessment, trend, lifetime, report'],
  ['helptest','helptest.js','help pages for every question type'],
  ['clocktest','clocktest.js','clock level: drawings, wording, answers'],
  ['difftest','difftest.js','difficulty ratings, coverage per section, parent setting'],
  ['unmtest','unmtest.js','merging and unmerging prizes and looks'],
  ['adulttest','adulttest.js','the adult check in front of the parent area: refuses a child and bad entries, accepts an adult, cancel'],
  ['menutest','menutest.js','top menu, panel navigation, guide, report from a question'],
  ['admintest','admintest.js','parent area: full screen, tabs on phone and desktop, consistent controls, first run', true],
  ['settingtest','settingtest.js','difficulty setting per profile and the sample questions'],
  ['newtypes','newtypes.js','question types added after the first sample tests'],
  ['nt2test','nt2test.js','numbers-castle question types: semantics, labels, help, order of levels'],
  ['sections','sections.js','each type in exactly one section; areas match sections; bonus pools'],
  ['shoptest','shoptest.js','shop stories: wording, answers, variety, price questions'],
  ['shapetest','shapetest.js','shapes garden types: geometry, answers, help examples'],
  ['grptest','grptest.js','shape groups never split across lines; choices fit the screen'],
  ['splittest','splittest.js','the repository as site: small page, picture files listed and used, every picture, icon and font loads'],
  ['tokentest','tokentest.js','personal-space tokens: one per upgrade, stored counter, one-time true-up, balance pictures by tier (1/10/50/100/300)'],
  ['catalogtest','catalogtest.js','personal space step 3: catalog, buy-and-place preview, floor cells, move, put away, stock, brown pots and the magenta recolor'],
  ['flattest','flattest.js','personal space: rugs and other flat floor things (stand-on rule, draw order, no shadow, shared rug colour)'],
  ['surfacetest','surfacetest.js','personal space: things on furniture, phase 1 (rules, data, save cleaning, carry and put away)'],
  ['surfaceuitest','surfaceuitest.js','personal space: things on furniture, phase 2 (drawing, lit tops, placing, tapping, moving)'],
  ['surfacemsgtest','surfacemsgtest.js','personal space: things on furniture, phase 4 (bed level preview, inventory notices, save and reload)'],
  ['surfacegroundtest','surfacegroundtest.js','personal space: the tops of tables, desk, toy boxes and beds match their pictures (tools/surfaces.py --check)'],
  ['gridtest','gridtest.js','denser room grid: unit sizes, small things, nudge arrows, converting old saves'],
  ['fixturetest','fixturetest.js','moving, deleting and upgrading the bed and the window'],
  ['surfpattest','surfpattest.js','patterns on the walls and floor'],
  ['rotatetest','rotatetest.js','turning items and the bed'],
  ['backtest','backtest.js','full turning: back pictures, four looks, what lies on a host, painting, saves'],
  ['ghosttaptest','ghosttaptest.js','a tap on the room does not tap the drawer that appears (touch)'],
  ['whitedefaulttest','whitedefaulttest.js','new profiles start with white walls; older saves keep purple'],
  ['pendingtest','pendingtest.js','pending previews look different from placed things: marching dashes, pulsing ghost, dashed bar, settle animation'],
  ['versiontest','versiontest.js','version in the parent area, the commit stamp from the deploy workflow, tools/version_commit.py'],
  ['drawerpintest','drawerpintest.js','the drawer: title, buy / place / cancel and close stay visible; only the middle scrolls'],
  ['groundtest','groundtest.js','grounding: from the real sprite pixels, every floor item and bed level stands on its footprint corners (no floating)'],
  ['colortest','colortest.js','colors of parts: bed blanket/sheet/pillow/curtains, pots, furniture; palette, pattern, prices, free switching, repainting, saving'],
  ['spacetest','spacetest.js','personal space: locked teaser, unlock ceremony, poof, room, zoom/pan, upgrades and colors cost tokens'],
  ['roomfiltertest','roomfiltertest.js','gift room: one section with a filter (all, current, past)'],
  ['layerstest','layerstest.js','layered rewards: item format, one-time migration, rarity, remembered merges and looks, every combination fits'],
  ['loctest','loctest.js','selection screen and locations: levels only at home, backdrop and title per game, back button, neutral background without backdrop'],
  ['sprtest','sprtest.js','no broken images'],
  ['lvtest','lvtest.js','level buttons fit at 320 to 1280 px'],
  ['gtest','gtest.js','boys and neutral profiles never see the girl-form wording', true],
  ['privacytest','privacytest.js','privacy statement is in the guide, linked from the cloud options, and matches the code (2,000 answers, no analytics)'],
  ['pairtest','pairtest.js','"two numbers" questions never offer the same pair in a different order'],
  ['plantest','cloud/plantest.js','cloud sync planner: push, pull, conflicts, deletions'],
  ['cloudtest','cloud/cloudtest.js','Google account sync with a fake Firebase: two devices, conflicts, offline, budget, reports'],
  ['famtest','cloud/famtest.js','family model: Google account, anonymous backup and codes, joining, migration, modes'],
  ['leveltest','leveltest.js','space sections: 8 pictures and names, gendered first name, hidden sections, parent area keeps default names, coverage'],
  ['rewardtest','rewardtest.js','space collectibles: 14+14 pictures, Hebrew names, workshop and upgrade wording, bonus trophy, extra mascot poses, sweets unchanged'],
  ['storytest','storytest.js','space stories: every question type in both themes, item pools, phrase map, help examples, praise, wrong-answer, bonus and party wording, sweets unchanged'],
  ['mascottest','mascottest.js','space mascot: 8 moods, equal height, wrong-answer reaction (theme only), looks, no broken picture on switching'],
  ['themetest','themetest.js','themes: per profile, saved, palettes (light/dark) and contrast, parent area stays neutral, picture fallback, coverage report'],
  ['warmtest','warmtest.js','warm-up first: first 5 questions of a session from solid types, fallback, respects hidden types, per profile, saved'],
  ['focustest','focustest.js','focus on weak spots: 4 in 10 from weak types, fallback tiers, respects section/hidden types, per profile, saved'],
  ['mxtest','mxtest.js','question matrix: sections x levels x types, defaults unchanged, instant effect, per profile, saved, empty game refused'],
  ['labeltest','labeltest.js','wrong-answer labels: classifier rules, per-skill counts, shown only with enough evidence'],
  ['pwatest','pwatest.js','home screen and offline: manifest, icons, service worker caches the game, offline reload, update notice, iPhone and installed variants'],
  ['adminpage','adminpage.js','admin.html: read-only, loading, filters, export, no write controls'],
];
const args = process.argv.slice(2), has = f => args.includes(f), val = f => { const i = args.indexOf(f); return i >= 0 ? args[i+1] : ''; };
if(has('--list')){ TESTS.forEach(t => console.log(t[0].padEnd(12), t[2] + (t[3] ? ' (slow)' : ''))); process.exit(0); }
let list = TESTS.slice();
if(has('--quick')) list = list.filter(t => !t[3]);
if(val('--only')){ const o = val('--only').split(','); list = TESTS.filter(t => o.includes(t[0])); if(!list.length){ console.log('no such test'); process.exit(2); } }
const jobs = Math.max(1, parseInt(val('--jobs') || '4', 10));
let globalRoot = ''; try{ globalRoot = execSync('npm root -g', {stdio: ['ignore','pipe','ignore']}).toString().trim(); }catch(e){}
const env = Object.assign({}, process.env, {NODE_PATH: [path.join(ROOT,'node_modules'), globalRoot, process.env.NODE_PATH||''].filter(Boolean).join(path.delimiter)});
const OUT = path.join(ROOT, '_out'); fs.mkdirSync(OUT, {recursive: true});
function verdict(code, out){
  const lines = out.split('\n'), bad = lines.filter(l => /^FAIL|^FAILURES|PAGE ERRORS|^Error|TimeoutError/.test(l.trim()));
  if(code !== 0) return {pass: false, why: 'exit code ' + code + (bad[0] ? ': ' + bad[0].slice(0, 120) : '')};
  if(bad.length) return {pass: false, why: bad[0].slice(0, 140)};
  return {pass: true};
}
function runOne(t){
  return new Promise(res => {
    const dir = path.join(OUT, t[0]); fs.mkdirSync(dir, {recursive: true});
    const t0 = Date.now(); let out = '';
    const p = spawn(process.execPath, [path.join(ROOT, t[1])], {cwd: dir, env});
    const kill = setTimeout(() => { out += '\nFAIL timeout after 5 minutes\n'; p.kill('SIGKILL'); }, 300000);
    p.stdout.on('data', d => out += d); p.stderr.on('data', d => out += d);
    p.on('close', code => { clearTimeout(kill); fs.writeFileSync(path.join(dir, 'log.txt'), out); const v = verdict(code, out); res({name: t[0], desc: t[2], secs: ((Date.now()-t0)/1000).toFixed(0), out, ...v}); });
  });
}
(async () => {
  console.log('Game: ' + require('./lib.js').GAME + '\nRunning ' + list.length + ' tests, ' + jobs + ' at a time...\n');
  const results = [], queue = list.slice();
  await Promise.all(Array.from({length: jobs}, async () => { while(queue.length){ const t = queue.shift(); const r = await runOne(t); results.push(r); console.log((r.pass ? 'PASS ' : 'FAIL ') + r.name.padEnd(12) + (r.secs + 's').padStart(5) + (r.pass ? '' : '   ' + r.why)); } }));
  const failed = results.filter(r => !r.pass);
  console.log('\n' + (failed.length ? failed.length + ' of ' + results.length + ' FAILED: ' + failed.map(r => r.name).join(', ') + '\nLogs and screenshots: ' + OUT + path.sep + '<test>' + path.sep : 'ALL ' + results.length + ' TESTS PASSED'));
  process.exit(failed.length ? 1 : 0);
})();
