// Main menu layout: buttons must form even rows at every screen width, with a short last row stretched
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts);
for(const [w,h,perRow] of [[390,844,3],[600,900,3],[820,1180,4],[1024,768,4],[1280,800,4],[1920,1080,4]]){
  const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
  await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
  for(const room of [false,true]){
    if(room) await p.evaluate(()=>{ try{ space.unlocked=true; }catch(e){} renderLevels(); });
    const rects=await p.evaluate(()=>[...document.querySelectorAll('#levels > *')].filter(e=>e.offsetParent&&!e.classList.contains('slot')).map(e=>{const r=e.getBoundingClientRect();return {x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width)}}));
    const list=[]; rects.slice().sort((a,c)=>a.y-c.y).forEach(r=>{ const g=list.find(l=>Math.abs(l[0].y-r.y)<=8); if(g) g.push(r); else list.push([r]); }); const n=rects.length;
    const tag=`${w}px, ${n} buttons`;
    ok(list.length===Math.ceil(n/perRow),`${tag}: ${list.length} rows (want ${Math.ceil(n/perRow)})`);
    ok(list.slice(0,-1).every(r=>r.length===perRow),`${tag}: every row but the last has ${perRow} buttons`);
    const left=Math.min(...rects.map(r=>r.x)), right=Math.max(...rects.map(r=>r.x+r.w));
    ok(list.every(r=>Math.abs(Math.min(...r.map(q=>q.x))-left)<=2&&Math.abs(Math.max(...r.map(q=>q.x+q.w))-right)<=2),`${tag}: every row, last one included, fills the full width`);
    ok(rects.every(r=>r.w>=90),`${tag}: no button narrower than 90px`);
  }
  ok(errs.length===0,w+'px: no page errors '+errs.join(';'));
  await p.context().close();
}
await b.close(); process.exit(f?1:0);
})();
