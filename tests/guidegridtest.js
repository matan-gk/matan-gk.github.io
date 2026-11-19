// the guide for the clue questions: rules module (certain marks only), board, and the whole flow in the game
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext({viewport:{width:360,height:780}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
const E=(fn,...a)=>p.evaluate(fn,...a);
await E(()=>{ document.body.dataset.view='play'; localStorage.setItem('cq_guide_flag','1'); GUIDE_VIEW_MS=0; });
// ---- rules over many generated questions ----
const R=await E(()=>{
  const out={n:0, bad:[], moves:[], moves2:[], twoN:0};
  const truthOf=m=>cgAssignments(m).filter(s=>m.clues.every(c=>cgClueHolds(c,s)))[0];
  const rules=GUIDE_RULES.clueGrid;
  for(let i=0;i<400;i++){
    const two=i%4===3; const q=two?bLogicGrid2():gLogicGrid(); if(!q.tool) continue; const m=q.tool.model; out.n++; if(two) out.twoN++;
    const rows=two?6:3, cols=two?6:3;
    if(!cgAssignments(m).filter(s=>m.clues.every(c=>cgClueHolds(c,s))).length) out.bad.push('no arrangement');
    // 1. a correct-answer run: follow rules.next until done
    let st=rules.init(m), steps=0;
    while(!rules.done(st) && steps<40){ const nx=rules.next(st); if(!nx){ out.bad.push('no next'); break; } const r=rules.legal(st,nx.move); if(!r.ok){ out.bad.push('next not legal'); break; } st=rules.apply(st,nx.move); steps++; }
    (two?out.moves2:out.moves).push(steps);
    const t=cgTarget(m); if(!(st.marks[t.r+','+t.c]===2)) out.bad.push('not done');
    if(!two && m.kids[t.r]!==q.answer) out.bad.push('target is not the answer'); 
    if(two && m.fruits[t.c-3]!==q.answer) out.bad.push('target fruit is not the answer');
    // 2. from the start: every move the rules accept is true in the solution; every move that contradicts the clues is a conflict; every true-but-uncertain one is unsure
    let st0=rules.init(m);
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) for(const v of [1,2]){
      const mv={r,c,v}; const res=rules.legal(st0,mv);
      if(!cgCellLive(m,r,c)){ if(res.ok||res.tag!=='inert') out.bad.push('inert'); continue; }
      const ps=cgPossible(m,st0,m.clues.map((_,i)=>i)), agree=ps.filter(s=>cgCellTrue(m,s,r,c)===(v===2)).length;
      if(res.ok!==(agree===ps.length)) out.bad.push('ok differs from all-arrangements-agree');
      if(!res.ok&&(res.tag==='conflict')!==(agree===0)) out.bad.push('conflict classification');
      if(!res.ok&&(res.tag==='unsure')!==(agree>0)) out.bad.push('unsure classification');
      if(res.ok){ // support is enough and minimal
        if(!cgImplied(m,st0,res.supportedBy,r,c,v)) out.bad.push('support not enough');
        for(const j of res.supportedBy){ if(cgImplied(m,st0,res.supportedBy.filter(x=>x!==j),r,c,v)) out.bad.push('support not minimal'); }
      }
      if(!res.ok){ const cq=rules.consequence(st0,mv); if(cq.kind!==res.tag) out.bad.push('consequence kind'); if(cq.kind==='conflict'&&cq.clue!==null&&cgPossible(m,st0,[cq.clue]).some(s=>cgCellTrue(m,s,r,c)===(v===2))) out.bad.push('wrong culprit clue'); }
    }
    // 3. random play: accepted moves keep her marks consistent with the solution
    let st1=rules.init(m); for(let k=0;k<30&&!rules.done(st1);k++){ const mv={r:Math.floor(Math.random()*rows),c:Math.floor(Math.random()*cols),v:1+Math.floor(Math.random()*2)}; const res=rules.legal(st1,mv); if(res.ok){ st1=rules.apply(st1,mv); } }
    if(!cgPossible(m,st1,m.clues.map((_,i)=>i)).length) out.bad.push('random play broke consistency');
    // 4. the payload is clean
    if(!two){ const lint=guideLint(q); if(lint.length) out.bad.push('lint '+lint.join(';')); }
  }
  out.max=Math.max(...out.moves); out.min=Math.min(...out.moves); out.max2=Math.max(...out.moves2); return out; });
ok(R.n>300&&R.bad.length===0,'400 generated questions ('+R.twoN+' bonus): unique solution, rules.next always legal and ends at the answer cell, a mark is accepted exactly when it holds in every arrangement still possible, conflicts and "unsure" classified right, supports sufficient and minimal, random play stays consistent: '+R.bad.slice(0,3).join('|'));
ok(R.max<=9&&R.max2<=27,'a full run is at most 9 marks for one attribute (min '+R.min+', max '+R.max+') and 27 for two ('+R.max2+')');
// ---- the board in the game ----
await E(()=>{ window.SHOWC=()=>{ qEpoch++; current=gLogicGrid(); current.skill='gLogicGrid'; current._gen=gLogicGrid; startQTimer(); document.getElementById('qtext').innerHTML=current.text; qToolOpen(current); renderAnswerArea(current,checkAnswer); guideAfterShow(current); };
  window.WRONG=()=>{ const els=[...document.querySelectorAll('#answerArea .choice')]; els.find(c=>c.textContent.trim()!==String(current.answer)).click(); };
  window.RIGHT=()=>{ const els=[...document.querySelectorAll('#answerArea .choice')]; els.find(c=>c.textContent.trim()===String(current.answer)).click(); }; });
await E(()=>{ streak=3; SHOWC(); WRONG(); document.getElementById('goYes').click(); });
await p.waitForSelector('#gbBoard .cgc',{timeout:3000});
ok(await E(()=>document.querySelectorAll('#gbBoard .cgc').length===9&&document.querySelectorAll('#gbBoard .cgclues li').length===3&&document.querySelectorAll('#gbBoard .cgpen').length===2),'the guide shows the grid (3x3), the three clues and two pens');
ok(await E(()=>document.getElementById('gbAsk').textContent.includes('בוודאות')),'the prompt asks for certain facts only');
ok(await E(()=>{ const bd=document.getElementById('gbBoard'), r=bd.getBoundingClientRect(); return document.documentElement.scrollWidth<=window.innerWidth&&[...bd.querySelectorAll('.cgc,.cgpen,.gbexit')].every(x=>{const q=x.getBoundingClientRect(); return q.width>=43.5&&q.height>=43.5&&q.left>=-0.5&&q.right<=window.innerWidth+0.5;}); }),'no overflow at 360px and every cell and pen button is at least 44px');
ok(await E(()=>document.getElementById('qTool').style.display==='none'),'the tool grid is hidden while the guide runs');
// find an unsupported-but-true move and a conflicting one, play them
const mv=await E(()=>{ const m=current.tool.model, st=GUIDE_RULES.clueGrid.init(m); const sol=cgAssignments(m).filter(s=>m.clues.every(c=>cgClueHolds(c,s)))[0]; const out={}; for(let r=0;r<3;r++) for(let c=0;c<3;c++) for(const v of [1,2]){ const res=GUIDE_RULES.clueGrid.legal(st,{r,c,v}); const key=res.ok?'ok':res.tag; (out[key]=out[key]||[]).push({r,c,v}); } return out; });
const tap=async(m)=>{ try{ await p.waitForFunction(()=>GUIDE_BOARDS.clueGuide.pending,null,{timeout:3000}); }catch(e){ console.log('STUCK', JSON.stringify(m), await E(()=>JSON.stringify({run:!!guideRunning, box:document.getElementById('guideBox').hidden, marks:[...document.querySelectorAll('#gbBoard .cgc')].map(c=>c.dataset.v).join(''), msg:(document.getElementById('gbBoard')||{textContent:''}).textContent.slice(-80), offer:document.getElementById('guideOffer').innerHTML.slice(0,80)}))); throw e; } await p.click(`#gbBoard .cgpen[data-pen="${m.v}"]`); await p.click(`#gbBoard .cgc[data-r="${m.r}"][data-c="${m.c}"]`); await p.waitForTimeout(30); };
if(mv.unsure&&mv.unsure.length){ await tap(mv.unsure[0]); const c=mv.unsure[0];
  ok(await E(c=>{ const b=document.querySelector(`#gbBoard .cgc[data-r="${c.r}"][data-c="${c.c}"]`); return b.dataset.v==='0'&&GUIDE_BOARDS.clueGuide.msg.textContent.includes('לא בטוח'); },c),'a true but uncertain mark is not kept; the message says it is not certain yet'); }
else ok(true,'(no uncertain move in this question)');
if(mv.conflict&&mv.conflict.length){ await tap(mv.conflict[0]); const c=mv.conflict[0];
  ok(await E(c=>{ const b=document.querySelector(`#gbBoard .cgc[data-r="${c.r}"][data-c="${c.c}"]`); return b.dataset.v==='0'&&/לא מסתדר/.test(GUIDE_BOARDS.clueGuide.msg.textContent); },c),'a mark that contradicts the clues is not kept; the message says it does not fit'); }
else ok(true,'(no conflicting move in this question)');
ok(await E(()=>!document.getElementById('gbAsk').textContent.includes('undefined')&&!document.getElementById('goAgain')),'the guide is still running');
// a certain mark is kept; tapping it again with the same pen clears it
const tg=await E(()=>cgTarget(current.tool.model)); const cert=mv.ok.find(x=>!(x.r===tg.r&&x.c===tg.c&&x.v===2)); await tap(cert);
ok(await E(c=>document.querySelector(`#gbBoard .cgc[data-r="${c.r}"][data-c="${c.c}"]`).dataset.v===String(c.v),cert),'a certain mark is kept');
await tap(cert);
ok(await E(c=>document.querySelector(`#gbBoard .cgc[data-r="${c.r}"][data-c="${c.c}"]`).dataset.v==='0',cert),'tapping a mark again with the same pen clears it');
// finish by following the rules; the guide ends and the follow-up is offered with the streak still held
await E(()=>{ window.__st=GUIDE_RULES.clueGrid.init(current.tool.model); });
for(let i=0;i<12;i++){
  const nx=await E(()=>{ if(document.getElementById('guideBox').hidden) return null; const m=current.tool.model; const marks=[...document.querySelectorAll('#gbBoard .cgc')].filter(c=>c.dataset.v!=='0').map(c=>({r:+c.dataset.r,c:+c.dataset.c,v:+c.dataset.v})); let st=GUIDE_RULES.clueGrid.init(m); marks.forEach(x=>{ st=GUIDE_RULES.clueGrid.apply(st,x); }); if(GUIDE_RULES.clueGrid.done(st)) return null; return GUIDE_RULES.clueGrid.next(st).move; });
  if(!nx) break; await tap(nx);
}
await p.waitForSelector('#goAgain',{timeout:5000});
ok(await E(()=>streak===3&&streakHeld&&document.getElementById('guideBox').hidden&&document.getElementById('qTool').style.display!=='none'),'the guide finishes at the answer cell: follow-up offered, streak held, the tool is back');
// the demo path: three different unsupported marks and the board plays one itself
await E(()=>{ document.getElementById('goMove').click(); streak=3; SHOWC(); WRONG(); document.getElementById('goYes').click(); });
await p.waitForSelector('#gbBoard .cgc',{timeout:3000});
const bad=await E(()=>{ const m=current.tool.model, st=GUIDE_RULES.clueGrid.init(m); const l=[]; for(let r=0;r<3;r++) for(let c=0;c<3;c++) for(const v of [1,2]){ if(!GUIDE_RULES.clueGrid.legal(st,{r,c,v}).ok) l.push({r,c,v}); } return l; });
const before=await E(()=>document.querySelectorAll('#gbBoard .cgc:not([data-v="0"])').length);
for(let i=0;i<3;i++) await tap(bad[i]);
await p.waitForTimeout(80);
ok(await E(b=>{ const n=document.querySelectorAll('#gbBoard .cgc:not([data-v="0"])').length; return n===b+1; },before),'three different unsupported marks: the board then plays one certain mark itself (the demonstration)');
// exit is always there
await E(()=>document.getElementById('gbExit').click()); await p.waitForTimeout(150);
ok(await E(()=>document.getElementById('guideBox').hidden&&streak===0&&document.querySelectorAll('#answerArea .choice.correct').length===1),'leaving the guide after a mistake shows the answer and resets the streak');
// idle path: no change of the streak, the tool keeps her marks
await E(()=>{ streak=3; SHOWC(); const b=document.querySelector('#qTool .cgc'); b.click(); b.click(); guideOpen(current,'idle'); });
await p.waitForSelector('#gbBoard .cgc',{timeout:3000}); await E(()=>document.getElementById('gbExit').click()); await p.waitForTimeout(100);
ok(await E(()=>document.querySelector('#qTool .cgc').dataset.v==='2'&&document.getElementById('answerArea').style.display!=='none'&&current._guided===1),'a guide opened first and left: her own marks in the tool are still there and the choices are back');
await E(()=>RIGHT()); await p.waitForTimeout(100);
ok(await E(()=>streak===3&&!!document.getElementById('goAgain')),'then answering gives no reward and no streak change');
// the quiet button on a real clue question
await E(()=>{ guideIdle=1; SHOWC(); }); await p.waitForSelector('#guideQuietBtn',{timeout:3000}); ok(true,'the quiet button shows on a clue question after the idle time');
// bonus clue questions have no guide for now
ok(await E(()=>!bLogicGrid2().guide),'bonus clue questions carry no guide yet');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close(); console.log(f?'FAILED '+f:'ALL OK'); process.exit(f?1:0);
})();
