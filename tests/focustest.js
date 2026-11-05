const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
const E=(fn,...a)=>p.evaluate(fn,...a);
// helper in page: seed answers for a skill: n answers with k correct
await E(()=>{ window.seed=(stats,skill,n,k)=>{ for(let i=0;i<n;i++) statsRecord(stats,{skill,level:1,ok:i<k,seconds:3,chosen:i<k?undefined:'9',correct:'8'}); };
  window.rng=(seed)=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; });
// ---- the rule, on a synthetic profile ----
const R=await E(()=>{
  const pool=pools[7]; const weak=pool.slice(0,2).map(g=>g.name), mid=pool[2].name, solid=pool[3].name;
  const st=statsNew(); weak.forEach(n=>seed(st,n,10,3)); seed(st,mid,10,7); seed(st,solid,10,10); seed(st,pool[4].name,3,0);   // pool[4]: too few answers to be labelled
  const out={weak,n:pool.length};
  const frac=(on,N)=>{ const r=rng(7); let w=0,last=null; for(let i=0;i<N;i++){ const g=pickGenerator(pool,st,on,last,r); last=g.name; if(weak.includes(g.name)) w++; } return w/N; };
  out.off=frac(false,20000); out.on=frac(true,20000);
  out.expectOn=0.4*(1)+0.6*(2/pool.length);                    // 4 in 10 from the 2 weak types, 6 in 10 as usual
  // tier fallback: nothing "needs practice", one type "on the way"
  const st2=statsNew(); seed(st2,mid,10,7); seed(st2,solid,10,10);
  out.tier2=focusPracticePool(st2,pool); out.tier2name=out.tier2.gens.map(g=>g.name).join(','); out.tier2t=out.tier2.tier; out.mid=mid;
  // nothing labelled: behaves as normal, never throws
  const st3=statsNew(); seed(st3,solid,10,10); const e3=focusPracticePool(st3,pool); out.none=e3.gens.length+'|'+e3.tier;
  out.noStats=focusPracticePool(null,pool).gens.length;
  // never the same weak type twice in a row by the rule (rule draws only; use a rnd that always takes the focus branch)
  const st4=statsNew(); seed(st4,weak[0],10,0); seed(st4,weak[1],10,0); let bad=0,last=weak[0]; const rr=rng(3); for(let i=0;i<500;i++){ const r2=()=>0.01; const g=pickGenerator(pool,st4,true,last,r2); if(g.name===last) bad++; last=g.name; }
  out.repeat=bad;
  // a single weak type: it may repeat, so the 4 in 10 still holds
  const st5=statsNew(); seed(st5,weak[0],10,0); let w5=0,l5=null; const r5=rng(11); for(let i=0;i<20000;i++){ const g=pickGenerator(pool,st5,true,l5,r5); if(g.name===weak[0]) w5++; l5=g.name; }
  out.single=w5/20000;
  // improvement: the weak type leaves the pool by itself
  const st6=statsNew(); seed(st6,weak[0],10,3); const before=focusPracticePool(st6,pool).gens.length; for(let i=0;i<30;i++) statsRecord(st6,{skill:weak[0],level:1,ok:true,seconds:2}); out.improve=[before,focusPracticePool(st6,pool).gens.length];
  return out; });
ok(Math.abs(R.off-2/R.n)<0.02,'focus off: weak types appear at their normal share ('+R.off.toFixed(3)+')');
ok(Math.abs(R.on-R.expectOn)<0.025&&R.on>R.off*3,'focus on: 4 in 10 from the weak types plus their normal share ('+R.on.toFixed(3)+' vs expected '+R.expectOn.toFixed(3)+')');
ok(R.tier2t==='ontheway'&&R.tier2name===R.mid,'no "needs practice" type: uses the "on the way" ones');
ok(R.none==='0|null'&&R.noStats===0,'nothing labelled (or no stats): no focus pool, game stays normal');
ok(R.repeat===0,'the focus rule never repeats the previous type when another weak type exists');
ok(Math.abs(R.single-(0.4+0.6/R.n))<0.02,'only one weak type: still 4 in 10 plus its normal share ('+R.single.toFixed(3)+')');
ok(R.improve[0]===1&&R.improve[1]===0,'a type that improves leaves the pool by itself');
// ---- in the game: respects section, hidden types and cells ----
const G=await E(()=>{
  const pr=activeProfile(); pr.stats=statsNew(); const target=pools[7][0].name, other=pools[7][1].name;
  seed(pr.stats,target,12,2);
  const run=(N)=>{ let c=0,d=0; for(let i=0;i<N;i++){ nextQuestion(); if(current.skill===target) c++; } return c/N; };
  level=7; renderLevels(); focusOn=false; const off=run(1500); focusOn=true; const on=run(1500);
  // hidden type is never drawn even though it is the weak one
  mxState={off:[],hide:[target]}; const hid=run(600); mxState={off:[],hide:[]};
  // a cell that excludes its difficulty: never drawn
  const d=skillDifficulty(target); mxState={off:['7:'+d],hide:[]}; const cell=run(600); mxState={off:[],hide:[]};
  // other section: the weak type of section 7 does not leak into the clock section
  level=6; renderLevels(); let leak=0; for(let i=0;i<600;i++){ nextQuestion(); if(current.skill===target) leak++; }
  // bonus unaffected
  level=3; renderBonus(); const bonusOk=!!current&&current.isBonus;
  focusOn=false;
  return {off,on,hid,cell,leak,bonusOk,expected:0.4+0.6/pools[7].length}; });
ok(G.off<0.12&&Math.abs(G.on-G.expected)<0.06,'in the game: weak type drawn '+G.off.toFixed(2)+' of the time off, '+G.on.toFixed(2)+' on (expected about '+G.expected.toFixed(2)+')');
ok(G.hid===0&&G.cell===0,'a hidden type or a hidden cell is never drawn, even if it is the weakest');
ok(G.leak===0,'focus stays inside the section she is playing');
ok(G.bonusOk,'bonus questions still work');
// ---- UI ----
await E(()=>{ const pr=activeProfile(); pr.stats=statsNew(); seed(pr.stats,pools[7][0].name,12,2); persist(); openPanel('settings'); });
await p.waitForTimeout(200);
const txt=await p.textContent('#profBody');
ok(txt.includes('תרגול ממוקד')&&txt.includes('מה זה עושה')&&txt.includes('4 שאלות מכל 10'.replace('4','4')),'card explains what it does');
ok(txt.includes('עכשיו ייבחרו לתרגול 1 סוגים'),'card shows which types are in the pool right now');
ok(await E(()=>focusOn===false),'off by default');
await p.evaluate(()=>{ document.getElementById('paMain').scrollTop=300; });
await p.locator('input[data-focus]').evaluate(el=>el.click()); await p.waitForTimeout(150);
ok(await E(()=>focusOn===true),'switch applies at once');
ok(Math.abs(await p.evaluate(()=>document.getElementById('paMain').scrollTop)-300)<5,'scroll position kept');
await p.reload(); await p.waitForTimeout(300);
ok(await E(()=>focusOn===true),'saved across reload');
ok(await E(()=>{ const c=cleanProgress(JSON.parse(JSON.stringify(captureProgress()))); return c.focus===true&&cleanProgress({score:1}).focus===false&&cleanProgress({focus:'yes'}).focus===false; }),'carried in saved progress; old saves and junk values give "off"');
// another profile keeps its own switch
await E(()=>{ store.profiles.push({id:'zz',name:'דני',gender:'m',progress:cleanProgress({}),stats:statsNew(),u:Date.now()}); persist(); setViewId='zz'; openPanel('settings'); });
ok(await p.locator('input[data-focus]').isChecked()===false&&await E(()=>profileFocus(store.profiles.find(x=>x.id==='zz'))===false),'other profile has its own switch (off)');
await p.locator('input[data-focus]').evaluate(el=>el.click()); await p.waitForTimeout(100);
ok(await E(()=>profileFocus(store.profiles.find(x=>x.id==='zz'))===true&&focusOn===true),'switching another profile does not touch the active one');
const txt2=await p.textContent('#profBody'); ok(txt2.includes('אין לדני סוג')||txt2.includes('המשחק יישאר רגיל'),'no data yet: card says the game stays normal');
ok(errs.length===0,'no page errors '+errs);
console.log(f?'FAILURES '+f:'ALL PASS'); await b.close(); process.exit(f?1:0);})();
