const T=require('/home/claude/matan-gk.github.io/tests/lib.js');const {chromium}=require('playwright');
exports.open=async(vw=1400,vh=1300)=>{const b=await chromium.launch({...T.launchOpts});const p=await (await b.newContext({viewport:{width:vw,height:vh},deviceScaleFactor:1})).newPage();
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await p.evaluate(()=>{space.earned=5000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();
 document.querySelectorAll('.rmdrawer,#rmDrawer').forEach(e=>e.style.display='none');});
return {b,p};};
exports.shot=async(p,path)=>{await p.evaluate(()=>document.querySelectorAll('#rmSvg').forEach(s=>s.parentElement.querySelectorAll('button').forEach(b=>b.style.display='none')));const el=await p.$('#rmSvg');await el.screenshot({path});};
