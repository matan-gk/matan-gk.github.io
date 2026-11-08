// Space theme step 5: the questions' world, praise, party and bonus wording; the sweets stories stay exactly as they were
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
const E=(fn,...a)=>p.evaluate(fn,...a);
// ---- every generator, many draws, both themes
const R=await E(()=>{
  const all=[]; Object.values(pools).forEach(a=>a.forEach(g=>all.push(g))); Object.values(BONUS_POOLS).forEach(a=>a.forEach(g=>all.push(g)));
  const uniq=[...new Set(all)]; const out={n:uniq.length};
  const leak=/הפתעות|קסום|קסומ|קוסם|סוכר|יו-יו|קאפקייק|שלג|גולות|גולה|כובע|🦄|🍭|🧁|🍩|🍪|שקית|שקיות|קופסה|קופסאות|ינשוף|גמד|תנור|קלפ|עוג|גלידה|שוקולד|לביבות|מתנה|מתנות|דרקון|פוף/;
  const spaceWords=/חנות הגלקטית|הטכנאי|ברגי חיבור|🚀|🛸|מארזים|מכולות|רחפן|כוכבי שביט/;
  ['space','sweets'].forEach(th=>{ themeId=th; let err=0, leaks=[], sw=0, lens=0, ansBad=0;
    uniq.forEach(g=>{ for(let i=0;i<40;i++){ try{ const q=themeStory(g()); const t=String(q.label)+' '+q.text+' '+(q.explain||''); if(leak.test(t)) leaks.push(g.name+': '+t.replace(/<[^>]+>/g,' ').slice(0,100)); if(spaceWords.test(t)) sw++; lens++; if(q.answer===undefined||q.answer===null||q.answer==='undefined') ansBad++; }catch(e){ err++; } } });
    out[th]={err,leaks:leaks.slice(0,6),nleaks:leaks.length,sw,lens,ansBad}; });
  themeId='sweets'; return out; });
ok(R.n>=100,'checked '+R.n+' question types');
ok(R.space.err===0&&R.sweets.err===0&&R.space.ansBad===0,'no generator fails or loses its answer in either theme');
ok(R.space.nleaks===0,'space: no sweets or magic wording left in any question ('+R.space.nleaks+' '+R.space.leaks.join(' | ')+')');
ok(R.space.sw>200,'space: the new world appears in the questions ('+R.space.sw+')');
ok(R.sweets.sw===0,'sweets: not a single space word in any question');
ok(R.sweets.nleaks>200,'sweets: the original stories are still the sweets ones ('+R.sweets.nleaks+')');
// ---- pools are well formed
ok(await E(()=>{ const P=SPACE_POOLS; return P.SHOP_ITEMS.every(i=>i.w&&(i.m===0||i.m===1))&&P.SHOP_JARS.every(j=>j.box&&j.unit&&(j.f===0||j.f===1)&&j.cats.length===3)&&P.BOXES.every(c=>c.in&&c.tot&&c.a&&c.b&&(c.m===0||c.m===1))&&P.BUDGET_ITEMS.every(i=>i.one&&i.many)&&P.FOODS.every(x=>x.all&&x.a&&x.b)&&P.SYM_POOL.length===16&&new Set(P.SYM_POOL).size===16&&P.CATEGORY_POOLS.length===7; }),'space pools well formed');
// specific rewrites
ok(await E(()=>{ themeId='space'; const t=storyText('הגיעו לחנות ההפתעות; מחנות ההפתעות; בקופה של חנות ההפתעות'); themeId='sweets'; return t==='הגיעו לחנות הגלקטית; מהחנות הגלקטית; בקופה של החנות הגלקטית'; }),'the shop name keeps its Hebrew prefixes');
ok(await E(()=>{ themeId='sweets'; return storyText('חנות ההפתעות שקיות')==='חנות ההפתעות שקיות'; }),'sweets: storyText does nothing');
// ---- the card shows themed text in a live game
await E(()=>setProfileTheme(activeProfile(),'space')); await E(()=>{ level=1; nextQuestion(); });
const qs=await E(()=>{ const a=[]; for(let i=0;i<40;i++){ level=1; nextQuestion(); a.push(document.getElementById('qtext').textContent); } return a; });
ok(qs.some(t=>t.includes('החנות הגלקטית')||t.includes('בחנות הגלקטית'))&&!qs.some(t=>t.includes('חנות ההפתעות')),'level 1 questions on the card mention the galactic store');
// ---- help examples
await E(()=>{ const g=pools[1].find(x=>x.name==='gRemainder'); current={skill:'gRemainder',label:'x',text:'x',answer:1,type:'mcq',choices:[1]}; openHelp(); });
let h=await p.textContent('#helpBody'); ok(h.includes('מארז')&&!h.includes('שקית'),'help example uses the space wording');
await E(()=>closeHelp());
// ---- praise, wrong answer, bonus tag
const pr=await E(()=>{ const a=new Set(); for(let i=0;i<400;i++) a.add(praise()); return [...a]; });
ok(pr.includes('ברק שמח מאוד! 🚀')&&!pr.some(x=>x.includes('קאפקייק')),'praise: Barak is happy, Cupcake not mentioned');
await E(()=>{ level=1; nextQuestion(); checkAnswer('__wrong__',null,null); });
ok((await p.textContent('#feedback')).includes('ננסה עוד משימה!')&&!(await p.textContent('#feedback')).includes('קסומה'),'wrong answer: "ננסה עוד משימה!"');
await E(()=>{ level=1; renderBonus(); });
ok((await p.textContent('#qlabel')).includes('משימת בונוס'),'bonus tag: "משימת בונוס"');
await E(()=>nextQuestion());
ok((await p.textContent('#nextBtn')).includes('🚀 לשאלה הבאה'),'space: next-question button');
await E(()=>{ golden=Array(10).fill('🦄'); renderRewards(); openRoom(); renderRoom(); }); ok(!(await p.textContent('#roomBody')).includes('🎀'),'space: the room offers no look any more'); await E(()=>{ golden=[]; closeRoom(); });
// ---- party
await E(()=>showMilestone()); await p.waitForTimeout(200);
const pt=await E(()=>({h:document.querySelector('.milestone h2').textContent, txt:document.querySelector('.milestone p').textContent, alt:document.getElementById('partyImg').alt, src:document.getElementById('partyImg').src, th:partyTheme().frames.length, same:partyTheme().frames.every(x=>Object.values(THEME_ASSETS.space.mood).includes(x))}));
ok(pt.h==='חגיגה בחלל!'&&pt.alt==='ברק חוגג'&&pt.txt.includes('טייסת מספרים')&&/^data:image\/webp|\.webp$/.test(pt.src),'party: title, alt, line and Barak\'s picture: '+pt.txt.slice(0,50));
ok(pt.th===5&&pt.same,'party cycles through 5 of Barak\'s poses');
await p.screenshot({path:T.p('_out/storytest_party.png')}).catch(()=>{});
await E(()=>document.querySelector('.milestone').click()); await p.waitForTimeout(100);
// ---- sweets: all original
await E(()=>setProfileTheme(activeProfile(),'sweets'));
const pr2=await E(()=>{ const a=new Set(); for(let i=0;i<400;i++) a.add(praise()); return [...a]; });
ok(pr2.includes('קאפקייק שמח מאוד! 🦄')&&!pr2.some(x=>x.includes('ברק')),'sweets praise (current wording)');
await E(()=>{ level=1; nextQuestion(); checkAnswer('__wrong__',null,null); }); ok((await p.textContent('#feedback')).includes('ננסה עוד משימה!'),'sweets wrong answer (current wording)');
await E(()=>{ level=1; renderBonus(); }); ok((await p.textContent('#qlabel')).includes('💖 משימת בונוס'),'sweets bonus tag (current wording)'); await E(()=>nextQuestion());
ok((await p.textContent('#nextBtn')).includes('🍭 לשאלה הבאה'),'sweets: next-question button unchanged');
await E(()=>{ golden=Array(10).fill('🦄'); renderRewards(); openRoom(); renderRoom(); }); ok(!(await p.textContent('#roomBody')).includes('לוק'),'sweets: the room offers no look any more'); await E(()=>{ golden=[]; closeRoom(); });
await E(()=>showMilestone()); await p.waitForTimeout(100);
const pt2=await E(()=>({h:document.querySelector('.milestone h2').textContent, p:document.querySelector('.milestone p').textContent})); ok(pt2.h==='מסיבת קאפקייק!'&&pt2.p.includes('קוסמת מספרים'),'sweets party unchanged'); await E(()=>document.querySelector('.milestone').click());
ok(await E(()=>{ const sp=Math.random; return !PARTY_THEMES.every(t=>t.frames.every(x=>Object.values(THEME_ASSETS.space.mood).includes(x))); }),'sweets party still uses the unicorn animations');
// ---- parent samples use the same world
await E(()=>setProfileTheme(activeProfile(),'space'));
const smp=await E(()=>{ themeId='space'; const g=pools[1].find(x=>x.name==='gGroups'); let ok=0; for(let i=0;i<20;i++){ const q=themeStory(g()); if(/מארזים|מכולות|ברגים|שבבים|קפסולות|גלגלי|מצברים|מפתחות|נורות|כוכבי|מדבקות/.test(q.text)) ok++; } return ok; });
ok(smp>=18,'a themed question never keeps sweets items: '+smp+'/20');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close(); process.exit(f?1:0);
})();
