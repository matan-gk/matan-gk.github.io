const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(300);
const r=await p.evaluate(()=>{
  const o={};
  const ids=Object.keys(SKILL_META);
  o.unrated=ids.filter(i=>!(i in SKILL_DIFFICULTY));
  o.orphans=Object.keys(SKILL_DIFFICULTY).filter(i=>!(i in SKILL_META));
  o.invalid=Object.keys(SKILL_DIFFICULTY).filter(i=>!difficultyValid(SKILL_DIFFICULTY[i]));
  const gens=[...Object.values(pools).flat(),...Object.values(BONUS_POOLS).flat()];
  o.poolsUnrated=[...new Set(gens.map(g=>g.name))].filter(n=>!(n in SKILL_DIFFICULTY)&&n!=='gReading');   // gReading: pseudo-generator, each reading question carries its own rated skill
  o.counts=Object.fromEntries(DIFFICULTY.levels.map(l=>[l.id,ids.filter(i=>skillDifficulty(i)===l.id).length]));
  o.perLevel=Object.fromEntries(Object.entries(pools).map(([k,v])=>[k,[1,2,3].map(d=>v.filter(g=>skillDifficulty(g.name)===d).length)]));
  o.nulls=pools[1]===filterByDifficulty(pools[1],null);
  const easy=filterByDifficulty(pools[5],{max:1}).map(g=>g.name);
  o.easyAllEasy=easy.length>0&&easy.every(n=>skillDifficulty(n)===1);
  const hard=filterByDifficulty(pools[5],{min:3}).map(g=>g.name); o.hardAll=hard.every(n=>skillDifficulty(n)===3)&&hard.length>0;
  const mid=filterByDifficulty(pools[5],{min:2,max:2}).map(g=>g.name); o.midAll=mid.every(n=>skillDifficulty(n)===2)&&mid.length>0;
  // fallback: level 1 pool has no rating-3 skill -> closest (2)
  const fb=filterByDifficulty(pools[1],{min:3}).map(g=>g.name); o.fallback=fb.join();
  const fbB=filterByDifficulty(BONUS_POOLS[4],{max:1}).map(g=>g.name); o.fallbackBonus=fbB.join();
  // inserting a level between existing ones works without renumbering
  DIFFICULTY.levels.splice(1,0,{id:'1.5',he:'x'});
  o.insert=[difficultyRank(1),difficultyRank('1.5'),difficultyRank(2),difficultyRank(3)].join();
  o.insRange=difficultyInRange(2,{max:'1.5'})===false&&difficultyInRange('1.5',{min:1,max:2})===true;
  DIFFICULTY.levels.splice(1,1);
  // per-question override and unknown values
  o.ovr=questionDifficulty({skill:'gSharing',d:3})+','+questionDifficulty({skill:'gSharing'})+','+questionDifficulty({skill:'nope'})+','+questionDifficulty({skill:'gSharing',d:99});
  // generated questions carry d
  o.cur=[];for(let i=0;i<60;i++){level=[1,2,3,4,5,6][i%6];nextQuestion();o.cur.push(current.d);}
  o.curOk=o.cur.every(d=>[1,2,3].includes(d));
  renderBonus();o.bonusD=current.d;
  o.cq=Object.keys(cqDifficulty()).length;
  return o;});
console.log(JSON.stringify(r,null,1));
ok(r.unrated.length===0,'every skill in SKILL_META is rated: '+r.unrated);ok(r.orphans.length===0,'no rating for an unknown skill: '+r.orphans);ok(r.invalid.length===0,'all ratings are valid level ids');
ok(r.poolsUnrated.length===0,'every generator in the pools is rated');ok(r.nulls,'no filter returns the pool unchanged');
ok(r.easyAllEasy&&r.hardAll&&r.midAll,'range filter picks only matching ratings');
ok(r.fallback.length>0&&r.fallbackBonus.length>0,'out-of-range falls back to the closest ratings, never empty');
ok(r.insert==='0,1,2,3','a level inserted in the middle keeps the order without renumbering ('+r.insert+')');ok(r.insRange,'ranges respect the inserted level');
ok(r.ovr==='3,2,2,2','question override wins; unknown skill or value gets the default ('+r.ovr+')');
ok(r.curOk&&[1,2,3].includes(r.bonusD),'generated questions carry a difficulty');
ok(errs.length===0,'no page errors '+errs);
console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
