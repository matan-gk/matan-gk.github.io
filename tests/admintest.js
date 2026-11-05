const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
for(const [name,vp] of [['phone',{width:390,height:780}],['desktop',{width:1280,height:800}]]){
  const ctx=await b.newContext({viewport:vp}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
  await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]');
  await p.click('[data-pact=new]').catch(()=>{});
  await p.evaluate(()=>openPanel('profiles')); await p.click('[data-pact=new]'); await p.fill('#pfName','דן'); await p.click('.gopt:has(input[value=m])'); await p.click('[data-pact=save]');
  // 1. full screen
  await p.evaluate(()=>openPanel('profiles'));
  const room=await p.locator('.room.pa').boundingBox();
  ok(Math.abs(room.width-vp.width)<2 && Math.abs(room.height-vp.height)<2, name+': panel fills the whole screen');
  ok(await p.locator('.pa-brand').innerText().then(t=>t.includes('אזור הורים')),name+': parent-area brand shown');
  // size and position of the content area never change between tabs
  const boxes={}; const tabs=['profiles','progress','settings','backup','guide'];
  for(const t of tabs){ await p.click(`.vtab[data-id=${t}]`); const m=await p.locator('#paMain').boundingBox(); const n=await p.locator('.pa-nav').boundingBox(); boxes[t]=[Math.round(m.x),Math.round(m.y),Math.round(m.width),Math.round(m.height),Math.round(n.x),Math.round(n.y),Math.round(n.width),Math.round(n.height)]; }
  ok(new Set(Object.values(boxes).map(v=>v.join())).size===1, name+': nav and content area are identical on every tab '+JSON.stringify(boxes.profiles));
  const pw={}; for(const t of tabs){ await p.click(`.vtab[data-id=${t}]`); pw[t]=Math.round((await p.locator('.pa-page').boundingBox()).width); }
  ok(new Set(Object.values(pw)).size===1, name+': page column width is the same on every tab '+JSON.stringify(pw));
  // 2. tabs
  const nb=await p.locator('.pa-nav').boundingBox(), mb=await p.locator('#paMain').boundingBox();
  const tb=await p.locator('.vtab').evaluateAll(a=>a.map(e=>{const r=e.getBoundingClientRect(); return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)];}));
  if(name==='phone'){
    ok(nb.y>mb.y && Math.abs(nb.y+nb.height-vp.height)<2,'phone: tab bar is at the bottom of the screen');
    ok(tb.every(r=>r[1]===tb[0][1]),'phone: tabs are in one row');
    ok(tb.every(r=>r[3]>=44 && r[2]>=52),'phone: tabs are big enough to tap ('+tb.map(r=>r[2]+'x'+r[3]).join(',')+')');
    ok(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'phone: no horizontal page scroll');
    ok(await p.evaluate(()=>document.getElementById('paMain').scrollWidth<=document.getElementById('paMain').clientWidth+1),'phone: no horizontal scroll in the panel');
  } else {
    ok(nb.x>mb.x && nb.width>=200,'desktop: sidebar on the right (RTL) next to the content, wide enough for labels');
    ok(tb.every((r,i)=>i===0||r[1]>tb[i-1][1]),'desktop: tabs are stacked vertically');
    ok(await p.locator('.vtab .pa-lbl').first().isVisible(),'desktop: full labels visible');
  }
  // 3. consistent controls: buttons share height, shape; every switch/field/row uses shared classes
  for(const t of ['profiles','settings','backup']){ await p.click(`.vtab[data-id=${t}]`);
    const hs=await p.locator('#paMain .pa-btn:not(.sm)').evaluateAll(a=>a.filter(e=>e.offsetParent).map(e=>Math.round(e.getBoundingClientRect().height)));
    ok(hs.every(h=>h===44), name+' '+t+': large buttons are all 44px ('+hs+')');
    const sm=await p.locator('#paMain .pa-btn.sm').evaluateAll(a=>a.filter(e=>e.offsetParent).map(e=>Math.round(e.getBoundingClientRect().height)));
    ok(sm.every(h=>h===38), name+' '+t+': small buttons are all 38px ('+sm+')');
    const old=await p.locator('#paMain .btn, #paMain .pbtn, #paMain .linkbtn, #paMain .ppick').count(); ok(old===0, name+' '+t+': no leftover old-style controls');
  }
  await p.click('.vtab[data-id=backup]');
  const fieldH=await p.evaluate(()=>[...document.querySelectorAll('#paMain select, #paMain textarea')].filter(e=>e.offsetParent).map(e=>[e.tagName, getComputedStyle(e).borderRadius, getComputedStyle(e).backgroundColor].join('|')));
  ok(new Set(fieldH.map(x=>x.split('|').slice(1).join('|'))).size===1, name+': all fields share the same shape and colour');
  // scope bar in progress + settings is the same component
  await p.click('.vtab[data-id=progress]'); const s1=await p.locator('.pa-scope').boundingBox();
  await p.click('.vtab[data-id=settings]'); const s2=await p.locator('.pa-scope').boundingBox();
  ok(Math.round(s1.x)===Math.round(s2.x)&&Math.round(s1.y)===Math.round(s2.y)&&Math.round(s1.width)===Math.round(s2.width), name+': profile selector sits in the same place on Progress and Settings');
  // scroll position survives a toggle
  await p.click('.vtab[data-id=guide]'); await p.evaluate(()=>{document.getElementById('paMain').scrollTop=300;});
  // keyboard: Escape closes; first-run has no close
  await p.keyboard.press('Escape'); ok(await p.locator('#profOverlay').isHidden(), name+': Escape closes the panel');
  ok(errs.length===0, name+': no page errors '+errs.join('|'));
  await ctx.close();
}
// first-run (no profiles): full screen, no nav, no close button
const c2=await b.newContext({viewport:{width:390,height:780}}); const q=await c2.newPage(); await q.goto(T.URL); await q.evaluate(()=>localStorage.clear()); await q.reload();
ok(await q.locator('.pa-nav').count()===0,'first run: no navigation'); ok(await q.locator('#profClose').evaluate(e=>getComputedStyle(e).visibility)==='hidden','first run: no close button');
const fr=await q.locator('.room.pa').boundingBox(); ok(Math.abs(fr.width-390)<2&&Math.abs(fr.height-780)<2,'first run: full screen');
console.log(f?'FAILURES '+f:'ALL OK'); await b.close();})();
