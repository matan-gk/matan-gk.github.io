// The prize of a question pops up in the middle of the screen, flies to the gift box in the corner, and does not collide with a party
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts);
async function setup(reduced){
  const ctx=await b.newContext({viewport:{width:390,height:844}, reducedMotion: reduced?'reduce':'no-preference'}); const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(e.message));
  await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
  await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
  await p.evaluate(()=>{ document.querySelectorAll('.milestone').forEach(e=>e.remove()); openGame(1); }); await p.waitForTimeout(200);
  return p; }
const right=p=>p.evaluate(()=>{ const q=current; const el=[...document.querySelectorAll('.choice')].find(c=>(c.dataset.key!==undefined?c.dataset.key===String(q.answer):c.textContent.trim()===String(q.answer).trim()))||document.querySelector('.choice'); el.click(); });
const box=(p,sel)=>p.evaluate(s=>{ const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); return {cx:r.left+r.width/2, cy:r.top+r.height/2, w:r.width, h:r.height}; }, sel);

let p=await setup(false);
const before=await p.evaluate(()=>collection.length);
await right(p); await p.waitForTimeout(250);
ok(await p.locator('.pfly').count()===1,'a right answer shows the prize on the screen');
let c=await box(p,'.pfly');
ok(c&&Math.abs(c.cx-195)<60&&c.cy>200&&c.cy<500,'the prize is in the middle of the screen ('+(c&&Math.round(c.cx)+','+Math.round(c.cy))+')');
ok(c&&c.w>110&&c.h>90,'and big enough to see ('+(c&&Math.round(c.w)+'x'+Math.round(c.h))+')');
ok(await p.evaluate(()=>{ const it=document.querySelector('#rsRecent .rs-item'); return !it||getComputedStyle(it).visibility==='hidden'||it.style.visibility==='hidden'; }),'the new item in the gift box waits for the prize to arrive');
await p.waitForTimeout(1500);
const mid=await box(p,'.pfly'); const strip=await box(p,'#rewardsStrip');
const d0=Math.hypot(c.cx-strip.cx,c.cy-strip.cy), d1=mid&&Math.hypot(mid.cx-strip.cx,mid.cy-strip.cy);
ok(mid&&d1<d0-40,'then it flies toward the gift box in the corner (distance '+Math.round(d0)+' -> '+(mid&&Math.round(d1))+')');
await p.waitForTimeout(1300);
ok(await p.locator('.pfly').count()===0,'it is gone once it has landed');
ok(await p.evaluate(()=>document.getElementById('rewardsStrip').classList.contains('pf-bump')&&getComputedStyle(document.querySelector('#rsRecent .rs-item')).visibility!=='hidden'),'the gift box bumps and shows the new item');
ok(await p.evaluate(b=>collection.length===b+1,before),'one prize was added');
// a wrong answer shows no prize
await p.evaluate(()=>nextQuestion()); await p.waitForTimeout(200);
await p.evaluate(()=>{ const q=current; const el=[...document.querySelectorAll('.choice')].find(c=>!(c.dataset.key!==undefined?c.dataset.key===String(q.answer):c.textContent.trim()===String(q.answer).trim())); el.click(); }); await p.waitForTimeout(300);
ok(await p.locator('.pfly').count()===0,'a wrong answer shows no prize');
// party on every 5th answer: the prize comes first, the party waits
await p.evaluate(()=>{ nextQuestion(); streak=4; }); await p.waitForTimeout(200);
await right(p); await p.waitForTimeout(300);
ok(await p.locator('.pfly').count()===1&&await p.locator('.milestone').count()===0,'5th in a row: the prize shows and the party is not on top of it');
let overlap=false; for(let i=0;i<30;i++){ await p.waitForTimeout(100); if(await p.locator('.pfly').count()&&await p.locator('.milestone').count()) overlap=true; }
ok(!overlap,'the prize and the party are never on the screen together');
await p.waitForTimeout(1500);
ok(await p.locator('.milestone').count()===1,'the party starts after the prize has landed');
ok(await p.evaluate(()=>!!document.querySelector('.milestone')),'(party is open)');
await p.evaluate(()=>{ document.querySelectorAll('.milestone').forEach(e=>e.click()); }); await p.waitForTimeout(300);
// profile switch clears a prize in flight
await p.evaluate(()=>{ nextQuestion(); }); await p.waitForTimeout(150); await right(p); await p.waitForTimeout(200);
ok(await p.locator('.pfly').count()===1,'(prize in flight)');
await p.evaluate(()=>refreshAll()); 
ok(await p.locator('.pfly').count()===0&&await p.evaluate(()=>prizeBusy===0),'refreshing (profile switch) clears a prize in flight');
ok(p.errs.length===0,'no page errors '+p.errs.join(';'));
await p.context().close();
// reduced motion: no flying, but still shown for a moment and then gone
p=await setup(true);
await right(p); await p.waitForTimeout(250);
ok(await p.locator('.pfly').count()===1,'reduced motion: the prize is shown');
await p.waitForTimeout(1300);
ok(await p.locator('.pfly').count()===0,'reduced motion: and removed again after about a second');
await p.context().close();
await b.close(); process.exit(f?1:0);
})();
