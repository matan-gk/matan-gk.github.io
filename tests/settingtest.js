const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','A');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(300);
// second profile
await p.evaluate(()=>openPanel('profiles'));await p.click('[data-pact=new]');await p.fill('#pfName','B');await p.click('.gopt:has(input[value=m])');await p.click('[data-pact=save]');await p.waitForTimeout(200);
ok(await p.evaluate(()=>JSON.stringify(diffOn))==='[1,2,3]','default = all levels');
await p.evaluate(()=>openPanel('settings'));
ok(await p.locator('input[data-dlvl]').count()===3,'3 switches');
ok((await p.locator('.pa-page').innerText()).includes('בונוס הן תמיד ברמה קשה'),'bonus comment shown');
await p.screenshot({path:'settings.png'});
// active profile (B? whichever active): turn off 2 and 3
const act=await p.evaluate(()=>store.activeId);
await p.locator('.tglw:has(input[data-dlvl="2"])').click();await p.locator('.tglw:has(input[data-dlvl="3"])').click();
ok(await p.evaluate(()=>JSON.stringify(diffOn))==='[1]','only easy after toggles');
// last one cannot be turned off
await p.locator('.tglw:has(input[data-dlvl="1"])').click();
ok(await p.evaluate(()=>JSON.stringify(diffOn))==='[1]','cannot disable the last level');
ok((await p.locator('#dswErr').innerText()).length>0,'message shown');
// questions only easy (where the pool has easy)
const r=await p.evaluate(()=>{const o={bad:0,n:0};for(let i=0;i<300;i++){level=[1,2,3,4,5,6][i%6];nextQuestion();o.n++;if(current.d!==1)o.bad++;}
 renderBonus();o.bonusD=current.d;o.bonusFlag=current.isBonus;return o;});
ok(r.bad===0&&r.n===300,'only easy questions: bad='+r.bad);ok(r.bonusD===3,'bonus still hard');
// other profile independent
const other=await p.evaluate(a=>store.profiles.find(x=>x.id!==a).id,act);
await p.click('[data-pact=setprof][data-id="'+other+'"]');
ok(await p.evaluate(()=>[...document.querySelectorAll('input[data-dlvl]')].map(x=>x.checked).join())==='true,true,true','other profile still all');
await p.locator('.tglw:has(input[data-dlvl="1"])').click();await p.locator('.tglw:has(input[data-dlvl="2"])').click();
ok(await p.evaluate(o=>JSON.stringify(profileDiff(store.profiles.find(x=>x.id===o))),other)==='[3]','non-active profile set to hard only');
ok(await p.evaluate(()=>JSON.stringify(diffOn))==='[1]','active unchanged');
// persistence + switching
await p.reload();
ok(await p.evaluate(()=>JSON.stringify(diffOn))==='[1]','active persisted after reload');
await p.evaluate(o=>{switchProfile?switchProfile(o):0;},other).catch(()=>{});
const sw=await p.evaluate(o=>{ if(typeof switchProfile==='function'){return JSON.stringify(diffOn);} return 'nosw';},other);
console.log('after switch:',sw);
// hard only pool
const h=await p.evaluate(o=>{const pr=store.profiles.find(x=>x.id===o);diffOn=[3];let bad=0;for(let i=0;i<300;i++){level=[1,2,3,4,5,6][i%6];nextQuestion();if(current.d!==3)bad++;}return bad;},other);
ok(h===0,'hard only: bad='+h);
const m=await p.evaluate(()=>{diffOn=[1,3];let seen=new Set();for(let i=0;i<400;i++){level=5;nextQuestion();seen.add(current.d);}return [...seen].sort().join();});
ok(m==='1,3','easy+hard only skips medium: '+m);
// save code roundtrip keeps setting
const rt=await p.evaluate(()=>{const c=cleanProgress({diff:[2,9,'x',2]});return JSON.stringify(c.diff)+JSON.stringify(cleanProgress({}).diff)+JSON.stringify(cleanProgress({diff:[]}).diff);});
ok(rt==='[2][1,2,3][1,2,3]','cleaning: '+rt);

// menu entry, header, samples
await p.evaluate(()=>{closeProfiles&&closeProfiles();});
await p.click('#menuBtn');ok(await p.locator('#topMenu [data-menu="panel:profiles"]').count()===1,'menu has the parent area');
await p.click('#topMenu [data-menu="panel:profiles"]');await p.waitForTimeout(100);await p.click('.vtab[data-id=settings]');await p.waitForTimeout(100);
ok(await p.locator('.vtab.on').innerText().then(t=>t.includes('הגדרות')),'menu opens the Settings tab');
ok((await p.locator('.pa-scope').innerText()).includes('חלות על'),'switcher is labelled');
ok(!(await p.locator('.pa-rows .pa-main-txt small').nth(1).innerText()).includes('לזכור'),'medium description clarified');
for(const l of [1,2,3]){
  await p.click('[data-pact=sample][data-id="'+l+'"]');await p.waitForTimeout(100);
  const o=await p.evaluate(()=>({n:document.querySelectorAll('#sampleBody .smpq').length,oks:[...document.querySelectorAll('#sampleBody .smpq')].map(q=>q.querySelectorAll('.smpok').length + (q.textContent.includes('תשובה:')?1:0)),title:document.getElementById('sampleTitle').textContent,vis:!document.getElementById('sampleOverlay').hidden}));
  ok(o.vis&&o.n===2&&o.oks.every(x=>x===1),'sample modal level '+l+': '+JSON.stringify(o));
  if(l===3){await p.waitForTimeout(600);await p.screenshot({path:'sample.png'});}
  await p.click('#sampleBody .btn');await p.waitForTimeout(50);
  await p.click('#sampleClose');ok(await p.evaluate(()=>document.getElementById('sampleOverlay').hidden),'modal closes');
}
ok(await p.evaluate(()=>{for(const l of [1,2,3]){sampleLevel=l;for(let i=0;i<40;i++){renderSample();const ts=[...document.querySelectorAll('#sampleBody .smplbl')].length;if(ts!==2)return false;}}return true;}),'samples render repeatedly');
ok(errs.length===0,'no page errors '+errs);
await b.close();process.exit(f?1:0);})();
