const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
const E=(fn,...a)=>p.evaluate(fn,...a);
// default theme: the unicorn, unchanged
const sw=await E(()=>{ const out={}; for(const m of Object.keys(UNICORN_IMG)){ setMood(m); out[m]=document.getElementById('charImg').src===new URL(UNICORN_IMG[m],document.baseURI).href; } return out; });
ok(Object.values(sw).every(Boolean)&&Object.keys(sw).length===8,'sweets: all 8 unicorn moods unchanged');
// space: 8 robot moods
await E(()=>setProfileTheme(activeProfile(),'space')); await p.waitForTimeout(100);
const R=await E(async()=>{ const img=document.getElementById('charImg'); const out={moods:{},hs:[],ws:[]}; const seen=new Set();
  for(const m of Object.keys(UNICORN_IMG)){ setMood(m); await new Promise(r=>setTimeout(r,60)); await img.decode().catch(()=>{}); const src=img.src; out.moods[m]=/^data:image\/webp|\.webp$/.test(src)&&src!==new URL(UNICORN_IMG[m],document.baseURI).href; seen.add(src); out.hs.push(img.offsetHeight); out.ws.push(img.offsetWidth); }
  out.distinct=seen.size; return out; });
ok(Object.values(R.moods).every(Boolean)&&Object.keys(R.moods).length===8,'space: every one of the 8 moods shows a robot picture');
ok(R.distinct===8,'space: 8 different pictures ('+R.distinct+')');
ok(Math.max(...R.hs)-Math.min(...R.hs)<=2&&Math.max(...R.ws)<=262,'space: all poses show at the same height (no jumping): '+R.hs.join(',')+' widths '+R.ws.join(','));
// coverage
ok(await E(()=>{ const c=themeCoverage('space'); const g=id=>c.find(x=>x.id===id); return g('mood').have===8&&g('mood').need===8&&g('react').have===1; }),'coverage report: moods 8/8, reaction 1/1');
// wrong answer -> puzzled (space only)
const W=await E(()=>{ nextQuestion(); const before=document.getElementById('charImg').src; checkAnswer('__wrong__',null,null); const after=document.getElementById('charImg').src; const isP=after===new URL(THEME_ASSETS.space.react.puzzled,document.baseURI).href; nextQuestion(); const back=document.getElementById('charImg').src===new URL(THEME_ASSETS.space.mood.happy,document.baseURI).href; return {isP,back,lm:lastMood}; });
ok(W.isP,'space: a wrong answer shows the puzzled robot');
ok(W.back&&W.lm==='happy','space: next question returns to the normal pose');
const C=await E(()=>{ nextQuestion(); checkAnswer(current.answer,null,null); const s=document.getElementById('charImg').src; return {robot:/^data:image\/webp|\.webp$/.test(s),notP:s!==new URL(THEME_ASSETS.space.react.puzzled,document.baseURI).href}; });
ok(C.robot&&C.notP,'space: a correct answer shows a (different) robot mood');
// sweets: no reaction
await E(()=>setProfileTheme(activeProfile(),'sweets'));
const S=await E(()=>{ nextQuestion(); const b=document.getElementById('charImg').src; checkAnswer('__wrong__',null,null); return {same:document.getElementById('charImg').src===b, lm:lastMood}; });
ok(S.same&&S.lm!=='puzzled','sweets: a wrong answer changes nothing (as before)');
// switching theme while the puzzled pose is showing never leaves a broken picture
const X=await E(async()=>{ setProfileTheme(activeProfile(),'space'); nextQuestion(); checkAnswer('__wrong__',null,null); setProfileTheme(activeProfile(),'sweets'); const img=document.getElementById('charImg'); await img.decode().catch(()=>{}); return {src:img.src===new URL(UNICORN_IMG.happy,document.baseURI).href, w:img.naturalWidth>0}; });
ok(X.src&&X.w,'switching to sweets while puzzled falls back to the unicorn, no broken picture');
// the 16 former looks are part of the mascot's pictures (sweets theme only)
const L=await E(()=>{ setProfileTheme(activeProfile(),'sweets'); const n1=moodPool().length; const lp=moodPool().filter(x=>/^look\d+$/.test(x)).length; setMood('look3'); const a=document.getElementById('charImg').src===new URL(LOOKS[3].img,document.baseURI).href; setMood('look99'); const fb=document.getElementById('charImg').src===new URL(UNICORN_IMG.happy,document.baseURI).href;
 let seen=new Set(); const keep=lastMood; for(let i=0;i<400;i++){ const pool=moodPool().filter(m=>m!==keep); seen.add(pool[Math.floor(Math.random()*pool.length)]); }
 setProfileTheme(activeProfile(),'space'); const n2=moodPool().length; const lp2=moodPool().filter(x=>/^look\d+$/.test(x)).length; setProfileTheme(activeProfile(),'sweets'); return {n1,lp,a,fb,seen:seen.size,n2,lp2}; });
ok(L.lp===16&&L.n1>=23&&L.n2<L.n1&&L.lp2===0,'sweets: 16 look pictures join the mascot moods ('+L.n1+' pictures); space keeps its own ('+L.n2+')');
ok(L.a&&L.fb,'a look picture shows as the mascot, an unknown one falls back to the happy unicorn');
ok(L.seen>=20,'picking at random reaches the look pictures too ('+L.seen+' different)');
// stats unaffected by the reaction
ok(await E(()=>activeProfile().stats.log.length>0),'answers still logged');
ok(errs.length===0,'no page errors '+errs);
await p.screenshot({path:'mascot_sweets.png'});
console.log(f?'FAILURES '+f:'ALL PASS'); await b.close(); process.exit(f?1:0);})();
