const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
const plainify=()=>p.evaluate(()=>{delete LAYERS['✨'];});await plainify();   // every reward kind is layered now; the merge tests need one plain kind, so the sparkles are turned plain in the page (old saves can still hold plain items)
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=n])');await p.click('[data-pact=save]');await p.waitForTimeout(300);
// merge a kind through the real flow
await p.evaluate(()=>{collection=Array(23).fill('✨');saveState();renderRewards();});
await p.evaluate(()=>{doMerge('✨');}); await p.waitForTimeout(1200);await p.evaluate(()=>closeCeleb());
let st=await p.evaluate(()=>({c:collection.filter(x=>x==='✨').length,g:golden.filter(x=>x==='✨').length}));
ok(st.c===13&&st.g===1,'merge used 10 ('+JSON.stringify(st)+')');
// the upgraded item is a memory vault: tapping it shows the 10 rewards inside, nothing can be taken apart
await p.click('#rewardsStrip');await p.waitForTimeout(300);
await p.click('.ritem.gold[data-kind="✨"]');await p.waitForTimeout(200);
const v=await p.evaluate(()=>({n:document.querySelectorAll('#celebBody .vitem').length,txt:document.getElementById('celebBody').textContent,btns:[...document.querySelectorAll('#celebBtns .btn')].length}));
ok(v.n===10&&v.btns===1&&!v.txt.includes('לפרק'),'tapping an upgraded item shows the 10 rewards it was made from, with only a close button');
await p.screenshot({path:'u_vault.png'});await p.click('#celebBtns .btn');
st=await p.evaluate(()=>({c:collection.length,g:golden.length}));ok(st.c===13&&st.g===1,'viewing changes nothing');
ok(await p.evaluate(()=>typeof doUnmergeGold==='undefined'&&typeof askUnmergeGold==='undefined'&&typeof doUnlockLook==='undefined'&&typeof wearLook==='undefined'),'un-merge and the look wardrobe are gone');
const room=await p.evaluate(()=>{const t=document.getElementById('roomBody').textContent;return {wardrobe:document.querySelectorAll('.wardrobe,.look').length,mentionsLook:t.includes('לוק')}});
ok(room.wardrobe===0&&!room.mentionsLook,'the gift room has no look section');
// 10 upgraded items of one kind no longer offer a look
await p.evaluate(()=>{collection=[];golden=Array(12).fill('🍦');saveState();renderRewards();});
ok(await p.evaluate(()=>readyList().length===0&&celebQueue.length===0),'ten upgraded items of one kind offer nothing more (no looks)');
// cotton candy is a regular layered reward
await p.evaluate(()=>{golden=[];collection=Array(10).fill('☁️:0.0.0');renderRewards();doMerge('☁️');});await p.waitForTimeout(1200);await p.evaluate(()=>closeCeleb());
ok(await p.evaluate(()=>collection.filter(x=>kOf(x)==='☁️').length===0&&golden.some(g=>kOf(g)==='☁️')),'cotton candy merged like any other reward');
// persistence: the memory survives a reload
const before=await p.evaluate(()=>golden.slice());await p.reload();await plainify();
ok(await p.evaluate(b=>JSON.stringify(golden)===JSON.stringify(b)&&goldItems(kOf(golden[0]),golden[0]).length===10,before),'upgraded items and what is inside them survive a reload');
// old saves with looks: the count is kept, the rest dropped
const cl=await p.evaluate(()=>{const c=cleanProgress({looks:[0,1,2,2,99],lookSrc:{0:'✨'},activeLook:1});return {n:c.legacyLooks,keys:Object.keys(c).filter(k=>/look/i.test(k))}});
ok(cl.n===3&&cl.keys.join()==='legacyLooks','a save with 3 opened looks keeps only the count: '+JSON.stringify(cl));
ok(await p.evaluate(()=>'legacyLooks' in captureProgress()),'the count is part of the saved progress');
ok(errs.length===0,'no page errors '+errs);console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
