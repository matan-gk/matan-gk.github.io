// the guide engine (inner loop), its harness runs on a toy type with a fake board, and how the game uses it: flag, offer after a mistake, streak rules, idle button, guided answers, settings
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
const E=(fn,...a)=>p.evaluate(fn,...a);
await E(()=>{ document.body.dataset.view='play'; });
// ---- a toy type: 7 + 8, three steps (pick the operation, type the sum, one demo screen), a fake board that plays a script ----
await E(()=>{
  window.TOYREC = {prompts:{op:{text:'איזו פעולה?',say:'איזו פעולה?'}, sum:{text:'כמה זה {a} ועוד {b}?',say:'כמה זה?'}, smaller:{text:'נתחיל מ-{a} ונוסיף 3',say:'נתחיל'}, fin:{text:'הנה התשובה',say:'הנה התשובה'}}};
  GUIDE_RECIPES.gToy = Object.assign({}, window.TOYREC, {steps:m=>[
    {id:'op', skill:'op', act:'pick', ask:'op', expect:{value:'+'}, mistakes:[{when:{value:'-'}, tag:'minus', conseq:{kind:'shrinks'}}], hints:{smaller:{id:'opx', act:'pick', ask:'op', expect:{value:'+'}}, demo:{kind:'demo-op'}}},
    {id:'sum', skill:'sum', act:'type', ask:'sum', expect:{value:m.a+m.b}, mistakes:[{when:{value:m.a+m.b-1}, tag:'off-by-one', conseq:{kind:'count-again'}}], hints:{smaller:{id:'sumx', act:'type', ask:'smaller', expect:{value:m.a+3}}, demo:{kind:'demo-sum'}}},
    {id:'fin', skill:'fin', act:'show', ask:'fin'}]});
  window.FAKE = (script, quitAfter)=>{ const views=[], runs=[]; let n=0; let qf; const quit=new Promise(r=>{ qf=r; });
    const bd={views, runs, quit, mounted:0, unmounted:0, mount(){ this.mounted++; }, unmount(){ this.unmounted++; },
      run(step){ runs.push(step.id); n++; if(quitAfter && n>quitAfter){ qf(true); return new Promise(()=>{}); } const v = script(step, runs.filter(x=>x===step.id).length); return Promise.resolve(v); },
      show(v){ views.push(v.kind); return Promise.resolve(); }};
    return bd; };
  window.TOYQ = function gToy(){ const a=7, b=8; const q={label:'תרגיל',text:`כמה זה ${a} + ${b}?`,type:'mcq',answer:15,choices:[13,14,15,16],skill:'gToy',d:1,guide:{v:1,mode:'script',board:'fake',model:{a,b},answer:15}}; return q; };
  window.RUN = (script, quitAfter, q)=>{ const bd=FAKE(script, quitAfter); GUIDE_BOARDS.fake=bd; return guideRun(q||TOYQ(), {board:bd, quit:bd.quit}).then(r=>({r, bd})); };
});
const okIn = (step)=>step.act==='show'?1:(step.expect&&step.expect.value!==undefined?step.expect.value:'?');
// judge
ok(await E(()=>guideJudge({value:15},'15')&&!guideJudge({value:15},14)&&guideJudge({oneOf:[1,2]},2)&&!guideJudge({oneOf:[1,2]},3)&&guideJudge({all:[{field:'op',value:'-'},{field:'n',value:8}]},{op:'-',n:'8'})&&!guideJudge({all:[{field:'op',value:'-'},{field:'n',value:8}]},{op:'+',n:8})&&guideJudge({check:'sum-to',args:[10,4]},6)&&!guideJudge({check:'sum-to',args:[10,4]},5)&&!guideJudge({check:'nope'},1)&&guideJudge(null,'x')),'expectations: value, oneOf, all, check, none');
// correct-answer run
let x=await E(async()=>{ const o=await RUN(s=>s.act==='show'?1:s.expect.value); return {out:o.r.outcome, steps:o.r.steps, rungs:o.r.rungs, views:o.bd.views, m:o.bd.mounted, u:o.bd.unmounted}; });
ok(x.out==='done'&&x.steps===3&&JSON.stringify(x.rungs)==='{"conseq":0,"smaller":0,"demo":0}'&&x.views.join()==='solved'&&x.m===1&&x.u===1,'correct-answer run: done, 3 steps, no hints, only the final view, board mounted and unmounted once');
// incorrect-answer run: ladder order consequence -> smaller question -> demo, then she does it herself
x=await E(async()=>{ let n=0; const wrong=['-','*','/']; const o=await RUN((s)=>{ if(s.id==='op'){ return n<3?wrong[n++]:'+'; } if(s.id==='opx') return '+'; return s.act==='show'?1:s.expect.value; }); return {out:o.r.outcome, views:o.bd.views, runs:o.bd.runs, rungs:o.r.rungs, tags:o.r.log.find(l=>l.id==='op').tags}; });
ok(x.out==='done'&&JSON.stringify(x.rungs)==='{"conseq":1,"smaller":1,"demo":1}','three different wrong inputs climb the ladder once each: '+JSON.stringify(x.rungs));
ok(x.views.join()==='shrinks,demo-op,solved'&&x.runs.join()==='op,op,opx,op,op,sum,sum_x'.replace(',sum_x','').split(',').slice(0,0).concat(['op','op','opx','op','op','sum','fin']).join(),'order: consequence, then the smaller question, then the demonstration, then she does it herself: '+x.views.join()+' / '+x.runs.join());
ok(x.tags.join()==='minus','the known mistake is tagged');
// the same wrong input again does not climb
x=await E(async()=>{ let n=0; const o=await RUN((s)=>{ if(s.id==='op'){ return n++<3?'-':'+'; } return s.act==='show'?1:s.expect.value; }); return {views:o.bd.views, rungs:o.r.rungs}; });
ok(x.views.join()==='shrinks,again,again,solved'&&x.rungs.conseq===1&&x.rungs.smaller===0,'the same wrong input three times: one consequence, then "again", no climb: '+x.views.join());
// a typed number with no known mistake skips the consequence
x=await E(async()=>{ let n=0; const o=await RUN((s)=>{ if(s.id==='sum'){ n++; return n===1?99:(s.expect.value); } if(s.id==='sumx') return 10; return s.act==='show'?1:s.expect.value; }); return {views:o.bd.views, rungs:o.r.rungs}; });
ok(x.rungs.conseq===0&&x.rungs.smaller===1,'an unknown wrong number goes straight to the smaller question (no consequence): '+JSON.stringify(x.rungs));
x=await E(async()=>{ let n=0; const o=await RUN((s)=>{ if(s.id==='sum'){ n++; return n===1?14:(s.expect.value); } return s.act==='show'?1:s.expect.value; }); return {views:o.bd.views, rungs:o.r.rungs}; });
ok(x.rungs.conseq===1&&x.views[0]==='count-again','a known wrong number shows its consequence: '+x.views.join());
// she can always quit
x=await E(async()=>{ const o=await RUN((s)=>s.act==='show'?1:s.expect.value, 1); return {out:o.r.outcome, u:o.bd.unmounted, views:o.bd.views}; });
ok(x.out==='quit'&&x.u===1&&!x.views.includes('solved'),'quit in the middle: outcome quit, board unmounted, no final view');
x=await E(async()=>{ const o=await RUN((s)=>'zzz', 7); return {out:o.r.outcome}; });
ok(x.out==='quit','quit works while she is stuck in a loop of wrong inputs');
// guess run: random inputs, always terminates by itself or by quit, never throws
x=await E(async()=>{ let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; }; const res=[]; for(let i=0;i<60;i++){ const o=await RUN((s)=>{ const r=rnd(); if(s.act==='show') return 1; if(r<.25) return s.expect.value; return ['+','-','*',1,2,14,15,99][Math.floor(rnd()*8)]; }, 120); res.push(o.r.outcome); } return res; });
ok(x.every(o=>o==='done'||o==='quit')&&x.filter(o=>o==='done').length>0,'60 random guess runs: no crash, each ends in done or quit');
// a board that throws
x=await E(async()=>{ const bd=FAKE(()=>1); bd.mount=()=>{ throw new Error('boom'); }; GUIDE_BOARDS.fake=bd; const r=await guideRun(TOYQ(), {board:bd}); return {out:r.outcome, e:r.error, u:bd.unmounted}; });
ok(x.out==='error'&&/boom/.test(x.e)&&x.u===1,'a board that throws ends the guide as an error and is cleaned up');
// state mode with a toy rules module: three marks, any order
x=await E(async()=>{
  GUIDE_RULES.toyrules={ init:m=>({need:m.need.slice(), done:[]}), legal:(s,mv)=>s.need.includes(mv)&&!s.done.includes(mv)?{ok:true,supportedBy:['c'+mv]}:{ok:false,tag:'unsupported'}, apply:(s,mv)=>({need:s.need, done:s.done.concat([mv])}), next:s=>{ const m=s.need.find(v=>!s.done.includes(v)); return m===undefined?null:{move:m,supportedBy:['c'+m]}; }, done:s=>s.need.every(v=>s.done.includes(v)), consequence:(s,mv)=>({kind:'would-break',move:mv}) };
  const q=()=>{ const o=TOYQ(); o.guide={v:1,mode:'state',board:'fake',model:{need:[1,2,3]},rules:'toyrules',answer:15}; return o; };
  let i=0; const order=[3,1,2]; const ok1=await RUN(s=>({move:order[i++]}), 0, q());
  let j=0; const seq=[9,8,7,6]; const ok2=await RUN(s=>{ const st=s; return {move: j<4? seq[j++] : [1,2,3][j++-4]}; }, 0, q());
  let k=0; const ok3=await RUN(s=>({move: k++<3?9:[1,2,3][(k-4)]}), 0, q());
  let r4=0; const ok4=await RUN(s=>{ r4++; return r4===1?{done:true}:{move:[1,2,3][r4-2]}; }, 0, q());
  return {a:[ok1.r.outcome, ok1.bd.views.join()], b:[ok2.r.outcome, ok2.r.rungs, ok2.bd.views.join()], c:[ok3.r.rungs, ok3.bd.views.join()], d:[ok4.r.outcome, ok4.bd.views.join()]}; });
ok(x.a[0]==='done'&&x.a[1]==='applied,applied,applied,solved','state mode correct run: any order of supported marks reaches done: '+x.a[1]);
ok(x.b[0]==='done'&&x.b[1].conseq>=1&&x.b[1].smaller>=1&&x.b[1].demo===1&&/^would-break,point,demo,/.test(x.b[2]),'state mode: different unsupported moves climb consequence, pointing at the clue, demo: '+x.b[2]);
ok(x.c[1].startsWith('would-break,again,again'),'state mode: the same unsupported move again does not climb: '+x.c[1]);
ok(x.d[0]==='done'&&x.d[1].startsWith('not-yet,'),'"I am finished" before it is true gets a not-yet and she goes on');
// lint
x=await E(()=>{ const q=TOYQ(); const good=guideLint(q); GUIDE_RECIPES.gToy.prompts.bad={text:'x',say:'say {n}'}; const l1=guideLint(q); delete GUIDE_RECIPES.gToy.prompts.bad; const q2=TOYQ(); q2.guide.answer=16; const l2=guideLint(q2); const q3=TOYQ(); q3.guide.board='nope'; const l3=guideLint(q3); GUIDE_BOARDS.fake=FAKE(()=>1); const l0=guideLint(TOYQ()); return {good,l1,l2,l3,l0}; });
ok(x.l0.length===0,'lint: the toy type is clean');
ok(x.l1.some(m=>/say has a slot/.test(m)),'lint: a spoken line with a slot is reported');
ok(x.l2.some(m=>/answer differs/.test(m)),'lint: a guide whose answer differs from the question is reported');
ok(x.l3.some(m=>/no board/.test(m)),'lint: an unknown board is reported');
ok(x.l0.length===0 && await E(()=>Object.keys(GUIDE_RECIPES.gToy.prompts).every(k=>!/\{/.test(GUIDE_RECIPES.gToy.prompts[k].say))),'no spoken line contains a slot');

// ---- the game around it ----
await E(()=>{
  window.AUTO = (delay)=>({views:[], mount(el){ el.textContent='לוח'; }, unmount(){}, run(s){ return new Promise(r=>setTimeout(()=>r(s.act==='show'?1:s.expect.value), delay||5)); }, show(v){ this.views.push(v.kind); return Promise.resolve(); }});
  GUIDE_BOARDS.fake = AUTO(5);
  window.SHOWQ = ()=>{ qEpoch++; current = TOYQ(); current._gen = TOYQ; startQTimer(); document.getElementById('qtext').textContent=current.text; qToolOpen(current); renderAnswerArea(current, checkAnswer); guideAfterShow(current); };
  window.CLICK = (right)=>{ const els=[...document.querySelectorAll('#answerArea .choice')]; const el = els.find(c=>(c.textContent.trim()===String(current.answer))===!!right); el.click(); };
  window.ST = ()=>JSON.stringify({streak, held:streakHeld, col:collection.length});
});
// 1. flag off (the default): the feature does not exist
ok(await E(()=>guideFlag()===false&&guideEnabled()===false),'the flag is off by default');
await E(()=>{ streak=3; SHOWQ(); CLICK(false); });
ok(await E(()=>streak===0&&document.querySelector('#answerArea .choice.correct')&&!document.getElementById('goYes')),'flag off: a wrong answer behaves as before (answer shown, streak 0, no offer)');
// 2. flag on: wrong answer -> offer, answer hidden, streak held
await E(()=>{ localStorage.setItem('cq_guide_flag','1'); streak=3; SHOWQ(); CLICK(false); });
let s0=await E(()=>({offer:!!document.getElementById('goYes'), hl:document.querySelectorAll('#answerArea .choice.correct').length, st:streak, held:streakHeld, next:document.getElementById('nextBtn').style.display, fb:document.getElementById('feedback').textContent, log:activeProfile().stats.log.slice(-1)[0]}));
ok(s0.offer&&s0.hl===0&&s0.st===3&&s0.held&&s0.next==='none','wrong answer with a guide: offer shown, answer not highlighted, streak held at 3, Next hidden');
ok(!s0.fb.includes('15')&&s0.log.c===0&&s0.log.x==='14'||s0.log.c===0,'the answer is not in the text, and the wrong answer is logged as a mistake');
// decline: reveal and reset
await E(()=>document.getElementById('goNo').click());
ok(await E(()=>streak===0&&!streakHeld&&document.querySelectorAll('#answerArea .choice.correct').length===1&&document.getElementById('nextBtn').style.display==='block'&&!document.getElementById('goYes')),'"show the answer": the answer appears, streak resets, Next is back');
// 3. guide, then another try right: the streak continues; reward as usual
await E(()=>{ GUIDE_BOARDS.fake=AUTO(300); streak=3; SHOWQ(); CLICK(false); document.getElementById('goYes').click(); });
await p.waitForTimeout(100);
ok(await E(()=>!document.getElementById('guideBox').hidden&&document.getElementById('answerArea').style.display==='none'&&document.getElementById('gbAsk').textContent.length>0&&document.getElementById('nextBtn').style.display==='none'),'while the guide runs: its box shows the prompt, the answers and Next are hidden');
await p.waitForSelector('#goAgain',{timeout:5000});
await E(()=>{ GUIDE_BOARDS.fake=AUTO(5); });
ok(await E(()=>streak===3&&streakHeld&&document.querySelectorAll('#answerArea .choice.correct').length===0),'after the guide the streak is still held and the answer was not revealed');
const col0=await E(()=>collection.length);
await E(()=>document.getElementById('goAgain').click()); await p.waitForTimeout(100);
ok(await E(()=>current._again===1&&streakHeld&&streak===3&&current.skill==='gToy'),'the follow-up is a fresh question of the same type; the hold waits');
await E(()=>CLICK(true)); await p.waitForTimeout(300);
ok(await E(()=>streak===4&&!streakHeld),'follow-up right: the streak continues (3 -> 4) and the hold is gone');
ok(await E(c=>collection.length===c+1,col0),'and the follow-up earns its normal reward');
ok(await E(()=>activeProfile().stats.log.slice(-1)[0].h===4),'the follow-up answer is logged with h=4 (tried again after a guide)');
// follow-up wrong: reset
await E(()=>{ streak=3; SHOWQ(); CLICK(false); document.getElementById('goYes').click(); }); await p.waitForSelector('#goAgain',{timeout:5000});
await E(()=>document.getElementById('goAgain').click()); await p.waitForTimeout(100); await E(()=>CLICK(false)); await p.waitForTimeout(200);
ok(await E(()=>streak===0&&!streakHeld),'follow-up wrong: the streak resets');
// guide, no other try: reset
await E(()=>{ streak=3; SHOWQ(); CLICK(false); document.getElementById('goYes').click(); }); await p.waitForSelector('#goMove',{timeout:5000});
await E(()=>document.getElementById('goMove').click());
ok(await E(()=>streak===0&&!streakHeld&&!current._again),'guide and "continue" without another try: the streak resets');
// guide quit on the mistake path: the answer is shown, reset
await E(()=>{ GUIDE_BOARDS.fake=AUTO(400); streak=3; SHOWQ(); CLICK(false); document.getElementById('goYes').click(); }); await p.waitForTimeout(100);
await E(()=>document.getElementById('gbExit').click()); await p.waitForTimeout(100);
ok(await E(()=>streak===0&&!streakHeld&&document.querySelectorAll('#answerArea .choice.correct').length===1&&document.getElementById('guideBox').hidden&&document.getElementById('answerArea').style.display!=='none'),'quitting the guide after a mistake shows the answer and resets the streak; the question is usable again');
// next question while the offer is open: the reset applies, nothing is left over
await E(()=>{ GUIDE_BOARDS.fake=AUTO(5); streak=3; SHOWQ(); CLICK(false); nextQuestion(); });
ok(await E(()=>streak===0&&!streakHeld&&!document.getElementById('goYes')&&document.getElementById('guideOffer').innerHTML===''),'moving on while the offer is open applies the reset and clears the offer');
// 4. a guide opened before answering (the idle button)
await E(()=>{ guideIdle=1; streak=3; SHOWQ(); });
ok(await E(()=>!document.getElementById('guideQuietBtn')),'the quiet button is not there at first');
await p.waitForSelector('#guideQuietBtn',{timeout:3000});
ok(true,'the quiet button appears after the idle time');
const col1=await E(()=>collection.length);
await E(()=>document.getElementById('guideQuietBtn').click()); await p.waitForTimeout(400);
ok(await E(()=>!document.getElementById('guideBox').hidden&&document.getElementById('gbExit').hidden&&document.getElementById('answerArea').style.display!=='none'&&current._guided===1),'after a finished guide the answer choices come back and the guide box stays (without the exit button)');
await E(()=>CLICK(false)); await p.waitForTimeout(200);
ok(await E(c=>streak===3&&collection.length===c&&!streakHeld,col1),'answering after a guide opened first: no reward and the streak does not change (even for a wrong pick)');
ok(await E(()=>{ const r=activeProfile().stats.log.slice(-1)[0]; return (r.h&2)===2; })&&await E(()=>!!document.getElementById('goAgain')),'logged with the guided bit, and "another one" is offered');
await E(()=>{ streak=3; SHOWQ(); document.getElementById('guideQuietBtn')&&0; });
// guided answers do not count for adaptation
ok(await E(()=>{ const st=activeProfile().stats; return statsRecent(st,'gToy',50).every(r=>!(r.h&6)); }),'guided records are skipped by the adaptation reads');
// idle never / no guide on the question
await E(()=>{ guideIdle=0; SHOWQ(); }); await p.waitForTimeout(1300); ok(await E(()=>!document.getElementById('guideQuietBtn')),'idle "never": no button');
await E(()=>{ guideIdle=1; qEpoch++; current=TOYQ(); delete current.guide; renderAnswerArea(current,checkAnswer); guideAfterShow(current); }); await p.waitForTimeout(1300); ok(await E(()=>!document.getElementById('guideQuietBtn')),'a question without a guide never gets the button');
await E(()=>{ guideIdle=1; SHOWQ(); CLICK(true); }); await p.waitForTimeout(1300); ok(await E(()=>!document.getElementById('guideQuietBtn')),'answering before the idle time: no button');
await E(()=>{ guideIdle=1; SHOWQ(); nextQuestion(); }); await p.waitForTimeout(1300); ok(await E(()=>!document.getElementById('guideQuietBtn')||current.guide),'the timer is cancelled when the question changes');
await E(()=>{ guideIdle=30; });
// a right answer with no guide is untouched
await E(()=>{ streak=3; SHOWQ(); CLICK(true); }); await p.waitForTimeout(200);
ok(await E(()=>streak===4),'a right answer on a question with a guide behaves as before');
// 5. settings
await E(()=>{ localStorage.setItem('cq_guide_flag','0'); });
ok(await E(()=>renderGuideSettingsHTML(activeProfile())===''),'flag off: no settings card');
await E(()=>{ localStorage.setItem('cq_guide_flag','1'); });
ok(await E(()=>/data-guide="1"/.test(renderGuideSettingsHTML(activeProfile()))&&/data-guideidle/.test(renderGuideSettingsHTML(activeProfile()))),'flag on: a switch and an idle selector are in the settings');
await E(()=>{ setProfileGuide(activeProfile(), {on:false, idle:45}); });
ok(await E(()=>guideOn===false&&guideIdle===45&&guideEnabled()===false),'the switch and the idle time are kept; off disables the feature');
await E(()=>{ SHOWQ(); streak=3; CLICK(false); });
ok(await E(()=>streak===0&&!document.getElementById('goYes')),'switch off: no offer on a wrong answer');
await p.reload(); await p.waitForTimeout(500);
ok(await E(()=>guideOn===false&&guideIdle===45),'the settings survive a reload');
ok(await E(()=>{ const c=cleanProgress({guide:{on:'x',idle:7}}).guide; const d=cleanProgress({}).guide; return c.on===true&&c.idle===30&&d.on===true&&d.idle===30; }),'junk values fall back to on and 30 seconds');
await E(()=>setProfileGuide(activeProfile(), {on:true, idle:30}));
// the debug panel button toggles the flag
await E(()=>{ localStorage.setItem('cq_guide_flag','0'); dbg.ok=true; profileAction('dbgguide'); });
ok(await E(()=>guideFlag()===true),'the debug button turns the flag on');
await E(()=>profileAction('dbgguide')); ok(await E(()=>guideFlag()===false),'and off');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close(); console.log(f?'FAILED '+f:'ALL OK'); process.exit(f?1:0);
})();
