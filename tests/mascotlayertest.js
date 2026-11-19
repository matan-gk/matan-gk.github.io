// the mascot (unicorn) is painted behind the question card, on big screens and when she peeks in on phones
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts);
for(const [w,h,name,peek] of [[1280,900,'big screen',false],[390,800,'phone (peeking in)',true]]){
  const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage();
  await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
  await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
  await p.evaluate(pk=>{ document.body.dataset.view='play'; nextQuestion(); if(pk) peekMascot(''); document.getElementById('card').style.background='#fff'; document.getElementById('card').style.minHeight='1500px'; document.querySelector('.charwrap').style.animation='none'; },peek);
  await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{ const i=document.getElementById('charImg').getBoundingClientRect(), c=document.getElementById('card').getBoundingClientRect(); const x0=Math.max(i.left,c.left), x1=Math.min(i.right,c.right), y0=Math.max(i.top,c.top), y1=Math.min(i.bottom,c.bottom); return {x:Math.floor(x0), y:Math.floor(y0), width:Math.floor(x1-x0), height:Math.floor(y1-y0), z:getComputedStyle(document.querySelector('.charwrap')).zIndex}; });
  ok(r.width>20&&r.height>20,name+': the mascot overlaps the card ('+r.width+'x'+r.height+')');
  ok(Number(r.z)<0,name+': the mascot layer is below the card (z-index '+r.z+')');
  const a=await p.screenshot({clip:{x:r.x,y:r.y,width:r.width,height:r.height}});
  await p.evaluate(()=>{ document.querySelector('.charwrap').style.visibility='hidden'; });
  const c=await p.screenshot({clip:{x:r.x,y:r.y,width:r.width,height:r.height}});
  ok(a.equals(c),name+': where the card covers her she is not visible at all (an opaque card hides her completely)');
  await p.close();
}
await b.close(); console.log(f?'FAILED '+f:'ALL OK'); process.exit(f?1:0);
})();
