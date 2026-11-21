// Fixes after Matan's review (clue-grid guide): intro, kudos for what is already marked, messages that follow the grid, strong highlights, rule shown in the guide box, "clear the table" restarts; plus the even-share wording
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
const E=(fn,...a)=>p.evaluate(fn,...a);
// ---- wording of the even-share question
const w=await E(()=>{ const out=[]; for(let i=0;i<60;i++){ const q=gEvenShare(); out.push(q.text); } return out; });
ok(w.every(t=>/ רוצה לחלק /.test(t)&&/ בין הילדים, כך שכל ילד/.test(t)&&!/ לחלק \d+[^ ]* [^ ]+ בין ילדים/.test(t)),'even share: "<name> רוצה לחלק N <things> בין הילדים…" ('+w[0].slice(0,60)+')');
await E(()=>{ document.body.dataset.view='play'; localStorage.setItem('cq_guide_flag','1');
  window.SHOWC=(two)=>{ qEpoch++; current=two?bLogicGrid2():gLogicGrid(); current.skill='gLogicGrid'; current._gen=gLogicGrid; startQTimer(); document.getElementById('qtext').innerHTML=current.text; qToolOpen(current); renderAnswerArea(current,checkAnswer); guideAfterShow(current); };
  window.WRONG=()=>{ [...document.querySelectorAll('#answerArea .choice')].find(c=>c.textContent.trim()!==String(current.answer)).click(); };
  window.PLAN=()=>cgPlan(current.tool.model); });
const setCell=async(c)=>{ const cur=await E(c=>+document.querySelector(`#qTool .cgc[data-r="${c.r}"][data-c="${c.c}"]`).dataset.v,c); const n=(c.v-cur+3)%3; for(let i=0;i<n;i++) await p.click(`#qTool .cgc[data-r="${c.r}"][data-c="${c.c}"]`); };
const check=async()=>{ await p.click('#gbCheck'); await p.waitForTimeout(80); };
const ask=()=>E(()=>document.getElementById('gbAsk').textContent), msg=()=>E(()=>document.querySelector('.cgmsg').textContent);
const start=async()=>{ await E(()=>{ streak=3; SHOWC(); WRONG(); document.getElementById('goYes').click(); }); await p.waitForSelector('#gbCheck'); };
await start();
const plan=await E(()=>PLAN());
// ---- 5. the opening
let a=await ask(); ok(a.startsWith('בואו נעבור על הרמזים אחד אחד')&&a.includes('הרמז: ״'),'the guide opens with "let\'s go through the clues one by one" and the first clue: '+a.slice(0,70));
await setCell(plan[0].cells[0]); await check(); a=await ask();
ok(!a.startsWith('בואו נעבור על הרמזים'),'the intro is only on the first step');
// ---- 6. the clue is shown inside the guide box, lit; and the lit styles are strong
ok(await E(()=>{ const r=document.getElementById('gbRule'); return !r.hidden&&r.textContent.includes('📌')&&current.tool.model.texts.some(t=>r.textContent.includes(t))&&document.getElementById('gbBoard').contains(r); }),'the clue of the step is shown (lit) inside the guide box, where she is looking');
ok(await E(()=>{ const on=document.querySelector('#qtext .cgclue.on'); if(!on) return false; const s=getComputedStyle(on); return s.backgroundColor==='rgb(255, 225, 77)'&&s.fontWeight>=800; }),'and it is lit strongly in the question text too');
// ---- 3. an error message goes away when the mark is fixed; the red cell is strong
await start().catch(()=>{});
await E(()=>{ guideCancel(); }); await start();
const pl=await E(()=>PLAN());
const wrong=await E(pl0=>{ const m=current.tool.model; const s0=pl0[0].cells[0]; for(const [r,c] of cgLive(m)){ if(r===s0.r&&c===s0.c) continue; if(cgBad(m,pl0[0].intro,{[r+','+c]:2}).length) return {r,c}; } return null; }, pl);
await setCell(pl[0].cells[0]); await setCell({...wrong,v:2}); await check();
ok((await msg()).includes('מסומן באדום'),'a mark the clues do not support: the message says so');
const bad=await E(()=>{ const c=document.querySelector('.cgc.bad'); if(!c) return null; const s=getComputedStyle(c); return {w:parseFloat(s.outlineWidth), col:s.outlineColor}; });
ok(bad&&bad.w>=3,'the red cell has a thick outline: '+JSON.stringify(bad));
await setCell({...wrong,v:0}); await p.waitForTimeout(60);
ok(!(await msg()).includes('מסומן באדום')&&(await msg()).includes('הכול מסתדר')&&await E(()=>document.querySelectorAll('.cgc.bad').length===0),'after she fixes it, the red goes and the message says it works now: '+await msg());
// a missing mark: the message is replaced when it is added
await E(()=>{ guideCancel(); }); await start(); const pl2=await E(()=>PLAN());
await check(); ok((await msg()).includes('עוד חסר סימון'),'nothing marked: "a mark is missing"');
ok(await E(()=>document.querySelectorAll('#qTool .cgh.hl').length>0),'and the row/column of the step are lit');
await setCell(pl2[0].cells[0]); await p.waitForTimeout(60);
ok((await msg()).includes('הכול מסתדר'),'when she adds it, the message changes: '+await msg());
// ---- 4. clear the table restarts the guide
await E(()=>{ guideCancel(); }); await start(); const pl4=await E(()=>PLAN());
await setCell(pl4[0].cells[0]); await check(); await setCell(pl4[1].cells[0]); await p.waitForTimeout(50);
ok(!(await ask()).startsWith('בואו נעבור'),'(on step 2 or later)');
await p.click('#qTool .cgclr'); await p.waitForTimeout(300);
a=await ask(); ok(a.startsWith('בואו נעבור על הרמזים אחד אחד'),'"clear the table" starts the guide again from the first step: '+a.slice(0,50));
ok(await E(()=>document.querySelectorAll('#qTool .cgc:not([data-v="0"])').length===0&&!document.getElementById('gbCheck').hidden&&!document.getElementById('guideBox').hidden),'the grid is empty and the guide is still there, not closed or finished');
ok(await E(()=>!document.querySelector('.cgc.bad,.cgc.hint')&&document.querySelector('.cgmsg').textContent===''),'no leftover messages or marks');
// the restarted guide works through to the end
for(let i=0;i<40;i++){ const solved=await E(()=>document.getElementById('gbCheck').hidden); if(solved) break; const pls=await E(()=>PLAN()); const cur=await E(()=>{ const mk={}; document.querySelectorAll('#qTool .cgc').forEach(b=>{ if(+b.dataset.v) mk[b.dataset.r+','+b.dataset.c]=+b.dataset.v; }); return mk; });
  const nxt=pls.find(s=>s.cells.some(x=>cur[x.r+','+x.c]!==x.v)); if(!nxt){ await check(); continue; } for(const c of nxt.cells) await setCell(c); await check(); }
ok(await E(()=>document.getElementById('gbCheck').hidden&&document.getElementById('gbAsk').textContent===''),'and it can be completed after a restart');
// ---- 7. already marked: kudos and move on. A step that follows from the same clues as the one before it can be marked ahead of time
let pl5=null, K=0;
for(let t=0;t<40&&!pl5;t++){ await E(()=>{ guideCancel(); }); await start(); const cand=await E(()=>PLAN()); const k=cand.findIndex((s,i)=>i>0&&s.intro.length===cand[i-1].intro.length); if(k>0){ pl5=cand; K=k; } }
ok(!!pl5,'found a question with a step that follows from the same clues as the step before it (step '+(K+1)+')');
for(let i=0;i<K-1;i++){ for(const c of pl5[i].cells) await setCell(c); await check(); }
for(const c of pl5[K-1].cells) await setCell(c); for(const c of pl5[K].cells) await setCell(c);      // she marks both before pressing anything
await check(); await p.waitForTimeout(80);
a=await ask(); const label=await E(()=>document.getElementById('gbCheck').textContent);
ok(a.includes('כל הכבוד, כבר סימנתם את זה')&&a.includes('אפשר להמשיך'),'a step she has already done shows kudos instead of asking again: '+a);
ok(label==='המשך לשלב הבא','and the button says to move on: '+label);
ok(await E(()=>document.querySelectorAll('#qTool .cgc.hint').length===0)&&!(await msg()).includes('חסר'),'with no complaint about missing marks');
await check(); await p.waitForTimeout(80);
ok(!(await ask()).includes('כבר סימנתם את זה'),'one press moves on to the next step');
ok(await E(()=>document.getElementById('gbCheck').textContent)!=='המשך לשלב הבא'||await E(()=>document.getElementById('gbCheck').hidden),'and the button is back to normal');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close(); process.exit(f?1:0);
})();
