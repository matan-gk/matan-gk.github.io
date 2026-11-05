const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(300);
const r=await p.evaluate(()=>{
  const o={}; const sec=[1,2,3,4,6,7,8];
  const reg=new Set(Object.keys(SKILL_META).filter(k=>!SKILL_META[k].bonus));
  const where={}; sec.forEach(l=>pools[l].forEach(g=>{(where[g.name]=where[g.name]||[]).push(l);}));
  o.twice=Object.entries(where).filter(([k,v])=>v.length>1).map(x=>x[0]);
  o.notInAny=[...reg].filter(k=>!where[k]);
  o.unknownInPool=Object.keys(where).filter(k=>!reg.has(k));
  o.mixOk=pools[5].length===reg.size&&[...reg].every(k=>pools[5].some(g=>g.name===k));
  // section = area
  const areaOf={1:'stories',2:'symbols',3:'patterns',4:'logic',6:'clock',7:'numbers',8:'shapes'};
  o.areaMismatch=[];sec.forEach(l=>pools[l].forEach(g=>{if(SKILL_META[g.name].area!==areaOf[l])o.areaMismatch.push(g.name+':'+SKILL_META[g.name].area);}));
  const bon=Object.keys(SKILL_META).filter(k=>SKILL_META[k].bonus);
  const bw={}; sec.forEach(l=>(BONUS_POOLS[l]||[]).forEach(g=>{(bw[g.name]=bw[g.name]||[]).push(l);}));
  o.bonusMissing=bon.filter(k=>!bw[k]); o.bonusTwice=Object.entries(bw).filter(([k,v])=>v.length>1).map(x=>x[0]);
  o.bonusAreaMismatch=[];sec.forEach(l=>(BONUS_POOLS[l]||[]).forEach(g=>{if(SKILL_META[g.name].area!==areaOf[l])o.bonusAreaMismatch.push(g.name);}));
  o.mixBonus=BONUS_POOLS[5].length===bon.length;
  o.areas=Object.keys(STATS_CONFIG.areas).join();
  o.names=LEVELS.map(l=>l.name).join(' | ');
  o.shapesBonus=(()=>{level=8;renderBonus();return current.isBonus===true;})();
  o.counts=Object.fromEntries(sec.map(l=>[l,[1,2,3].map(d=>new Set(pools[l].filter(g=>skillDifficulty(g.name)===d).map(g=>g.name)).size)]));
  // every level draws questions of its own pool
  o.badDraw=0;for(const l of [1,2,3,4,6,7,8,5]){level=l;for(let i=0;i<40;i++){nextQuestion();if(!pools[l].some(g=>g.name===current.skill))o.badDraw++;}}
  o.levelsSaved=(()=>{const c=cleanProgress({level:8}).level;const d=cleanProgress({level:9}).level;return c+','+d;})();
  return o;});
console.log(JSON.stringify(r,null,1));
ok(r.twice.length===0,'no type in two sections: '+r.twice);ok(r.notInAny.length===0,'every regular type is in a section: '+r.notInAny);ok(r.unknownInPool.length===0,'no unknown type in a pool');
ok(r.mixOk,'mix = all regular types');ok(r.areaMismatch.length===0,'section = area for every type: '+r.areaMismatch);
ok(r.bonusMissing.length===0&&r.bonusTwice.length===0,'every bonus in exactly one section '+r.bonusMissing+r.bonusTwice);ok(r.bonusAreaMismatch.length===0,'bonus area matches section: '+r.bonusAreaMismatch);
ok(r.mixBonus,'mix has every bonus');ok(r.shapesBonus,'shapes section still gets a bonus (from the mix)');
ok(r.areas==='numbers,stories,symbols,clock,patterns,logic,shapes,other','7 areas + other: '+r.areas);
ok(r.badDraw===0,'each level draws only from its own pool');ok(r.levelsSaved==='8,1','saved level 8 is valid, 9 resets');
ok(['1','2','3','4','6','7'].every(l=>r.counts[l].every(n=>n>=2)),'sections 1-7 have >=2 types at every difficulty');
console.log('shapes (known gap until step 3):',r.counts[8]);
ok(errs.length===0,'no page errors '+errs);
await b.close();process.exit(f?1:0);})();
