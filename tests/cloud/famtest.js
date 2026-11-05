const T=require('../lib.js');
const {chromium}=require('playwright');const fs=require('fs');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
const srv={fams:{},users:{},legacy:{},reports:[],reads:0,writes:0};
const F=id=>srv.fams[id]||(srv.fams[id]={});
const clone=o=>JSON.parse(JSON.stringify(o));
async function handle(op,a){
  if(op==='getFamily') return (srv.users[a.uid]||{}).fid||'';
  if(op==='setFamily'){ srv.users[a.uid]={fid:a.fid}; return; }
  if(op==='clearFamily'){ delete srv.users[a.uid]; return; }
  if(op==='list'){ const d=Object.entries(F(a.fid)).map(([id,v])=>Object.assign({id},v)); srv.reads+=Math.max(1,d.length); return clone(d); }
  if(op==='put'){ const cur=F(a.fid)[a.id]; if(cur&&cur.u!==a.doc.b) return {conflict:true}; F(a.fid)[a.id]=clone(a.doc); srv.writes++; return {ok:true}; }
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
const quick=async p=>p.evaluate(()=>{CLOUD_LIMITS.pushDelayMs=300;});
const play=async(p,n)=>p.evaluate(n=>{ for(let i=0;i<n;i++){ nextQuestion(); checkAnswer(current.answer,null,null);} document.querySelectorAll('.milestone').forEach(e=>e.remove()); document.getElementById('celebOverlay').hidden=true; saveState(); },n);
const mkProfile=async(p,name,g)=>{ await p.fill('#pfName',name); await p.click('.gopt:has(input[value='+g+'])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300); };
const backup=async(p,sub)=>{ await p.evaluate(()=>openPanel('backup')); if(sub) await p.click('[data-pact=bksub][data-id='+sub+']'); await p.waitForTimeout(100); };
const code=p=>p.evaluate(()=>cloud.fid);
const txt=p=>p.textContent('#profBody');

// ===== 1. Backup tab has three options; report tab replaced the account tab =====
const A=await device(); await quick(A); await mkProfile(A,'נועה','f');
await backup(A);
ok(await A.locator('[data-pact=bksub]').count()===3,'backup tab offers three options');
ok((await A.locator('[data-pact=bksub]').allTextContents()).join('|').includes('גיבוי מקומי')&&(await txt(A)).includes('גיבוי אנונימי')&&(await txt(A)).includes('חשבון בענן'),'option names');
ok(await A.locator('[data-pact=bkgen]').count()===1,'local backup is the default and still works');
ok(await A.locator('.pa-tab[data-id=account]').count()===0&&await A.locator('.pa-tab[data-id=report]').count()===1,'no account tab; report tab exists');
await A.click('.pa-tab[data-id=report]');
ok((await txt(A)).includes('דיווח על בעיה')&&await A.locator('[data-pact=cloudin]').count()===0&&await A.locator('[data-pact=report]').count()===1,'report page has no login');
// ===== 2. Google account: family is created automatically =====
await backup(A,'account'); ok(await A.locator('[data-pact=cloudin]').count()===1,'account option offers Google login');
await A.click('[data-pact=cloudin]'); await A.waitForTimeout(700);
ok(await A.evaluate(()=>cloud.status)==='ok'&&await A.evaluate(()=>cloud.mode)==='google','signed in and synced');
const famA=await code(A); ok(/^[A-HJ-NP-Z2-9]{26}$/.test(famA),'family id is 26 random chars: '+famA);
ok(srv.users.u1&&srv.users.u1.fid===famA,'account remembers its family'); await A.evaluate(()=>{ cloudAuthChanged(cloud.user); cloudAuthChanged(cloud.user); }); await A.waitForTimeout(500); ok(Object.values(srv.fams).filter(x=>Object.keys(x).length).length===1&&await code(A)===famA,'repeated sign-in events never create a second family'); ok(Object.keys(F(famA)).length===1,'profile uploaded to the family');
ok((await txt(A)).includes('parent@example.com')&&(await A.inputValue('#famShown')).replace(/-/g,'')===famA,'shows the account and the family code');
ok(await A.evaluate(()=>bkSubCur())==='account','account option is selected while signed in');
// second device, same account: automatic
const B=await device(); await quick(B);
ok(await B.locator('[data-pact=cloudin]').count()===1&&await B.locator('[data-pact=joinfirst]').count()===1&&await B.locator('[data-pact=restorefirst]').count()===1,'welcome screen: sign in / family code / restore');
await B.click('[data-pact=cloudin]'); await B.waitForTimeout(700);
ok(await B.evaluate(()=>store.profiles.length)===1&&await code(B)===famA,'same account on a second device joins the same family automatically');
await play(B,6); await B.waitForTimeout(800); const scB=await B.evaluate(()=>score);
await A.evaluate(()=>{cloud.lastPull=0; document.dispatchEvent(new Event('visibilitychange'));}); await A.waitForTimeout(600);
ok(await A.evaluate(()=>score)===scB,'A receives what B played');
// ===== 3. Anonymous backup: start on a device with progress =====
const C=await device(); await quick(C); await mkProfile(C,'דנה','f'); await play(C,12); const scC=await C.evaluate(()=>score);
await backup(C,'anon'); ok(await C.locator('[data-pact=famnew]').count()===1&&await C.locator('#famCode').count()===1,'anonymous option: start, or join with a code');
const nf=()=>Object.values(srv.fams).filter(x=>Object.keys(x).length).length; ok(nf()===1,'nothing new in the cloud before starting');
await C.click('[data-pact=famnew]'); await C.waitForTimeout(800);
const famC=await code(C); ok(/^[A-HJ-NP-Z2-9]{26}$/.test(famC)&&famC!==famA,'new anonymous family');
ok(await C.evaluate(()=>cloud.mode)==='code'&&await C.evaluate(()=>cloud.status)==='ok','anonymous backup active, synced');
ok(Object.keys(F(famC)).length===1&&JSON.parse(Object.values(F(famC))[0].p).score===scC,'her progress is in the cloud');
ok(Object.keys(srv.users).every(u=>u==='u1'),'no account was created for the anonymous backup');
const shown=await C.inputValue('#famShown'); ok(/^[A-Z2-9]{5}(-[A-Z2-9]{5}){3}-[A-Z2-9]{6}$/.test(shown),'code is shown in groups: '+shown);
// switching to the Google option while anonymous: explained, and the other panel is explained from a Google device
ok((await A.evaluate(()=>{ bk.sub='anon'; renderProfiles(); return document.getElementById('profBody').textContent; })).includes('מחובר לחשבון Google'),'anonymous option on a Google device explains it must disconnect first');
// ===== 4. Join with the code =====
const D=await device(); await quick(D);
ok(await D.locator('[data-pact=joinfirst]').count()===1,'first run offers the family code'); await D.click('[data-pact=joinfirst]');
await D.fill('#famCode','abc'); await D.click('[data-pact=famjoin]'); await D.waitForTimeout(300);
ok((await txt(D)).includes('הקוד לא תקין'),'short code rejected');
await D.fill('#famCode','AAAAA-BBBBB-CCCCC-DDDDD-EEEEEE'.replace(/[B-E]/g,'H')); await D.click('[data-pact=famjoin]'); await D.waitForTimeout(500);
ok((await txt(D)).includes('לא נמצא גיבוי')&&await D.evaluate(()=>cloud.mode)==='off','unknown code: not found, nothing joined');
ok(nf()===2,'a mistyped code does not create a family ('+nf()+')');
await D.fill('#famCode',' '+shown.toLowerCase()+' '); await D.click('[data-pact=famjoin]'); await D.waitForTimeout(900);
ok(await D.evaluate(()=>store.profiles.length)===1&&await D.evaluate(()=>score)===scC,'joined with a lower-case, dashed code: profile and score arrived');
ok(!(await D.locator('#profOverlay').isVisible()),'welcome closes after joining');
// D and C sync both ways
await play(D,5); await D.waitForTimeout(800); const scD=await D.evaluate(()=>score);
await C.evaluate(()=>{cloud.lastPull=0; document.dispatchEvent(new Event('visibilitychange'));}); await C.waitForTimeout(600);
ok(await C.evaluate(()=>score)===scD,'C receives what D played ('+scD+')');
// D reloads: still synced (anonymous identity persisted)
await D.reload(); await D.waitForTimeout(900); ok(await D.evaluate(()=>cloud.mode)==='code'&&await D.evaluate(()=>cloud.status)==='ok','after reload the device is still connected');
// D loses its anonymous identity (storage of the auth only): the stored code gets it back in
await D.evaluate(()=>localStorage.removeItem('mock_user')); await D.reload(); await D.waitForTimeout(900);
ok(await D.evaluate(()=>cloud.status)==='ok'&&await D.evaluate(()=>!!cloud.user&&cloud.user.anon),'lost identity is re-created from the stored code');
// ===== 5. the daughter flow: existing progress becomes the master =====
const G=await device(); await quick(G); await mkProfile(G,'מאיה','f'); await play(G,15); const idG=await G.evaluate(()=>store.activeId), scG=await G.evaluate(()=>score);
await backup(G,'anon'); await G.click('[data-pact=famnew]'); await G.waitForTimeout(800); const famG=await code(G);
const H=await device(); await quick(H); await H.click('[data-pact=joinfirst]'); await H.fill('#famCode',famG); await H.click('[data-pact=famjoin]'); await H.waitForTimeout(900);
ok(await H.evaluate(()=>activeProfile().id)===idG&&await H.evaluate(()=>score)===scG,'second device gets the same profile id and score');
// parent signs in with Google on H: the anonymous backup becomes the account's family
await H.evaluate(()=>{window.__uid='u9';}); await backup(H,'account'); await H.click('[data-pact=cloudin]'); await H.waitForTimeout(900);
ok(await H.evaluate(()=>cloud.mode)==='google'&&await code(H)===famG&&srv.users.u9&&srv.users.u9.fid===famG,'Google login on a device with an anonymous backup keeps the same family');
ok(await H.evaluate(()=>cloudStored('cq_family'))==='','local anonymous code cleared (account holds it)');
// ===== 6. Google account that already has another family: merge + note =====
await G.evaluate(()=>{window.__uid='u1';}); await backup(G,'account'); await G.click('[data-pact=cloudin]'); await G.waitForTimeout(1000);
ok(await G.evaluate(()=>cloud.mode)==='google'&&await code(G)===famA,'account with its own family wins');
ok((await txt(G)).includes('כבר הייתה משפחה'),'user is told about the merge');
ok(Object.keys(F(famA)).includes(idG),'this device\'s profile was merged into the account family');
// ===== 7. legacy data migrates =====
srv.legacy.u7={p1:{n:'ישן',g:'m',p:'{"score":77}',s:'',u:5,b:0,d:false,v:1}};
const L=await device(); await quick(L); await L.evaluate(()=>{window.__uid='u7';}); await L.click('[data-pact=cloudin]'); await L.waitForTimeout(1000);
ok(await L.evaluate(()=>store.profiles.length)===1&&(await L.evaluate(()=>store.profiles[0].name))==='ישן','profile saved by the previous version arrives');
const famL=await code(L); ok(srv.users.u7.fid===famL&&F(famL).p1&&Object.keys(srv.legacy.u7).length===0,'moved into a family, old copy deleted');
// ===== 8. disconnect / wipe / modes =====
await backup(C,'anon'); await C.click('[data-pact=cloudout]'); await C.waitForTimeout(300);
ok(await C.evaluate(()=>cloud.mode)==='off'&&await C.evaluate(()=>store.profiles.length)===1&&Object.keys(F(famC)).length===1,'disconnect keeps local progress and the cloud copy');
ok(await C.locator('[data-pact=famnew]').count()===1,'back to local-only; can start again');
await C.fill('#famCode',famC); await C.click('[data-pact=famjoin]'); await C.waitForTimeout(900);
ok(await C.evaluate(()=>cloud.mode)==='code'&&await C.evaluate(()=>store.profiles.length)===1,'rejoin with the code does not duplicate profiles');
await C.click('[data-pact=cloudwipe]'); await C.click('[data-pact=cloudwipeyes]'); await C.waitForTimeout(500);
ok(Object.keys(F(famC)).length===0&&await C.evaluate(()=>cloud.mode)==='off'&&await C.evaluate(()=>store.profiles.length)===1,'wipe deletes the family, keeps local progress');
// anonymous sign-in not enabled in Firebase
await C.evaluate(()=>{window.__noAnon=true;}); await C.click('[data-pact=famnew]'); await C.waitForTimeout(400);
ok((await txt(C)).includes('עדיין לא הופעל')&&await C.evaluate(()=>cloud.mode)==='off','anonymous sign-in disabled: clear message');
// ===== 9. reports still work and never start a sync =====
const R=await device(); await mkProfile(R,'x','n'); await R.evaluate(()=>openReport(false)); await R.fill('#reportMsg','באג'); await R.click('#reportSend'); await R.waitForTimeout(700);
ok(srv.reports.length===1&&/^anon-/.test(srv.reports[0].uid),'report from a device without cloud sync works through an anonymous session');
ok(await R.evaluate(()=>cloud.mode)==='off'&&await R.evaluate(()=>!cloudActive()),'a report session does not turn sync on');
// ===== 10. UI sanity =====
await backup(A,'account'); await A.screenshot({path:'fam_account.png'}); await backup(G,'anon'); 
const wide=await device(); await wide.setViewportSize({width:1280,height:800}); await wide.evaluate(()=>{window.__uid='u1';}); 
for(const p of [A,B,C,D,G,H,L,R]) ok(p.errs.length===0,'no page errors '+p.errs.join('|'));
console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
