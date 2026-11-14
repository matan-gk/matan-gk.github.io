const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','גאיה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
await p.evaluate(()=>{ document.querySelectorAll('.milestone').forEach(e=>e.remove()); });
const D=86400000;
// --- ageing: per story, default 30 days
const a=await p.evaluate(()=>{ const now=Date.now(); const r0=rdClean({}); 
  rd=rdClean({done:['hedgehog'],t:{hedgehog:now-29*86400000}}); rdExpire(now); const day29=rd.done.length;
  rdExpire(now+2*86400000); const day31=rd.done.length+':'+Object.keys(rd.t).length;
  rd=rdClean({done:['hedgehog'],t:{hedgehog:now-400*86400000},days:0}); rdExpire(now); const never=rd.done.length;
  rd=rdClean({done:['hedgehog'],t:{hedgehog:now-8*86400000},days:7}); rdExpire(now); const d7=rd.done.length;
  rd=rdClean({done:['hedgehog','x']}); rdExpire(now); const noT=Object.keys(rd.t).sort().join();
  return {def:[r0.days,r0.off], day29, day31, never, d7, noT, bad:[rdClean({days:-3}).days, rdClean({days:9999}).days, rdClean({days:'x'}).days, rdClean({off:'yes'}).off]}; });
ok(a.def[0]===30&&a.def[1]===false,'defaults: 30 days, shown'); ok(a.day29===1,'a story finished 29 days ago is still done'); ok(a.day31==='0:0','31 days later it is back, and its time is removed');
ok(a.never===1,'"never" keeps it done for ever'); ok(a.d7===0,'with 7 days it returns after 8'); ok(a.noT==='hedgehog,x','a finished story with no time gets one (today)');
ok(a.bad.join()==='30,30,30,false','bad values fall back to the defaults');
// --- returning story restarts from question 1
await p.evaluate(()=>{ rd=rdClean({done:['hedgehog'],t:{hedgehog:Date.now()-31*86400000}}); saveState(); });
await p.evaluate(()=>{ renderLevels(); [...document.querySelectorAll('#levels .levelbtn')].find(b=>b.textContent.includes('ספריית')).click(); }); await p.waitForTimeout(300);
ok(await p.evaluate(()=>gameView==='play'&&current.rd&&current.rd.i===0&&!rd.done.length),'after 31 days the story is offered again from question 1'); await p.evaluate(()=>rdClose());
// --- parent switch + days + per-story list
await p.evaluate(()=>{ rd=rdClean({done:['hedgehog'],t:{hedgehog:Date.now()-5*86400000}}); saveState(); showHome(); openProfiles(false); openPanel('settings'); });
await p.waitForTimeout(200);
const card=await p.evaluate(()=>{ const c=document.querySelector('.rdset'); return c?c.textContent:''; });
ok(/ספריית הסיפורים/.test(card)&&/הקפוד|הַקִּפּוֹד/.test(card)&&/נקרא ב-/.test(card)&&/יחזור ב-/.test(card),'the settings tab has a reading card listing each story with its dates');
await p.click('[data-pact=rddays][data-id="7"]'); await p.waitForTimeout(150);
ok(await p.evaluate(()=>rd.days)===7&&await p.evaluate(()=>activeProfile().progress.rd.days)===7,'changing the days is saved in the profile');
ok(await p.locator('[data-pact=rddays][data-id="7"]').getAttribute('aria-pressed')==='true','the chosen number is marked');
await p.click('[data-pact=rddays][data-id="0"]'); await p.waitForTimeout(100);
ok(/לא יחזור/.test(await p.evaluate(()=>document.querySelector('.rdset').textContent)),'"never" shows in the story list');
await p.click('[data-pact=rddays][data-id="30"]');
await p.click('[data-pact=rdoff]'); await p.waitForTimeout(150);
ok(await p.evaluate(()=>rd.off===true&&!mxVisibleLevels(diffOn,mxState).filter(id=>id!==9||!rd.off).includes(9)),'the switch hides the section from the menu');
ok(await p.evaluate(()=>!document.querySelector('#levels')||![...document.querySelectorAll('#levels .levelbtn')].some(b=>b.textContent.includes('ספריית'))),'and the button is gone');
await p.click('[data-pact=rdoff]'); await p.waitForTimeout(100);
ok(await p.evaluate(()=>rd.off===false),'switching back shows it');
await p.click('[data-pact=rdreturn][data-id=hedgehog]'); await p.waitForTimeout(150);
ok(await p.evaluate(()=>rd.done.length===0&&!rd.t.hedgehog),'"return now" brings one story back');
// --- another profile is edited without leaving the active one
await p.evaluate(()=>{ profileAction('new'); });
await p.fill('#pfName','דן'); await p.click('.gopt:has(input[value=m])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
const ids=await p.evaluate(()=>({first:store.profiles[0].id, active:store.activeId}));
await p.evaluate(id=>{ setViewId=id; openPanel('settings'); },ids.first); await p.waitForTimeout(150);
await p.click('[data-pact=rddays][data-id="90"]'); await p.click('[data-pact=rdoff]'); await p.waitForTimeout(150);
const other=await p.evaluate(id=>{ const q=store.profiles.find(x=>x.id===id); return {days:q.progress.rd.days, off:q.progress.rd.off, activeDays:rd.days, activeOff:rd.off}; },ids.first);
ok(other.days===90&&other.off===true&&other.activeDays===30&&other.activeOff===false,'editing another profile changes only that profile: '+JSON.stringify(other));
// --- the cloud document carries it
ok(await p.evaluate(()=>{ const q=store.profiles[0]; const d=cloudDocFromProfile(q,700000,0); const r=JSON.parse(d.p).rd; return d.v===CLOUD_DOC_V&&r.days===90&&r.off===true; }),'the cloud document carries the settings');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
