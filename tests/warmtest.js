const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
const E=(fn,...a)=>p.evaluate(fn,...a);
await E(()=>{ window.seed=(stats,skill,n,k)=>{ for(let i=0;i<n;i++) statsRecord(stats,{skill,level:1,ok:i<k,seconds:3,chosen:i<k?undefined:'9',correct:'8'}); };
  window.rng=(seed)=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; });
// ---- the rule ----
const R=await E(()=>{
  const pool=pools[7], solid=pool.slice(0,3).map(g=>g.name), weak=pool[3].name;
  const st=statsNew(); solid.forEach(n=>seed(st,n,10,10)); seed(st,weak,10,2); seed(st,pool[4].name,3,3);   // pool[4]: perfect but too few answers to be labelled
  const out={}; const r=rng(5);
  out.warm=[]; for(let i=0;i<3000;i++){ const g=pickGenerator(pool,st,false,null,r,true); out.warm.push(g.name); }
  out.allSolid=out.warm.every(n=>solid.includes(n)); out.spread=new Set(out.warm).size;
  out.normal=pickGenerator(pool,st,false,null,rng(1),false)!=null;
  let rep=0,last=solid[0]; for(let i=0;i<500;i++){ const g=pickGenerator(pool,st,false,last,r,true); if(g.name===last) rep++; last=g.name; } out.rep=rep;
  const empty=statsNew(); seed(empty,weak,10,2); const q=[]; for(let i=0;i<200;i++) q.push(pickGenerator(pool,empty,false,null,r,true).name); out.noSolid=new Set(q).size;   // no solid type: ordinary draw over the whole pool
  out.noStats=pickGenerator(pool,null,false,null,r,true)!=null;
  // single solid type may repeat
  const one=statsNew(); seed(one,solid[0],10,10); let only=true; for(let i=0;i<200;i++) if(pickGenerator(pool,one,false,solid[0],r,true).name!==solid[0]) only=false; out.one=only;
  // warm-up wins over focus while warming; focus returns afterwards
  const both=statsNew(); solid.forEach(n=>seed(both,n,10,10)); seed(both,weak,10,0);
  let leak=0; for(let i=0;i<500;i++) if(pickGenerator(pool,both,true,null,r,true).name===weak) leak++; out.leak=leak;
  let after=0; for(let i=0;i<4000;i++) if(pickGenerator(pool,both,true,null,r,false).name===weak) after++; out.after=after/4000;
  return out; });
ok(R.allSolid&&R.spread===3,'warm-up draws only "solid" types, using all of them ('+R.spread+' types)');
ok(R.rep===0,'warm-up does not repeat the previous type when another solid one exists');
ok(R.noSolid>5,'no solid type yet: ordinary draw (game stays normal)');
ok(R.noStats&&R.normal,'no stats: no error');
ok(R.one,'a single solid type may repeat');
ok(R.leak===0&&R.after>0.4,'while warming focus does not apply; afterwards it does ('+R.after.toFixed(2)+')');
// ---- in the game: first 5 of each session ----
const G=await E(()=>{
  const pr=activeProfile(); pr.stats=statsNew(); const pool=pools[7]; const solid=pool.slice(0,2).map(g=>g.name);
  solid.forEach(n=>seed(pr.stats,n,10,10)); pool.slice(2,6).forEach(g=>seed(pr.stats,g.name,10,3));
  level=7; renderLevels(); const first=(on)=>{ warmOn=on; sessionDraws=0; const a=[]; for(let i=0;i<8;i++){ nextQuestion(); a.push(current.skill); } return a; };
  const off=first(false), on=first(true);
  // hidden solid type is not used
  mxState={off:[],hide:[solid[0]]}; const hid=first(true); mxState={off:[],hide:[]};
  // a new session (switching profile) warms up again
  setProfileWarm(activeProfile(),true); sessionDraws=0; for(let i=0;i<8;i++) nextQuestion(); const before=sessionDraws; enterProfile(); const reset=sessionDraws;
  const again=[]; for(let i=0;i<5;i++){ nextQuestion(); again.push(current.skill); }
  // bonus not counted/affected
  const c0=sessionDraws; level=3; renderBonus(); const bonusSame=sessionDraws===c0&&current.isBonus;
  setProfileWarm(activeProfile(),false);
  return {solid,off,on,hid,before,reset,again,bonusSame}; });
ok(G.on.slice(0,5).every(n=>G.solid.includes(n)),'game: first 5 questions of the session are solid types: '+G.on.slice(0,5).join(','));
ok(G.on.slice(5).some(n=>!G.solid.includes(n)),'game: after 5 it is back to the normal draw');
ok(G.off.slice(0,5).some(n=>!G.solid.includes(n)),'game: with the switch off nothing changes');
ok(G.hid.slice(0,5).every(n=>n===G.solid[1]),'game: a hidden type is not used for warm-up');
ok(G.before>=8&&G.reset===0&&G.again.every(n=>G.solid.includes(n)),'game: a new session (profile switch / reopening) warms up again');
ok(G.bonusSame,'game: bonus questions do not count and are not affected');
// ---- UI ----
await E(()=>{ const pr=activeProfile(); pr.stats=statsNew(); seed(pr.stats,pools[7][0].name,10,10); persist(); openPanel('settings'); });
await p.waitForTimeout(200);
const txt=await p.textContent('#profBody');
ok(txt.includes('חימום בתחילת משחק')&&txt.includes('מה זה עושה')&&txt.includes('5 השאלות הראשונות'),'card explains what it does');
ok(txt.includes('עכשיו 1 סוגים יכולים לשמש לחימום'),'card shows the types available now');
ok(await E(()=>warmOn===false),'off by default');
await p.evaluate(()=>{ document.getElementById('paMain').scrollTop=250; });
await p.locator('input[data-warm]').evaluate(el=>el.click()); await p.waitForTimeout(150);
ok(await E(()=>warmOn===true)&&Math.abs(await p.evaluate(()=>document.getElementById('paMain').scrollTop)-250)<5,'switch applies at once, scroll kept');
await p.reload(); await p.waitForTimeout(300);
ok(await E(()=>warmOn===true&&sessionDraws<=1),'saved across reload; a reload starts a new session (counter starts again)');
ok(await E(()=>{ const c=cleanProgress(JSON.parse(JSON.stringify(captureProgress()))); return c.warm===true&&cleanProgress({score:1}).warm===false&&cleanProgress({warm:'x'}).warm===false; }),'carried in saved progress; old saves and junk give "off"');
await E(()=>{ store.profiles.push({id:'zz',name:'דני',gender:'m',progress:cleanProgress({}),stats:statsNew(),u:Date.now()}); persist(); setViewId='zz'; openPanel('settings'); });
ok(await p.locator('input[data-warm]').isChecked()===false,'another profile has its own switch');
await p.locator('input[data-warm]').evaluate(el=>el.click()); await p.waitForTimeout(100);
ok(await E(()=>profileWarm(store.profiles.find(x=>x.id==='zz'))===true&&warmOn===true),'changing another profile leaves the active one alone');
ok(errs.length===0,'no page errors '+errs);
console.log(f?'FAILURES '+f:'ALL PASS'); await b.close(); process.exit(f?1:0);})();
