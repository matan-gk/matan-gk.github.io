const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','נועה');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(300);await p.evaluate(()=>openGame(level));
const miss=await p.evaluate(()=>Object.keys(SKILL_META).filter(id=>!HELP[id]));ok(miss.length===0,'every skill has help '+miss);
const extra=await p.evaluate(()=>Object.keys(HELP).filter(id=>!SKILL_META[id]));ok(extra.length===0,'no stray help '+extra);
ok(await p.locator('#helpBtn').isVisible(),'help button visible');
// open from a real question of each level
for(const lv of [1,2,3,4,5]){
  await p.evaluate(l=>{openGame(l);},lv);
  const sk=await p.evaluate(()=>current.skill);
  await p.click('#helpBtn');await p.waitForTimeout(100);
  const t=await p.textContent('#helpTitle'); const body=await p.textContent('#helpBody');
  ok(await p.locator('#helpOverlay').isVisible()&&t.length>1&&!/undefined|\[\[|\]\]/.test(body),'level '+lv+' ('+sk+') help shows: '+t);
  await p.click('#helpBack');ok(!(await p.locator('#helpOverlay').isVisible()),'closes');
}
// render every entry, no leftovers
const bad=await p.evaluate(()=>{const r=[];for(const id of Object.keys(HELP)){helpSkill=id;renderHelp();const t=document.getElementById('helpBody').textContent;if(/undefined|\[\[|\]\]|NaN/.test(t)) r.push(id);}return r;});ok(bad.length===0,'all pages clean '+bad);
// timer pause
await p.evaluate(()=>{nextQuestion();});const h0=await p.evaluate(()=>qTimer.hidden);await p.click('#helpBtn');await p.waitForTimeout(1200);await p.click('#helpClose');
ok(await p.evaluate(h=>qTimer.hidden-h>=1000,h0),'time in help excluded from answer time');
// index navigation + escape
await p.click('#helpBtn');await p.click('#helpBody summary');await p.click('[data-help=gSumDiff]');ok((await p.textContent('#helpTitle')).includes('סכום'),'index jumps to another type');
await p.keyboard.press('Escape');ok(!(await p.locator('#helpOverlay').isVisible()),'escape closes');
// bonus question
await p.evaluate(()=>{renderBonus();});await p.click('#helpBtn');ok((await p.textContent('#helpTitle')).includes('בונוס'),'bonus help');await p.click('#helpClose');
// screenshots
for(const id of ['gFillNumber','gOddGrid','gMovingSquare','bLogicMatrix','gLogicGrid','gGrowingSteps']){
  await p.evaluate(i=>{helpSkill=i;document.getElementById('helpOverlay').hidden=false;renderHelp();},id);await p.screenshot({path:'h_'+id+'.png'});
}
await p.evaluate(()=>{document.getElementById('helpOverlay').hidden=true;});await p.screenshot({path:'h_card.png'});
ok(errs.length===0,'no page errors '+errs.join('|'));
console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
