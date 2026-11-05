const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{if(!c){f++;console.log('FAIL',m);}else console.log('ok  ',m);};
(async()=>{const b=await chromium.launch({...T.launchOpts});const pg=await b.newPage({viewport:{width:390,height:800}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto(T.URL);await pg.evaluate(()=>localStorage.clear());await pg.reload();
// fresh install: welcome panel has no tabs
ok(await pg.locator('.ptabs').count()===0,'welcome/form view has no tabs');
await pg.fill('#pfName','<img src=x onerror=window.__x=1>'); await pg.click('.gopt:has(input[value=n])'); await pg.click('[data-pact=save]');
// play some answers through the real UI
for(let i=0;i<10;i++){ await pg.evaluate(()=>{checkAnswer(current.answer,null,null);}); await pg.evaluate(()=>{document.querySelectorAll('.milestone').forEach(e=>e.remove());document.getElementById('celebOverlay').hidden=true;celebQueue=[];celebOpen=false;nextQuestion();}); }
await pg.evaluate(()=>openPanel('profiles'));
ok((await pg.textContent('#profTitle')).includes('פרופילים'),'opens on the profiles section');
await pg.evaluate(()=>openPanel('progress'));
ok(await pg.locator('.sk-hero').count()===1,'progress tab renders overview');
ok((await pg.locator('.sk-skill').count())>0,'skills listed');
ok(await pg.evaluate(()=>window.__x===undefined),'name is escaped (no injected HTML)');
ok(await pg.locator('.pa-scope .pa-chip').count()===1,'scope bar with single profile shows just that profile');
await pg.evaluate(()=>openPanel('profiles')); ok(await pg.locator('.prow').count()===1,'back to profiles list');
// add second profile, picker appears, switch to it, empty state
await pg.click('[data-pact=new]'); await pg.fill('#pfName','דן'); await pg.click('.gopt:has(input[value=m])'); await pg.click('[data-pact=save]');
await pg.evaluate(()=>openPanel('progress'));
ok(await pg.locator('.pa-scope .pa-chip').count()===2,'picker with two profiles');
ok(await pg.locator('.sk-empty').count()===1,'new active profile shows empty state');
await pg.click('.pa-scope .pa-chip >> nth=0'); ok(await pg.locator('.sk-hero').count()===1,'picker shows other profile stats');
// deleting the viewed profile falls back gracefully
await pg.evaluate(()=>{statsViewId=store.profiles[0].id;profileAction('del',store.profiles[0].id);profileAction('delyes',store.profiles[0].id);profTab='progress';renderProfiles();});
ok(await pg.locator('.sk-empty').count()===1,'deleted viewed profile: falls back to remaining profile');
// tab bar not shown while editing
await pg.evaluate(()=>{profTab='profiles';profileAction('edit',store.profiles[0].id);}); ok(await pg.locator('.ptabs').count()===0,'no tabs in edit form');
ok(errs.length===0,'no page errors '+errs.join('|'));
console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
