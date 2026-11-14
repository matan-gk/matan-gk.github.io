const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
const E=(fn,...a)=>p.evaluate(fn,...a);
const btns=()=>E(()=>[...document.querySelectorAll('#levels .levelbtn')].map(b=>({t:b.textContent.trim(),img:!!b.querySelector('img.lvimg'),src:(b.querySelector('img.lvimg')||{}).src||'',w:b.querySelector('img.lvimg')?b.querySelector('img.lvimg').offsetWidth:0})));
const sw=await btns();
ok(sw.length===9&&sw.filter(x=>x.img).length===3&&sw[0].t.includes('ארמון המספרים')&&sw[7].t.includes('אתגר הקשת בענן')&&sw[8].t.includes('ספריית הסיפורים'),'sweets: names and emoji unchanged, the reading section last');
await E(()=>setProfileTheme(activeProfile(),'space')); await p.waitForTimeout(100);
const sp=await btns();
const names=sp.map(x=>x.t);
const want=['אימון טייסת חלל','חנות גלקטית','אותות מהחלל','מכונת הזמן','בית חרושת רובוטי','רובוט בילוש','תכנון חלליות','אליפות הרובוטים'];
const order=await E(()=>LEVELS.map(l=>l.id));
const expectOrder={7:'אימון טייסת חלל',1:'חנות גלקטית',2:'אותות מהחלל',6:'מכונת הזמן',3:'בית חרושת רובוטי',4:'רובוט בילוש',8:'תכנון חלליות',5:'אליפות הרובוטים',9:'📖ספריית הסיפורים'};
ok(sp.length===9&&order.every((id,i)=>names[i]===expectOrder[id]),'space: the 8 section names, in the same order: '+names.join(' | '));
ok(sp.slice(0,8).every(x=>x.img&&x.w===64)&&new Set(sp.slice(0,8).map(x=>x.src)).size===8&&!sp[8].img,'space: 8 different section pictures, each 64 px (the reading section has no picture yet)');
// gendered first name
await E(()=>{ activeProfile().gender='m'; curGender='m'; renderLevels(); });
ok((await btns())[0].t==='אימון טייס חלל','boy: אימון טייס חלל');
await E(()=>{ activeProfile().gender='n'; curGender='n'; renderLevels(); });
ok((await btns())[0].t==='אימון טייס חלל','neutral: אימון טייס חלל');
await E(()=>{ activeProfile().gender='f'; curGender='f'; renderLevels(); });
// selecting a section still works
await p.locator('#levels .levelbtn').nth(3).click(); await p.waitForTimeout(100);
ok(await E(()=>level===6)&&await p.locator('#levels .levelbtn.active').count()===1,'tapping a picture selects that section (clock = 6)');
// mix, hidden section, fine-tuning interplay
await E(()=>{ mxState={off:[],hide:pools[6].map(g=>g.name)}; renderLevels(); });
const hid=await btns(); ok(hid.length===8&&!hid.some(x=>x.t==='מכונת הזמן')&&await E(()=>level===5),'a hidden section leaves the themed menu too; she moves to the mix');
await E(()=>{ mxState={off:[],hide:[]}; renderLevels(); });
// parent area keeps default names
const par=await E(()=>{ setViewId=store.activeId; openPanel('settings'); document.querySelector('details.mxd').open=true; return [...document.querySelectorAll('table.qmx tbody th')].map(t=>t.textContent.trim()); });
ok(par.length===7&&par.some(n=>n.includes('ארמון המספרים'))&&!par.some(n=>n.includes('טייס')),'parent area still shows the default section names');
await E(()=>closeProfiles());
// back to sweets
await E(()=>setProfileTheme(activeProfile(),'sweets'));
const back=await btns(); ok(back.filter(x=>x.img).length===3&&back[0].t.includes('ארמון המספרים'),'switching back restores names and emoji');
// coverage
await E(()=>setProfileTheme(activeProfile(),'space'));
ok(await E(()=>{ const g=themeCoverage('space').find(x=>x.id==='level'); return g.have===8&&g.need===9; }),'coverage: section pictures 8 of 9 (the reading section has none yet, and the report says so)');
await p.evaluate(()=>{ document.getElementById('levels').scrollIntoView(); }); await p.screenshot({path:'levels_space.png'});
ok(errs.length===0,'no page errors '+errs);
console.log(f?'FAILURES '+f:'ALL PASS'); await b.close(); process.exit(f?1:0);})();
