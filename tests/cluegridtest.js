// the clue grid under the logic clue questions: layout, tap cycle, inert block, clear, hide, no effect on score/streak/rewards, help flag, 360px fit
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext({viewport:{width:360,height:740}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
const E=(fn,...a)=>p.evaluate(fn,...a);
await E(()=>{ document.body.dataset.view='play'; });
const SHOW=(two)=>E((two)=>{ current=themeStory(two?bLogicGrid2():gLogicGrid()); current.skill=two?'bLogicGrid2':'gLogicGrid'; current.isBonus=!!two; qToolOpen(current); renderAnswerArea(current,checkAnswer); startQTimer(); window.cells=()=>[...document.querySelectorAll('#qTool .cgc')]; },two);
// ---- regular: one attribute ----
await SHOW(false);
ok(await E(()=>!document.getElementById('qTool').hidden&&document.querySelector('.qtoolt').textContent==='טבלה לעזרה'),'the clue question shows the grid under a titled header');
ok(await E(()=>cells().length===9&&document.querySelectorAll('#qTool .cgx').length===0),'one attribute: 3 kids x 3 animals, nothing greyed');
ok(await E(()=>{ const m=current.tool.model, t=document.getElementById('qTool').textContent; return m.kids.every(n=>t.includes(n))&&m.pets.every(x=>t.includes(x)); }),'headers carry the names and the animals');
ok(await E(()=>cells().every(c=>c.getAttribute('aria-label')&&c.getAttribute('aria-label').endsWith(': ריק'))),'every cell has a label saying what it is and that it is empty');
// tap cycle
const c0=p.locator('#qTool .cgc').first();
await c0.click(); let t1=await c0.textContent(); await c0.click(); let t2=await c0.textContent(); await c0.click(); let t3=await c0.textContent();
ok(t1==='✗'&&t2==='✓'&&t3==='','a cell cycles empty -> ✗ -> ✓ -> empty: '+[t1,t2,t3]);
await c0.click(); ok((await c0.getAttribute('aria-label')).endsWith(': לא'),'the label follows the mark');
// no effect on anything
const snap=()=>E(()=>JSON.stringify({sc:typeof score!=='undefined'?score:null,st:typeof streak!=='undefined'?streak:null,log:activeProfile().stats.log.length,col:collection.length,lol:lollipops.length}));
const s0=await snap(); await c0.click(); await c0.click(); await p.locator('#qTool .cgclr').click();
ok(await snap()===s0,'marking and clearing change no score, streak, collection, lollipops or log');
ok(await E(()=>cells().every(c=>c.dataset.v==='0'&&c.textContent==='')),'clear empties the grid');
// the grid does not check anything: marking the right answer cell leaves answer area untouched
ok(await E(()=>!document.getElementById('feedback').textContent),'no feedback appears from marking');
// help flag
await E(()=>{ activeProfile().stats=statsNew(); });
await SHOW(false); await p.locator('#qTool .cgc').nth(2).click();
await E(()=>checkAnswer(current.answer,null,null));
ok(await E(()=>{ const r=activeProfile().stats.log.slice(-1)[0]; return r&&r.h===1&&r.c===1; }),'using the grid before answering is recorded as h=1 (answer still counted as it was)');
await SHOW(false); await E(()=>checkAnswer(current.answer,null,null));
ok(await E(()=>activeProfile().stats.log.slice(-1)[0].h===undefined),'without touching the grid there is no h');
// hide / show
await SHOW(false); await p.locator('.qtoolb').click();
ok(await E(()=>document.querySelector('.qtoolbody').hidden),'hide works');
await p.locator('.qtoolb').click(); await p.locator('#qTool .cgc').first().click();
await p.locator('.qtoolb').click(); await p.locator('.qtoolb').click();
ok((await p.locator('#qTool .cgc').first().textContent())==='✗','marks survive hide and show');
// ---- bonus: two attributes ----
await SHOW(true);
ok(await E(()=>cells().length===27&&document.querySelectorAll('#qTool .cgx').length===9),'two attributes: 27 live cells (kids x animals, kids x fruits, animals x fruits) and a greyed animals x animals block of 9');
ok(await E(()=>{ const x=document.querySelector('#qTool .cgx'); return x.tagName!=='BUTTON'&&x.getAttribute('aria-hidden')==='true'; }),'the greyed block is inert and hidden from screen readers');
await p.locator('#qTool .cgx').first().click({force:true}); ok(await E(()=>cells().every(c=>c.dataset.v==='0')),'tapping the greyed block does nothing');
// fits 360px
ok(await E(()=>{ const r=document.getElementById('qTool').getBoundingClientRect(); return document.documentElement.scrollWidth<=window.innerWidth && r.right<=window.innerWidth+0.5 && r.left>=-0.5; }),'no horizontal overflow at 360px');
ok(await E(()=>cells().every(c=>{ const r=c.getBoundingClientRect(); return r.width>=43.5&&r.height>=43.5; })),'every cell is at least 44px');
ok(await E(()=>{ const e=document.getElementById('qTool').getBoundingClientRect(); return [...document.querySelectorAll('#qTool .cg > *')].every(x=>{const r=x.getBoundingClientRect(); return r.left>=e.left-0.5&&r.right<=e.right+0.5&&r.left>=0&&r.right<=window.innerWidth;}); }),'every cell and header stays inside its box and the screen');
// marks are per question
await p.locator('#qTool .cgc').first().click();
await SHOW(true);
ok(await E(()=>cells().every(c=>c.dataset.v==='0')),'a new question starts with an empty grid');
// removed on next regular question, and only clue questions carry it
const kinds=await E(()=>{ level=4; let tool=0, none=0, bad=0; for(let i=0;i<200;i++){ nextQuestion(); const has=!document.getElementById('qTool').hidden; if(has!==!!(current.tool&&current.tool.kind==='clueGrid')) bad++; has?tool++:none++; } return {tool,none,bad}; });
ok(kinds.bad===0&&kinds.none>0&&kinds.tool>0,'the grid is there exactly for the questions that carry it: '+JSON.stringify(kinds));
// answering is scored the same with or without the grid
const scoreWith=async(use)=>E((use)=>{ score=0; streak=0; current=gLogicGrid(); current.skill='gLogicGrid'; qToolOpen(current); renderAnswerArea(current,checkAnswer); startQTimer(); if(use) document.querySelector('#qTool .cgc').click(); checkAnswer(current.answer,null,null); return JSON.stringify([score,streak]); },use);
const a1=await scoreWith(false), a2=await scoreWith(true);
ok(a1===a2,'a correct answer scores and streaks the same with or without the grid: '+a1+' / '+a2);
const wrongWith=async(use)=>E((use)=>{ score=0; streak=3; current=gLogicGrid(); current.skill='gLogicGrid'; qToolOpen(current); renderAnswerArea(current,checkAnswer); startQTimer(); if(use) document.querySelector('#qTool .cgc').click(); checkAnswer('אי אפשר לדעת',null,null); return JSON.stringify([score,streak]); },use);
const w1=await wrongWith(false), w2=await wrongWith(true);
ok(w1===w2,'a wrong answer is treated the same with or without the grid: '+w1+' / '+w2);
// setting off
await E(()=>{ setProfileTools(activeProfile(),false); }); await SHOW(false);
ok(await E(()=>document.getElementById('qTool').hidden),'with the parents switch off the grid is not shown');
await E(()=>{ setProfileTools(activeProfile(),true); });
// space theme
await E(()=>{ themeId='space'; }); await SHOW(true);
ok(await E(()=>cells().length===27&&!document.getElementById('qTool').hidden),'works under the space theme');
await E(()=>{ themeId='default'; });
// 500 generated questions: every cell label names a kid/animal/fruit present in the model
ok(await E(()=>{ for(let i=0;i<200;i++){ const q=i%2?bLogicGrid2():gLogicGrid(); if(!q.tool) continue; const m=q.tool.model; const d=document.createElement('div'); const ctx={state:{},q,used(){}}; QTOOLS.clueGrid.mount(d,m,ctx); const n=d.querySelectorAll('.cgc').length; if(n!==(m.two?27:9)) return false; if([...d.querySelectorAll('.cgc')].some(c=>!c.dataset.n||/undefined/.test(c.dataset.n+d.textContent))) return false; } return true; }),'200 generated questions mount cleanly with the right cell count');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close(); console.log(f?'FAILED '+f:'ALL OK'); process.exit(f?1:0);
})();
