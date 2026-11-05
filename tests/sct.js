const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{if(!c){f++;console.log('FAIL',m);}else console.log('ok  ',m);};
const URL=T.URL;
(async()=>{const b=await chromium.launch({...T.launchOpts});
const errs=[];
async function newDev(){const ctx=await b.newContext({viewport:{width:390,height:900},permissions:['clipboard-read','clipboard-write']});const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));await pg.goto(URL);await pg.evaluate(()=>localStorage.clear());await pg.reload();return {ctx,pg};}
// ---------- device 1
const d1=await newDev(); const p1=d1.pg;
await p1.fill('#pfName','נועה');await p1.click('.gopt:has(input[value=f])');await p1.click('[data-pact=save]');
await p1.evaluate(()=>{for(let i=0;i<30;i++){nextQuestion();checkAnswer(i%4?current.answer:'__w__',null,null);} for(let i=0;i<14;i++)collection.push(STICKERS[i%14]); legacyLooks=2;saveState();});
await p1.evaluate(()=>{openProfiles(false);profileAction('new');}); await p1.fill('#pfName','דן <b>x</b>');await p1.click('.gopt:has(input[value=m])');await p1.click('[data-pact=save]');
await p1.evaluate(()=>{for(let i=0;i<10;i++){nextQuestion();checkAnswer(current.answer,null,null);}saveState();});
const before=await p1.evaluate(()=>store.profiles.map(p=>({id:p.id,name:p.name,score:p.id===store.activeId?score:p.progress.score,log:p.stats.log.length})));
await p1.evaluate(()=>{document.querySelectorAll('.milestone').forEach(e=>e.remove());document.getElementById('profOverlay').hidden=true;});
await p1.evaluate(()=>openPanel('profiles')); await p1.evaluate(()=>openPanel('backup'));
ok(await p1.locator('#bkSel option').count()===3,'selector: all + 2 profiles');
await p1.click('[data-pact=bkgen]'); await p1.waitForSelector('#bkCode');
const codeAll=await p1.inputValue('#bkCode'); ok(codeAll.startsWith('CQ1.z.'),'code for all profiles created ('+codeAll.length+' chars)');
console.log('   info:',await p1.locator('.bkinfo').innerText());
await p1.click('[data-pact=bkcopy]'); await p1.waitForTimeout(150);
const clip=await p1.evaluate(()=>navigator.clipboard.readText()); ok(clip===codeAll,'copy button puts the exact code on the clipboard');
ok(await p1.locator('.pbadge:has-text("הועתק")').count()===1,'copied confirmation shown');
await p1.screenshot({path:'s1.png'});
// single profile, no stats
await p1.selectOption('#bkSel',before[0].id); await p1.locator('.pa-switch:has(#bkStats)').click(); await p1.click('[data-pact=bkgen]'); await p1.waitForSelector('#bkCode');
const codeOne=await p1.inputValue('#bkCode'); ok(codeOne.length<codeAll.length,'single profile without stats is shorter ('+codeOne.length+' chars)');
ok(await p1.locator('.bkinfo').innerText().then(t=>t.includes('פרופיל אחד')&&t.includes('בלי סטטיסטיקות')),'info line describes the code');
// ---------- device 2: fresh install, restore all
const d2=await newDev(); const p2=d2.pg;
ok(await p2.locator('[data-pact=restorefirst]').count()===1,'welcome screen offers "I have a code"');
await p2.click('[data-pact=restorefirst]'); ok(await p2.locator('#profClose').evaluate(e=>getComputedStyle(e).visibility)==='hidden','cannot close without a profile');
await p2.fill('#bkRestoreText','CQ1.z.garbage'); await p2.click('[data-pact=bkcheck]'); await p2.waitForTimeout(250); ok(await p2.locator('.bkmsg.bad').count()===1,'garbage code: friendly error');
await p2.fill('#bkRestoreText',codeAll.slice(0,codeAll.length-30)); await p2.click('[data-pact=bkcheck]'); await p2.waitForTimeout(250); ok(await p2.locator('.bkmsg.bad').count()===1,'cut-off code: friendly error');
await p2.fill('#bkRestoreText',codeAll.replace(/(.{60})/g,'$1\n')); await p2.click('[data-pact=bkcheck]'); await p2.waitForTimeout(250); await p2.waitForSelector('.bkrow');
ok(await p2.locator('.bkrow').count()===2,'preview lists both profiles (code pasted with line breaks)');
ok(await p2.locator('.bkrow select').first().inputValue()==='add','default for a new device: add');
ok(await p2.evaluate(()=>!document.body.innerHTML.includes('<b>x</b>')||document.body.innerHTML.includes('&lt;b&gt;x')),'names are escaped in the preview');
await p2.screenshot({path:'s2.png'});
await p2.click('[data-pact=bkrestore]'); await p2.waitForTimeout(250); await p2.waitForTimeout(300);
const after=await p2.evaluate(()=>({n:store.profiles.length,ids:store.profiles.map(p=>p.id),active:store.activeId,overlayHidden:document.getElementById('profOverlay').hidden,score:store.profiles.map(p=>p.id===store.activeId?score:p.progress.score),log:store.profiles.map(p=>p.stats.log.length),coll:collection.length,looks:legacyLooks}));
ok(after.n===2&&after.overlayHidden,'restored 2 profiles, panel closed');
ok(JSON.stringify(after.ids)===JSON.stringify(before.map(x=>x.id)),'profile ids preserved'); ok(after.active===before[0].id,'first profile active');
ok(after.score[0]===before[0].score&&after.score[1]===before[1].score,'scores restored '+after.score); ok(after.log[0]===before[0].log&&after.log[1]===before[1].log,'statistics restored '+after.log);
ok(after.coll>=14&&after.looks===2,'rewards and the opened-looks count restored');
await p2.reload(); ok(await p2.evaluate(()=>store.profiles.length)===2,'restored data persists after reload');
await p2.screenshot({path:'s3.png'});
// ---------- device 1: conflicts
await p1.fill('#bkRestoreText',codeAll); await p1.click('[data-pact=bkcheck]'); await p1.waitForTimeout(250);
ok(await p1.locator('.bkrow select').first().inputValue()==='new','conflict default: add as new (safe)');
ok(await p1.locator('.bkrow select').first().locator('option').allInnerTexts().then(a=>a.length===3),'conflict offers new / replace / skip');
await p1.screenshot({path:'s4.png'});
// change progress then roll back with replace
await p1.evaluate(()=>{score=99999;saveState();});
const ai=await p1.evaluate(()=>store.profiles.findIndex(p=>p.id===store.activeId)); await p1.selectOption('.bkrow >> nth='+ai+' >> select','replace'); await p1.selectOption('.bkrow >> nth='+(1-ai)+' >> select','skip');
await p1.click('[data-pact=bkrestore]'); await p1.waitForTimeout(250); await p1.waitForTimeout(300);
let st=await p1.evaluate((ai)=>({n:store.profiles.length,score,shown:document.getElementById('score').textContent,bak:!!localStorage.getItem('cupcakeQuestSave_v2_before_restore'),bakScore:JSON.parse(localStorage.getItem('cupcakeQuestSave_v2_before_restore')).profiles[ai].progress.score}),ai);
console.log(JSON.stringify(st),JSON.stringify(before.map(b=>b.score)));
ok(st.n===2&&st.score===before[ai].score&&st.shown==String(before[ai].score),'replace rolled the active profile back and refreshed the screen');
ok(st.bak&&st.bakScore===99999,'backup of the pre-restore state saved');
ok(await p1.locator('.bkmsg.good').count()===1,'success message shown');
// add as new
await p1.fill('#bkRestoreText',codeOne); await p1.click('[data-pact=bkcheck]'); await p1.waitForTimeout(250); await p1.click('[data-pact=bkrestore]'); await p1.waitForTimeout(250); await p1.waitForTimeout(200);
ok(await p1.evaluate(()=>store.profiles.length)===3,'code of one profile added as a new copy');
ok(await p1.evaluate(()=>store.profiles[2].stats.log.length)===0,'no-stats code adds empty stats');
// replace without stats keeps existing stats
await p1.fill('#bkRestoreText',codeOne); await p1.click('[data-pact=bkcheck]'); await p1.waitForTimeout(250); await p1.selectOption('.bkrow >> nth=0 >> select','replace'); await p1.click('[data-pact=bkrestore]'); await p1.waitForTimeout(250); await p1.waitForTimeout(200);
ok(await p1.evaluate(()=>store.profiles[0].stats.log.length)===before[0].log,'replace from a no-stats code keeps the existing statistics');
// limit
await p1.evaluate(()=>{while(store.profiles.length<8) store.profiles.push({id:'x'+store.profiles.length,name:'f',gender:'f',progress:{},stats:statsNew()}); persist(); renderProfiles();});
await p1.fill('#bkRestoreText',codeAll); await p1.click('[data-pact=bkcheck]'); await p1.waitForTimeout(250); await p1.selectOption('.bkrow >> nth=0 >> select','new'); await p1.click('[data-pact=bkrestore]'); await p1.waitForTimeout(250);
ok(await p1.locator('.bkmsg.bad').count()===1&&await p1.evaluate(()=>store.profiles.length)===8,'profile limit enforced, nothing changed');
// skip all
await p1.selectOption('.bkrow >> nth=0 >> select','skip'); await p1.selectOption('.bkrow >> nth=1 >> select','skip'); await p1.click('[data-pact=bkrestore]'); await p1.waitForTimeout(250); ok(await p1.locator('.bkmsg.bad').count()===1,'skipping everything is a no-op message');
// code view cleared on reopen
await p1.click('#profClose'); await p1.evaluate(()=>openPanel('profiles')); await p1.evaluate(()=>openPanel('backup')); ok(await p1.locator('#bkCode').count()===0,'generated code is not kept after closing the panel');
// foreign/empty
await p1.fill('#bkRestoreText',''); await p1.click('[data-pact=bkcheck]'); await p1.waitForTimeout(250); ok(await p1.locator('.bkmsg.bad').count()===1,'empty field message');
ok(errs.length===0,'no page errors '+errs.join('|'));
console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
