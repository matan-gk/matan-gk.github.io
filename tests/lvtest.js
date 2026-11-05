const T=require('./lib.js');
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({...T.launchOpts});
for(const [w,h] of [[320,700],[390,844],[720,900],[1280,900]]){
const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(300);
const r=await p.evaluate(()=>{const l=document.getElementById('levels');return {scroll:l.scrollWidth>l.clientWidth+1, rows:new Set([...l.children].map(c=>Math.round(c.getBoundingClientRect().top))).size, w:Math.round(l.getBoundingClientRect().width), pageScroll:document.documentElement.scrollWidth>innerWidth};});
console.log(w,JSON.stringify(r),errs);
if(r.scroll||r.pageScroll||errs.length){ console.log('FAIL level buttons overflow or page errors at '+w+'px'); process.exitCode=1; }
await p.screenshot({path:'lv_'+w+'.png'});}
await b.close(); if(!process.exitCode) console.log('ALL PASS');})();
