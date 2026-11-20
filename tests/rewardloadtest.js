// Rewards must never pop up empty or half drawn: the prize waits (a moment at most) for its pictures, the art is preloaded in the background, and a failing picture blocks nothing
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts);
async function setup(delay){
  const ctx=await b.newContext({viewport:{width:390,height:844}}); const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(e.message));
  if(delay>0) await ctx.route(/\/assets\/[0-9a-f]{12}\.webp/, async r=>{ await new Promise(x=>setTimeout(x,delay)); r.continue().catch(()=>{}); });
  if(delay<0) await ctx.route(/\/assets\/[0-9a-f]{12}\.webp/, r=>r.abort());
  await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
  await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
  await p.evaluate(()=>{ document.querySelectorAll('.milestone').forEach(e=>e.remove()); openGame(1); }); await p.waitForTimeout(200);
  return p; }
const win=p=>p.evaluate(()=>{ current=themeStory(gLogicGrid()); current.skill='x'; const q=current; const el=[...document.querySelectorAll('.choice')].find(c=>(c.dataset.key!==undefined?c.dataset.key===String(q.answer):c.textContent.trim()===String(q.answer).trim())); if(el) el.click(); return !!el; });
// 1. slow pictures: the prize is not shown empty; it appears once its pictures are there
let p=await setup(900);
await p.evaluate(()=>{ IMG_HOLD.clear(); IMG_DONE.clear(); });   // as on a first visit: nothing preloaded
const state=()=>p.evaluate(()=>{ const e=document.querySelector('.pfly'); if(!e) return null; const im=[...e.querySelectorAll('img')]; return {vis:getComputedStyle(e).visibility, n:im.length, loaded:im.filter(i=>i.complete&&i.naturalWidth>0).length}; });
await p.evaluate(()=>{ nextQuestion(); }); await p.waitForTimeout(100);
const clicked=await p.evaluate(()=>{ const q=current; const el=[...document.querySelectorAll('.choice')].find(c=>(c.dataset.key!==undefined?c.dataset.key===String(q.answer):c.textContent.trim()===String(q.answer).trim())); if(el){ el.click(); return true; } return false; });
ok(clicked,'answered right'); await p.waitForTimeout(250);
let s=await state();
ok(s&&s.n>=1,'the prize is on the page with its pictures ('+(s&&s.n)+')');
ok(s&&s.loaded<s.n&&s.vis==='hidden','while its pictures are still loading the prize is not shown ('+JSON.stringify(s)+')');
await p.waitForTimeout(1500); s=await state();
ok(s&&s.vis!=='hidden'&&s.loaded===s.n,'once they are loaded it is shown, all of them ('+JSON.stringify(s)+')');
await p.context().close();
// 2. a picture that never loads: the prize still shows (after 1.5 s at most) and nothing gets stuck
p=await setup(-1);
await p.evaluate(()=>{ nextQuestion(); }); await p.waitForTimeout(100);
await p.evaluate(()=>{ const q=current; const el=[...document.querySelectorAll('.choice')].find(c=>(c.dataset.key!==undefined?c.dataset.key===String(q.answer):c.textContent.trim()===String(q.answer).trim())); if(el) el.click(); });
await p.waitForTimeout(2300);
ok(await p.evaluate(()=>{ const e=document.querySelector('.pfly'); return !e || getComputedStyle(e).visibility!=='hidden'; }),'pictures that fail do not keep the prize hidden');
await p.waitForTimeout(7000);
ok(await p.locator('.pfly').count()===0&&await p.evaluate(()=>prizeBusy)===0,'and the prize is removed in the end (busy flag back to 0)');
await p.context().close();
// 3. preload: the reward art is loaded quietly, a few at a time, and never while a new version is waiting
p=await setup(0);
await p.evaluate(()=>{ warmRewardArt(); }); await p.waitForTimeout(3000);
const w=await p.evaluate(()=>({held:IMG_HOLD.size, all:rewardArtList().length}));
ok(w.held>=50&&w.held<=w.all,'reward art is being preloaded ('+w.held+' of '+w.all+' so far)');
ok(await p.evaluate(()=>{ const a=document.createElement('div'); a.innerHTML='<img src="assets/doesnotexist.webp">'; let ran=false; whenImgs(a,300,()=>{ran=true;}); return new Promise(r=>setTimeout(()=>r(ran),700)); }),'whenImgs gives up on a missing picture');
ok(await p.evaluate(()=>{ const a=document.createElement('div'); let ran=false; whenImgs(a,300,()=>{ran=true;}); return ran; }),'with nothing to wait for, it runs straight away (no extra delay)');
ok(await p.evaluate(()=>{ PWA.waiting={}; const n=IMG_HOLD.size; warmQ=null; return n; })>=0,'(a waiting update pauses the preload)');
const n0=await p.evaluate(()=>IMG_HOLD.size); await p.waitForTimeout(1500); ok(await p.evaluate(()=>IMG_HOLD.size)<=n0+3,'a waiting new version stops the preload');
ok(p.errs.length===0,'no page errors '+p.errs.join('|'));
await b.close(); process.exit(f?1:0);
})();
