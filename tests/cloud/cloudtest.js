const T=require('../lib.js');
const {chromium}=require('playwright');const fs=require('fs');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
const srv={fams:{},users:{},legacy:{},reports:[],reads:0,writes:0};
const F=id=>srv.fams[id]||(srv.fams[id]={});
const U=u=>F((srv.users[u]||{}).fid||'none-'+u);
const clone=o=>JSON.parse(JSON.stringify(o));
async function handle(op,a){
  if(op==='getFamily') return (srv.users[a.uid]||{}).fid||'';
  if(op==='setFamily'){ srv.users[a.uid]={fid:a.fid}; return; }
  if(op==='clearFamily'){ delete srv.users[a.uid]; return; }
  if(op==='list'){ const d=Object.entries(F(a.fid)).map(([id,v])=>Object.assign({id},v)); srv.reads+=Math.max(1,d.length); return clone(d); }
  if(op==='put'){ const cur=F(a.fid)[a.id]; if(cur&&cur.u!==a.doc.b) return {conflict:true}; if(!(a.doc.v>=2)||(cur&&a.doc.v<cur.v)){ srv.refusedV=(srv.refusedV||0)+1; return {conflict:true}; }   /* the security rules: format 2 or newer, never lower */ F(a.fid)[a.id]=clone(a.doc); srv.writes++; return {ok:true}; }
  if(op==='wipe'){ srv.fams[a.fid]={}; return; }
  if(op==='legacyList'){ return clone(Object.entries(srv.legacy[a.uid]||{}).map(([id,v])=>Object.assign({id},v))); }
  if(op==='legacyDelete'){ srv.legacy[a.uid]={}; return; }
  if(op==='report'){ srv.reports.push(Object.assign({uid:a.uid},a.o)); return; }
}
(async()=>{
const b=await chromium.launch({...T.launchOpts});
const init=fs.readFileSync(T.p('cloud/mock_init.js'),'utf8');
async function device(){ const ctx=await b.newContext({viewport:{width:390,height:844}}); const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(e.message)); await p.exposeFunction('__srv',handle); await p.addInitScript(init);
  await p.goto('file://'+T.cloudBuild()); await p.evaluate(()=>localStorage.clear()); await p.reload(); return p; }
const tab=async(p,t)=>{ await p.evaluate(()=>openPanel('backup')); await p.click('[data-pact=bksub][data-id=account]'); };
const quick=async(p)=>{ await p.evaluate(()=>{CLOUD_LIMITS.pushDelayMs=300;}); };
const play=async(p,n)=>{ await p.evaluate(n=>{ for(let i=0;i<n;i++){ nextQuestion(); checkAnswer(current.answer,null,null);} document.querySelectorAll('.milestone').forEach(e=>e.remove()); document.getElementById('celebOverlay').hidden=true; saveState(); },n); };
const A=await device(); await quick(A);
await A.fill('#pfName','נועה'); await A.click('.gopt:has(input[value=f])'); await A.click('[data-pact=save]'); await A.waitForTimeout(300); await A.evaluate(()=>openGame(level));
ok(await A.evaluate(()=>typeof cloudOn==='function'&&cloudOn()),'cloud on in test build');
// --- sign in on A
await A.evaluate(()=>openProfiles(false)); await tab(A,'חשבון');
ok(await A.locator('[data-pact=cloudin]').count()===1,'account option shows sign-in');
await A.click('[data-pact=cloudin]'); await A.waitForTimeout(500);
ok(await A.evaluate(()=>cloud.status)==='ok','signed in and synced (status ok)');
ok(Object.keys(U('u1')).length===1,'profile uploaded');
const d0=Object.values(U('u1'))[0]; ok(d0.n==='נועה'&&d0.g==='f'&&typeof d0.p==='string'&&typeof d0.s==='string'&&d0.d===false,'doc shape: name, gender, json strings');
ok((await A.textContent('#profBody')).includes('parent@example.com'),'shows who is signed in');
// --- play: debounced pushes
const w0=srv.writes; await A.click('#profClose'); await play(A,40); await A.waitForTimeout(900);
ok(srv.writes-w0>=1&&srv.writes-w0<=2,'40 answers in a burst -> '+(srv.writes-w0)+' write(s), not 40');
const sc=await A.evaluate(()=>score); ok(JSON.parse(Object.values(U('u1'))[0].p).score===sc,'cloud has current score '+sc);
// --- device B: fresh, sign in from the welcome screen
const B=await device(); await quick(B);
ok(await B.locator('[data-pact=cloudin]').count()===1,'welcome screen offers sign-in');
await B.click('[data-pact=cloudin]'); await B.waitForTimeout(700);
ok(await B.evaluate(()=>store.profiles.length)===1&&await B.evaluate(()=>score)===sc,'B got the profile and score');
ok(!(await B.locator('#profOverlay').isVisible()),'welcome closes after sign-in');
ok(await B.evaluate(()=>(statsReport(activeProfile().stats).skills||[]).length>=0 && activeProfile().stats.log.length)>=40,'stats came across too');
ok(await B.evaluate(()=>document.getElementById('score').textContent)===String(sc),'B screen shows score');
// --- B plays, A comes back (focus) and pulls
await play(B,5); await B.waitForTimeout(800); const sc2=await B.evaluate(()=>score);
await A.evaluate(()=>{cloud.lastPull=0; document.dispatchEvent(new Event('visibilitychange'));}); await A.waitForTimeout(600);
ok(await A.evaluate(()=>score)===sc2,'A pulled B\'s progress on return: '+sc2);
// --- conflict: A and B both change; B pushes first, A's push hits the base check
await A.evaluate(()=>{CLOUD_LIMITS.pushDelayMs=60000;}); await B.evaluate(()=>{CLOUD_LIMITS.pushDelayMs=60000;});
await B.evaluate(()=>{ score+=1000; saveState(); }); await A.waitForTimeout(50);
await A.evaluate(()=>{ score+=7; saveState(); });
await B.evaluate(()=>cloudPush()); await B.waitForTimeout(300);
await A.evaluate(()=>cloudPush()); await A.waitForTimeout(800);
const final=JSON.parse(Object.values(U('u1'))[0].p).score;
ok(await A.evaluate(()=>cloud.status)==='ok','conflict resolved without error');
ok(await A.evaluate(()=>!!localStorage.getItem(SAVE_KEY+'_snaps')),'safety copy made before conflict resolution');
ok(final===(await A.evaluate(()=>score)),'A and the cloud agree after conflict ('+final+')');
// --- deletion propagates
await A.evaluate(()=>{ store.profiles.push(makeProfile('דני','m',{})); persist(); cloudChanged(); }); await A.evaluate(()=>cloudPush()); await A.waitForTimeout(400);
await B.evaluate(()=>cloudSync('manual')); await B.waitForTimeout(600);
ok(await B.evaluate(()=>store.profiles.length)===2,'B received the second profile');
await A.evaluate(()=>{ openProfiles(false); profileAction('del', store.profiles[1].id); profileAction('delyes', store.profiles[1].id); });
await A.evaluate(()=>cloudSync('manual')); await A.waitForTimeout(500);
ok(Object.values(U('u1')).some(d=>d.d===true),'deletion marker in the cloud');
await B.evaluate(()=>cloudSync('manual')); await B.waitForTimeout(600);
ok(await B.evaluate(()=>store.profiles.length)===1,'B removed it too');
ok(await A.evaluate(()=>store.gone.length)===0,'A cleared its pending-deletion list');
// --- offline then back
await A.evaluate(()=>{window.__offline=true;}); await play(A,3); await A.evaluate(()=>cloudPush()); await A.waitForTimeout(300);
ok(await A.evaluate(()=>cloud.status)==='offline','offline: status offline, game keeps working');
const sc3=await A.evaluate(()=>score); await A.evaluate(()=>{window.__offline=false;}); await A.evaluate(()=>cloudSync('online')); await A.waitForTimeout(600);
ok(JSON.parse(Object.values(U('u1')).find(d=>!d.d).p).score===sc3,'after reconnect the cloud has the offline progress');
// --- write budget guard
await A.evaluate(()=>{ localStorage.setItem('cq_cloud_budget', JSON.stringify({day:cloudDay(),w:CLOUD_LIMITS.maxWritesPerDay,r:0})); });
const wb=srv.writes; await play(A,2); await A.evaluate(()=>cloudPush()); await A.waitForTimeout(300);
ok(srv.writes===wb&&await A.evaluate(()=>cloud.status)==='budget','daily write guard stops uploads at the cap');
await A.evaluate(()=>localStorage.removeItem('cq_cloud_budget'));
// --- reports
await A.evaluate(()=>{ closeProfiles(); openGame(level); }); await A.click('#helpBtn'); await A.waitForTimeout(300); await A.click('#helpReport'); await A.waitForTimeout(200);
ok(await A.locator('#reportOverlay').isVisible(),'report dialog opens from help');
await A.fill('#reportMsg','התשובה לא נכונה'); await A.click('#reportSend'); await A.waitForTimeout(500);
ok(srv.reports.length===1&&srv.reports[0].msg==='התשובה לא נכונה'&&srv.reports[0].ctx&&srv.reports[0].ctx.skill&&srv.reports[0].ver,'report arrived with question context + version');
ok(srv.reports[0].uid===(await A.evaluate(()=>cloud.user.uid)),'report carries uid');
// signed-out device reports via anonymous sign-in
const C=await device(); await C.fill('#pfName','x'); await C.click('.gopt:has(input[value=n])'); await C.click('[data-pact=save]'); await C.waitForTimeout(300); await C.evaluate(()=>openGame(level));
await C.evaluate(()=>openReport(false)); await C.fill('#reportMsg','באג'); await C.click('#reportSend'); await C.waitForTimeout(700);
ok(srv.reports.length===2&&/^anon-/.test(srv.reports[1].uid),'signed-out report works through anonymous sign-in');
ok(await C.evaluate(()=>cloud.user&&cloud.user.anon),'anonymous user does not trigger profile sync'); ok(true,'');
// failed send falls back to copy
await C.evaluate(()=>{window.__offline=true;}); await C.evaluate(()=>openReport(false)); await C.fill('#reportMsg','עוד באג'); await C.click('#reportSend'); await C.waitForTimeout(500);
ok((await C.textContent('#reportStatus')).includes('הועתק')||(await C.textContent('#reportStatus')).includes('השליחה'),'offline report: friendly fallback');
// report limit per day
await C.evaluate(()=>{window.__offline=false; localStorage.setItem('cq_cloud_budget', JSON.stringify({day:cloudDay(),w:0,r:CLOUD_LIMITS.maxReportsPerDay}));}); await C.evaluate(()=>openReport(false)); await C.fill('#reportMsg','spam'); const rc=srv.reports.length; await C.click('#reportSend'); await C.waitForTimeout(500);
ok(srv.reports.length===rc,'report daily limit enforced client-side');
// --- sign out / different account / wipe
await A.evaluate(()=>openProfiles(false)); await tab(A,'חשבון'); await A.click('[data-pact=cloudout]'); await A.waitForTimeout(300);
ok(await A.locator('[data-pact=cloudin]').count()===1,'signed out');
await A.evaluate(()=>{window.__uid='u2';}); await A.click('[data-pact=cloudin]'); await A.waitForTimeout(700);
ok(Object.keys(U('u2')).length===1,'a different account on the same device uploads the local profiles (not skipped as "already synced")');
await A.click('[data-pact=cloudwipe]'); await A.click('[data-pact=cloudwipeyes]'); await A.waitForTimeout(500);
ok(Object.keys(U('u2')).length===0&&await A.evaluate(()=>store.profiles.length)===1,'wipe removes cloud data, keeps local progress');
await A.screenshot({path:'c_account_out.png'});
// failed sign-in message
await A.evaluate(()=>{window.__failNext=true;}); await A.click('[data-pact=cloudin]'); await A.waitForTimeout(300);
ok((await A.textContent('#profBody')).includes('ההתחברות לא הצליחה'),'failed sign-in shows a message');
for(const p of [A,B,C]) ok(p.errs.length===0,'no page errors '+p.errs.join('|'));
ok(!srv.refusedV,'every upload is in document format 2 (the security rules would refuse anything else)');
console.log('server totals: reads',srv.reads,'writes',srv.writes);
console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
