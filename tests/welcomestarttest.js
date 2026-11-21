// First-run welcome: one clear way to start ("▶ התחלת משחק"); family code, save code and Google are optional alternatives.
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(300);
const E=(fn,...a)=>p.evaluate(fn,...a);
const saveBtn=await E(()=>document.querySelector('[data-pact=save]').textContent.trim());
ok(saveBtn.includes('התחלת משחק')&&!saveBtn.includes('שמירה'),'the main button says "begin playing" '+saveBtn);
ok(await E(()=>document.querySelectorAll('#profBody .pa-btn:not(.sec):not(.gbtn)').length)===1,'it is the only filled (primary) button');
const txt=await E(()=>document.getElementById('profBody').textContent);
ok(/לא חובה/.test(txt)&&/אחר כך/.test(txt),'says everything else is optional and can be done later');
ok(await E(()=>!!document.querySelector('[data-pact=restorefirst]')),'save-code restore is offered');
const cloud=await E(()=>cloudOn());
if(cloud){
  ok(await E(()=>!!document.querySelector('[data-pact=joinfirst]')),'family code is offered');
  ok(await E(()=>{const g=document.querySelector('[data-pact=cloudin]');return !!g&&!!g.querySelector('svg')&&g.classList.contains('gbtn')&&/Google/.test(g.textContent);}),'Google button carries the Google logo');
  ok(await E(()=>{const a=document.querySelector('[data-pact=save]').getBoundingClientRect(),g=document.querySelector('[data-pact=cloudin]').getBoundingClientRect();return a.top<g.top;}),'the start button comes before the optional ones');
} else console.log('note  cloud off here: family code / Google parts skipped');
ok(await E(()=>document.documentElement.scrollWidth<=window.innerWidth),'no horizontal scroll at 390px');
// the start path works with just the form
await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
ok(await E(()=>store.profiles.length===1&&document.getElementById('profOverlay').hidden),'filling the form and pressing begin starts the game');
// a later new profile keeps the plain "שמירה" button and has no restore options
await E(()=>{profMode={view:'form',editId:null,first:false,confirmDel:null,error:''};document.getElementById('profOverlay').hidden=false;renderProfiles();});
ok(await E(()=>document.querySelector('[data-pact=save]').textContent.trim())==='שמירה'&&await E(()=>!document.querySelector('[data-pact=restorefirst]')),'later profiles: "שמירה", no restore options');
// the Backup tab's Google button has the logo too
if(cloud){ await E(()=>{openPanel&&0;profTab='backup';profMode={view:'list'};renderProfiles();}); const g=await E(()=>{const x=document.querySelector('[data-pact=cloudin]');return x?!!x.querySelector('svg'):null;}); ok(g!==false,'Google button in the Backup tab has the logo (or is not shown while signed in)'); }
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close(); process.exit(f?1:0);})();
