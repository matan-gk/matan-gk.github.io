// Difficulty choice on the new-profile form (first run and "new profile"), with the pointer to the parent area.
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
const E=(fn,...a)=>p.evaluate(fn,...a);
// first run: the field is there, "everything" is preselected, the note points to the parent area
const opts=await E(()=>[...document.querySelectorAll('#pfDiffField .gopt')].map(l=>l.textContent.trim()));
ok(opts.length===4&&opts.some(t=>t.includes('קל'))&&opts.some(t=>t.includes('בינוני'))&&opts.some(t=>t.includes('קשה'))&&opts.some(t=>t.includes('הכול')),'first run offers easy / medium / hard / everything '+JSON.stringify(opts));
ok(await E(()=>document.querySelector('input[name=pfD]:checked').value)==='all','"everything" is the default');
ok(await E(()=>/באזור ההורים/.test(document.getElementById('pfDiffField').textContent)),'a note says the parent area is much more specific');
ok(await E(()=>{const r=document.getElementById('pfDiffField').getBoundingClientRect();return r.width<=window.innerWidth&&r.left>=0;}),'fits a 390px screen');
// choose easy for the first profile
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('.dopts .gopt:has(input[value="1"])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
ok(await E(()=>JSON.stringify(diffOn))==='[1]','the first profile starts on easy only');
const ratings=await E(()=>{const s=new Set();for(const lv of [7,1,2,6,3,4,8])for(const g of poolFor(lv))s.add(skillDifficulty(g.name));return [...s];});
ok(ratings.length===1&&ratings[0]===1,'only easy questions are offered '+ratings);
ok(await E(()=>JSON.stringify(store.profiles[0].progress.diff))==='[1]'||await E(()=>JSON.stringify(captureProgress().diff))==='[1]','saved with the profile');
// new profile from the parent area: choose hard; default stays everything when untouched
await E(()=>{profMode={view:'form',editId:null,first:false,confirmDel:null,error:''};document.getElementById('profOverlay').hidden=false;renderProfiles();});
ok(await E(()=>!!document.getElementById('pfDiffField')),'"new profile" has the field too');
await p.fill('#pfName','גיא'); await p.click('.gopt:has(input[value=m])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
ok(await E(()=>JSON.stringify(diffOn))==='[1,2,3]','a new profile left on the default gets every level');
// editing does not show it (the parent area is the place to change it later)
await E(()=>{profMode={view:'form',editId:store.activeId,first:false,confirmDel:null,error:''};renderProfiles();});
ok(await E(()=>!document.getElementById('pfDiffField')),'the edit form has no difficulty field');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close(); process.exit(f?1:0);})();
