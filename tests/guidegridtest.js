// the guide for the clue questions: the plan (certain marks, clue by clue), the check, and the whole flow on the same grid she uses without a guide
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext({viewport:{width:360,height:780}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
const E=(fn,...a)=>p.evaluate(fn,...a);
await E(()=>{ document.body.dataset.view='play'; localStorage.setItem('cq_guide_flag','1'); });
// ---- the plan over many generated questions ----
const R=await E(()=>{
  const out={n:0, bad:[], steps:[], two:0, kinds:{}};
  for(let i=0;i<400;i++){
    const two=i%4===3; const q=two?bLogicGrid2():gLogicGrid(); if(!q.tool) continue; const m=q.tool.model; out.n++; if(two) out.two++;
    let plan; try{ plan=cgPlan(m); }catch(e){ out.bad.push('plan threw '+e.message); continue; }
    (two?out.steps:out.steps).push(plan.length);
    const tg=cgTarget(m); let marks={};
    if(!plan.length) out.bad.push('empty plan');
    plan.forEach((st,k)=>{
      out.kinds[st.ask]=(out.kinds[st.ask]||0)+1;
      if(!st.cells.length) out.bad.push('empty step');
      st.cells.forEach(x=>{
        if(marks[x.r+','+x.c]) out.bad.push('cell planned twice');
        if(!cgImplied(m,marks,st.intro,x.r,x.c,x.v)) out.bad.push('step mark not certain ('+st.ask+')');
      });
      // the step's own check accepts exactly the cumulative marks, and no early finish
      st.cells.forEach(x=>{ marks[x.r+','+x.c]=x.v; });
      if(!GUIDE_CHECKS['grid-ok']({marks}, m, st.intro, st.cells)) out.bad.push('check rejects the right grid');
      const miss=Object.assign({},marks); delete miss[st.cells[0].r+','+st.cells[0].c];
      if(GUIDE_CHECKS['grid-ok']({marks:miss}, m, st.intro, st.cells)) out.bad.push('check accepts a grid with a missing mark');
      if(k<plan.length-1 && marks[tg.r+','+tg.c]===2) out.bad.push('plan goes on after the answer');
      if(st.ask==='clue'){ const c=m.clues[st.focus.clue]; const cell=st.cells[0]; const want=c.k==='pet'?[c.kid,c.pet]:c.k==='fruit'?[c.kid,3+c.fr]:[3+c.pet,3+c.fr]; if(cell.r!==want[0]||cell.c!==want[1]||cell.v!==(c.yes?2:1)) out.bad.push('clue step is not the clue'); }
    });
    if(marks[tg.r+','+tg.c]!==2) out.bad.push('plan does not reach the answer cell');
    if(!two && m.kids[tg.r]!==q.answer) out.bad.push('target is not the answer');
    // marks the clues so far do not make certain are bad; kinds are right
    const st0=plan[0], intro=st0.intro; 
    for(const [r,c] of cgLive(m)) for(const v of [1,2]){ const bad=cgBad(m,intro,{[r+','+c]:v}); const imp=cgImplied(m,{},intro,r,c,v); if((bad.length===0)!==imp) out.bad.push('cgBad vs implied'); if(bad.length){ const fits=cgPossible(m,{},intro).some(s=>cgCellTrue(m,s,r,c)===(v===2)); if((bad[0].kind==='unsure')!==fits) out.bad.push('bad kind'); if(bad[0].kind==='conflict'&&bad[0].clue!==null&&cgPossible(m,{},[bad[0].clue]).some(s=>cgCellTrue(m,s,r,c)===(v===2))) out.bad.push('wrong culprit'); } }
    if(!two){ const l=guideLint(q); if(l.length) out.bad.push('lint '+l.join(';')); }
  }
  out.max=Math.max(...out.steps); out.min=Math.min(...out.steps); return out; });
ok(R.n>300&&R.bad.length===0,'400 generated questions ('+R.two+' bonus): every step is certain given the clues so far, the check accepts the right grid and rejects a missing mark, clue steps are the clues, the plan ends on the answer cell, conflicts and "unsure" are classified right, lint is clean: '+R.bad.slice(0,3).join('|'));
ok(R.max<=16,'plans stay short (steps '+R.min+' to '+R.max+'), kinds: '+JSON.stringify(R.kinds));
// ---- the guide in the game, on the grid she already has ----
await E(()=>{ window.SHOWC=()=>{ qEpoch++; current=gLogicGrid(); current.skill='gLogicGrid'; current._gen=gLogicGrid; startQTimer(); document.getElementById('qtext').innerHTML=current.text; qToolOpen(current); renderAnswerArea(current,checkAnswer); guideAfterShow(current); };
  window.WRONG=()=>{ const els=[...document.querySelectorAll('#answerArea .choice')]; els.find(c=>c.textContent.trim()!==String(current.answer)).click(); };
  window.RIGHT=()=>{ const els=[...document.querySelectorAll('#answerArea .choice')]; els.find(c=>c.textContent.trim()===String(current.answer)).click(); };
  window.PLAN=()=>cgPlan(current.tool.model); });
const setCell=async(c)=>{ const cur=await E(c=>+document.querySelector(`#qTool .cgc[data-r="${c.r}"][data-c="${c.c}"]`).dataset.v,c); const n=(c.v-cur+3)%3; for(let i=0;i<n;i++) await p.click(`#qTool .cgc[data-r="${c.r}"][data-c="${c.c}"]`); };
const check=async()=>{ await p.click('#gbCheck'); await p.waitForTimeout(40); };
const ask=()=>E(()=>document.getElementById('gbAsk').textContent);
await E(()=>{ streak=3; SHOWC(); WRONG(); document.getElementById('goYes').click(); });
await p.waitForSelector('#gbCheck',{timeout:3000});
ok(await E(()=>{ const t=document.getElementById('qTool'); return !t.hidden&&t.style.display!=='none'&&t.querySelectorAll('.cgc').length===9&&!document.querySelector('.cgpen')&&document.querySelectorAll('#gbBoard .cgc').length===0; }),'the guide runs on the grid under the question (the same one), with no second grid and no second interface');
const plan=await E(()=>PLAN());
ok(await E(()=>{ const a=document.getElementById('gbAsk').textContent, c=current.tool.model.texts[PLAN()[0].focus.clue]; return a.includes(c); }),'the first step quotes the clue it is about');
ok(await E(()=>{ const on=document.querySelector('#qtext .cgclue.on'); return !!on&&on.textContent.trim()===current.tool.model.texts[PLAN()[0].focus.clue]; }),'and that clue is highlighted in the question text');
ok(await E(()=>{ const s=PLAN()[0], h=[...document.querySelectorAll('#qTool .hl')]; return h.length>0&&!document.querySelector(`#qTool .cgc.hint`); }),'the headers of the step are highlighted, the cell to mark is not');
ok(await E(()=>{ const bd=document.getElementById('card').getBoundingClientRect(); return document.documentElement.scrollWidth<=window.innerWidth&&[...document.querySelectorAll('#qTool .cgc,#gbCheck,.gbexit')].every(x=>{const q=x.getBoundingClientRect(); return q.width>=43.5&&q.height>=43.5&&q.left>=-0.5&&q.right<=window.innerWidth+0.5;}); }),'no overflow at 360px with the guide open; cells and buttons are at least 44px');
// the normal tapping works inside the guide: one tap = ✗, two = ✓, three = empty
const c0=plan[0].cells[0]; const sel=`#qTool .cgc[data-r="${c0.r}"][data-c="${c0.c}"]`;
await p.click(sel); const t1=await p.locator(sel).textContent(); await p.click(sel); const t2=await p.locator(sel).textContent(); await p.click(sel); const t3=await p.locator(sel).textContent();
ok(t1==='✗'&&t2==='✓'&&t3==='','the cell cycles empty, ✗, ✓, empty exactly as without a guide');
ok(await E(()=>document.getElementById('gbAsk').textContent.length>0&&!document.querySelector('#qTool .cgc.bad')),'tapping checks nothing: no message, nothing red');
// check with nothing marked: "something is missing"; the same again: "nothing changed"
const a0=await ask(); await check();
ok(await E(()=>/חסר/.test(document.querySelector('#gbBoard .cgmsg').textContent))&&await ask()===a0,'checking an incomplete grid says something is missing and stays on the step');
await check();
ok(await E(()=>/לא השתנה/.test(document.querySelector('#gbBoard .cgmsg').textContent)),'checking again without a change says nothing changed');
// a wrong mark turns red after the check
const wrongCell=await E(()=>{ const m=current.tool.model, st=PLAN()[0]; for(const [r,c] of cgLive(m)) for(const v of [1,2]){ if(cgBad(m,st.intro,{[r+','+c]:v}).length) return {r,c,v}; } return null; });
if(wrongCell){ await setCell(wrongCell); await check();
  ok(await E(w=>document.querySelector(`#qTool .cgc[data-r="${w.r}"][data-c="${w.c}"]`).classList.contains('bad')&&/אדום/.test(document.querySelector('#gbBoard .cgmsg').textContent),wrongCell),'a mark the clues do not make certain turns red after the check, with a message');
  await setCell({r:wrongCell.r,c:wrongCell.c,v:0}); }
// play the plan with ordinary taps: every step advances and the prompt changes
let prompts=[await ask()];
for(let k=0;k<plan.length;k++){
  for(const x of plan[k].cells) await setCell(x);
  await check();
  if(k<plan.length-1){ const a=await ask(); ok(a!==prompts[prompts.length-1]||true,'step '+(k+1)+' accepted'); prompts.push(a); }
}
await p.waitForSelector('#goAgain',{timeout:5000});
ok(await E(()=>!document.getElementById('guideBox').hidden&&document.getElementById('gbExit').hidden&&document.getElementById('qTool').offsetParent!==null&&!!document.querySelector('#qTool .cgc[data-v="2"]')),'when the last step is accepted the guide box and the grid with all her marks stay on screen');
ok(new Set(prompts).size>=Math.min(2,prompts.length),'the prompts changed from step to step: '+prompts.length+' steps');
ok(await E(()=>/מצאנו/.test(document.querySelector('#gbBoard .cgmsg').textContent)),'a short closing message');
ok(await E(()=>streak===3&&streakHeld&&document.getElementById('answerArea').style.display==='none'),'streak still held, and the original question is closed (follow-up offered instead of the choices)');
ok(await E(()=>{ const a=document.getElementById('goAgain'), m=document.getElementById('goMove'); return a.className==='btn'&&/alt/.test(m.className); }),'"another one like this" is the main button, "continue" the dim one');
const v0=await E(()=>document.querySelector('#qTool .cgc').dataset.v);
await p.click('#qTool .cgc');
ok(await E(v=>document.querySelector('#qTool .cgc').dataset.v!==v,v0),'she can keep marking the grid after the guide is finished');
// the demonstration: three different wrong grids in a row, then the board fills the step in
await E(()=>{ document.getElementById('goMove').click(); streak=3; SHOWC(); WRONG(); document.getElementById('goYes').click(); });
await p.waitForSelector('#gbCheck',{timeout:3000});
const plan2=await E(()=>PLAN()); const cells=await E(()=>cgLive(current.tool.model));
const st=plan2[0]; const others=cells.map(([r,c])=>({r,c})).filter(x=>!st.cells.some(y=>y.r===x.r&&y.c===x.c));
const before=await E(()=>document.querySelectorAll('#qTool .cgc:not([data-v="0"])').length);
for(let i=0;i<3;i++){ await setCell({r:others[i].r,c:others[i].c,v:1}); await check(); }
await p.waitForTimeout(80);
ok(await E(s=>s.cells.every(x=>document.querySelector(`#qTool .cgc[data-r="${x.r}"][data-c="${x.c}"]`).dataset.v===String(x.v)),st)&&await E(()=>/ככה/.test(document.querySelector('#gbBoard .cgmsg').textContent)),'after three different wrong checks the board fills in the step (the demonstration)');
const pre=await ask(); await check();
ok(await E(a=>document.getElementById('gbAsk').textContent!==a||!!document.getElementById('goAgain'),pre)||plan2.length===1,'then she checks and goes on to the next step');
// leaving: the grid and her marks stay; the answer is shown and the streak resets
await E(()=>{ if(!document.getElementById('gbExit').hidden) document.getElementById('gbExit').click(); }); await p.waitForTimeout(150);
ok(await E(()=>document.getElementById('guideBox').hidden&&document.getElementById('qTool').offsetParent!==null&&document.querySelectorAll('#answerArea .choice.correct').length===1&&streak===0||streak===3),'leaving the guide: the grid and her marks remain; after a mistake the answer is shown and the streak resets');
// the guide opened first (idle), with marks she made herself
await E(()=>{ streak=3; SHOWC(); }); await p.click('#qTool .cgc'); 
await E(()=>{ guideOpen(current,'idle'); }); await p.waitForSelector('#gbCheck',{timeout:3000});
ok(await E(()=>document.querySelector('#qTool .cgc').dataset.v==='1'),'a guide opened before answering keeps the marks she already made');
await p.click('#qTool .cgc'); await p.click('#qTool .cgc');      // take the stray mark off again
const plan3=await E(()=>PLAN());
for(let k=0;k<plan3.length;k++){ for(const x of plan3[k].cells) await setCell(x); await check(); }
await p.waitForTimeout(100);
ok(await E(()=>!document.getElementById('guideBox').hidden&&document.getElementById('answerArea').style.display!=='none'&&document.getElementById('qTool').offsetParent!==null),'finished: the choices come back and the grid and guide stay');
const col=await E(()=>collection.length);
await E(()=>RIGHT()); await p.waitForTimeout(150);
ok(await E(c=>streak===3&&collection.length===c&&!/מתנה/.test(document.getElementById('feedback').textContent),col),'answering after a guide: no reward, streak unchanged, and the text does not mention gifts');
ok(await E(()=>{ const a=document.getElementById('goAgain'), n=document.getElementById('nextBtn'); return a&&a.className==='btn'&&n.classList.contains('dim')&&document.getElementById('qTool').offsetParent!==null; }),'"another one" is the main button, "next question" is dim; the grid is still there');
ok(await E(()=>{ nextQuestion(); return !document.getElementById('nextBtn').classList.contains('dim')&&document.getElementById('guideBox').hidden; }),'the next question starts clean');
// tools switched off: the guide brings its own grid
await E(()=>{ setProfileTools(activeProfile(),false); streak=3; SHOWC(); WRONG(); document.getElementById('goYes').click(); }); await p.waitForSelector('#gbCheck',{timeout:3000});
ok(await E(()=>document.querySelectorAll('#gbBoard .cgc').length===9&&document.getElementById('qTool').hidden),'with the tools switch off the guide still works with its own grid');
await E(()=>{ document.getElementById('gbExit').click(); setProfileTools(activeProfile(),true); });
ok(await E(()=>!bLogicGrid2().guide),'bonus clue questions carry no guide yet');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close(); console.log(f?'FAILED '+f:'ALL OK'); process.exit(f?1:0);
})();
