const T=require('./lib.js');
const {chromium}=require('playwright'); let fails=0; const ok=(c,m)=>{ if(!c){fails++;console.log('FAIL',m);} else console.log('ok  ',m); };
(async()=>{const b=await chromium.launch({...T.launchOpts});const ctx=await b.newContext();const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const URL=T.URL;
await pg.goto(URL); await pg.evaluate(()=>localStorage.clear());
// seed a v2 (pre-stats) store with two profiles
await pg.evaluate(()=>{localStorage.setItem('cupcakeQuestSave_v2',JSON.stringify({version:2,activeId:'a',profiles:[{id:'a',name:'נועה',gender:'f',progress:{score:50,level:2,collection:['🍩','🍩']}},{id:'b',name:'דן',gender:'m',progress:{}}]}));});
await pg.reload();
let r=await pg.evaluate(()=>({v:store.version,st:store.profiles.map(p=>!!p.stats&&p.stats.log.length===0),score,coll:collection.length}));
ok(r.st.every(Boolean)&&r.score===50&&r.coll===2,'v2 store loads, empty stats added, progress intact');
// every generator in every pool/bonus pool has skill metadata
const miss=await pg.evaluate(()=>{const s=new Set();Object.values(pools).concat(Object.values(BONUS_POOLS)).flat().forEach(f=>s.add(f.name));LOGIC_POOL.forEach(f=>s.add(f.name));return [...s].filter(n=>!SKILL_META[n]&&n!=='gReading');});   // gReading is the reading section's pseudo-generator: each question carries its own rd... skill
ok(miss.length===0,'all generators have SKILL_META ('+miss.join(',')+')');
// play 120 questions across levels (some wrong)
const res=await pg.evaluate(()=>{let n=0;for(let lv=1;lv<=5;lv++){level=lv;for(let i=0;i<24;i++){nextQuestion();const wrong=(i%4===3);checkAnswer(wrong?'__wrong__':current.answer,null,null);n++;}}
 // a bonus
 level=3; renderBonus(); checkAnswer(current.answer,null,null); document.getElementById('nextBtn').style.display='none';
 const p=activeProfile(); return {n, len:p.stats.log.length, bonus:p.stats.log.filter(r=>r.b).length, wrong:p.stats.log.filter(r=>!r.c).length, skills:new Set(p.stats.log.map(r=>r.s)).size, unknown:p.stats.log.filter(r=>!r.s||r.s==='').length, other:store.profiles[1].stats.log.length};});
ok(res.len===121&&res.bonus===1&&res.wrong===30&&res.unknown===0&&res.other===0,'answers logged to active profile only: '+JSON.stringify(res));
// double submit guard
const dbl=await pg.evaluate(()=>{nextQuestion();const before=activeProfile().stats.log.length;checkAnswer(current.answer,null,null);checkAnswer(current.answer,null,null);return activeProfile().stats.log.length-before;});
ok(dbl===1,'double-submit logs once');
// skipped bonus not logged
const skip=await pg.evaluate(()=>{const before=activeProfile().stats.log.length;renderBonus();nextQuestion();return activeProfile().stats.log.length-before;});
ok(skip===0,'skipped bonus not logged');
// persistence
await pg.reload();
r=await pg.evaluate(()=>{const p=activeProfile();return {len:p.stats.log.length,sample:p.stats.log[0],rep:Object.keys(cqStats()),n:cqStats().skills.length};});
ok(r.len===122,'stats survive reload ('+r.len+')'); console.log('   sample record',JSON.stringify(r.sample),'report keys',r.rep.join(','),'skills',r.n);
// edit profile keeps stats; switch keeps separate
const sw=await pg.evaluate(()=>{const before=activeProfile().stats.log.length;switchProfile('b');const dn=activeProfile().stats.log.length;switchProfile('a');return {before,dn,after:activeProfile().stats.log.length};});
ok(sw.dn===0&&sw.after===sw.before,'switching profiles keeps stats separate');
await pg.evaluate(()=>{openProfiles(false);profileAction('edit','a');});
await pg.fill('#pfName','נועה ב'); await pg.check('input[name=pfG][value=f]'); await pg.evaluate(()=>profileAction('save'));
r=await pg.evaluate(()=>({n:store.profiles[0].name,len:store.profiles[0].stats.log.length}));
ok(r.n==='נועה ב'&&r.len===122,'editing a profile keeps its stats');
// v1 migration still works and gets stats
const p2=await ctx.newPage();p2.on('pageerror',e=>errs.push(e.message));await p2.goto(URL);
await p2.evaluate(()=>{localStorage.clear();localStorage.setItem('cupcakeQuestSave_v1',JSON.stringify({score:99,collection:['🍩'],level:3}));});await p2.reload();
r=await p2.evaluate(()=>({score,len:store.profiles[0].stats.log.length,v:store.version,v1:!!localStorage.getItem('cupcakeQuestSave_v1')}));
ok(r.score===99&&r.len===0&&r.v===3&&r.v1,'v1 migrates with empty stats, v1 kept');
// corrupt stats in v2 are sanitised, not fatal
await p2.evaluate(()=>{localStorage.setItem('cupcakeQuestSave_v2',JSON.stringify({version:3,activeId:'a',profiles:[{id:'a',name:'x',gender:'n',progress:{score:7},stats:{log:'nope',daily:5}}]}));});await p2.reload();
r=await p2.evaluate(()=>({score,ok:Array.isArray(activeProfile().stats.log)}));
ok(r.score===7&&r.ok,'corrupt stats field sanitised');
// size check of a full log
const sz=await pg.evaluate(()=>{const s=statsNew();for(let i=0;i<2000;i++)statsRecord(s,{skill:'gHiddenOdd',level:4,ok:i%3>0,seconds:12.3,chosen:'g2',correct:'g3',t:Date.now()+i});return JSON.stringify(s).length;});
console.log('   full 2000-record log size ~',Math.round(sz/1024),'KB');
ok(errs.length===0,'no page errors '+errs.join('|'));
console.log(fails?'FAILURES '+fails:'ALL PASS');await b.close();})();
