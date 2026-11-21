// New Google account on the welcome screen: explain the next step without a repeat login.
const T=require('../lib.js');
const {chromium}=require('playwright'), fs=require('fs');
let bad=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)bad++;};
(async()=>{
 const b=await chromium.launch(T.launchOpts);
 const srv={users:{},fams:{}};
 async function handle(op,a){
  if(op==='getFamily')return srv.users[a.uid]||'';
  if(op==='setFamily'){srv.users[a.uid]=a.fid;return;}
  if(op==='legacyList'||op==='snapList')return [];
  if(op==='list')return Object.entries(srv.fams[a.fid]||{}).map(([id,d])=>({id,...d}));
  if(op==='put'){(srv.fams[a.fid]||={})[a.id]=a.doc;return {ok:true};}
  if(op==='snapPut')return {ok:true};
 }
 const pages=[];
 async function device(width=390){
  const c=await b.newContext({viewport:{width,height:844}}),p=await c.newPage();pages.push(p);p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.exposeFunction('__srv',handle);await p.addInitScript(fs.readFileSync(T.p('cloud/mock_init.js'),'utf8'));
  await p.goto('file://'+T.cloudBuild());return p;
 }
 const success=p=>p.locator('#profBody [role=status]');
 const A=await device();
 const baselineWidths={};
 for(const width of [320,390,768,1280]){await A.setViewportSize({width,height:844});baselineWidths[width]=await A.evaluate(()=>document.documentElement.scrollWidth);}
 await A.setViewportSize({width:390,height:844});
 ok(await success(A).count()===0,'signed-out welcome never claims login succeeded');
 await A.evaluate(()=>{window.__failNext=true;});await A.click('[data-pact=cloudin]');
 await A.waitForFunction(()=>!!cloud.msg);
 ok(await success(A).count()===0&&await A.locator('[data-pact=cloudin]').count()===1,'failed popup shows no success and still allows retry');
 ok((await A.locator('#profBody').innerText()).includes('ההתחברות לא הצליחה'),'failed popup keeps its error message');
 await A.click('[data-pact=cloudin]');await A.waitForFunction(()=>cloud.status==='ok');
 ok(await success(A).count()===1&&(await success(A).innerText()).includes('ההתחברות ל-Google הצליחה'),'new account sees an explicit Google sign-in confirmation');
 ok((await success(A).innerText()).includes('התחלת משחק')&&(await success(A).innerText()).includes('השם לא חובה'),'confirmation explains profile creation, Begin playing, and optional name');
 ok(await A.locator('[data-pact=cloudin]').count()===0,'successful empty account no longer invites another Google login');
 ok(await A.evaluate(()=>!!cloud.user&&!cloud.user.anon&&store.profiles.length===0),'no child profile is created automatically');
 for(const width of [320,390,768,1280]){
  await A.setViewportSize({width,height:844});
  ok(await A.evaluate(()=>document.documentElement.scrollWidth)<=Math.max(width,baselineWidths[width]),'note adds no horizontal overflow at '+width+'px (baseline '+baselineWidths[width]+')');
  if(process.env.LOGIN_SCREENSHOTS)await A.screenshot({path:process.env.LOGIN_SCREENSHOTS+'/google-welcome-'+width+'.png',fullPage:true});
 }
 await A.reload();await A.waitForFunction(()=>cloud.status==='ok');
 ok(await success(A).count()===1&&await A.locator('[data-pact=cloudin]').count()===0,'reload of signed-in empty account retains the explanation');
 await A.click('.gopt:has(input[value=n])');await A.click('[data-pact=save]');
 await A.waitForFunction(()=>document.getElementById('profOverlay').hidden);
 ok(await A.evaluate(()=>store.profiles.length===1&&cloud.mode==='google'&&!document.getElementById('profOverlay').offsetParent),'Save opens the game and keeps Google connection');
 await A.evaluate(()=>cloudSync('test'));await A.waitForFunction(()=>cloud.status==='ok');
 const B=await device();await B.click('[data-pact=cloudin]');await B.waitForFunction(()=>cloud.status==='ok');
 ok(await B.evaluate(()=>store.profiles.length===1&&document.getElementById('profOverlay').hidden),'existing-account restore still opens the game automatically');
 ok(await success(B).count()===0,'restored profiles do not get an unnecessary create-profile note');
 const C=await device();await C.evaluate(()=>{cloud.user={uid:'anonymous',anon:true};cloud.status='ok';renderProfiles();});
 ok(await success(C).count()===0,'anonymous sessions never claim successful Google login');
 for(const p of pages)ok(p.errs.length===0,'no page errors '+p.errs.join('|'));
 await b.close();process.exit(bad?1:0);
})();
