// The adult check in front of the parent area: shown, rejects a child's birth year and a bad entry, accepts an adult's, can be cancelled
const T = require('./lib.js'); T.gate.on();
const {chromium} = require('playwright');
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if(!c) f++; };
(async () => {
  const b = await chromium.launch({...T.launchOpts});
  const p = await (await b.newContext({viewport: {width: 390, height: 844}})).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(T.URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.fill('#pfName', 'Test'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
  const open = async () => { await p.click('#menuBtn'); await p.click('#topMenu .mitem:has-text("אזור הורים")'); await p.waitForTimeout(200); };
  const year = new Date().getFullYear();
  await open();
  ok(await p.locator('#adultOverlay').isVisible() && !(await p.locator('#profOverlay').isVisible()), 'the parent area asks for a birth year first');
  await p.fill('#adultYear', String(year - 10)); await p.click('#adultSubmit');
  ok(/18/.test(await p.textContent('#adultError')) && !(await p.locator('#profOverlay').isVisible()), 'a child\'s birth year is refused');
  await p.fill('#adultYear', ''); await p.click('#adultSubmit');
  ok((await p.textContent('#adultError')).length > 0 && !(await p.locator('#profOverlay').isVisible()), 'an empty entry is refused');
  await p.click('#adultCancel'); await p.waitForTimeout(150);
  ok(!(await p.locator('#adultOverlay').isVisible()) && !(await p.locator('#profOverlay').isVisible()), 'cancel closes the check and opens nothing');
  await open(); await p.fill('#adultYear', String(year - 40)); await p.click('#adultSubmit'); await p.waitForTimeout(300);
  ok(await p.locator('#profOverlay').isVisible() && !(await p.locator('#adultOverlay').isVisible()), 'an adult\'s birth year opens the parent area');
  ok(errs.length === 0, 'no page errors ' + errs);
  console.log(f ? 'FAILURES ' + f : 'ALL PASS'); await b.close(); process.exit(f ? 1 : 0);
})();
