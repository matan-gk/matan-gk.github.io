const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch(T.launchOpts);const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(300);
await p.evaluate(()=>openPanel('guide'));
const g=await p.textContent('#gPrivacy');
ok(g&&g.includes('הצהרת פרטיות')&&g.includes('מה נשמר במכשיר')&&g.includes('דיווח על בעיה')&&g.includes('מה לא נאסף'),'guide has the privacy statement with its sections');
ok(await p.evaluate(()=>cloudOn())?g.includes('גיבוי אנונימי')&&g.includes('חשבון Google')&&g.includes('מחיקת הנתונים שלי מהענן'):!g.includes('Firebase'),'cloud paragraphs present when cloud is on');
ok(!/undefined|\[\[|NaN/.test(g),'no template leftovers');
// linked from the cloud options
await p.evaluate(()=>openPanel('backup'));
if(await p.evaluate(()=>cloudOn())){
  for(const sub of ['account','anon']){ await p.click('[data-pact=bksub][data-id='+sub+']'); ok(await p.locator('[data-pact=privacy]').count()===1,'privacy link on the '+sub+' option');}
  await p.click('[data-pact=privacy]'); await p.waitForTimeout(100);
  ok(await p.evaluate(()=>profTab)==='guide'&&await p.evaluate(()=>{const r=document.getElementById('gPrivacy').getBoundingClientRect();return r.top<window.innerHeight&&r.bottom>0;}),'the link opens the guide at the statement');
}
// data claims match the code
const claims=await p.evaluate(()=>({cap:STATS_CONFIG.logCap,hasAds:!!document.querySelector('script[src*="ads"],script[src*="analytics"],script[src*="gtag"]')}));
ok(claims.cap===2000,'statement says 2,000 answers; code keeps '+claims.cap);
ok(!claims.hasAds,'no analytics or ad scripts on the page');
ok(errs.length===0,'no page errors '+errs);
console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
