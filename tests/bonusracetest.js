// the party and the bonus question after a 5th correct answer: the bonus appears once, stays put, and never lands after she has moved on
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts);
async function setup(){
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(e.message));
  await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
  await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
  await p.evaluate(()=>{ document.querySelectorAll('.milestone').forEach(e=>e.remove()); openGame(1); }); await p.waitForTimeout(200);
  return p; }
const ev=(p,fn,...a)=>p.evaluate(fn,...a);
const snap=p=>ev(p,()=>JSON.stringify({b:bonusActive,t:document.getElementById('qtext').textContent,i:current.isBonus,o:document.querySelectorAll('.milestone').length}));

// 1. a tap on the party, then the 5-second timer: the bonus is shown once and does not change
let p=await setup();
await ev(p,()=>{ bonusActive=false; showMilestone(); }); await p.waitForTimeout(300);
await ev(p,()=>document.querySelector('.milestone').click()); await p.waitForTimeout(200);
const s1=await snap(p); const cur1=await ev(p,()=>{ window.__c=current; return 1; });
ok(JSON.parse(s1).b&&JSON.parse(s1).i,'tapping the party shows a bonus question');
await p.waitForTimeout(5600);
ok(await snap(p)===s1&&await ev(p,()=>current===window.__c),'5 seconds later it is still the same bonus question (it used to be swapped for another)');
// 2. only the timer
await ev(p,()=>{ nextQuestion(); showMilestone(); }); await p.waitForTimeout(5400);
const s2=await snap(p); ok(JSON.parse(s2).b&&JSON.parse(s2).o===0,'with no tap the party closes by itself and shows the bonus');
await ev(p,()=>{ window.__c=current; }); await p.waitForTimeout(2500);
ok(await ev(p,()=>current===window.__c),'and it stays');
// 3. a late party does not start on a question she has moved past
await ev(p,()=>{ nextQuestion(); window.__ep=qEpoch; nextQuestion(); showMilestone(window.__ep); });
ok(await ev(p,()=>document.querySelectorAll('.milestone').length===0&&!bonusActive),'a party scheduled for an earlier question is dropped');
// 4. she moves on while the party is open: no bonus afterwards
await ev(p,()=>{ showMilestone(); }); await p.waitForTimeout(200);
await ev(p,()=>{ nextQuestion(); }); const q4=await ev(p,()=>current); 
await p.waitForTimeout(5400);
ok(await ev(p,()=>!bonusActive&&!current.isBonus&&document.querySelectorAll('.milestone').length===0),'a party that is still open when she moves on does not bring a bonus over the next question');
// 5. the real flow: Next is not offered while the party and bonus are on their way
await ev(p,()=>{ nextQuestion(); streak=4; }); await p.waitForTimeout(200);
await ev(p,()=>{ const q=current; const el=[...document.querySelectorAll('.choice')].find(c=>(c.dataset.key!==undefined?c.dataset.key===String(q.answer):c.textContent.trim()===String(q.answer).trim()))||document.querySelector('.choice'); el.click(); });
await p.waitForTimeout(300);
ok(await ev(p,()=>document.getElementById('nextBtn').style.display==='none'),'after the 5th correct answer the Next button waits for the party');
let seen=false; for(let i=0;i<60&&!seen;i++){ await p.waitForTimeout(100); seen=await ev(p,()=>!!document.querySelector('.milestone')); }
ok(seen,'the party comes');
await ev(p,()=>document.querySelector('.milestone').click()); await p.waitForTimeout(300);
ok(await ev(p,()=>bonusActive&&current.isBonus),'then the bonus question');
const s5=await snap(p); await p.waitForTimeout(5600);
ok(await snap(p)===s5,'and the bonus question does not change');
// answering the bonus brings Next back; Next gives a normal question
await ev(p,()=>{ const q=current; const el=[...document.querySelectorAll('.choice')].find(c=>(c.dataset.key!==undefined?c.dataset.key===String(q.answer):c.textContent.trim()===String(q.answer).trim()))||document.querySelector('.choice'); el.click(); }); await p.waitForTimeout(300);
ok(await ev(p,()=>document.getElementById('nextBtn').style.display==='block'),'after the bonus is answered Next is there');
// 6. an ordinary 5th answer after a wrong one is unaffected; the flag does not stick
await ev(p,()=>nextQuestion()); await p.waitForTimeout(100);
ok(await ev(p,()=>milestoneDue===false),'the waiting flag is cleared once the next question is shown');
ok(p.errs.length===0,'no page errors '+p.errs.join('|'));
await b.close(); console.log(f?'FAILED '+f:'ALL OK'); process.exit(f?1:0);
})();
