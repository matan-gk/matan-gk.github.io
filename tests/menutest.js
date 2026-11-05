const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','נועה');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(300);
ok(await p.locator('#profileChip').count()===0,'old button under the unicorn is gone');
const bb=await p.locator('#menuBtn').boundingBox(); ok(bb.x+bb.width>390-40&&bb.y<60,'menu button sits at the top right ('+Math.round(bb.x+bb.width)+','+Math.round(bb.y)+')');
ok((await p.textContent('#menuBtn')).includes('נועה'),'button shows the profile name');
await p.screenshot({path:'m_top.png'});
await p.click('#menuBtn');ok(await p.locator('#topMenu').isVisible()&&await p.getAttribute('#menuBtn','aria-expanded')==='true','menu opens');
await p.screenshot({path:'m_open1.png'});
ok(await p.locator('#topMenu .mitem').count()===1&&(await p.textContent('#topMenu .mitem')).includes('אזור הורים'),'one profile: the menu has just the parent-area item');
await p.keyboard.press('Escape');ok(!(await p.locator('#topMenu').isVisible()),'escape closes');
await p.click('#menuBtn');await p.mouse.click(15,800);ok(!(await p.locator('#topMenu').isVisible()),'click outside closes');
// add second profile, switch from the menu
await p.evaluate(()=>{store.profiles.push(makeProfile('דני','m',{score:77}));persist();});
await p.click('#menuBtn');ok(await p.locator('#topMenu [data-menu=switch]').count()===2&&await p.locator('#topMenu .mitem').count()===3,'two profiles: the switcher plus the parent-area item, nothing else');await p.waitForTimeout(400);await p.screenshot({path:'m_open2.png'});
await p.click('#topMenu [data-menu=switch]:not(.cur)');await p.waitForTimeout(200);
ok((await p.textContent('#menuBtn')).includes('דני')&&await p.evaluate(()=>score)===77,'switching from the menu works');
// the menu's parent-area item opens the parent area (profiles page)
await p.click('#menuBtn');await p.click('#topMenu .mitem:has-text("אזור הורים")');await p.waitForTimeout(150);
ok((await p.textContent('#profTitle')).includes('ניהול פרופילים')&&await p.locator('.vtab.on').count()===1,'parent-area item opens the parent area with its tabs');
ok(!(await p.textContent('#topMenu')).match(/התקדמות|הגדרות|גיבוי|מדריך|דיווח/),'no other sections in the menu');
await p.click('#profClose');
// side tabs switch pages without going back
await p.evaluate(()=>openPanel('profiles'));
ok(await p.locator('.vtabs .vtab').count()===7,'side tab bar has 7 pages (incl. Settings and Debug)');
ok(await p.locator('.vtabs').isVisible(),'tab bar is visible (layout is checked in admintest)');
await p.screenshot({path:'m_vtabs_profiles.png'});
await p.click('.vtab[data-id=progress]');ok((await p.textContent('#profTitle')).includes('התקדמות')&&await p.locator('.vtab.on').innerText().then(t=>t.includes('התקדמות')),'switch to progress straight from the tab bar');await p.screenshot({path:'m_vtabs_progress.png'});
await p.click('.vtab[data-id=backup]');await p.screenshot({path:'m_vtabs_backup.png'});
await p.click('.vtab[data-id=report]');await p.screenshot({path:'m_vtabs_account.png'});
await p.click('.vtab[data-id=guide]');await p.waitForTimeout(300);
ok((await p.textContent('#profBody')).length>1500&&!/undefined|\[\[/.test(await p.textContent('#profBody')),'guide is a page in the panel');
ok(!(await p.textContent('#profBody')).includes('שערות סבתא מתחברות')&&!(await p.textContent('#profBody')).includes('10 סוכריות'),'lollipop->cotton note removed');
await p.screenshot({path:'m_guide1.png'});
await p.click('.vtab[data-id=profiles]');ok(await p.locator('.prow').count()===2,'back to profiles from the guide');
await p.click('#profClose');
// report button on the question card
await p.evaluate(()=>{closeProfiles&&0; openGame(level);});
ok(await p.locator('#reportBtn').isVisible(),'report button on the question card');
await p.click('#reportBtn');ok(await p.locator('#reportOverlay').isVisible()&&(await p.textContent('#reportCtx')).length>10,'report from the question attaches the question');await p.screenshot({path:'m_report.png'});await p.click('#reportCancel');
await p.evaluate(()=>renderBonus());ok(await p.locator('#reportBtn').isVisible(),'report button also on bonus questions');
// long name
await p.evaluate(()=>{activeProfile().name='שם ארוך מאוד מאוד';renderProfileChip();});await p.screenshot({path:'m_long.png'});
ok(errs.length===0,'no page errors '+errs.join('|'));
console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
